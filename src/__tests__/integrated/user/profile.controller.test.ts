import mongoose from "mongoose";
import { ProfileController } from "../../../controllers/profile.controller";
import { UserModel } from "../../../model/user.model";
import { ProfileModel } from "../../../model/profile.model";
import { PostModel } from "../../../model/post.model";
let controller: ProfileController;

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/not_a_writing_app");
  controller = new ProfileController();
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe("ProfileController Integration Tests", () => {

  let userId: string;
  let targetUserId: string;
  let postId: string;

  beforeEach(async () => {

    userId = new mongoose.Types.ObjectId().toHexString();
    targetUserId = new mongoose.Types.ObjectId().toHexString();
    postId = new mongoose.Types.ObjectId().toHexString();

   await UserModel.create({
  _id: userId,
  name: "User1",
  email: "user1@test.com",
  password: "testpassword123"
});
await UserModel.create({
  _id: targetUserId,
  name: "User2",
  email: "user2@test.com",
  password: "testpassword123"
});
    await ProfileModel.create({
      user: userId,
      followers: [],
      following: [],
      savedPosts: [],
      likedPosts: [],
    });

    await ProfileModel.create({
      user: targetUserId,
      followers: [],
      following: [],
      savedPosts: [],
      likedPosts: [],
    });

  });

  afterEach(async () => {
    await ProfileModel.deleteMany({});
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it("should fetch a profile", async () => {

    const req: any = { params: { userId } };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getProfile(req, res);

    expect(res.json).toHaveBeenCalled();

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);

  });


  it("should follow a user", async () => {

    const req: any = {
      body: { targetUserId },
      user: { _id: userId },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.follow(req, res);

    const updatedProfile = await ProfileModel.findOne({ user: userId });

    expect(updatedProfile?.following.length).toBe(1);

  });


  it("should unfollow a user", async () => {

    await ProfileModel.updateOne(
      { user: userId },
      { $push: { following: targetUserId } }
    );

    const req: any = {
      body: { targetUserId },
      user: { _id: userId },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.unfollow(req, res);

    const updated = await ProfileModel.findOne({ user: userId });

    expect(updated?.following.length).toBe(0);

  });


  it("should fetch followers", async () => {

    await ProfileModel.updateOne(
      { user: targetUserId },
      { $push: { followers: userId } }
    );

    const req: any = { params: { userId: targetUserId } };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getFollowers(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);

  });


  it("should fetch following list", async () => {

    await ProfileModel.updateOne(
      { user: userId },
      { $push: { following: targetUserId } }
    );

    const req: any = { params: { userId } };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getFollowing(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);

  });


  it("should save a post", async () => {

    await PostModel.create({
      _id: postId,
      author: targetUserId,
      title: "Test Post",
      description: "Test description",
      status: "published",
    });

    const req: any = {
      body: {
        postId,
        action: "save",
      },
      user: { _id: userId },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.addPostAction(req, res);

    const profile = await ProfileModel.findOne({ user: userId });

    expect(profile?.savedPosts.length).toBe(1);

  });


  it("should like a post", async () => {

    await PostModel.create({
      _id: postId,
      author: targetUserId,
      title: "Test Post",
      description: "Test description",
      status: "published",
    });

    const req: any = {
      body: {
        postId,
        action: "like",
      },
      user: { _id: userId },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.addPostAction(req, res);

    const profile = await ProfileModel.findOne({ user: userId });

    expect(profile?.likedPosts.length).toBe(1);

  });


  it("should fetch saved posts", async () => {

    await PostModel.create({
      _id: postId,
      author: targetUserId,
      title: "Saved Post",
      description: "Test description",
      status: "published",
    });

    await ProfileModel.updateOne(
      { user: userId },
      { $push: { savedPosts: postId } }
    );

    const req: any = { user: { _id: userId } };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getSavedPosts(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);

  });


  it("should fetch liked posts", async () => {

    await PostModel.create({
      _id: postId,
      author: targetUserId,
      title: "Liked Post",
      description: "Test description",
      status: "published",
    });

    await ProfileModel.updateOne(
      { user: userId },
      { $push: { likedPosts: postId } }
    );

    const req: any = { user: { _id: userId } };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getLikedPosts(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);

  });


  it("should fetch user's posts", async () => {

    await PostModel.create({
      author: targetUserId,
      title: "User Post",
      description: "Test description",
      status: "published",
    });

    const req: any = {
      params: { userId: targetUserId },
      user: { _id: userId },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getOwnPosts(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThanOrEqual(1);

  });


  it("should fetch full profile summary", async () => {

    const req: any = {
      params: { userId },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getWholeProfile(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);
    expect(response.data.userId.toString()).toBe(userId);

  });


  it("should return 404 if profile not found", async () => {

    const req: any = {
      params: { userId: new mongoose.Types.ObjectId().toHexString() },
    };

    const res: any = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await controller.getWholeProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

  });

});