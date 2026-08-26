import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Novo Produto · Admin" };

export default function NovoProdutoPage() {
  return (
    <div>
      <p className="text-xs text-stone-500 mb-4">
        Cadastre a peça com fotos, preço e grade P/M/G/GG. Ela entra direto na arara digital.
      </p>
      <ProductForm />
    </div>
  );
}
