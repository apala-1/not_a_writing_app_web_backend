import { CommentService } from "../../../services/comment.service";
import { CommentRepository } from "../../../repository/comment.repository";
import { PostRepository } from "../../../repository/post.repository";
import { Types } from "mongoose";

// Mock the repositories
jest.mock("../../../repository/comment.repository");
jest.mock("../../../repository/post.repository");

describe("CommentService Unit Tests", () => {
  let service: CommentService;
  let commentRepoMock: jest.Mocked<CommentRepository>;
  let postRepoMock: jest.Mocked<PostRepository>;

  beforeEach(() => {
    commentRepoMock = new CommentRepository() as jest.Mocked<CommentRepository>;
    postRepoMock = new PostRepository() as jest.Mocked<PostRepository>;

    service = new CommentService();

    // Override private repos with mocks
    // @ts-ignore
    service.repo = commentRepoMock;
    // @ts-ignore
    service.postRepo = postRepoMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get comments by post", async () => {
    const mockComments = [{ _id: "c1", content: "comment" }];
    commentRepoMock.findByPost.mockResolvedValue(mockComments as any);

    const result = await service.getCommentsByPost("p1");

    expect(commentRepoMock.findByPost).toHaveBeenCalledWith("p1");
    expect(result).toEqual(mockComments);
  });

  it("should update a comment", async () => {
    const updatedComment = { _id: "c1", content: "updated" };
    commentRepoMock.update.mockResolvedValue(updatedComment as any);

    const result = await service.updateComment("c1", "u1", "updated");

    expect(commentRepoMock.update).toHaveBeenCalledWith("c1", "u1", "updated");
    expect(result).toEqual(updatedComment);
  });

  it("should delete a comment and decrement post comments", async () => {
    const deletedComment = { _id: "c1", post: "p1" };
    commentRepoMock.delete.mockResolvedValue(deletedComment as any);
    postRepoMock.decrementComments.mockResolvedValue({} as any);

    const result = await service.deleteComment("c1", "u1");

    expect(commentRepoMock.delete).toHaveBeenCalledWith("c1", "u1");
    expect(postRepoMock.decrementComments).toHaveBeenCalledWith("p1");
    expect(result).toEqual(deletedComment);
  });
});