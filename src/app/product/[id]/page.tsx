import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/data";
import { ProductView } from "./ProductView";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function ProductPage(props: PageProps<"/product/[id]">) {
  const { id } = await props.params;
  const product = getProduct(id);
  if (!product) notFound();

  return <ProductView product={product} />;
}
