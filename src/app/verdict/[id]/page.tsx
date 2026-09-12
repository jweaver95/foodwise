import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/data";
import { VerdictView } from "./VerdictView";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function VerdictPage(props: PageProps<"/verdict/[id]">) {
  const { id } = await props.params;
  const product = getProduct(id);
  if (!product) notFound();

  return <VerdictView product={product} />;
}
