import { NextApiResponse } from "next";
import { verifyToken, AuthenticatedNextApiRequest } from "../auth";

export function withAuth(handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse) => any) {
  return async (req: any, res: NextApiResponse) => {
    try {
      const user = await verifyToken(req);
      (req as AuthenticatedNextApiRequest).user = user;
      return handler(req as AuthenticatedNextApiRequest, res);
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
