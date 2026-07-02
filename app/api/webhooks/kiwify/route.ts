import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Endpoint do webhook da Kiwify. O formato exato do payload varia
 * entre a doc nova (type/data) e o formato clássico
 * (order_status/Customer/Subscription) — por isso o parser abaixo é
 * defensivo e tenta múltiplos caminhos. Antes de confiar 100% no
 * mapeamento de status, dispare um evento de teste real da Kiwify
 * contra um túnel local (ngrok/cloudflared) e confira o
 * `raw_payload` gravado no Supabase.
 */

function isAuthorized(request: NextRequest): boolean {
  const provided = request.nextUrl.searchParams.get("token") ?? "";
  const expected = process.env.KIWIFY_WEBHOOK_TOKEN ?? "";
  if (!expected || !provided) return false;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

type ParsedEvent = {
  email: string | null;
  orderId: string | null;
  subscriptionId: string | null;
  productId: string | null;
  status: "active" | "canceled" | "refunded" | "late" | "pending";
};

function parseEvent(payload: Record<string, unknown>): ParsedEvent {
  const data = (payload.data as Record<string, unknown>) ?? {};
  const customer =
    (payload.Customer as Record<string, unknown>) ??
    (payload.customer as Record<string, unknown>) ??
    (data.customer as Record<string, unknown>) ??
    {};
  const subscription =
    (payload.Subscription as Record<string, unknown>) ??
    (payload.subscription as Record<string, unknown>) ??
    (data.subscription as Record<string, unknown>) ??
    {};
  const product =
    (payload.Product as Record<string, unknown>) ??
    (data.product as Record<string, unknown>) ??
    {};

  const email = firstString(
    customer.email,
    payload.email,
    data.email,
  )?.toLowerCase() ?? null;

  const orderId = firstString(
    payload.order_id,
    data.order_id,
    payload.id,
    data.id,
  );

  const subscriptionId = firstString(
    subscription.id,
    payload.subscription_id,
    data.subscription_id,
  );

  const productId = firstString(
    product.product_id,
    product.id,
    payload.product_id,
    data.product_id,
  );

  const statusSignal = firstString(
    payload.order_status,
    data.order_status,
    payload.type,
    data.status,
    subscription.status,
    payload.webhook_event_type,
  ) ?? "";

  let status: ParsedEvent["status"] = "pending";
  if (/refund|chargeback|reembols/i.test(statusSignal)) {
    status = "refunded";
  } else if (/cancel/i.test(statusSignal)) {
    status = "canceled";
  } else if (/late|overdue|atras/i.test(statusSignal)) {
    status = "late";
  } else if (/approved|paid|active|complete/i.test(statusSignal)) {
    status = "active";
  }

  return { email, orderId, subscriptionId, productId, status };
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const event = parseEvent(payload as Record<string, unknown>);

  if (!event.email) {
    // Sem e-mail não há como associar a assinatura a um membro.
    // Retorna 200 para não gerar reenvios infinitos, mas nada é gravado.
    return NextResponse.json({ received: true, warning: "no email in payload" });
  }

  const supabase = createAdminClient();

  const row = {
    email: event.email,
    kiwify_order_id: event.orderId,
    kiwify_subscription_id: event.subscriptionId,
    product_id: event.productId,
    status: event.status,
    raw_payload: payload,
  };

  if (event.subscriptionId) {
    await supabase
      .from("subscriptions")
      .upsert(row, { onConflict: "kiwify_subscription_id" });
  } else if (event.orderId) {
    await supabase
      .from("subscriptions")
      .upsert(row, { onConflict: "kiwify_order_id" });
  } else {
    await supabase.from("subscriptions").insert(row);
  }

  return NextResponse.json({ received: true });
}
