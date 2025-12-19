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
  title: "Now Showing - Movie Ticket Booking",
  description: "Browse all movies currently showing in theaters",
  
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