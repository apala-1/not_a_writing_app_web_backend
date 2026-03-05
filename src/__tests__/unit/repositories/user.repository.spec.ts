import { UserModel } from "../../../model/user.model";
import { UserRepository } from "../../../repository/user.repository";

jest.mock("../../../model/user.model"); // Mock the Mongoose model

describe("UserRepository Unit Tests", () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create and save a user", async () => {
      const userData = { name: "Test User", email: "test@example.com" };
      const mockSave = jest.fn().mockResolvedValue(userData);
      (UserModel as any).mockImplementation(() => ({ save: mockSave }));

      const result = await repo.createUser(userData as any);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });
  });

  describe("getUserByEmail", () => {
    it("should find user by email", async () => {
      const user = { _id: "id1", email: "test@example.com" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

      const result = await repo.getUserByEmail("test@example.com");

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(result).toEqual(user);
    });
  });

  describe("getUserByUsername", () => {
    it("should find user by username", async () => {
      const user = { _id: "id2", username: "testuser" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

      const result = await repo.getUserByUsername("testuser");

      expect(UserModel.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(result).toEqual(user);
    });
  });

  describe("getUserById", () => {
    it("should find user by id", async () => {
      const user = { _id: "id3" };
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

      const result = await repo.getUserById("id3");

      expect(UserModel.findById).toHaveBeenCalledWith("id3");
      expect(result).toEqual(user);
    });
  });

  describe("getAllUsers / getUsersPaginated", () => {
    it("should return users with skip and limit", async () => {
      const users = [{ _id: "1" }, { _id: "2" }];
      (UserModel.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(users),
      });

      const result = await repo.getAllUsers(0, 10);
      const paginated = await repo.getUsersPaginated(5, 5);

      expect(result).toEqual(users);
      expect(paginated).toEqual(users);
    });
  });

  describe("updateUser", () => {
    it("should update a user and return new document", async () => {
      const updatedUser = { _id: "id4", name: "Updated" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) });

      const result = await repo.updateUser("id4", { name: "Updated" });

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "id4",
        { name: "Updated" },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe("countUsers", () => {
    it("should return the number of users", async () => {
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(5) });

      const count = await repo.countUsers();

      expect(count).toBe(5);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return true if deleted", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: "id5" }) });

      const result = await repo.deleteUser("id5");

      expect(result).toBe(true);
    });

    it("should return false if user not found", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await repo.deleteUser("idNotExist");

      expect(result).toBe(false);
    });
  });
});