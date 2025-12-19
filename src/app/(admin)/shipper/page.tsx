"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Phone, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ShipperPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <div className="p-6">Đang tải...</div>;

  if (!session) {
    toast.error("Bạn cần đăng nhập");
    router.push("/");
    return null;
  }

  const role = session.user.role;

  if (role !== "SHIPPER" && role !== "ADMIN") {
    toast.error("Không có quyền truy cập");
    router.push("/");
    return null;
  }

  const [tab, setTab] = useState<"PROCESSING" | "SHIPPING" | "COMPLETED">(
    "PROCESSING"
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [proof, setProof] = useState<File | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shipper/orders?status=${tab}`, {
        cache: "no-store",
      });

      const data = await res.json();
      if (!data.success) return toast.error("Không thể tải đơn");

      setOrders(data.orders);

    } catch {
      toast.error("Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [tab]);

const uploadAndSendProof = async (file: File, order: any) => {
  toast.loading("Đang tải ảnh lên...");

  const form = new FormData();
  form.append("file", file);

  // 1) Upload Cloudinary
  const up = await fetch("/api/shipper/upload-proof", {
    method: "POST",
    body: form,
  }).then((r) => r.json());

  if (!up.success) {
    toast.error("Upload thất bại");
    return;
  }

  // 2) Gửi minh chứng vào DB
  const save = await fetch("/api/shipper/proof", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      imageUrl: up.url,
    }),
  }).then((r) => r.json());

  if (!save.success) {
    toast.error("Lưu minh chứng thất bại");
    return;
  }

  toast.success("Đã giao hàng thành công!");
  loadOrders();
};


  const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch("/api/shipper/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status }),
    });

    const data = await res.json();
    if (!data.success) return toast.error("Cập nhật lỗi");

    toast.success("Cập nhật thành công");
    loadOrders();
  };

  const tabs = [
    { id: "PROCESSING", label: "Đang chuẩn bị", icon: <Package /> },
    { id: "SHIPPING", label: "Đang giao", icon: <Truck /> },
    { id: "COMPLETED", label: "Hoàn thành", icon: <CheckCircle /> },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-10">
      <div className="sticky top-0 bg-white p-4 border-b flex justify-between">
        <h1 className="text-xl font-bold">Quản lý giao hàng</h1>
        <span className="text-sm text-gray-500">{session.user.name}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex-1 text-center p-3 border-b-2",
              tab === t.id ? "border-black text-black" : "text-gray-500"
            )}
          >
            <div className="flex justify-center">{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border p-4 rounded-xl shadow-sm">
            <div className="flex justify-between">
              <p className="font-semibold">Đơn #{order.id.slice(-6)}</p>
            </div>

            <p className="mt-2 text-sm"><strong>Khách:</strong> {order.recipientName}</p>

            <p className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" /> {order.recipientPhone}
            </p>

            <p className="text-sm"><strong>Địa chỉ:</strong> {order.shippingAddress}</p>

            {/* ACTIONS */}
            <div className="mt-3 space-y-2">
              {tab === "PROCESSING" && role === "SHIPPER" && (
                <button
                  onClick={() => updateOrderStatus(order.id, "SHIPPING")}
                  className="w-full bg-blue-600 text-white py-2 rounded-md"
                >
                  Nhận giao hàng
                </button>
              )}

              {tab === "SHIPPING" && role === "SHIPPER" && (
                <label className="w-full bg-green-600 text-white py-2 rounded-md flex flex-col items-center cursor-pointer">
                  <Camera className="w-6 h-6" />
                  Chụp/Upload Minh Chứng
<input
  type="file"
  accept="image/*"
  capture="environment"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Không có ảnh nào!");
      return;
    }

    uploadAndSendProof(file, order);
  }}
/>

                </label>
              )}

              {tab === "COMPLETED" && (
                <div className="text-center text-green-600 font-medium">
                  ✔ Đã giao thành công
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
