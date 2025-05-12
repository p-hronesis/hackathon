import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../lib/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Missing fields" });

  const normalized = address.toLowerCase();
  const user = await prisma.user.findUnique({ where: { address: normalized } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(200).json({ nonce: user.nonce });
}
