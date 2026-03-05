import request from "supertest";
import express from "express";
import { PostController } from "../../../controllers/posts/post.controller";

describe("PostController Simplified Integration Tests", () => {
  let app: express.Application;
  const controller = new PostController();

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Fake auth middleware
    app.use((req: any, res: any, next: any) => {
      req.user = { _id: "fake-user-id" }; // always set a user
      next();
    });

    // Routes only for validation/failing cases
    app.post("/post", controller.createPost.bind(controller));
    app.get("/post/:id", controller.getPost.bind(controller));
    app.get("/post/drafts", controller.getDrafts.bind(controller));
  });

  it("should fail if title missing", async () => {
    const res = await request(app)
      .post("/post")
      .send({ content: "No title", description: "Missing title" });

    expect(res.status).toBe(400);
  });

  it("should fail if content missing", async () => {
    const res = await request(app)
      .post("/post")
      .send({ title: "No content", description: "Missing content" });

    expect(res.status).toBe(400);
  });

  it("should fail if description missing", async () => {
    const res = await request(app)
      .post("/post")
      .send({ title: "No description", content: "Content here" });

    expect(res.status).toBe(400);
  });

  it("should return 500 if post not found", async () => {
    const res = await request(app).get("/post/fake-id");
    expect(res.status).toBe(500);
  });

  it("should not fetch drafts if empty", async () => {
    const res = await request(app).get("/post/drafts");
    expect(res.status).toBe(500);
  });
});