"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

export type StoreSettingFormValues = z.infer<typeof FormSchema>;

function toCurrency(n: number) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  } catch {
    return `${n} VND`;
  }
}

export default function StoreSettingForm({
  initialData,
}: {
  initialData: StoreSettingFormValues;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<StoreSettingFormValues>(() => {
    return {
      storeName: initialData.storeName ?? "Cửa hàng CHQA",
      address: initialData.address ?? "Chưa cập nhật",
      latitude: initialData.latitude ?? null,
      longitude: initialData.longitude ?? null,
      lowStockThreshold: initialData.lowStockThreshold ?? 5,
      normalShippingFee: initialData.normalShippingFee ?? 15000,
      expressRatePerKm: initialData.expressRatePerKm ?? 8000,
      maxExpressDistanceKm: initialData.maxExpressDistanceKm ?? 30,
      enableExpress: initialData.enableExpress ?? true,
      enableFreeShipByTotal: initialData.enableFreeShipByTotal ?? false,
      enableFreeShipByQuantity: initialData.enableFreeShipByQuantity ?? false,
      freeShipMinTotal: initialData.freeShipMinTotal ?? 500000,
      freeShipMinQuantity: initialData.freeShipMinQuantity ?? 3,
    };
  }, [initialData]);

  const form = useForm<StoreSettingFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    watch,
  } = form;

  const enableFreeShipByTotal = watch("enableFreeShipByTotal");
  const enableFreeShipByQuantity = watch("enableFreeShipByQuantity");
  const enableExpress = watch("enableExpress");

  async function onSubmit(values: StoreSettingFormValues) {
    try {
      setSaving(true);

      const res = await fetch("/api/store-setting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Cập nhật thất bại");

      toast.success("Đã cập nhật cài đặt cửa hàng");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Thông tin cửa hàng */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Thông tin cửa hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên cửa hàng</Label>
              <Input placeholder="VD: Cửa hàng CHQA" {...register("storeName")} />
              {errors.storeName && (
                <p className="text-sm text-destructive">{errors.storeName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input placeholder="VD: 123 Lê Lợi, Quận 1..." {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude (tuỳ chọn)</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="VD: 10.762622"
                {...register("latitude", {
                  setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                })}
              />
              {errors.latitude && (
                <p className="text-sm text-destructive">Latitude không hợp lệ</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Longitude (tuỳ chọn)</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="VD: 106.660172"
                {...register("longitude", {
                  setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                })}
              />
              {errors.longitude && (
                <p className="text-sm text-destructive">Longitude không hợp lệ</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tồn kho */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Tồn kho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Ngưỡng sắp hết hàng</Label>
          <Input
            type="number"
            min={0}
            {...register("lowStockThreshold", { valueAsNumber: true })}
          />
          {errors.lowStockThreshold && (
            <p className="text-sm text-destructive">Giá trị không hợp lệ</p>
          )}
          <p className="text-sm text-muted-foreground">
            Sản phẩm có tồn kho ≤ ngưỡng sẽ hiển thị cảnh báo.
          </p>
        </CardContent>
      </Card>

      {/* Vận chuyển */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Vận chuyển</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Phí ship thường</Label>
              <Input
                type="number"
                min={0}
                {...register("normalShippingFee", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Gợi ý hiển thị: {toCurrency(watch("normalShippingFee") || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ship nhanh (VNĐ/km)</Label>
              <Input
                type="number"
                min={0}
                {...register("expressRatePerKm", { valueAsNumber: true })}
                disabled={!enableExpress}
              />
              <p className="text-xs text-muted-foreground">
                Gợi ý hiển thị: {toCurrency(watch("expressRatePerKm") || 0)}/km
              </p>
            </div>

            <div className="space-y-2">
              <Label>Khoảng cách tối đa (km)</Label>
              <Input
                type="number"
                min={0}
                {...register("maxExpressDistanceKm", { valueAsNumber: true })}
                disabled={!enableExpress}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Bật ship nhanh</p>
              <p className="text-sm text-muted-foreground">
                Cho phép tính phí ship nhanh theo khoảng cách.
              </p>
            </div>

            <Controller
              control={control}
              name="enableExpress"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Freeship */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Miễn phí vận chuyển</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Miễn phí ship theo tổng tiền</p>
              <p className="text-sm text-muted-foreground">
                Freeship nếu tổng đơn đạt mức tối thiểu.
              </p>
            </div>

            <Controller
              control={control}
              name="enableFreeShipByTotal"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tổng tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                disabled={!enableFreeShipByTotal}
                {...register("freeShipMinTotal", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              <p className="text-xs text-muted-foreground">
                Gợi ý hiển thị: {toCurrency(watch("freeShipMinTotal") || 0)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Miễn phí ship theo số lượng</p>
              <p className="text-sm text-muted-foreground">
                Freeship nếu tổng số lượng sản phẩm đạt mức tối thiểu.
              </p>
            </div>

            <Controller
              control={control}
              name="enableFreeShipByQuantity"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số lượng tối thiểu</Label>
              <Input
                type="number"
                min={0}
                disabled={!enableFreeShipByQuantity}
                {...register("freeShipMinQuantity", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.refresh()}
          disabled={saving}
        >
          Tải lại
        </Button>

        <Button type="submit" disabled={saving || !isDirty}>
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}
