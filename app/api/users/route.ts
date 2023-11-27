import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request, res: Response) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    const users = await prisma.user.findFirst({
      where: {
        email: email ?? "",
      },
    });

    return new Response(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }));
  }
}
