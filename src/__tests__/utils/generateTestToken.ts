import jwt from "jsonwebtoken";

export const generateTestToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1h" }
  );
};
