import { createClient } from "@commercetools/sdk-client";
import { createAuthMiddlewareForClientCredentialsFlow } from "@commercetools/sdk-middleware-auth";
import { createHttpMiddleware } from "@commercetools/sdk-middleware-http";

export async function GET(req, res) {
  const projectKey = "airtim1-webshop-i-cms";
  const clientId = "54XWWcDIYMSH1QmlVsdihWJn";
  const clientSecret = "m5h9PcQ8GOn6tjI9n8yHwpYxuiyxrxDc";
  const authHost = "https://auth.eu-central-1.aws.commercetools.com";
  const httpHost = "https://api.eu-central-1.aws.commercetools.com";

  const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
    host: authHost,
    projectKey,
    credentials: {
      clientId: clientId,
      clientSecret: clientSecret,
    },
    scopes: [
      "manage_customers:airtim1-webshop-i-cms manage_my_profile:airtim1-webshop-i-cms",
    ],
    fetch,
  });

  const httpMiddleware = createHttpMiddleware({
    host: httpHost,
    fetch,
  });

  const client = createClient({
    middlewares: [authMiddleware, httpMiddleware],
  });

  try {
    const response = await client.execute({
      method: "GET",
      uri: "/airtim1-webshop-i-cms/customers",
    });

    console.log(response.body.results);

    const customers = response.body.results;

    return new Response(JSON.stringify(customers));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch customers" }));
  }
}
