import request from "supertest";
import express from "express";
import mongoose from "mongoose";

import { UserModel } from "../../../model/user.model";
import { ProfileModel } from "../../../model/profile.model";
import { connectToDatabase } from "../../../database/mondodb";
import { FollowController } from "../../../controllers/follow/follow.controller";

describe("FollowController Integration Tests", () => {

  let app: express.Application;

  let userA: string;
  let userB: string;
  let userC: string;

  const controller = new FollowController();

  beforeAll(async () => {

    await connectToDatabase();

    app = express();
    app.use(express.json());

    // fake auth middleware
    app.use((req: any, res, next) => {
      req.user = { _id: userA, id: userA };
      next();
    });

    app.post("/follow", controller.follow.bind(controller));
    app.post("/unfollow", controller.unfollow.bind(controller));
    app.get("/search", controller.searchUsers.bind(controller));
    app.get("/followers/:userId", controller.followers.bind(controller));
    app.get("/following/:userId", controller.following.bind(controller));
    app.get("/can-message/:userA/:userB", controller.canMessage.bind(controller));
    app.get("/follow-status/:userId", controller.followStatus.bind(controller));
    app.get("/follow-count/:userId", controller.followCount.bind(controller));
    app.get("/mutuals/:userId", controller.mutuals.bind(controller));

  });

  beforeEach(async () => {

    await mongoose.connection.db!.dropDatabase();

    userA = new mongoose.Types.ObjectId().toHexString();
    userB = new mongoose.Types.ObjectId().toHexString();
    userC = new mongoose.Types.ObjectId().toHexString();

    await UserModel.create([
      {
        _id: userA,
        name: "User A",
        email: `a${Date.now()}@test.com`,
        password: "password"
      },
      {
        _id: userB,
        name: "User B",
        email: `b${Date.now()}@test.com`,
        password: "password"
      },
      {
        _id: userC,
        name: "User C",
        email: `c${Date.now()}@test.com`,
        password: "password"
      }
    ]);

    await ProfileModel.create([
      { user: userA, followers: [], following: [] },
      { user: userB, followers: [], following: [] },
      { user: userC, followers: [], following: [] }
    ]);

  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should follow another user", async () => {

    const res = await request(app)
      .post("/follow")
      .send({ targetUserId: userB });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should not follow same user twice", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    const res = await request(app)
      .post("/follow")
      .send({ targetUserId: userB });

    expect(res.body.success).toBe(false);

  });

  it("should unfollow user", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    const res = await request(app)
      .post("/unfollow")
      .send({ targetUserId: userB });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should search users", async () => {

    const res = await request(app)
      .get("/search?q=User");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

  });

  it("should fetch followers list", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    const res = await request(app)
      .get(`/followers/${userB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should fetch following list", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    const res = await request(app)
      .get(`/following/${userA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should check if users can message each other", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });
    await request(app).post("/follow").send({ targetUserId: userA });

    const res = await request(app)
      .get(`/can-message/${userA}/${userB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should return follow status", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    const res = await request(app)
      .get(`/follow-status/${userB}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isFollowing).toBe(true);

  });

  it("should return follow counts", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    const res = await request(app)
      .get(`/follow-count/${userB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should return mutual followers", async () => {

    await request(app).post("/follow").send({ targetUserId: userB });

    // simulate B following C
    await ProfileModel.updateOne(
      { user: userB },
      { $push: { following: userC } }
    );

    await ProfileModel.updateOne(
      { user: userC },
      { $push: { followers: userB } }
    );

    const res = await request(app)
      .get(`/mutuals/${userC}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

  });

});