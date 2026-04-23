import "server-only";
import { createDepixCheckout } from "@/lib/depix/create-checkout";
import { assertUrlAllowedForPaymentCallbacks, getPublicSiteUrl } from "@/lib/site-url";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  countAvailableCodes,
  getProductBySlug,
} from "@/services/checkout/product-by-slug.service";

export interface CreateCheckoutOrderInput {
  planSlug: string;
  customerName: string;
  customerEmail: string;
  taxIdDigits: string;
  /** DDD (2 dígitos) e número (9 dígitos, começando em 9). */
  phoneArea: string;
  phoneNumber: string;
  clientIp: string | null;
}

export interface CreateCheckoutOrderResult {
  payUrl: string;
  orderId: string;
}

export async function createCheckoutOrder(
  input: CreateCheckoutOrderInput
): Promise<CreateCheckoutOrderResult> {
  const product = await getProductBySlug(input.planSlug);
  if (!product) {
    throw new Error("Produto não encontrado.");
  }

  const available = await countAvailableCodes(product.id);
  if (available < 1) {
    throw new Error("Produto sem estoque no momento.");
  }

  const supabase = createServiceRoleClient();
  const site = getPublicSiteUrl();
  assertUrlAllowedForPaymentCallbacks(site);
  const webhookUrl = `${site}/api/webhooks/depix`;

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      total_amount: product.price,
      customer_email: input.customerEmail.trim().toLowerCase(),
      ip_address: input.clientIp,
    })
    .select("id")
    .single();

  if (orderErr || !orderRow) {
    throw new Error(orderErr?.message ?? "Falha ao criar pedido.");
  }

  const orderId = orderRow.id as string;

  const { error: itemErr } = await supabase.from("order_items").insert({
    order_id: orderId,
    product_id: product.id,
    price: product.price,
  });

  if (itemErr) {
    await supabase.from("orders").delete().eq("id", orderId);
    throw new Error(itemErr.message ?? "Falha ao criar item do pedido.");
  }

  try {
    const { checkoutId, payUrl } = await createDepixCheckout({
      amount: product.price,
      description: `${product.name} (${product.slug ?? product.id})`,
      callbackUrl: webhookUrl,
      redirectUrl: `${site}/checkout/sucesso?ref=${encodeURIComponent(orderId)}`,
      metadata: {
        order_id: orderId,
        plan_slug: product.slug ?? null,
        customer_email: input.customerEmail.trim().toLowerCase(),
      },
    });

    const { error: updErr } = await supabase
      .from("orders")
      .update({ depix_checkout_id: checkoutId })
      .eq("id", orderId);

    if (updErr) {
      console.error("DePix: pedido criado mas falha ao salvar checkout id", updErr);
    }

    return { payUrl, orderId };
  } catch (e) {
    await supabase.from("orders").delete().eq("id", orderId);
    throw e instanceof Error ? e : new Error(String(e));
  }
}
