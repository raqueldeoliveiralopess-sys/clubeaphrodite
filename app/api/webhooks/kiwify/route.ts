import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Endpoint do webhook da Kiwify.
 *
 * Autenticação: a Kiwify assina o corpo bruto da requisição com
 * HMAC-SHA1 usando o "Token" configurado no painel do webhook, e
 * envia o resultado em hex como query string `?signature=`.
 * Confirmado empiricamente disparando eventos de teste reais pelo
 * painel da Kiwify e comparando com o corpo exato recebido — não
 * documentado com esse nível de detalhe na doc pública.
 *
 * Payload: os nomes de campo usados abaixo (order_id, order_status,
 * webhook_event_type, Customer.email, Product.product_id,
 * Subscription.id/status) também vêm de eventos de teste reais, não
 * de suposição. `webhook_event_type` é o sinal mais confiável do
 * tipo de evento — em alguns casos (ex.: cancelamento de assinatura)
 * o `order_status` do último pedido não reflete o evento atual.
 */

function isAuthorized(request: NextRequest, rawBody: string): boolean {
  const provided = request.nextUrl.searchParams.get("signature") ?? "";
  const secret = process.env.KIWIFY_WEBHOOK_TOKEN ?? "";
  if (!secret || !provided) return false;

  const expected = createHmac("sha1", secret).update(rawBody).digest("hex");

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

function classifyStatus(signal: string): ParsedEvent["status"] | null {
  if (/refund|reembols/i.test(signal)) return "refunded";
  if (/charge.*back/i.test(signal)) return "refunded";
  if (/cancel/i.test(signal)) return "canceled";
  if (/late|overdue|atras/i.test(signal)) return "late";
  if (/approved|renewed|paid|active|complete/i.test(signal)) return "active";
  return null;
}

function parseEvent(payload: Record<string, unknown>): ParsedEvent {
  const customer = (payload.Customer as Record<string, unknown>) ?? {};
  const subscription = (payload.Subscription as Record<string, unknown>) ?? {};
  const product = (payload.Product as Record<string, unknown>) ?? {};

  const email =
    firstString(customer.email, payload.email)?.toLowerCase() ?? null;

  const orderId = firstString(payload.order_id, payload.id);

  const subscriptionId = firstString(subscription.id, payload.subscription_id);

  const productId = firstString(product.product_id, payload.product_id);

  // webhook_event_type é checado primeiro por ser o sinal mais
  // preciso; order_status/Subscription.status servem de reforço.
  const eventType = firstString(payload.webhook_event_type) ?? "";
  const orderStatus = firstString(payload.order_status, subscription.status) ?? "";

  const status = classifyStatus(eventType) ?? classifyStatus(orderStatus) ?? "pending";

  return { email, orderId, subscriptionId, productId, status };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isAuthorized(request, rawBody)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
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
