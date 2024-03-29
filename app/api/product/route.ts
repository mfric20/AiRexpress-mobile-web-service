import { IProduct } from "@/types/IProduct";
import client from "../commercetools";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request, res: Response) {
  try {
    const url = new URL(req.url);
    const token = headers().get("bearer");
    const variantKey = url.searchParams.get("variantKey");

    const verifiedJWT = verifyJWT(token ?? "");

    if (verifiedJWT == false)
      return new Response(
        JSON.stringify({
          success: false,
          message: "JWT not valid!",
          data: [],
        })
      );

    const productKey =
      variantKey?.split("-")[0] + "-" + variantKey?.split("-")[1];

    const product = await client.execute({
      method: "GET",
      uri: `/airexpress/products/key=${productKey}`,
    });

    let formatedProduct;

    if (variantKey == product?.body?.masterData?.current?.masterVariant?.key) {
      const desiredVariant = product?.body?.masterData?.current?.masterVariant;
      formatedProduct = {
        productId: product?.body?.id,
        version: product?.body?.version,
        name: product?.body?.masterData?.current?.name?.["en-US"],
        description: product?.body?.masterData?.current?.description?.["en-US"],
        variantKey: variantKey,
        priceId: desiredVariant?.prices?.[0]?.id,
        amount: desiredVariant?.prices?.[0]?.value?.centAmount / 100,
        inventoryId:
          desiredVariant?.availability?.channels?.[
            "9fce1ee9-e108-4654-a6b4-0f74a1008dc8"
          ]?.id,
        inventoryVersion:
          desiredVariant?.availability?.channels?.[
            "9fce1ee9-e108-4654-a6b4-0f74a1008dc8"
          ]?.version,
        quantity:
          desiredVariant?.availability?.channels?.[
            "9fce1ee9-e108-4654-a6b4-0f74a1008dc8"
          ]?.availableQuantity,
      };
    } else {
      const desiredVariant = product?.body?.masterData?.current?.variants?.find(
        (variant: any) => variant?.key == variantKey
      );
      formatedProduct = {
        productId: product?.body?.id,
        version: product?.body?.version,
        name: product?.body?.masterData?.current?.name?.["en-US"],
        description: product?.body?.masterData?.current?.description?.["en-US"],
        variantKey: variantKey,
        priceId: desiredVariant?.prices?.[0]?.id,
        amount: desiredVariant?.prices?.[0]?.value?.centAmount / 100,
        inventoryId:
          desiredVariant?.availability?.channels?.[
            "9fce1ee9-e108-4654-a6b4-0f74a1008dc8"
          ]?.id,
        inventoryVersion:
          desiredVariant?.availability?.channels?.[
            "9fce1ee9-e108-4654-a6b4-0f74a1008dc8"
          ]?.version,
        quantity:
          desiredVariant?.availability?.channels?.[
            "9fce1ee9-e108-4654-a6b4-0f74a1008dc8"
          ]?.availableQuantity,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Fetching successful!",
        data: [formatedProduct],
      })
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify(
        JSON.stringify({
          success: false,
          message: error,
          data: [],
        })
      )
    );
  }
}

export async function POST(req: Request, res: Response) {
  const url = new URL(req.url);
  const token = headers().get("bearer");
  const productData: IProduct = await req.json();

  const verifiedJWT = verifyJWT(token ?? "");

  if (verifiedJWT == false)
    return new Response(
      JSON.stringify({
        success: false,
        message: "JWT not valid!",
        data: [],
      })
    );

  try {
    const productResponse = await client.execute({
      method: "POST",
      uri: `/airexpress/products/${productData.productID}`,
      body: {
        version: productData.version,
        actions: [
          {
            action: "changeName",
            name: {
              "EN-US": productData.name,
            },
          },
          {
            action: "setDescription",
            description: {
              "EN-US": productData.description,
            },
          },
          {
            action: "changePrice",
            priceId: `${productData.priceId}`,
            price: {
              value: {
                currencyCode: "EUR",
                centAmount: productData.amount * 100,
              },
            },
            staged: true,
          },
        ],
      },
    });

    const inventoryResponse = await client.execute({
      method: "POST",
      uri: `/airexpress/inventory/${productData.inventoryId}`,
      body: {
        version: productData.inventoryVersion,
        actions: [
          {
            action: "changeQuantity",
            quantity: productData.quantity,
          },
        ],
      },
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ success: false }));
  }
}

const verifyJWT = (token: string) => {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  try {
    const userData = jwt.verify(token, jwtSecret);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
