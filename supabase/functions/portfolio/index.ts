import { createClient } from "supabase";
import { verifyClerkToken } from "../_shared/clerk-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

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

    // POST /portfolio - 새 포트폴리오 생성 (multipart/form-data)
    if (req.method === "POST") {
      const formData = await req.formData();
      const title = formData.get("title") as string;
      const rawData = formData.get("raw_data") as string | null;
      const pdfFile = formData.get("pdf") as File | null;

      if (!title) throw new Error("Title is required.");

      let pdfPath: string | null = null;

      // PDF 파일이 있으면 Supabase Storage에 업로드
      if (pdfFile) {
        const safeName = encodeURIComponent(pdfFile.name);
        const filePath = `${userId}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolios")
          .upload(filePath, pdfFile, {
            contentType: pdfFile.type,
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
          raw_data: rawData ? JSON.parse(rawData) : null,
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
    console.error("[Portfolios] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
