"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/dashboard/overview").then(res => res.json()).then(d => setStats(d.data));
    fetch("/api/admin/dashboard/revenue").then(res => res.json()).then(d => setRevenueData(d.data));
    fetch("/api/admin/dashboard/recent-orders").then(res => res.json()).then(d => setRecentOrders(d.data));
  }, []);

  if (!stats) return <p className="p-8">Đang tải...</p>;

  const statCards = [
    { label: "Tổng doanh thu", value: `₫${stats.revenue.toLocaleString("vi-VN")}`, icon: TrendingUp },
    { label: "Sản phẩm", value: stats.productCount, icon: Package },
    { label: "Đơn hàng", value: stats.orderCount, icon: ShoppingCart },
    { label: "Khách hàng", value: stats.userCount, icon: Users },
  ];

return (
  <div className="p-8 space-y-10">

    {/* ======================== */}
    {/*        TOP STAT CARDS    */}
    {/* ======================== */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={i}
            className="p-6 shadow-sm border border-border hover:shadow-md transition-all rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{stat.value}</p>
              </div>

              <div className="bg-primary/15 p-3 rounded-xl">
                <Icon className="text-primary" size={26} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>

    {/* ======================== */}
    {/*        CHARTS GRID       */}
    {/* ======================== */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* Revenue Bar Chart */}
      <Card className="p-6 shadow-sm rounded-xl border">
        <h3 className="text-xl font-semibold mb-6">📊 Doanh thu theo tháng</h3>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
<Bar
  dataKey="orders"
  name="Số đơn hàng"
  fill="#6366f1"
  radius={[6, 6, 0, 0]}
/>

<Bar
  dataKey="revenue"
  name="Doanh thu (₫)"
  fill="#22c55e"
  radius={[6, 6, 0, 0]}
/>

          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Trend Line Chart */}
      <Card className="p-6 shadow-sm rounded-xl border">
        <h3 className="text-xl font-semibold mb-6">📈 Xu hướng doanh thu</h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu (₫)"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ stroke: "#0ea5e9", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

    </div>

    {/* ======================== */}
    {/*     RECENT ORDERS TABLE  */}
    {/* ======================== */}
    <Card className="p-6 shadow-sm rounded-xl border">
      <h3 className="text-xl font-semibold mb-6">🛒 Đơn hàng gần đây</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-3 px-4 text-left text-sm font-semibold">Mã đơn</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Khách hàng</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Sản phẩm</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Giá</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.map((o) => (
              <tr
                key={o.id}
                className="bg-background hover:bg-muted/40 transition rounded-lg shadow-sm"
              >
                <td className="py-3 px-4 font-medium">{o.id}</td>
                <td className="py-3 px-4">{o.user.name}</td>
                <td className="py-3 px-4">{o.items[0]?.product.name}</td>
                <td className="py-3 px-4 font-semibold text-primary">
                  {o.totalAmount.toLocaleString("vi-VN")}₫
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${
                        o.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : o.status === "SHIPPING"
                          ? "bg-blue-100 text-blue-700"
                          : o.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }
                    `}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </Card>

  </div>
);

}
