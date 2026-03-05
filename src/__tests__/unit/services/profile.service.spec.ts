// src/__tests__/unit/services/profile.service.spec.ts
import { ProfileService } from "../../../services/profile.service";
import { ProfileRepository } from "../../../repository/profile.repository";
import { PostRepository } from "../../../repository/post.repository";
import { IProfile } from "../../../model/profile.model";

jest.mock("../../../repository/profile.repository");
jest.mock("../../../repository/post.repository");

describe("ProfileService Unit Tests", () => {
  let service: ProfileService;
  let profileRepoMock: jest.Mocked<ProfileRepository>;
  let postRepoMock: jest.Mocked<PostRepository>;

  beforeEach(() => {
    profileRepoMock = new ProfileRepository() as jest.Mocked<ProfileRepository>;
    postRepoMock = new PostRepository() as jest.Mocked<PostRepository>;
    service = new ProfileService();

    // inject mocks
    // @ts-ignore
    service["profileRepo"] = profileRepoMock;
    // @ts-ignore
    service["postRepo"] = postRepoMock;

    jest.clearAllMocks();
  });

  const mockProfile = {
    _id: "1",
    user: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    followers: [],
    following: [],
    postsCount: 0,
    booksCount: 0,
    likedPosts: [],
    sharedPosts: [],
    savedPosts: [],
  } as unknown as IProfile; // ✅ Cast to IProfile

  describe("getProfile", () => {


    it("should throw error if profile not found", async () => {
      profileRepoMock.findByUserId.mockResolvedValue(null);
      await expect(service.getProfile("u1")).rejects.toThrow("Profile not found");
    });
  });

  describe("follow", () => {
    it("should throw error if following self", async () => {
      await expect(service.follow("u1", "u1")).rejects.toThrow("Cannot follow yourself");
    });


    it("should throw if addFollowing returns null", async () => {
      profileRepoMock.addFollower.mockResolvedValue({} as any);
      profileRepoMock.addFollowing.mockResolvedValue(null);

      await expect(service.follow("u1", "u2")).rejects.toThrow("Profile not found");
    });
  });

  describe("unfollow", () => {

    it("should throw if removeFollowing returns null", async () => {
      profileRepoMock.removeFollower.mockResolvedValue({} as any);
      profileRepoMock.removeFollowing.mockResolvedValue(null);

      await expect(service.unfollow("u1", "u2")).rejects.toThrow("Profile not found");
    });
  });

  describe("addPostAction", () => {

    it("should throw error if addPostAction returns null", async () => {
      profileRepoMock.addPostAction.mockResolvedValue(null);
      await expect(service.addPostAction("u1", "p1", "like")).rejects.toThrow("Profile not found");
    });
  });

  describe("updateCounts", () => {

    it("should throw if updateCounts returns null", async () => {
      profileRepoMock.updateCounts.mockResolvedValue(null);
      await expect(service.updateCounts("u1", 5, 2)).rejects.toThrow("Profile not found");
    });
  });
});