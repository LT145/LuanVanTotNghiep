import { ArrowRightIcon, CreditCardIcon, ShieldCheckIcon, SparklesIcon, TruckIcon } from "lucide-react";
import { redirect } from "next/navigation";
import BestSellerProducts from "../best-seller/best-seller";
import RecentlyViewedProducts from "../recently-view/recently-view";

export default async function HomePageComponent () {
   return (
<main>
<section className="relative overflow-hidden">
  <img
    src="/banner.png"
    alt="Banner"
    className="custom-container w-full h-full  "
  />

  {/* Overlay mờ để chữ dễ đọc */}
  <div className="absolute inset-0 " />

  {/* <div className="custom-container mx-auto px-4 h-full flex items-center relative z-10">
    <div className="max-w-2xl space-y-6 text-white">
      <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full text-sm font-semibold mb-4">
        Bộ Sưu Tập Mới Thu Đông 2024
      </div>

      <h1 className="text-6xl font-bold leading-tight text-balance">
        Phong Cách Thời Trang <span className="text-accent">Đỉnh Cao</span>
      </h1>

      <p className="text-xl text-gray-200">
        Khám phá bộ sưu tập mới nhất với thiết kế hiện đại, chất liệu cao cấp và giá cả hợp lý.
        Nâng tầm phong cách của bạn ngay hôm nay.
      </p>

      <div className="flex gap-4 pt-4">
        <button className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Mua Sắm Ngay
        </button>
        <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors">
          Xem Bộ Sưu Tập
        </button>
      </div>
    </div>
  </div> */}
</section>


        <section className="py-16 border-y border-border">
          <div className="custom-container mx-auto px-4">
            <div className="grid grid-cols-4 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-6 h- text-black" />
                </div>
                <div>
                  <h3 className="font-semibold">Miễn Phí Vận Chuyển</h3>
                  <p className="text-sm text-muted-foreground">Đơn hàng từ 500K</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold">Đổi Trả 30 Ngày</h3>
                  <p className="text-sm text-muted-foreground">Hoàn tiền 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CreditCardIcon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold">Thanh Toán Đa Dạng</h3>
                  <p className="text-sm text-muted-foreground">An toàn & bảo mật</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold">Chất Lượng Cao Cấp</h3>
                  <p className="text-sm text-muted-foreground">Cam kết chính hãng</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Danh Mục Sản Phẩm</h2>
              <p className="text-lg text-muted-foreground">Khám phá bộ sưu tập thời trang cho phong cách của bạn</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">

              <div className="group relative rounded-2xl overflow-hidden h-[500px] cursor-pointer">
                <img
                  src="/stylish-men-fashion-model-in-elegant-casual-wear.jpg"
                  alt="Thời Trang Nam"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <span className="text-sm font-medium uppercase tracking-wider mb-2 text-white/80">Dành Cho Nam</span>
                  <h3 className="text-4xl font-bold mb-3">Thời Trang Nam</h3>
                  <p className="text-lg mb-6 text-white/90">Phong cách lịch lãm, năng động và hiện đại</p>
                  <button className="flex items-center gap-2 w-fit px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors group-hover:gap-4 duration-300">
                    Khám Phá Ngay
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="group relative rounded-2xl overflow-hidden h-[500px] cursor-pointer">
                <img
                  src="/elegant-women-fashion-model-in-chic-modern-outfit.jpg"
                  alt="Thời Trang Nữ"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <span className="text-sm font-medium uppercase tracking-wider mb-2 text-white/80">Dành Cho Nữ</span>
                  <h3 className="text-4xl font-bold mb-3">Thời Trang Nữ</h3>
                  <p className="text-lg mb-6 text-white/90">Thanh lịch, quyến rũ và đầy cá tính</p>
                  <button className="flex items-center gap-2 w-fit px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors group-hover:gap-4 duration-300">
                    Khám Phá Ngay
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section> */}

<BestSellerProducts />
<RecentlyViewedProducts />


        <section className="py-20"> 
          <div className="custom-container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-12">
              <h2 className="text-3xl font-bold">Đăng Ký Nhận Tin</h2>
              <p className="text-lg text-muted-foreground">Nhận thông tin về bộ sưu tập mới và ưu đãi độc quyền</p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
                />
                <button className="px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Đăng Ký
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
   )
}