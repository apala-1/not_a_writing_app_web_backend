import request from "supertest";
import bcrypt from "bcryptjs";
import { UserModel } from "../../../model/user.model";
import { generateTestToken } from "../../utils/generateTestToken";
import app from "../../../app";
import { connectToDatabase } from "../../../database/mondodb";

let user: any;
let token: string;

beforeAll(async () => {
    await connectToDatabase();

  user = await UserModel.create({
    name: "Self",
    email: "self@test.com",
    password: await bcrypt.hash("password", 10),
    role: "user",
  });

  token = generateTestToken(user);
});

it("should return logged-in user", async () => {
  const res = await request(app)
    .get("/api/v1/auth/me")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.data.email).toBe("self@test.com");
});

it("should fail if no token", async () => {
  const res = await request(app).get("/api/v1/auth/me");
  expect(res.status).toBe(401);
});

it("should update allowed fields", async () => {
  const res = await request(app)
    .put("/api/v1/auth/me")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "New Self" });

  expect(res.status).toBe(200);
  expect(res.body.data.name).toBe("New Self");
});

it("should NOT update role", async () => {
  const res = await request(app)
    .put("/api/v1/auth/me")
    .set("Authorization", `Bearer ${token}`)
    .send({ role: "admin" });

  expect(res.body.data.role).toBe("user");
});

it("should hash password if updated", async () => {
  await request(app)
    .put("/api/v1/auth/me")
    .set("Authorization", `Bearer ${token}`)
    .send({ password: "newpass123" });

  const updated = await UserModel.findOne({ email: "self@test.com" });
  expect(updated!.password).not.toBe("newpass123");
});

it("should return 401 if user not found", async () => {
  await UserModel.deleteMany({ email: "self@test.com" });

  const res = await request(app)
    .put("/api/v1/auth/me")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Ghost" });

  expect(res.status).toBe(401);
});