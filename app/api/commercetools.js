import { createClient } from "@commercetools/sdk-client";
import { createAuthMiddlewareForClientCredentialsFlow } from "@commercetools/sdk-middleware-auth";
import { createHttpMiddleware } from "@commercetools/sdk-middleware-http";

const projectKey = process.env.PROJECT_KEY;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authHost = process.env.AUTH_HOST;
const httpHost = process.env.HTTP_HOST;

const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
  host: authHost,
  projectKey,
  credentials: {
    clientId: clientId,
    clientSecret: clientSecret,
  },
  fetch,
});

const httpMiddleware = createHttpMiddleware({
  host: httpHost,
  fetch,
});

const client = createClient({
  middlewares: [authMiddleware, httpMiddleware],
});

export default client;
