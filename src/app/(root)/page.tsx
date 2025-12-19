import  HomePageComponent   from "@/components/homepage/homepage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galaxy Booking - Your Ultimate Cinema Experience",
  description:
    "Book movie tickets online, browse now showing and upcoming movies, and enjoy exclusive deals for your favorite films.",
};

const HomePage = () => {
  return <HomePageComponent  />;
};

export default HomePage;