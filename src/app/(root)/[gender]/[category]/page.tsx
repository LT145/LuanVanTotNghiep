import CategoryContent from "@/components/list_product/category-content"
import { Metadata } from "next";

// export default async function CategoryPage({
//   params
// }: {
//   params: Promise<{ gender: string; category: string }>
// }) {
//   const { gender, category } = await params

//   return (
//     <main className="min-h-screen bg-background">
//       <CategoryContent gender={gender} category={category} />
//     </main>
//   )
// }




export const metadata: Metadata = {
  title: "Cửa Hàng Quần Áo",
  description:
    "Mua sắm quần áo trực tuyến, xem các sản phẩm mới và nhận ưu đãi hấp dẫn cho các mặt hàng yêu thích.",
};


const ProductCategory = async ({
  params
}: {
  params: Promise<{ gender: string; category: string }>
}) => {
      const { gender, category } = await params
  return <CategoryContent  gender={gender} category={category} />;
};

export default ProductCategory;