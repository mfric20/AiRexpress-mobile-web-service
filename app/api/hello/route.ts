import client from "../commercetools";

export async function GET(req: Request, res: Response) {
  try {
    const response = await client.execute({
      method: "GET",
      uri: "/airtim1-webshop-i-cms/products",
    });

    const customers = response.body.results;

    return new Response(JSON.stringify(customers));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch customers" }));
  }
}
