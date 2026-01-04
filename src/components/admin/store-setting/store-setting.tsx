"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  Store, Truck, Package, MapPin, RefreshCw, Save, AlertTriangle, Zap, Gift 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const API_URL = "/api/admin/store-setting";

const FormSchema = z.object({
  storeName: z.string().min(1, "Vui lòng nhập tên cửa hàng"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  lowStockThreshold: z.number().int().min(0),
  normalShippingFee: z.number().min(0),
  expressRatePerKm: z.number().min(0),
  maxExpressDistanceKm: z.number().min(0),
  enableExpress: z.boolean(),
  enableFreeShipByTotal: z.boolean(),
  enableFreeShipByQuantity: z.boolean(),
  freeShipMinTotal: z.number().nullable().optional(),
  freeShipMinQuantity: z.number().int().nullable().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function StoreSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
  });

  const { register, handleSubmit, control, formState: { errors, isDirty }, watch, reset } = form;
  const watchedValues = watch();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (res.ok) reset(json.data);
      } catch (e) {
        toast.error("Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reset]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        toast.success("Đã lưu cài đặt");
        reset(values);
      }
    } catch (e) {
      toast.error("Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    // Xóa p-8 nếu layout ngoài đã có padding
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header: Dàn hàng ngang chuyên nghiệp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cấu hình hệ thống</h1>
          <p className="text-sm text-muted-foreground">Quản lý cửa hàng, vận chuyển và kho hàng.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={!isDirty || saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI - TO HƠN */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-4"> {/* Giảm padding bottom của header */}
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Thông tin cửa hàng</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-0 pb-6"> {/* pt-0 để không bị trống với header */}
              <div className="grid gap-2">
                <Label>Tên cửa hàng</Label>
                <Input {...register("storeName")} />
              </div>
              <div className="grid gap-2">
                <Label>Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...register("address")} className="pl-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Vận chuyển</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-0 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phí ship thường</Label>
                  <Input type="number" {...register("normalShippingFee", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2 text-muted-foreground pt-8 pb-6 text-sm">
                  Giá trị: {watchedValues.normalShippingFee?.toLocaleString()} đ
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Giao hàng hỏa tốc</Label>
                  <p className="text-xs text-muted-foreground">Cho phép tính phí theo km</p>
                </div>
                <Controller
                  control={control}
                  name="enableExpress"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              {watchedValues.enableExpress && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Phí mỗi KM</Label>
                    <Input type="number" {...register("expressRatePerKm", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tối đa (KM)</Label>
                    <Input type="number" {...register("maxExpressDistanceKm", { valueAsNumber: true })} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI - NHỎ HƠN */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Kho hàng</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="space-y-2">
                <Label>Ngưỡng báo sắp hết</Label>
                <Input type="number" {...register("lowStockThreshold", { valueAsNumber: true })} />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Cảnh báo khi tồn kho thấp hơn mức này.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/[0.02] border-dashed">
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Freeship</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 pb-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm cursor-pointer" htmlFor="fs-total">Theo tổng đơn</Label>
                <Controller
                  control={control}
                  name="enableFreeShipByTotal"
                  render={({ field }) => (
                    <Switch id="fs-total" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
              {watchedValues.enableFreeShipByTotal && (
                <Input 
                  type="number" 
                  placeholder="Đơn từ... (đ)" 
                  {...register("freeShipMinTotal", { valueAsNumber: true })}
                  className="h-8 text-sm animate-in zoom-in-95"
                />
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Label className="text-sm cursor-pointer" htmlFor="fs-qty">Theo số lượng</Label>
                <Controller
                  control={control}
                  name="enableFreeShipByQuantity"
                  render={({ field }) => (
                    <Switch id="fs-qty" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
              {watchedValues.enableFreeShipByQuantity && (
                <Input 
                  type="number" 
                  placeholder="Từ ... món" 
                  {...register("freeShipMinQuantity", { valueAsNumber: true })}
                  className="h-8 text-sm animate-in zoom-in-95"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}