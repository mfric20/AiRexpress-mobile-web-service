import { IUser } from "@/types/IUser";
import { prisma } from "../prisma";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET(req: Request, res: Response) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

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
      console.log(email), console.log(JWT_SECRET);
      const token = jwt.sign(
        { email: email?.toString() } ?? "",
        JWT_SECRET ?? "defaultSecret",
        {
          expiresIn: "2h",
        }
      );

      return new Response(
        JSON.stringify({
          success: verfication,
          message: "Login successful!",
          data: [
            {
              email: user?.email,
              firstName: user?.firstName,
              lastName: user?.lastName,
              jwt: token,
            },
          ],
        })
      );
    }

    return new Response(
      JSON.stringify({
        success: verfication,
        message: "Incorrect username or password!",
        data: [],
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
