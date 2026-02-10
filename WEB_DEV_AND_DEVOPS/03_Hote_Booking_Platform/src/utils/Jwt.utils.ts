import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY!;

export function signToken(payload: {
  userId: string;
  role: "customer" | "owner";
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: "customer" | "owner";
  };
}
