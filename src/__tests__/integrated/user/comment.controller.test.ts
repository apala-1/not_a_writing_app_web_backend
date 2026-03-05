import request from "supertest";
import express from "express";
import mongoose from "mongoose";

import { UserModel } from "../../../model/user.model";
import { Comment } from "../../../model/comment.model";
import { connectToDatabase } from "../../../database/mondodb";
import { CommentController } from "../../../controllers/comments/comment.controller";

describe("CommentController Integration Tests", () => {

  let app: express.Application;
  let userId: string;
  let otherUserId: string;
  let postId: string;

  const controller = new CommentController();

  beforeAll(async () => {
    await connectToDatabase();

    app = express();
    app.use(express.json());

    // fake auth middleware
    app.use((req: any, res, next) => {
      req.user = { id: userId };
      next();
    });

    app.post("/comments", controller.create.bind(controller));
    app.get("/comments/:postId", controller.getByPost.bind(controller));
    app.put("/comments/:commentId", controller.update.bind(controller));
    app.delete("/comments/:commentId", controller.delete.bind(controller));
    app.post("/comments/reply", controller.reply.bind(controller));
    app.get("/comments/profile/:userId", controller.getWholeCommentWithProfile.bind(controller));
  });

  beforeEach(async () => {

    await mongoose.connection.db!.dropDatabase();

    userId = new mongoose.Types.ObjectId().toHexString();
    otherUserId = new mongoose.Types.ObjectId().toHexString();
    postId = new mongoose.Types.ObjectId().toHexString();

    await UserModel.create({
      _id: userId,
      name: "Test User",
      email: `test${Date.now()}@test.com`,
      password: "password"
    });

    await UserModel.create({
      _id: otherUserId,
      name: "Other User",
      email: `other${Date.now()}@test.com`,
      password: "password"
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should create a comment", async () => {

    const res = await request(app)
      .post("/comments")
      .send({
        postId,
        content: "This is a comment"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("This is a comment");
  });

  it("should fail if content is empty", async () => {

    const res = await request(app)
      .post("/comments")
      .send({
        postId,
        content: ""
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should fetch comments for a post", async () => {

    await Comment.create({
      post: postId,
      user: userId,
      content: "Test comment"
    });

    const res = await request(app)
      .get(`/comments/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("should update a comment", async () => {

    const comment = await Comment.create({
      post: postId,
      user: userId,
      content: "Old comment"
    });

    const res = await request(app)
      .put(`/comments/${comment._id}`)
      .send({
        content: "Updated comment"
      });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("Updated comment");
  });

  it("should not update comment if unauthorized", async () => {

    const comment = await Comment.create({
      post: postId,
      user: otherUserId,
      content: "Other user's comment"
    });

    const res = await request(app)
      .put(`/comments/${comment._id}`)
      .send({
        content: "Hacked"
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should delete a comment", async () => {

    const comment = await Comment.create({
      post: postId,
      user: userId,
      content: "Delete me"
    });

    const res = await request(app)
      .delete(`/comments/${comment._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comment deleted");

    const exists = await Comment.findById(comment._id);
    expect(exists).toBeNull();
  });

  it("should not delete if unauthorized", async () => {

    const comment = await Comment.create({
      post: postId,
      user: otherUserId,
      content: "Protected"
    });

    const res = await request(app)
      .delete(`/comments/${comment._id}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should reply to a comment", async () => {

    const parent = await Comment.create({
      post: postId,
      user: userId,
      content: "Parent comment"
    });

    const res = await request(app)
      .post("/comments/reply")
      .send({
        postId,
        parentCommentId: parent._id,
        content: "Reply comment"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should fetch comments with user profile", async () => {

    await Comment.create({
      post: postId,
      user: userId,
      content: "Profile comment"
    });

    const res = await request(app)
      .get(`/comments/profile/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].user.email).toBeDefined();
  });

  it("should return 404 if user has no comments", async () => {

    const newUser = new mongoose.Types.ObjectId().toHexString();

    const res = await request(app)
      .get(`/comments/profile/${newUser}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

});