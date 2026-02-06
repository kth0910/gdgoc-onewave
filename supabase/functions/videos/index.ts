import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

type VisualStyle = 'standard tech' | 'cyberpunk' | 'nature clean';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForOperation(operationId: string): Promise<any> {
    while (true) {
        const status = await getOperationStatus(operationId);
        if (status.done) {
            if (status.error) throw new Error(`Veo Operation failed: ${JSON.stringify(status.error)}`);
            return status.response;
        }
        console.log(`[Veo] Waiting for operation ${operationId}...`);
        await sleep(4000); // 4초 대기
    }
}

/**
 * Enhanced Gemini call to analyze portfolio PDF and generate a Veo 3.1 prompt.
 */
async function generateVeoPrompt(portfolio: any, visualStyle: VisualStyle): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using mock metadata.");
    return `Generate a cinematic portfolio video for ${portfolio.title} in ${visualStyle} style.`;
  }

  let pdfBase64 = "";
  if (portfolio.pdf_path) {
    try {
      const { data, error } = await supabase.storage.from("portfolios").download(portfolio.pdf_path);
      if (data) {
        const arrayBuffer = await data.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        pdfBase64 = btoa(binary);
      }
    } catch (e) {
      console.warn("PDF download/encoding failed:", e.message);
    }
  }

  const parts: any[] = [
    {
      text: `Task: Create a highly detailed cinematic video generation prompt for Google Veo 3.1.
Portfolio Title: ${portfolio.title}
Target Visual Style: ${visualStyle}
Portfolio Data: ${JSON.stringify(portfolio.raw_data || {})}

Styling Guidelines:
- standard tech: Sleek, minimalistic, high-tech glass/metal, blue and white lighting, clean UI overlays.
- cyberpunk: Neon colors (pink, cyan), night city, rain-slicked streets, futuristic hardware, glitch effects.
- nature clean: Natural daylight, soft greens/browns, organic textures, airy atmosphere, eco-friendly tech.

Prompt Requirements:
- Cinematic lighting and 4K resolution feel.
- Dynamic camera movement (slow pan or zoom).
- Do not mention the text from the portfolio too literally, describe the visual representation of it.
- Return ONLY the final prompt string. No conversational text.`
    }
  ];

  if (pdfBase64) {
    parts.push({
      inline_data: {
        mime_type: "application/pdf",
        data: pdfBase64
      }
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );

    const result = await response.json();
    const prompt = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return prompt || `Cinematic showcase of ${portfolio.title} with ${visualStyle} aesthetic.`;
  } catch (error) {
    console.error("Gemini Prompt Generation Error:", error);
    return `Cinematic showcase of ${portfolio.title} with ${visualStyle} aesthetic.`;
  }
}

/**
 * Initiates a Veo 3.1 video generation or extension.
 */
async function callVeo31(prompt: string, duration: number, referenceVideoUri?: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-standard:generateVideo?key=${GEMINI_API_KEY}`;
  
  const body: any = {
    prompt,
    videoConfig: {
      durationSeconds: duration,
      fps: 24,
      resolution: "720p",
      aspectRatio: "16:9"
    }
  };

  if (referenceVideoUri) {
    body.videoConfig.referenceVideo = {
      fileUri: referenceVideoUri
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return await response.json();
}


/**
 * Polls the status of a long-running operation.
 */
async function getOperationStatus(operationId: string): Promise<any> {
    const name = operationId.startsWith('operations/') ? operationId : `operations/${operationId}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${name}?key=${GEMINI_API_KEY}`;
    const response = await fetch(url);
    return await response.json();
}

Deno.serve(async (req) => {
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
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // Handle POST /videos/generate
    if (req.method === "POST" && pathSegments.includes("generate")) {
      const { portfolio_id, visual_style } = await req.json();

      if (!portfolio_id || !visual_style) {
        throw new Error("portfolio_id and visual_style are required.");
      }

      // 1. Fetch portfolio data
      const { data: portfolio, error: portError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", portfolio_id)
        .eq("user_id", userId)
        .single();

      if (portError || !portfolio) throw new Error("Portfolio not found or unauthorized.");

      // 2. Generate Veo Prompt using Gemini
      const prompt = await generateVeoPrompt(portfolio, visual_style as VisualStyle);

      // Create initial record
      const { data: videoRecord, error: initError } = await supabase
        .from("videos")
        .insert({
          user_id: userId,
          portfolio_id: portfolio_id,
          status: "PROCESSING",
          ai_metadata: { model: "veo-3.1-standard", prompt, visual_style, segments: [], extension_count: 0 },
        })
        .select()
        .single();

      if (initError) throw initError;

      try {
        // 3. Start Initial Veo Generation (8s)
        console.log("[Veo] Starting initial 8s segment...");
        const res1 = await callVeo31(prompt, 8);
        const op1 = await waitForOperation(res1.name);
        const videoUri1 = op1.video.uri;

        // 4. First Extension (8s) -> Total 16s
        console.log("[Veo] Starting first 8s extension...");
        const res2 = await callVeo31(prompt, 8, videoUri1);
        const op2 = await waitForOperation(res2.name);
        const videoUri2 = op2.video.uri;

        // 5. Second Extension (4s) -> Total 20s
        console.log("[Veo] Starting final 4s extension...");
        const res3 = await callVeo31(prompt, 4, videoUri2);
        const op3 = await waitForOperation(res3.name);
        
        const finalVideoUrl = op3.video.downloadUri || op3.video.uri;

        // 6. Update record as COMPLETED
        const { data: completedVideo, error: updateError } = await supabase
          .from("videos")
          .update({
            status: "COMPLETED",
            video_url: finalVideoUrl,
            ai_metadata: {
                ...videoRecord.ai_metadata,
                final_video_uri: op3.video.uri,
                extension_count: 2,
                segments: [res1.name, res2.name, res3.name]
            }
          })
          .eq("id", videoRecord.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(completedVideo), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });

      } catch (error) {
        console.error("[Veo] Generation Sequence Failed:", error);
        await supabase.from("videos").update({ status: "FAILED" }).eq("id", videoRecord.id);
        throw error;
      }
    }

    // Handle GET /videos/{id} - Simple return
    if (req.method === "GET") {
      const videoId = url.searchParams.get("id") || pathSegments[pathSegments.length - 1];
      if (!videoId || videoId === "videos") throw new Error("Video ID is required.");
  
      const { data: video, error } = await supabase
          .from("videos")
          .select("*")
          .eq("id", videoId)
          .eq("user_id", userId)
          .single();

      if (error || !video) {
          return new Response(JSON.stringify({ error: "Video not found or unauthorized" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
          });
      }

      return new Response(JSON.stringify(video), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
      });
    }

    // Handle PATCH /videos/{id}/edit
    if (req.method === "PATCH") {
        const videoId = pathSegments[pathSegments.length - 1];
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
