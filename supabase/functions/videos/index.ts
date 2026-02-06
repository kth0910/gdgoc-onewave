import { createClient } from "supabase";
import { GoogleGenAI } from "npm:@google/genai";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


const allowedOrigins = [
  "http://localhost:5173",
  "https://vidifolio.vercel.app"
];

type VisualStyle = 'standard tech' | 'cyberpunk' | 'nature clean';

// Helper to wait
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced Gemini call to analyze portfolio PDF and generate a 3-part storyboard for a 20s Veo video.
 */
async function generateVeoPrompts(portfolio: any, visualStyle: VisualStyle): Promise<{ part1: string, part2: string, part3: string }> {
  // ... (Keep existing prompt generation logic unchanged, just ensuring it's not lost in replacement)
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using mock prompts.");
    const mock = `Cinematic showcase of ${portfolio.title} with ${visualStyle} aesthetic.`;
    return { part1: mock, part2: mock, part3: mock };
  }

  const promptText = `Task: Create a highly detailed 3-part cinematic video generation storyboard for Google Veo 3.1.
The goal is to create a 20-second portfolio showcase video.

Portfolio Title: ${portfolio.title}
Target Visual Style: ${visualStyle}
Portfolio Data: ${JSON.stringify(portfolio.raw_data || {})}

Narrative Structure (Total 20 seconds):
1. Part 1 (0-5s): Opening / Hook. Introduce the portfolio's theme and the professional identity.
2. Part 2 (5-15s): Core Content. Showcase the key projects, skills, and major achievements. Ensure ALL significant information from the portfolio is visually represented here.
3. Part 3 (15-20s): Ending / Outro. A smooth concluding scene that provides a clear sense of completion and leaves a lasting professional impression.

Styling Guidelines:
- standard tech: Sleek, minimalistic, high-tech glass/metal, blue and white lighting, clean UI overlays.
- cyberpunk: Neon colors (pink, cyan), night city, rain-slicked streets, futuristic hardware, glitch effects.
- nature clean: Natural daylight, soft greens/browns, organic textures, airy atmosphere, eco-friendly tech.

Prompt Requirements:
- Cinematic lighting and 4K resolution feel.
- Dynamic camera movements (slow pan, orbit, or zoom).
- Describe visuals and atmosphere vividy; do not just list text.
- Each part must flow logically from the previous one.

Return ONLY a JSON object with keys: "part1", "part2", "part3". No conversational text.
IMPORTANT: Do not wrap the JSON in markdown code blocks.`;

  const inputParts: any[] = [
      { type: 'text', text: promptText }
  ];

  if (portfolio.pdf_path) {
    try {
      const { data, error } = await supabase.storage
        .from("portfolios")
        .createSignedUrl(portfolio.pdf_path, 3600);

      if (error || !data) {
        console.warn("Failed to create signed URL for PDF:", error);
      } else {
        inputParts.push({
          type: 'document',
          uri: data.signedUrl,
          mime_type: 'application/pdf'
        });
      }
    } catch (e) {
      console.warn("Error processing PDF for Gemini:", e.message);
    }
  }

  try {
    const interaction = await client.interactions.create({
      model: 'gemini-3-flash-preview',
      input: inputParts,
    });

    let text = interaction.outputs?.[0]?.text?.trim() || "{}";
    
    if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const json = JSON.parse(text);
    
    return {
      part1: json.part1 || `Cinematic intro of ${portfolio.title} in ${visualStyle} style.`,
      part2: json.part2 || `Showcasing work and skills of ${portfolio.title} in ${visualStyle} style.`,
      part3: json.part3 || `Professional closing scene for ${portfolio.title} portfolio.`
    };
  } catch (error) {
    console.error("Gemini Prompt Generation Error:", error);
    const fallback = `Cinematic showcase of ${portfolio.title} with ${visualStyle} aesthetic.`;
    return { part1: fallback, part2: fallback, part3: fallback };
  }
}

