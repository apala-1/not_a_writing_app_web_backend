import { FollowModel, IFollow } from "../../../model/follow.model";
import mongoose from "mongoose";
import { FollowRepository } from "../../../repository/follow.repository";

jest.mock("../../../model/follow.model"); // Mock FollowModel

describe("FollowRepository Unit Tests", () => {
  let repo: FollowRepository;

  beforeEach(() => {
    repo = new FollowRepository();
    jest.clearAllMocks();
  });

  describe("createFollow", () => {
    it("should create a follow document", async () => {
      const followerId = new mongoose.Types.ObjectId().toHexString();
      const followedId = new mongoose.Types.ObjectId().toHexString();
      const mockFollow = { followerId, followedId } as unknown as IFollow;

      (FollowModel.create as jest.Mock).mockResolvedValue(mockFollow);

      const result = await repo.createFollow(followerId, followedId);

      expect(FollowModel.create).toHaveBeenCalledWith({
        followerId: new mongoose.Types.ObjectId(followerId),
        followedId: new mongoose.Types.ObjectId(followedId),
      });
      expect(result).toEqual(mockFollow);
    });
  });

  describe("removeFollow", () => {
    it("should delete a follow", async () => {
      const followerId = "f1";
      const followedId = "f2";
      const mockResult = { deletedCount: 1 };
      (FollowModel.deleteOne as jest.Mock).mockResolvedValue(mockResult);

      const result = await repo.removeFollow(followerId, followedId);

      expect(FollowModel.deleteOne).toHaveBeenCalledWith({ followerId, followedId });
      expect(result).toEqual(mockResult);
    });

    it("should return zero if nothing deleted", async () => {
      (FollowModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await repo.removeFollow("x", "y");
      expect(result.deletedCount).toBe(0);
    });
  });

  describe("exists", () => {
    it("should return true if follow exists", async () => {
      (FollowModel.findOne as jest.Mock).mockResolvedValue({} as unknown as IFollow);

      const result = await repo.exists("a", "b");
      expect(result).toBe(true);
    });

    it("should return false if follow does not exist", async () => {
      (FollowModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repo.exists("a", "b");
      expect(result).toBe(false);
    });
  });

  describe("getFollowers", () => {
    it("should return followers with populate", async () => {
      const mockFollowers = [
        { followerId: { name: "User1" }, followedId: "dummy", _id: "1", createdAt: new Date() }
      ] as unknown as IFollow[];
      const populateMock = { exec: jest.fn().mockResolvedValue(mockFollowers) };
      (FollowModel.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue(populateMock) });

      const result = await repo.getFollowers("user1");
      expect(result).toEqual(mockFollowers);
    });

    it("should return empty array if none", async () => {
      const populateMock = { exec: jest.fn().mockResolvedValue([]) };
      (FollowModel.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue(populateMock) });

      const result = await repo.getFollowers("user1");
      expect(result).toEqual([]);
    });
  });

  describe("getFollowing", () => {
    it("should return following with populate", async () => {
      const mockFollowing = [
        { followedId: { name: "User2" }, followerId: "dummy", _id: "1", createdAt: new Date() }
      ] as unknown as IFollow[];
      const populateMock = { exec: jest.fn().mockResolvedValue(mockFollowing) };
      (FollowModel.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue(populateMock) });

      const result = await repo.getFollowing("user2");
      expect(result).toEqual(mockFollowing);
    });
  });

  describe("isMutual", () => {
    it("should return true if both follow each other", async () => {
      jest.spyOn(repo, "exists").mockResolvedValue(true);

      const result = await repo.isMutual("a", "b");
      expect(result).toBe(true);
    });

    it("should return false if not mutual", async () => {
      jest.spyOn(repo, "exists").mockImplementation(async (a, b) => a === "a" && b === "b" ? true : false);

      const result = await repo.isMutual("a", "b");
      expect(result).toBe(false);
    });
  });

  describe("count", () => {
    it("should return followers and following counts", async () => {
      (FollowModel.countDocuments as jest.Mock)
        .mockResolvedValueOnce(5) // followers
        .mockResolvedValueOnce(3); // following

      const result = await repo.count("user1");
      expect(result).toEqual({ followers: 5, following: 3 });
    });

    it("should return zeros if no followers/following", async () => {
      (FollowModel.countDocuments as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await repo.count("userX");
      expect(result).toEqual({ followers: 0, following: 0 });
    });
  });
});