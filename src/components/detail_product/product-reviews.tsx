"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();

  const [canReview, setCanReview] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [filterRating, setFilterRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  // Ảnh upload
  const [images, setImages] = useState<string[]>([]);
const [viewImage, setViewImage] = useState<string | null>(null);

  // =============================================================
  // CHECK CAN REVIEW
  // =============================================================
  useEffect(() => {
    if (!productId) return;

    axios
      .get("/api/reviews/can-review", { params: { productId } })
      .then((res) => {
        if (res.data.success) {
          setCanReview(res.data.canReview);
        }
      })
      .finally(() => setCheckDone(true));
  }, [productId]);

  // =============================================================
  // LOAD REVIEWS
  // =============================================================
  const loadReviews = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/reviews", {
        params: { productId, rating: filterRating || undefined },
      });

      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filterRating]);

  // =============================================================
  // UPLOAD IMAGE → BASE64
  // =============================================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // =============================================================
  // SUBMIT REVIEW
  // =============================================================
  const submitReview = async () => {
    if (!session?.user) {
      return toast.error("Bạn cần đăng nhập để đánh giá");
    }

    if (!content.trim()) {
      return toast.error("Vui lòng nhập nội dung đánh giá");
    }

    try {
      const res = await axios.post("/api/reviews", {
        productId,
        rating,
        content,
        images, // base64 array
      });

      if (res.data.success) {
        toast.success("Đã gửi đánh giá!");

        setContent("");
        setImages([]);
        loadReviews();
      } else {
        toast.error(res.data.message || "Gửi đánh giá thất bại");
      }
    } catch (err) {
      console.error("POST review error:", err);
      toast.error("Lỗi gửi đánh giá");
    }
  };

  // =============================================================
  // UI
  // =============================================================
  return (
    <div className="mt-12 pb-12">
      <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

      {/* FILTER */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterRating(0)}
          className={`px-4 py-2 border rounded-lg ${
            filterRating === 0 ? "bg-primary text-white" : "hover:border-primary"
          }`}
        >
          Tất cả
        </button>

        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`px-4 py-2 border rounded-lg ${
              filterRating === r
                ? "bg-primary text-white"
                : "hover:border-primary"
            }`}
          >
            {r} ★
          </button>
        ))}
      </div>

      {/* WRITE REVIEW */}
      {checkDone && session?.user && canReview && (
        <div className="border rounded-lg p-5 mb-10 bg-card">
          <h3 className="font-semibold mb-3">Viết đánh giá của bạn</h3>

          {/* Rating */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={22}
                onClick={() => setRating(i)}
                className={`cursor-pointer ${
                  i <= rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>

          <textarea
            rows={3}
            placeholder="Chia sẻ cảm nhận của bạn..."
            className="w-full rounded-lg border p-3 text-sm bg-background"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

{/* UPLOAD IMAGE BUTTON */}
<div className="mt-3">
  <label
    htmlFor="review-image-input"
    className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer
               hover:bg-accent hover:text-accent-foreground transition-colors"
  >
    📸 Thêm ảnh
  </label>

  <input
    id="review-image-input"
    type="file"
    accept="image/*"
    multiple
    className="hidden"
    onChange={handleImageUpload}
  />

  <p className="text-xs text-muted-foreground mt-1">
    (Tối đa 5 ảnh)
  </p>
</div>

{/* PREVIEW IMAGE GRID */}


          {/* PREVIEW */}
          {images.length > 0 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button className="mt-3" onClick={submitReview}>
            Gửi đánh giá
          </Button>
        </div>
      )}

      {/* {checkDone && session?.user && !canReview && (
        <p className="text-sm text-red-500 mb-6">
          Bạn phải mua sản phẩm này và chưa từng đánh giá để viết review.
        </p>
      )} */}

      {/* REVIEW LIST */}
      <div className="space-y-4">
        {loading && (
          <p className="text-muted-foreground text-center">Đang tải đánh giá...</p>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
        )}

        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-5 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <strong>{review.user?.name || "Khách hàng"}</strong>

              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }
                  />
                ))}
              </div>
            </div>

            <p className="text-sm">{review.content}</p>
{/* IMAGE VIEW POPUP */}
{viewImage && (
  <div
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={() => setViewImage(null)}
  >
    <div className="relative max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setViewImage(null)}
        className="absolute -top-10 right-0 text-white text-3xl font-bold"
      >
        ×
      </button>

      <img
        src={viewImage}
        className="w-full max-h-[85vh] object-contain rounded-lg shadow-xl"
      />
    </div>
  </div>
)}

{review.images?.length > 0 && (
  <div className="flex gap-2 mt-2 flex-wrap">
    {review.images.map((img: string, index: number) => (
      <img
        key={index}
        src={img}
        onClick={() => setViewImage(img)}
        className="w-24 h-24 object-cover rounded-lg border cursor-zoom-in hover:opacity-80 transition"
      />
    ))}
  </div>
)}


            <p className="text-xs text-muted-foreground mt-1">
              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
