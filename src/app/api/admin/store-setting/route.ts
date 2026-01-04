// src/app/api/store-setting/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const StoreSettingSchema = z.object({
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

async function getOrCreateStoreSetting() {
  let setting = await prisma.storeSetting.findFirst();
  if (!setting) {
    setting = await prisma.storeSetting.create({
      data: {
        // storeName đã có default trong schema
        address: "Chưa cập nhật",
        lowStockThreshold: 5,
        normalShippingFee: 15000,
        expressRatePerKm: 8000,
        maxExpressDistanceKm: 30,
        enableExpress: true,
        enableFreeShipByTotal: false,
        enableFreeShipByQuantity: false,
        freeShipMinTotal: 500000,
        freeShipMinQuantity: 3,
      },
    });
  }
  return setting;
}

export async function GET() {
  try {
    const setting = await getOrCreateStoreSetting();
    return NextResponse.json({ data: setting });
  } catch (e) {
    return NextResponse.json({ error: "Không thể tải cài đặt cửa hàng" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const raw = await req.json();
    const payload = StoreSettingSchema.parse(raw);

    const current = await getOrCreateStoreSetting();

    const updated = await prisma.storeSetting.update({
      where: { id: current.id },
      data: {
        storeName: payload.storeName,
        address: payload.address,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        lowStockThreshold: payload.lowStockThreshold,
        normalShippingFee: payload.normalShippingFee,
        expressRatePerKm: payload.expressRatePerKm,
        maxExpressDistanceKm: payload.maxExpressDistanceKm,
        enableExpress: payload.enableExpress,
        enableFreeShipByTotal: payload.enableFreeShipByTotal,
        enableFreeShipByQuantity: payload.enableFreeShipByQuantity,
        freeShipMinTotal: payload.freeShipMinTotal ?? null,
        freeShipMinQuantity: payload.freeShipMinQuantity ?? null,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    const msg =
      e?.name === "ZodError"
        ? e.issues?.[0]?.message ?? "Dữ liệu không hợp lệ"
        : "Không thể cập nhật cài đặt";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
