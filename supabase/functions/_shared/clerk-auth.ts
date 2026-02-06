import { verifyToken, createClerkClient } from "@clerk/backend";

const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");
const CLERK_PUBLISHABLE_KEY = Deno.env.get("CLERK_PUBLISHABLE_KEY");

if (!CLERK_SECRET_KEY || !CLERK_PUBLISHABLE_KEY) {
  console.warn("Clerk API keys are not fully set. Auth verification might fail.");
}

const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
  publishableKey: CLERK_PUBLISHABLE_KEY,
});

/**
 * Verifies the Clerk JWT token from the Request headers.
 * Returns the decoded payload if valid.
 */
export async function verifyClerkToken(req: Request) {
  console.log("[Auth] Starting token verification...");
  
  if (!CLERK_SECRET_KEY || !CLERK_PUBLISHABLE_KEY) {
    console.error("[Auth] Missing Clerk API Keys in environment!");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[Auth] Missing or invalid Authorization header");
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];
  console.log(`[Auth] Token received (length: ${token.length}, value: ${token})`);

  try {
    // Use standalone verifyToken instead of clerkClient instance
    const payload = await verifyToken(token, {
      secretKey: CLERK_SECRET_KEY,
    });
    
    console.log("[Auth] Token verified successfully for sub:", payload.sub);
    return payload;
  } catch (err) {
    console.error("[Auth] Clerk Token Verification failed!");
    console.error(`[Auth] Error Name: ${err.name}`);
    console.error(`[Auth] Error Message: ${err.message}`);
    
    if (err.message.includes("jwks")) {
      console.error("[Auth] JWKS retrieval failed. Check network or CLERK_PUBLISHABLE_KEY.");
    }

    throw new Error("Invalid token");
  }
}

/**
 * Example of using other Clerk Backend features
 */
export const clerk = clerkClient;
