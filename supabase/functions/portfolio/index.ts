import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


const allowedOrigins = [
  "http://localhost:5173",
  "https://vidifolio.vercel.app"
];

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const method = req.method;
  console.error(`>>>> [DEBUG] Incoming ${method} request from origin: ${origin}`);

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
    "Access-Control-Allow-Credentials": "true",
  };

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (method === "OPTIONS") {
    console.error(">>>> [DEBUG] Responding to OPTIONS preflight");
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

    // GET /portfolio - 전체 목록 조회
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // POST /portfolio - 새 포트폴리오 생성 (multipart/form-data mandatory)
    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
        throw new Error("Content-Type must be multipart/form-data to support file uploads.");
      }

      let title: string;
      let rawData: any = null;
      let pdfFile: File | null = null;

      try {
        const formData = await req.formData();
        title = formData.get("title") as string;
        const rawDataStr = formData.get("raw_data") as string | null;
        rawData = rawDataStr ? JSON.parse(rawDataStr) : null;
        pdfFile = formData.get("pdf") as File | null;
      } catch (e) {
        throw new Error(`Failed to decode form data: ${e.message}`);
      }

      if (!title) throw new Error("Title is required.");

      let pdfPath: string | null = null;

      // PDF 파일이 필수라면 여기서 pdfFile 존재 여부를 체크할 수도 있습니다.
      // 현재는 선택사항으로 유지하되, 있다면 업로드합니다.
      if (pdfFile && pdfFile.size > 0) {
        const safeName = encodeURIComponent(pdfFile.name);
        const filePath = `${userId}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolios")
          .upload(filePath, pdfFile, {
            contentType: pdfFile.type,
            upsert: false
          });

        if (uploadError) throw new Error("PDF upload failed: " + uploadError.message);
        pdfPath = filePath;
      }

      const { data, error } = await supabase
        .from("portfolios")
        .insert({
          user_id: userId,
          title,
          pdf_path: pdfPath,
          raw_data: rawData,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    // DELETE /portfolio?id=<id> - 포트폴리오 삭제
    if (req.method === "DELETE") {
      const portfolioId = url.searchParams.get("id");
      if (!portfolioId) throw new Error("Portfolio ID is required.");

      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", portfolioId)
        .eq("user_id", userId);

      if (error) throw error;

      return new Response(JSON.stringify({ message: "Deleted." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Portfolio] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