// Helper to download video from URL and upload to Supabase Storage
// Helper to download video from URL and upload to Supabase Storage
async function downloadAndSaveToStorage(supabase: any, url: string, bucket: string, path: string) {
    console.log(`[Storage] Downloading from ${url} and uploading to ${bucket}/${path}...`);
    
    const headers: Record<string, string> = {};
    // If it's a direct Google API URL (not a generic storage URL), it might need the API Key.
    // However, usually downloadUri is a short-lived signed URL. 
    // We add the key only if it looks like an API endpoint to be safe, or if user specifically requested.
    if (url.includes("generativelanguage.googleapis.com")) {
        headers["x-goog-api-key"] = GEMINI_API_KEY;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`Failed to download video from ${url}: ${response.status} ${response.statusText}`);
    }
    
    if (!response.body) {
        throw new Error("Response body is empty, cannot stream upload.");
    }

    // Use stream directly to save memory (avoid loading entire Blob)
    const { error } = await supabase.storage.from(bucket).upload(path, response.body, {
        contentType: 'video/mp4',
        upsert: true,
        duplex: 'half' 
    });
    
    if (error) {
        console.error(`[Storage] Upload failed:`, error);
        throw error;
    }
    console.log(`[Storage] Saved to ${path}`);
}

// Helper to load video from Storage as Base64 string
async function loadVideoAsBase64(supabase: any, bucket: string, path: string): Promise<string> {
    console.log(`[Storage] Loading ${bucket}/${path} as Base64...`);
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) throw error || new Error("Download failed");
    
    const buffer = await data.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Manual Base64 encoding for Deno compatibility
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}



/**
 * Initiates a Veo 3.1 video generation/extension and waits for completion using GoogleGenAI SDK.
 * Returns the generated video object.
 */
async function callVeo31(prompt: string, duration: number, referenceVideoBase64?: string): Promise<any> {
    const videoConfig: any = {
        numberOfVideos: 1,
        durationSeconds: duration,
        resolution: "720p",
        aspectRatio: "16:9"
    };

    try {
        console.log(`[Veo] Starting generation request. Duration: ${duration}s, Extension: ${!!referenceVideoBase64}`);
        
        // Prepare video input: if Base64 string is provided, construct inlineData object
        let videoInput;
        if (referenceVideoBase64) {
             videoInput = {
                inlineData: {
                    data: referenceVideoBase64,
                    mimeType: "video/mp4"
                }
            };
        }

        let operation = await client.models.generateVideos({
            model: "veo-3.1-fast-generate-preview",
            prompt: prompt,
            video: videoInput,
            config: videoConfig
        });

        // Poll the operation status until the video is ready.
        while (!operation.done) {
            console.log(`[Veo] Operation ${operation.name} in progress... Waiting 5s`);
            await sleep(5000);
            
            // Re-fetch operation status using the SDK method
            operation = await client.operations.getVideosOperation({
                operation: operation,
            });
        }

        if (operation.error) {
            throw new Error(`Veo Operation failed: ${JSON.stringify(operation.error)}`);
        }

        if (!operation.response?.generatedVideos?.[0]) {
            throw new Error("Veo completed but no video returned.");
        }

        return operation.response.generatedVideos[0];

    } catch (error) {
        console.error(`[Veo] SDK Execution Error:`, error);
        throw error;
    }
}



