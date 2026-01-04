import  HomePageComponent   from "@/components/homepage/homepage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cửa Hàng Quần Áo",
  description:
    "Mua sắm quần áo trực tuyến, xem các sản phẩm mới và nhận ưu đãi hấp dẫn cho các mặt hàng yêu thích.",
};

const HomePage = () => {
  return <HomePageComponent  />;
};

export default HomePage;