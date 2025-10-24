import { Header } from "@/components/header/header";
import { CategoryNav } from "@/components/header/category-nav";
import { Footer } from "@/components/footer";
import { ProductDetail } from "@/components/product-detail";
import { getProductById } from "@/lib/products-data";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    type: string;
    category: string;
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params; // ✅ Bắt buộc await params
  const product = await getProductById(id); // nếu getProductById là async

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <CategoryNav isHeaderHidden={false}/>
      <main className="pt-32 pb-20">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </div>
  );
}
