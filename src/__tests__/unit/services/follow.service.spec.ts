import { FollowService } from "../../../services/follow.service";
import { FollowRepository } from "../../../repository/follow.repository";
import { UserModel } from "../../../model/user.model";
import { FollowModel } from "../../../model/follow.model";

jest.mock("../../../model/user.model");
jest.mock("../../../model/follow.model");

describe("FollowService Unit Tests", () => {
  let service: FollowService;

  beforeEach(() => {
    service = new FollowService();
    jest.clearAllMocks();
  });

  describe("follow", () => {
    it("should throw error if user tries to follow themselves", async () => {
      await expect(service.follow("u1", "u1")).rejects.toThrow("Cannot follow yourself");
    });

    it("should throw error if already following", async () => {
      jest.spyOn(FollowRepository.prototype, "exists").mockResolvedValue(true);

      await expect(service.follow("u1", "u2")).rejects.toThrow("Already following");
      expect(FollowRepository.prototype.exists).toHaveBeenCalledWith("u1", "u2");
    });

    it("should create a follow if not already following", async () => {
      const mockFollow = { followerId: "u1", followedId: "u2" } as any;
      jest.spyOn(FollowRepository.prototype, "exists").mockResolvedValue(false);
      jest.spyOn(FollowRepository.prototype, "createFollow").mockResolvedValue(mockFollow);

      const result = await service.follow("u1", "u2");

      expect(FollowRepository.prototype.createFollow).toHaveBeenCalledWith("u1", "u2");
      expect(result).toEqual(mockFollow);
    });
  });

  describe("unfollow", () => {
    it("should throw error if not following", async () => {
      jest.spyOn(FollowRepository.prototype, "removeFollow").mockResolvedValue({ deletedCount: 0 } as any);

      await expect(service.unfollow("u1", "u2")).rejects.toThrow("Not following or already removed");
      expect(FollowRepository.prototype.removeFollow).toHaveBeenCalledWith("u1", "u2");
    });

    it("should return success if unfollowed", async () => {
      jest.spyOn(FollowRepository.prototype, "removeFollow").mockResolvedValue({ deletedCount: 1 } as any);

      const result = await service.unfollow("u1", "u2");
      expect(result).toEqual({ success: true });
      expect(FollowRepository.prototype.removeFollow).toHaveBeenCalledWith("u1", "u2");
    });
  });

  describe("getFollowing", () => {
    it("should return following from repo", async () => {
      const mockFollowing = [{ followedId: "u2" }] as any;
      jest.spyOn(FollowRepository.prototype, "getFollowing").mockResolvedValue(mockFollowing);

      const result = await service.getFollowing("u1");
      expect(result).toEqual(mockFollowing);
      expect(FollowRepository.prototype.getFollowing).toHaveBeenCalledWith("u1");
    });
  });

  describe("canMessage", () => {
    it("should call repo.isMutual", async () => {
      jest.spyOn(FollowRepository.prototype, "isMutual").mockResolvedValue(true);

      const result = await service.canMessage("u1", "u2");
      expect(result).toBe(true);
      expect(FollowRepository.prototype.isMutual).toHaveBeenCalledWith("u1", "u2");
    });
  });

  describe("isFollowing", () => {
    it("should return true/false from repo.exists", async () => {
      jest.spyOn(FollowRepository.prototype, "exists").mockResolvedValue(true);

      const result = await service.isFollowing("u1", "u2");
      expect(result).toBe(true);
      expect(FollowRepository.prototype.exists).toHaveBeenCalledWith("u1", "u2");
    });
  });

  describe("getCounts", () => {
    it("should return followers/following counts", async () => {
      const mockCounts = { followers: 5, following: 3 };
      jest.spyOn(FollowRepository.prototype, "count").mockResolvedValue(mockCounts);

      const result = await service.getCounts("u1");
      expect(result).toEqual(mockCounts);
      expect(FollowRepository.prototype.count).toHaveBeenCalledWith("u1");
    });
  });

  describe("searchUsers", () => {
    it("should return users matching query", async () => {
      const mockUsers = [{ name: "Alice" }] as any;
      (UserModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue(mockUsers),
      });

      const result = await service.searchUsers("ali");
      expect(result).toEqual(mockUsers);
    });
  });

  describe("getFollowers", () => {
    it("should return follower user objects", async () => {
      const mockFollowers = [{ followerId: { name: "Bob" } }] as any;
      const populateMock = { map: jest.fn().mockReturnValue(mockFollowers.map((f: { followerId: any }) => f.followerId))};
      (FollowModel.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockReturnValue(populateMock) });

      const result = await service.getFollowers("u1");
      expect(result).toEqual(mockFollowers.map((f: { followerId: any }) => f.followerId));
    });
  });

  describe("getMutuals", () => {
    it("should return mutual users", async () => {
      const following = [{ followedId: { toString: () => "u2" } }] as any;
      const followers = [{ followerId: { name: "Alice" } }] as any;

      (FollowModel.find as jest.Mock)
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(following) })
        .mockReturnValueOnce({ populate: jest.fn().mockReturnValue(followers) });

      const result = await service.getMutuals("u1");
      expect(result).toEqual(followers.map((f: { followerId: any }) => f.followerId));
    });
  });
});