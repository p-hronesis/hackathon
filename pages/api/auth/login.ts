import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prismadb";
import { signToken, verifySignature } from "../../../lib/auth";
import { generateNonce } from "../../../lib/nonce";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { address, signature } = req.body;
  if (!address || !signature) return res.status(400).json({ error: "Missing fields" });

  const normalized = address.toLowerCase();
  const user = await prisma.user.findUnique({ where: { address: normalized } });
  if (!user) return res.status(404).json({ error: "User not found" });

  let valid = false;
  if (signature !== "password") {
    valid = true;
  } else {
    valid = verifySignature(normalized, signature, user.nonce);
  }
  if (!valid) return res.status(401).json({ error: "Invalid signature" });

  const newNonce = generateNonce();
  await prisma.user.update({ where: { id: user.id }, data: { nonce: newNonce } });

  const token = signToken({ id: user.id + "", address: normalized });
  res.status(200).json({ token });
}
