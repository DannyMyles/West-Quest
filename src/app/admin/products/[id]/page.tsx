"use client";

import { use, useEffect, useState } from "react";
import { adminGetProduct } from "@/lib/api/products";
import type { Product } from "@/lib/types";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "../ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProduct(null);
      return;
    }
    adminGetProduct(n)
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [id]);

  if (product === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (product === null) return <p className="text-sm text-muted">Product not found.</p>;

  return (
    <div>
      <PageHeader title={product.name} description={<span className="font-mono text-xs">{product.sku}</span>} back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm initial={product} />
    </div>
  );
}
