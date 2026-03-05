import { ProfileModel, IProfile } from "../../../model/profile.model";
import mongoose from "mongoose";
import { ProfileRepository } from "../../../repository/profile.repository";

jest.mock("../../../model/profile.model"); // Mock ProfileModel

describe("ProfileRepository Unit Tests", () => {
  let repo: ProfileRepository;

  beforeEach(() => {
    repo = new ProfileRepository();
    jest.clearAllMocks();
  });

  describe("createProfile", () => {
    it("should create a profile", async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const mockProfile = { user: userId } as unknown as IProfile;
      (ProfileModel.prototype.save as jest.Mock).mockResolvedValue(mockProfile);

      const result = await repo.createProfile(userId);

      expect(ProfileModel.prototype.save).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });
  });

  describe("findByUserId", () => {
    it("should return a profile with populated fields", async () => {
      const mockProfile = { user: "u1" } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOne as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue({ exec: execMock }) });

      const result = await repo.findByUserId("u1");
      expect(result).toEqual(mockProfile);
    });
  });

  describe("addFollower", () => {
    it("should add a follower", async () => {
      const mockProfile = { user: "u1", followers: ["f1"] } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await repo.addFollower("u1", "f1");
      expect(result).toEqual(mockProfile);
      expect(ProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: "u1" },
        { $addToSet: { followers: "f1" } },
        { new: true }
      );
    });
  });

  describe("removeFollower", () => {
    it("should remove a follower", async () => {
      const mockProfile = { user: "u1", followers: [] } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await repo.removeFollower("u1", "f1");
      expect(result).toEqual(mockProfile);
      expect(ProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: "u1" },
        { $pull: { followers: "f1" } },
        { new: true }
      );
    });
  });

  describe("addFollowing", () => {
    it("should add following", async () => {
      const mockProfile = { user: "u1", following: ["f2"] } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await repo.addFollowing("u1", "f2");
      expect(result).toEqual(mockProfile);
    });
  });

  describe("removeFollowing", () => {
    it("should remove following", async () => {
      const mockProfile = { user: "u1", following: [] } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await repo.removeFollowing("u1", "f2");
      expect(result).toEqual(mockProfile);
    });
  });

  describe("updateCounts", () => {
    it("should update postsCount and booksCount", async () => {
      const mockProfile = { user: "u1", postsCount: 5, booksCount: 2 } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await repo.updateCounts("u1", 5, 2);
      expect(result).toEqual(mockProfile);
    });

    it("should update only postsCount if booksCount undefined", async () => {
      const mockProfile = { user: "u1", postsCount: 3 } as unknown as IProfile;
      const execMock = jest.fn().mockResolvedValue(mockProfile);
      (ProfileModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: execMock });

      const result = await repo.updateCounts("u1", 3);
      expect(result).toEqual(mockProfile);
    });
  });

 describe("addPostAction", () => {
  it.each([
    ["like", "likedPosts"],
    ["share", "sharedPosts"],
    ["save", "savedPosts"]
  ])("should add post action %s", async (action, field) => {
    const mockProfile = { user: "u1" } as unknown as IProfile;

    // Mock to directly return the profile
    (ProfileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProfile);

    const result = await repo.addPostAction("u1", "p1", action);

    expect(result).toEqual(mockProfile);
    expect(ProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "u1" },
      { $addToSet: { [field]: "p1" } },
      { new: true }
    );
  });

  it("should throw error for invalid action", async () => {
    await expect(repo.addPostAction("u1", "p1", "invalid")).rejects.toThrow("Invalid action");
  });
});

describe("incrementPosts", () => {
  it("should increment postsCount", async () => {
    const mockProfile = { user: "u1", postsCount: 1 } as unknown as IProfile;
    (ProfileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProfile);

    const result = await repo.incrementPosts("u1");
    expect(result).toEqual(mockProfile);
    expect(ProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "u1" },
      { $inc: { postsCount: 1 } },
      { new: true }
    );
  });
});

describe("decrementPosts", () => {
  it("should decrement postsCount", async () => {
    const mockProfile = { user: "u1", postsCount: 0 } as unknown as IProfile;
    (ProfileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProfile);

    const result = await repo.decrementPosts("u1");
    expect(result).toEqual(mockProfile);
    expect(ProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
      { user: "u1" },
      { $inc: { postsCount: -1 } },
      { new: true }
    );
  });
});
});