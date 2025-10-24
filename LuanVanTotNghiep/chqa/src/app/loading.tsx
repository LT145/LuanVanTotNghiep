export default function Loading() {
  return (
<div className="flex flex-col items-center justify-center h-screen gap-4">
  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
  <p className="text-muted-foreground animate-pulse">Đang tải...</p>
</div>

  )
}
