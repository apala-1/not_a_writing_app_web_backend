import { Comment } from "../../../model/comment.model";
import { Types } from "mongoose";
import { CommentRepository } from "../../../repository/comment.repository";

jest.mock("../../../model/comment.model");

describe("CommentRepository Unit Tests", () => {
  let repository: CommentRepository;

  beforeEach(() => {
    repository = new CommentRepository();
    jest.clearAllMocks();
  });

  /* -------------------------------------------------- */
  /* CREATE */
  /* -------------------------------------------------- */

  it("should create a comment", async () => {
    const mockComment = { _id: "c1", content: "hello" };

    (Comment.create as jest.Mock).mockResolvedValue(mockComment);

    const result = await repository.create({
      content: "hello",
    } as any);

    expect(Comment.create).toHaveBeenCalledWith({
      content: "hello",
    });

    expect(result).toEqual(mockComment);
  });

  /* -------------------------------------------------- */
  /* FIND BY POST (with replies mapping) */
  /* -------------------------------------------------- */

  it("should return comments with nested replies", async () => {
    const parentComment = {
      _id: new Types.ObjectId(),
      toObject: jest.fn().mockReturnValue({
        _id: "parent1",
        content: "parent",
      }),
    };

    const replyComment = {
      _id: new Types.ObjectId(),
      parentComment: parentComment._id,
    };

    // First find → parent comments
    (Comment.find as jest.Mock)
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([parentComment]),
      })
      // Second find → replies
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([replyComment]),
      });

    const result = await repository.findByPost(
      new Types.ObjectId().toString()
    );

    expect(Comment.find).toHaveBeenCalledTimes(2);

    expect(result[0]).toHaveProperty("replies");
    expect(result[0].replies.length).toBe(1);
  });

  /* -------------------------------------------------- */
  /* UPDATE */
  /* -------------------------------------------------- */

  it("should update comment if owned by user", async () => {
    const updatedComment = { _id: "c1", content: "updated" };

    (Comment.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedComment);

    const result = await repository.update(
      "commentId",
      "userId",
      "updated"
    );

    expect(Comment.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "commentId",
        user: "userId",
      },
      { content: "updated" },
      { new: true }
    );

    expect(result).toEqual(updatedComment);
  });

  /* -------------------------------------------------- */
  /* DELETE */
  /* -------------------------------------------------- */

  it("should delete comment and its replies", async () => {
    const mockDeletedComment = {
      _id: new Types.ObjectId(),
    };

    (Comment.findOneAndDelete as jest.Mock).mockResolvedValue(
      mockDeletedComment
    );

    (Comment.deleteMany as jest.Mock).mockResolvedValue({});

    const result = await repository.delete(
      new Types.ObjectId().toString(),
      new Types.ObjectId().toString()
    );

    expect(Comment.findOneAndDelete).toHaveBeenCalled();
    expect(Comment.deleteMany).toHaveBeenCalledWith({
      parentComment: mockDeletedComment._id,
    });

    expect(result).toEqual(mockDeletedComment);
  });

  it("should not delete replies if comment not found", async () => {
    (Comment.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const result = await repository.delete(
      new Types.ObjectId().toString(),
      new Types.ObjectId().toString()
    );

    expect(Comment.deleteMany).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});