"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/admin/ui/sidebar";
import Dashboard from "@/components/admin/dashboard/dashboard";
import AddProductForm from "@/components/admin/product/add_product/add_product";
import AllProductsPage from "@/components/admin/product/product_manager/products-page";
import Orders from "@/components/admin/order/orders";
import AdminUsersPage from "@/components/admin/user/user-manager";
import PromotionManager from "@/components/admin/promotion-manager/promotion-manager";
import AdminReturnsPage from "@/components/admin/returns/returns";
import InventoryManager from "@/components/admin/inventory/inventory-manager";
import StoreSettingsPage from "@/components/admin/store-setting/store-setting";

type Role = "ADMIN" | "MANAGER" | "SHIPPER" | "USER";

export default function AdminPage() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // 📌 LẤY ROLE TỪ SESSION
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        const userRole: Role = data?.user?.role ?? "USER";

        // ❌ Không phải ADMIN → đá ra ngoài
        if (userRole !== "ADMIN") {
          router.replace("/"); // hoặc "/403"
          return;
        }

        setRole(userRole);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [router]);

  // 📌 Lấy trang đang mở
  useEffect(() => {
    const savedPage = localStorage.getItem("admin-current-page");
    if (savedPage) setCurrentPage(savedPage);
  }, []);

  // 📌 Lưu trang đang mở
  useEffect(() => {
    localStorage.setItem("admin-current-page", currentPage);
  }, [currentPage]);

  if (loading || role !== "ADMIN") {
    return null; // hoặc spinner
  }

  const renderPage = () => {
    switch (currentPage) {
      case "products":
        return <AllProductsPage />;

      case "products-add":
        return <AddProductForm />;

      case "orders":
        return <Orders />;

      case "account":
        return <AdminUsersPage />;

      case "promotions":
        return <PromotionManager />;
      case "inventory":
        return <InventoryManager />;
      case "returns":
        return <AdminReturnsPage />;
      case "settings":
        return <StoreSettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        role={role}
      />

      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
