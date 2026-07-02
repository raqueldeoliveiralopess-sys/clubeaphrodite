import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { user } = data;
  await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email! },
      { onConflict: "id", ignoreDuplicates: true },
    );

  return NextResponse.redirect(`${origin}/feed`);
}
