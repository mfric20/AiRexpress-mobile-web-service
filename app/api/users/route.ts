import { IUser } from "@/types/IUser";
import { prisma } from "../prisma";
import * as bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

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
    return new Response(
      JSON.stringify({ message: "Error while fetching users", error })
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: IUser = await req.json();
    const plainTextPassword = body.password;
    const saltRounds = 10;

    const hashedPassword = bcrypt.hashSync(plainTextPassword, saltRounds);

    const response = await prisma.user.create({
      data: {
        firstName: body.name,
        lastName: body.lastName,
        email: body.email,
        password: hashedPassword,
      },
    });

    if (response) return new Response(JSON.stringify({ success: true }));
    else return new Response(JSON.stringify({ success: false }));
  } catch (error) {
    console.error("Error while registering new user: ", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "User with this email already exsists!",
      })
    );
  }
}
