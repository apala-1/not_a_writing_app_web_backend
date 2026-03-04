import request from "supertest";
import mongoose from "mongoose";
import { PostModel } from "../../../model/post.model";
import { AdminPostController } from "../../../controllers/admin/post.controller";

let controller: AdminPostController;

beforeAll(async () => {
  // Connect to test MongoDB
  await mongoose.connect("mongodb://127.0.0.1:27017/not_a_writing_app");
  controller = new AdminPostController();
});

afterAll(async () => {
  // Only drop DB if connection is active
  if (mongoose.connection.readyState === 1) { // 1 = connected
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  } else {
    console.warn("Skipping dropDatabase, Mongoose not connected");
  }
});

describe("AdminPostController Integration Tests", () => {
  let postId: string;

  it("should create a post", async () => {
    const req: any = {
      body: { title: "Test Post", description: "desc", content: "content" },
      user: { _id: new mongoose.Types.ObjectId() },
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    const jsonResponse = res.json.mock.calls[0][0];
    expect(jsonResponse.success).toBe(true);
    postId = jsonResponse.data._id;
  });

  it("should update a post", async () => {
    const req: any = {
      params: { id: postId },
      body: { title: "Updated Title" },
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonResponse = res.json.mock.calls[0][0];
    expect(jsonResponse.data.title).toBe("Updated Title");
  });

  it("should delete a post", async () => {
    const req: any = { params: { id: postId } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const jsonResponse = res.json.mock.calls[0][0];
    expect(jsonResponse.success).toBe(true);

    const deleted = await PostModel.findById(postId);
    expect(deleted).toBeNull();
  });
});