import type { Order, OrderStatus } from "@/lib/api/account";
import { formatKES, toMsisdn } from "@/lib/format";
import { BRAND_NAME } from "@/lib/contact";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  completed: "bg-success/10 text-success",
  cancelled: "bg-red-100 text-red-600",
};

export function whatsappForOrder(o: Order): string {
  const first = o.customer.name.split(" ")[0] || "there";
  const update: Record<OrderStatus, string> = {
    pending: "we've received your order and will confirm availability shortly.",
    confirmed: `your order is confirmed — the total is ${formatKES(o.total)}. We'll arrange collection or delivery with you.`,
    completed: "your order is complete. Thank you for shopping with us!",
    cancelled: "your order has been cancelled. Reply here if that's unexpected.",
  };
  const lines = [
    `Hi ${first} 👋`,
    "",
    `Update on your ${BRAND_NAME} order ${o.ref}: ${update[o.status]}`,
    "",
    ...o.items.map((i) => `${i.quantity} × ${i.name}`),
    "",
    `Follow it any time: ${window.location.origin}/account`,
  ];
  return `https://wa.me/${toMsisdn(o.customer.phone)}?text=${encodeURIComponent(lines.join("\n").trim())}`;
}

