import { IUser } from "@/types/IUser";
import { prisma } from "../prisma";
import * as bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request, res: Response) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const password = url.searchParams.get("password");

    const user = await prisma.user.findFirst({
      where: {
        email: email ?? "",
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        password: true,
      },
    });

    const verfication = await bcrypt.compare(
      password ?? "",
      user?.password ?? "0"
    );

    if (verfication) {
      return new Response(
        JSON.stringify({
          success: verfication,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
        })
      );
    }

    return new Response(
      JSON.stringify({
        success: verfication,
        email: "",
        firstName: "",
        lastName: "",
      })
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(
      JSON.stringify({ message: "Error while fetching user", error })
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
