import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import { NextApiRequest } from "next";
import { prisma } from "./prismadb";

const JWT_SECRET = process.env.JWT_SECRET!;
export const SIGN_MESSAGE = (nonce: string) => `Sign this message to log in: ${nonce}`;

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user: { id: string | number; address: string };
}

export function signToken(payload: { id: string | number; address: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Missing token");
  const token = authHeader.slice(7);
  const payload = jwt.verify(token, JWT_SECRET) as { id: string | number; address: string };
  const user = await prisma.user.findUnique({ where: { id: payload.id as unknown as number } });
  if (!user) throw new Error("Invalid user");
  return { id: user.id, address: user.address };
}

export function verifySignature(address: string, signature: string, nonce: string): boolean {
  const message = SIGN_MESSAGE(nonce);
  const recovered = ethers.verifyMessage(message, signature);
  return recovered.toLowerCase() === address.toLowerCase();
}
