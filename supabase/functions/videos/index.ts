import { serve } from "http/server";
import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

/**
 * Very basic Gemini call helper.
 * You can optimize this with better prompts and structured output.
 */
async function generateVideoMetadataWithGemini(context: any) {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using mock metadata.");
    return {
      model: "veo-3.1-standard",
      prompt: "Generated prompt based on: " + (context.title || "portfolio"),
      extension_count: 0,
      segments: [],
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate video generation parameters for a portfolio titled "${context.title}".
                     Data provided: ${JSON.stringify(context.raw_data || {})}
                     Return JSON with structure: { "prompt": "...", "model": "veo-3.1-standard", "segments": [] }`
            }]
          }]
        }),
      }
    );

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Attempt to extract JSON if Gemini returned markdown code block
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      model: "veo-3.1-standard",
      prompt: generatedText || "Analyze portfolio content",
      segments: [],
    };
  } catch (e) {
    console.error("Gemini Error:", e.name, e.message);
    return { error: "Gemini failed", details: e.message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await verifyClerkToken(req);
    const clerkId = payload.sub as string;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) throw new Error("User not found.");

    const userId = user.id;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean); // e.g. ["videos", "generate"] or ["videos", "ID"]

    // Handle POST /videos/generate
    if (req.method === "POST" && pathSegments.includes("generate")) {
      const { portfolio_id } = await req.json();

      // Fetch portfolio data
      const { data: portfolio, error: portError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", portfolio_id)
        .eq("user_id", userId)
        .single();

      if (portError || !portfolio) throw new Error("Portfolio not found or unauthorized.");

      // Initialize video record
      const { data: videoRecord, error: initError } = await supabase
        .from("videos")
        .insert({
          user_id: userId,
          portfolio_id: portfolio_id,
          status: "PENDING",
        })
        .select()
        .single();

      if (initError) throw initError;

      // Call Gemini (Async or Sync? For Edge Functions, usually we wait or use queue, 
      // but here we'll wait and update the record immediately for simplicity).
      const aiMetadata = await generateVideoMetadataWithGemini({
        title: portfolio.title,
        raw_data: portfolio.raw_data,
      });

      const { data: updatedVideo, error: updateError } = await supabase
        .from("videos")
        .update({
          ai_metadata: aiMetadata,
          status: "READY", // Or 'PROCESSING' if actual video gen is elsewhere
        })
        .eq("id", videoRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(JSON.stringify(updatedVideo), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    // Handle GET /videos/{id} - Download/URL info
    if (req.method === "GET") {
      // Expecting /videos?id=UUID or /videos/UUID
      const videoId = url.searchParams.get("id") || pathSegments[pathSegments.length - 1];
      if (!videoId || videoId === "videos") throw new Error("Video ID is required.");

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .eq("user_id", userId)
        .single();

      if (error || !data) throw new Error("Video not found.");

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle PATCH /videos/{id}/edit
    if (req.method === "PATCH") {
        const videoId = pathSegments[pathSegments.length - 1]; // e.g. /videos/edit/{id} or /videos/{id}
        // Let's assume URL is like /videos/{id} for PATCH
        if (!videoId || videoId === "videos") throw new Error("Video ID is required.");

        const updates = await req.json();
        
        const { data, error } = await supabase
            .from("videos")
            .update(updates)
            .eq("id", videoId)
            .eq("user_id", userId)
          .select()
          .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response("Method or Path not allowed", { status: 405 });
  } catch (error) {
    console.error("[Videos] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