async function processVideoGeneration(
  supabase: any,
  videoRecord: any,
  portfolio: any,
  visualStyle: VisualStyle
) {
  try {
    const videoId = videoRecord.id;
    console.log(`[Mock] Starting mock generation for video ${videoId}`);

    // Simulate processing time (15 seconds)
    console.log(`[Mock] Waiting 15 seconds to simulate generation...`);
    await sleep(15000);

    // Mock Video URL (Public Sample Video)
    const mockVideoUrl = "https://illueaemdsirgpbjzwlz.supabase.co/storage/v1/object/public/videos/3e8c8c79-4cc3-41e2-80e1-46d751d7271c/Feb_07__0449_21s_202602070505_6f1kp.mp4";

    console.log(`[Mock] Finishing generation with sample URL: ${mockVideoUrl}`);

    // Update DB as COMPLETED
    const { error: updateError } = await supabase.from("videos").update({
        status: "COMPLETED",
        video_url: mockVideoUrl,
        ai_metadata: { 
            ...videoRecord.ai_metadata,
            mock: true,
            note: "Generated by Mock Function (No API Cost)",
            segments: [
                { step: 1, status: "completed", mock: true },
                { step: 2, status: "completed", mock: true },
                { step: 3, status: "completed", mock: true }
            ]
        }
    }).eq("id", videoId);

    if (updateError) {
        console.error(`[Mock] DB update failed:`, updateError);
        throw updateError;
    }

    console.log(`[Mock] Successfully finalized video ${videoId}`);

  } catch (error: any) {
    console.error(`[Mock] Generation Failed for ${videoRecord.id}:`, error);
    await supabase.from("videos").update({ 
        status: "FAILED",
        ai_metadata: {
            ...videoRecord.ai_metadata,
            error: error.message
        }
    }).eq("id", videoRecord.id);
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const method = req.method;
  const url = new URL(req.url);
  console.log(`>>>> [Videos] Incoming ${method} request to ${url.pathname}`);

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
    "Access-Control-Allow-Credentials": "true",
  };

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await verifyClerkToken(req);
    const clerkId = payload.sub as string;
    console.log(`[Videos] Authenticated Clerk User: ${clerkId}`);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      console.error(`[Videos] User lookup failed for clerkId ${clerkId}:`, userError);
      throw new Error("User not found.");
    }

    const userId = user.id;
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // Handle POST /videos/generate
    if (req.method === "POST" && pathSegments.includes("generate")) {
      const { portfolio_id, visual_style } = await req.json();
      console.log(`[Videos] Starting generation for portfolio: ${portfolio_id}, Style: ${visual_style}`);

      if (!portfolio_id || !visual_style) {
        throw new Error("portfolio_id and visual_style are required.");
      }

      // 1. Fetch portfolio data
      console.log(`[Videos] Fetching portfolio data for ID: ${portfolio_id}`);
      const { data: portfolio, error: portError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", portfolio_id)
        .eq("user_id", userId)
        .single();

      if (portError || !portfolio) {
        console.error(`[Videos] Portfolio fetch error:`, portError);
        throw new Error("Portfolio not found or unauthorized.");
      }

      // 2. Create initial record IMMEDIATELY with PROCESSING status
      console.log(`[Videos] Creating initial database record...`);
      const { data: videoRecord, error: initError } = await supabase
        .from("videos")
        .insert({
          user_id: userId,
          portfolio_id: portfolio_id,
          status: "PROCESSING",
          ai_metadata: { 
            model: "veo-3.1-fast-generate-preview", 
            visual_style, 
            segments: [], 
            extension_count: 0 
          },
        })
        .select()
        .single();

      if (initError) {
        console.error(`[Videos] Initial DB insert failed:`, initError);
        throw initError;
      }

      // 3. Start Background Processing using EdgeRuntime.waitUntil
      // This allows the function to return the response while the async task continues.
      console.log(`[Videos] Scheduling background generation task for ${videoRecord.id}...`);
      
      EdgeRuntime.waitUntil(
        processVideoGeneration(supabase, videoRecord, portfolio, visual_style as VisualStyle)
      );

      // 4. Return immediately
      console.log(`[Videos] Returning initial response to client.`);
      return new Response(JSON.stringify(videoRecord), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201, // Created
      });
    }

    // Handle GET /videos/{id}
    if (req.method === "GET") {
      const videoId = url.searchParams.get("id") || pathSegments[pathSegments.length - 1];
      console.log(`[Videos] Fetching video record: ${videoId}`);

      if (!videoId || videoId === "videos") throw new Error("Video ID is required.");
  
      const { data: video, error } = await supabase
          .from("videos")
          .select("*")
          .eq("id", videoId)
          .eq("user_id", userId)
          .single();

      if (error || !video) {
          console.warn(`[Videos] Video ${videoId} not found or unauthorized for user ${userId}`);
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
      console.log(`[Videos] Updating video record: ${videoId}`);
      if (!videoId || videoId === "videos") throw new Error("Video ID is required.");

      const updates = await req.json();
      const { data, error } = await supabase
        .from("videos")
        .update(updates)
        .eq("id", videoId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error(`[Videos] Patch update failed for ${videoId}:`, error);
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response("Method or Path not allowed", { status: 405 });
  } catch (error) {
    console.error("[Videos] Global Catch Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
