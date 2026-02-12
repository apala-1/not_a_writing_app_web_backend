import request from "supertest";
import bcrypt from "bcryptjs";
import { connectToDatabase, disconnectDB } from "../../../database/mondodb";
import { UserModel } from "../../../model/user.model";
import { generateTestToken } from "../../utils/generateTestToken";
import app from "../../../app";

let adminToken: string;
let userToken: string;
let adminUser: any;
let normalUser: any;

beforeAll(async () => {
  await connectToDatabase();

  // Clean the collection completely
  await UserModel.deleteMany({});
  
  adminUser = await UserModel.create({
    name: "Admin",
    email: "admin@test.com",
    password: await bcrypt.hash("password", 10),
    role: "admin",
  });

  normalUser = await UserModel.create({
    name: "User",
    email: "user@test.com",
    password: await bcrypt.hash("password", 10),
    role: "user",
  });

  adminToken = generateTestToken(adminUser);
  userToken = generateTestToken(normalUser);
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  await UserModel.deleteMany({ email: { $regex: /new|updated/ } });
});

it("should create user successfully", async () => {
  const res = await request(app)
    .post("/api/v1/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "New User",
      email: "new@test.com",
      password: "123456",
      role: "user",
    });

  expect(res.status).toBe(201);
  expect(res.body.data.password).toBeUndefined();
});

it("should fail if missing required fields", async () => {
  const res = await request(app)
    .post("/api/v1/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ email: "fail@test.com" });

  expect(res.status).toBe(400);
});

it("should fail if non-admin tries to create", async () => {
  const res = await request(app)
    .post("/api/v1/users")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      name: "Fail",
      email: "fail2@test.com",
      password: "123456",
      role: "user",
    });

  expect(res.status).toBe(403);
});

it("should fail if no token", async () => {
  const res = await request(app)
    .post("/api/v1/users")
    .send({
      name: "Fail",
      email: "fail3@test.com",
      password: "123456",
      role: "user",
    });

  expect(res.status).toBe(401);
});

it("should hash password", async () => {
  await request(app)
    .post("/api/v1/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Hash Test",
      email: "newhash@test.com",
      password: "plain123",
      role: "user",
    });

  const user = await UserModel.findOne({ email: "newhash@test.com" });
  expect(user!.password).not.toBe("plain123");
});

it("should return paginated users", async () => {
  const res = await request(app)
    .get("/api/v1/users?page=1&size=5")
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
});

it("should fail if non-admin", async () => {
  const res = await request(app)
    .get("/api/v1/users")
    .set("Authorization", `Bearer ${userToken}`);

  expect(res.status).toBe(403);
});

it("should fail if no token", async () => {
  const res = await request(app).get("/api/v1/users");
  expect(res.status).toBe(401);
});

it("should return user by id", async () => {
  const res = await request(app)
    .get(`/api/v1/users/${normalUser._id}`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.status).toBe(200);
  expect(res.body.data._id).toBe(normalUser._id.toString());
});

it("should return 404 if user not found", async () => {
  const fakeId = "507f191e810c19729de860ea";

  const res = await request(app)
    .get(`/api/v1/users/${fakeId}`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.status).toBe(404);
});

it("should update allowed fields", async () => {
  const res = await request(app)
    .put(`/api/v1/users/${normalUser._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Updated Name" });

  expect(res.status).toBe(200);
  expect(res.body.data.name).toBe("Updated Name");
});

it("should return 404 if user not found", async () => {
  const fakeId = "507f191e810c19729de860ea";

  const res = await request(app)
    .put(`/api/v1/users/${fakeId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Fail" });

  expect(res.status).toBe(404);
});

it("should fail if non-admin", async () => {
  const res = await request(app)
    .put(`/api/v1/users/${normalUser._id}`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({ name: "Hacker" });

  expect(res.status).toBe(403);
});

it("should delete user", async () => {
  const tempUser = await UserModel.create({
    name: "Temp",
    email: "temp@test.com",
    password: await bcrypt.hash("123456", 10),
    role: "user",
  });

  const res = await request(app)
    .delete(`/api/v1/users/${tempUser._id}`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.status).toBe(200);
});

it("should return 404 if user not found", async () => {
  const fakeId = "507f191e810c19729de860ea";

  const res = await request(app)
    .delete(`/api/v1/users/${fakeId}`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.status).toBe(404);
});
