import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/db/store";
import { SIZES } from "@/lib/schemas/admin.schema";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const stockBySize = new Map(product.variants.map((v) => [v.size, v.stock]));

  return (
    <div>
      <p className="text-xs text-stone-500 mb-4 truncate">
        Editando <span className="text-stone-300 font-medium">{product.name}</span> · /{product.slug}
      </p>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          category: product.category,
          isActive: product.isActive,
          images: product.images.map((i) => i.url),
          variants: SIZES.map((size) => ({ size, stock: stockBySize.get(size) ?? 0 })),
        }}
      />
    </div>
  );
}
