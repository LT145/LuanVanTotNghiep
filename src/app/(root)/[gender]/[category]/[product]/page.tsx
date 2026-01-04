import { Metadata } from "next";
import ProductDetailPage from "@/components/detail_product/detail_product";

export const metadata: Metadata = {
  title: "Cửa Hàng Quần Áo",
  description:
    "Mua sắm quần áo trực tuyến, xem các sản phẩm mới và nhận ưu đãi hấp dẫn cho các mặt hàng yêu thích.",
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