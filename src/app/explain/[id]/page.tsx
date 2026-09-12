import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/data";
import { ExplainView } from "./ExplainView";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function ExplainPage(props: PageProps<"/explain/[id]">) {
  const { id } = await props.params;
  const product = getProduct(id);
  if (!product) notFound();

  return <ExplainView product={product} />;
}
