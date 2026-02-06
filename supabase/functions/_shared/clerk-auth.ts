import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Clerk public JWKS endpoint. 
 * You can find this in your Clerk Dashboard under "API Keys" -> "Advanced" -> "JWKS URL"
 */
const CLERK_JWKS_URL = Deno.env.get("CLERK_JWT_JWKS_URL");

if (!CLERK_JWKS_URL) {
  console.warn("CLERK_JWT_JWKS_URL is not set. Auth verification will fail.");
}

const JWKS = CLERK_JWKS_URL ? createRemoteJWKSet(new URL(CLERK_JWKS_URL)) : null;

export async function verifyClerkToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];

  if (!JWKS) {
    throw new Error("Internal Server Error: JWKS not configured");
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    return payload;
  } catch (err) {
    console.error("JWT Verification failed:", err);
    throw new Error("Invalid token");
  }
}
