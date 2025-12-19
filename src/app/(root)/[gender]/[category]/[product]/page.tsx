import { Metadata } from "next";
import ProductDetailPage from "@/components/detail_product/detail_product";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm",
};

const ProductPage = async ({
  params,
}: {
  params: { gender: string; category: string; product: string };
}) =>{
    const { product } = await params
  return (
    <ProductDetailPage
      productSlug={product}
    />
  );
}
export default ProductPage;