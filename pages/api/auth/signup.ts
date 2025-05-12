import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import crypto from "crypto";
import { prisma } from "../../../lib/prismadb";
import { generateNonce } from "../../../lib/nonce";
import { SIGN_MESSAGE } from "../../../lib/auth";

function encrypt(text: string): string {
  const algorithm = "aes-256-cbc";
  const encryptionPassword = process.env.ENCRYPTION_PASSWORD;
  if (!encryptionPassword) {
    throw new Error("ENCRYPTION_PASSWORD environment variable is not set.");
  }

  const key = crypto.scryptSync(encryptionPassword, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  // Prepend the iv to the encrypted text (separated by a colon) so it can be used for decryption later
  return iv.toString("hex") + ":" + encrypted;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "missing address" });

  const normalized = address.toLowerCase();
  const nonce = generateNonce();

  const user = await prisma.user.findUnique({ where: { address: normalized } });

  if (user) {
    return res.status(400).json({ error: "user already exist" });
  }

  const wallet = ethers.Wallet.createRandom();
  const aiWalletAddress = wallet.address.toString();
  const privateKey = wallet.privateKey.toString();
  const encryptedPrivateKey = encrypt(privateKey);

  await prisma.user.create({
    data: { address: normalized, nonce, aiWalletAddress, encryptedPrivateKey },
  });

  res.status(200).json({ message: SIGN_MESSAGE(nonce) });
}
