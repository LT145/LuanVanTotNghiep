"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { type Product } from "@/lib/data"

interface Props {
  product: Product | null
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onClose: () => void
}

export default function ProductDeleteDialog({
  product,
  setProducts,
  selectedIds,
  setSelectedIds,
  onClose
}: Props) {
  const confirm = () => {
    if (!product) return

    setProducts((prev) => prev.filter((p) => p.id !== product.id))

    if (selectedIds.has(product.id)) {
      const newSet = new Set(selectedIds)
      newSet.delete(product.id)
      setSelectedIds(newSet)
    }

    onClose()
  }

  return (
    <AlertDialog open={!!product} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
        </AlertDialogHeader>

        <p>Bạn có chắc muốn xóa "{product?.name}"?</p>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} className="bg-red-500 hover:bg-red-600">
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
