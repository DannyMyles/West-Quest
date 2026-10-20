import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Add product" description="Fill in the details, then create it. You can edit everything later." back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm />
    </div>
  );
}
