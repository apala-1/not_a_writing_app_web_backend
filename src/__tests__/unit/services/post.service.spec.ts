import { PostService } from "../../../services/post.service";
import { PostRepository } from "../../../repository/post.repository";
import { ProfileModel } from "../../../model/profile.model";
import { PostModel } from "../../../model/post.model";
import { HttpError } from "../../../errors/http-error";
import mongoose from "mongoose";

jest.mock("../../../repository/post.repository");
jest.mock("../../../model/profile.model");
jest.mock("../../../model/post.model");

describe("PostService Unit Tests", () => {
  let service: PostService;
  let postRepoMock: jest.Mocked<PostRepository>;

  const userId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    postRepoMock = new PostRepository() as jest.Mocked<PostRepository>;
    service = new PostService();

    jest.clearAllMocks();
  });

  it("should throw if post not found", async () => {
    postRepoMock.getPostById.mockResolvedValue(null);

    await expect(service.getPostById("notfound")).rejects.toThrow(HttpError);
  });

  it("should throw if user is not the author", async () => {
    const postId = "p1";
    postRepoMock.getPostById.mockResolvedValue({ _id: postId, author: "otherId" } as any);

    await expect(service.updatePost(postId, { title: "x" }, userId)).rejects.toThrow(HttpError);
  });

  it("should throw if post not found for deletion", async () => {
    postRepoMock.getPostById.mockResolvedValue(null);

    await expect(service.deletePost("p1", userId)).rejects.toThrow(HttpError);
  });


  /* ---------------- TOGGLE SAVE ---------------- */
  it("should save a post if not saved", async () => {
    const mockProfile: any = { savedPosts: [], save: jest.fn() };
    const mockPost: any = { savesCount: 0, savedBy: [], _id: "p1", save: jest.fn() };

    (ProfileModel.findOne as any).mockResolvedValue(mockProfile);
    (PostModel.findById as any).mockResolvedValue(mockPost);

    const result = await service.toggleSave("p1", userId);

    expect(mockProfile.save).toHaveBeenCalled();
    expect(mockPost.save).toHaveBeenCalled();
    expect(result.savesCount).toBe(1);
  });

  it("should unsave a post if already saved", async () => {
    const mockProfile: any = { savedPosts: ["p1"], save: jest.fn() };
    const mockPost: any = { savesCount: 1, savedBy: [userId], _id: "p1", save: jest.fn() };

    (ProfileModel.findOne as any).mockResolvedValue(mockProfile);
    (PostModel.findById as any).mockResolvedValue(mockPost);

    const result = await service.toggleSave("p1", userId);

    expect(result.savesCount).toBe(0);
  });
});