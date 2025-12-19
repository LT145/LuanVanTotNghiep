import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function isHex64(s: string) {
  return /^[a-f0-9]{64}$/i.test(s)
}

// VModel official response shape: { code, result, message } :contentReference[oaicite:2]{index=2}
type VModelCreateResp = {
  code: number
  result?: { task_id: string; task_cost?: number }
  message?: any
}

type VModelGetResp = {
  code: number
  result?: {
    task_id: string
    status: "starting" | "processing" | "succeeded" | "failed" | "canceled" | string
    output?: string[]
    error?: any
    version?: string
    logs?: any
    completed_at?: any
  }
  message?: any
}

async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  const dataUrl = `data:${file.type};base64,${base64}`

  const res = await cloudinary.uploader.upload(dataUrl, {
    folder: "tryon_humans",
    resource_type: "image",
  })
  return res.secure_url
}

async function probeUrl(url: string) {
  // Quick check: server fetch must see 200 and an image content-type
  const res = await fetch(url, { method: "HEAD" })
  const ct = res.headers.get("content-type")
  const cl = res.headers.get("content-length")
  return { ok: res.ok, status: res.status, contentType: ct, contentLength: cl }
}

export async function POST(req: Request) {
  try {
    const token = process.env.VMODEL_API_TOKEN
    const version = process.env.VMODEL_TRYON_VERSION

    if (!token) {
      return NextResponse.json({ success: false, message: "Missing VMODEL_API_TOKEN" }, { status: 500 })
    }
    if (!version || !isHex64(version)) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing/Invalid VMODEL_TRYON_VERSION (must be 64-char hex)",
          current: version ?? null,
        },
        { status: 500 }
      )
    }

    const form = await req.formData()
    const humanFile = form.get("human") as File | null
    const garmentUrl = (form.get("garmentUrl") as string | null) ?? ""
    const category = (form.get("category") as string | null) ?? "upper_body"
    const garmentDes = ((form.get("garmentDes") as string | null) ?? "").trim()
    const crop = ((form.get("crop") as string | null) ?? "true") === "true"
    const stepsRaw = Number((form.get("steps") as string | null) ?? "30")
    const steps = Number.isFinite(stepsRaw) ? Math.min(Math.max(stepsRaw, 1), 40) : 30

    if (!humanFile) return NextResponse.json({ success: false, message: "Missing human file" }, { status: 400 })
    if (!garmentUrl) return NextResponse.json({ success: false, message: "Missing garmentUrl" }, { status: 400 })

    // 1) upload human image -> public URL
    const humanUrl = await uploadToCloudinary(humanFile)

    // 2) probe URLs (diagnostics)
    const [garmentProbe, humanProbe] = await Promise.all([probeUrl(garmentUrl), probeUrl(humanUrl)])

    // 3) create task (payload keys based on model page schema) :contentReference[oaicite:3]{index=3}
    const payload = {
      version,
      input: {
        garm_img: garmentUrl,
        human_img: humanUrl,
        garment_des: garmentDes,
        category,
        crop,
        steps,
        seed: 42,
        force_dc: false,
        mask_only: false,
        disable_safety_checker: false,
        ...(garmentDes ? { garment_des: garmentDes } : {}),
      },
    }

    const createRes = await fetch("https://api.vmodel.ai/api/tasks/v1/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const createText = await createRes.text()
    let createJson: VModelCreateResp | any = null
    try {
      createJson = createText ? JSON.parse(createText) : null
    } catch {
      createJson = null
    }

    if (!createRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "VModel create failed",
          status: createRes.status,
          detail: createJson ?? createText,
          sent: payload,
          probes: { garmentProbe, humanProbe },
        },
        { status: 502 }
      )
    }

    const taskId = createJson?.result?.task_id
    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message: "No task_id returned (unexpected response shape)",
          detail: createJson ?? createText,
          sent: payload,
          probes: { garmentProbe, humanProbe },
        },
        { status: 502 }
      )
    }

    // 4) poll task (parse result.status/result.output per docs) :contentReference[oaicite:4]{index=4}
    const deadline = Date.now() + 120_000
    let last: VModelGetResp | null = null

    while (Date.now() < deadline) {
      const getRes = await fetch(`https://api.vmodel.ai/api/tasks/v1/get/${taskId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })

      const getText = await getRes.text()
      let getJson: VModelGetResp | any = null
      try {
        getJson = getText ? JSON.parse(getText) : null
      } catch {
        getJson = null
      }

      if (!getRes.ok) {
        return NextResponse.json(
          { success: false, taskId, message: "VModel get failed", status: getRes.status, detail: getJson ?? getText },
          { status: 502 }
        )
      }

      last = getJson
      const status = getJson?.result?.status
      const output0 = getJson?.result?.output?.[0]

      if (status === "succeeded" && output0) {
        return NextResponse.json({
          success: true,
          taskId,
          humanUrl,
          outputUrl: output0,
          raw: getJson,
          probes: { garmentProbe, humanProbe },
        })
      }

      if (status === "failed") {
        return NextResponse.json(
          {
            success: false,
            taskId,
            message: "Task failed",
            error: getJson?.result?.error ?? null,
            logs: getJson?.result?.logs ?? null,
            raw: getJson,
            sent: payload,
            probes: { garmentProbe, humanProbe },
          },
          { status: 502 }
        )
      }

      await sleep(1200)
    }

    return NextResponse.json(
      { success: false, taskId, message: "Timeout waiting for result", raw: last, sent: payload, probes: { garmentProbe, humanProbe } },
      { status: 504 }
    )
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Unknown error" }, { status: 500 })
  }
}
