import mongoose from "mongoose";
import { PostRepository } from "../../../repository/post.repository";
import { PostModel } from "../../../model/post.model";

jest.mock("../../../model/post.model");

describe("PostRepository Unit Tests", () => {
  let repository: PostRepository;

  beforeEach(() => {
    repository = new PostRepository();
    jest.clearAllMocks();
  });

  /* -------------------------------------------------- */
  /* CREATE POST */
  /* -------------------------------------------------- */

  it("should create a post", async () => {
    const saveMock = jest.fn().mockResolvedValue({ _id: "post1" });

    (PostModel as any).mockImplementation(() => ({
      save: saveMock,
    }));

    const result = await repository.createPost({ title: "Test" });

    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ _id: "post1" });
  });

  /* -------------------------------------------------- */
  /* GET POST BY ID */
  /* -------------------------------------------------- */

  it("should return post by id", async () => {
    const execMock = jest.fn().mockResolvedValue({ _id: "post1" });

    (PostModel.findById as jest.Mock).mockReturnValue({
      exec: execMock,
    });

    const result = await repository.getPostById("post1");

    expect(PostModel.findById).toHaveBeenCalledWith("post1");
    expect(result).toEqual({ _id: "post1" });
  });

  /* -------------------------------------------------- */
  /* GET ALL POSTS */
  /* -------------------------------------------------- */

  it("should fetch published public posts", async () => {
    const execMock = jest.fn().mockResolvedValue([{ _id: "post1" }]);

    const chainMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: execMock,
    };

    (PostModel.find as jest.Mock).mockReturnValue(chainMock);

    const result = await repository.getAllPosts(0, 10);

    expect(PostModel.find).toHaveBeenCalledWith({
      status: "published",
      visibility: "public",
    });

    expect(result).toEqual([{ _id: "post1" }]);
  });

  /* -------------------------------------------------- */
  /* UPDATE POST */
  /* -------------------------------------------------- */

  it("should update post", async () => {
    const execMock = jest.fn().mockResolvedValue({ _id: "post1" });

    (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: execMock,
    });

    const result = await repository.updatePost("post1", { title: "Updated" });

    expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "post1",
      { title: "Updated" },
      { new: true, runValidators: true }
    );

    expect(result).toEqual({ _id: "post1" });
  });

  /* -------------------------------------------------- */
  /* DELETE POST */
  /* -------------------------------------------------- */

  it("should return true if deleted", async () => {
    (PostModel.findByIdAndDelete as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "post1" }),
    });

    const result = await repository.deletePost("post1");

    expect(result).toBe(true);
  });

  it("should return false if not deleted", async () => {
    (PostModel.findByIdAndDelete as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await repository.deletePost("post1");

    expect(result).toBe(false);
  });

  /* -------------------------------------------------- */
  /* INCREMENT COUNTERS */
  /* -------------------------------------------------- */

  it("should increment views", async () => {
    (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn(),
    });

    await repository.incrementViews("post1");

    expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "post1",
      { $inc: { viewsCount: 1 } }
    );
  });

  it("should decrement likes", async () => {
    (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn(),
    });

    await repository.decrementLikes("post1");

    expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "post1",
      { $inc: { likesCount: -1 } }
    );
  });

  /* -------------------------------------------------- */
  /* GET FEED POSTS */
  /* -------------------------------------------------- */

  it("should fetch feed posts with date filter", async () => {
    const execMock = jest.fn().mockResolvedValue([]);

    (PostModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: execMock,
    });

    await repository.getFeedPosts(
      ["user1"],
      "2024-01-01T00:00:00.000Z",
      5
    );

    expect(PostModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        author: { $in: ["user1"] },
        status: "published",
        visibility: "public",
      })
    );
  });
});