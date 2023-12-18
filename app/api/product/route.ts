import client from "../commercetools";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function GET(req: Request, res: Response) {
  try {
    const url = new URL(req.url);
    const token = headers().get("bearer");
    const variantKey = url.searchParams.get("variantKey");

    const verifiedJWT = verifyJWT(token ?? "");

    if (verifiedJWT == false) return new Response("JWT not valid!");

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
        variant: {
          variantKey,
          price: {
            priceId: desiredVariant?.prices?.[0]?.id,
            amount: desiredVariant?.prices?.[0]?.value?.centAmount / 100,
            currency: desiredVariant?.prices?.[0]?.value?.currencyCode,
          },
          image: desiredVariant?.images[0]?.url,
          inventory: {
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
          },
        },
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
        variant: {
          variantKey,
          price: {
            priceId: desiredVariant?.prices?.[0]?.id,
            amount: desiredVariant?.prices?.[0]?.value?.centAmount / 100,
            currency: desiredVariant?.prices?.[0]?.value?.currencyCode,
          },
          image: desiredVariant?.images[0]?.url,
          inventory: {
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
          },
        },
      };
    }

    return new Response(JSON.stringify(formatedProduct));
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch product!" }));
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
