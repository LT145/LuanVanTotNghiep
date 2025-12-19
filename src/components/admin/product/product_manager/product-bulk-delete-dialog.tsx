"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AllProduct } from "@/types/product"

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  selectedIds: Set<string>
  setProducts: React.Dispatch<React.SetStateAction<AllProduct[]>>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
}

export default function ProductBulkDeleteDialog({
  open,
  setOpen,
  selectedIds,
  setProducts,
  setSelectedIds,
}: Props) {
  const confirm = () => {
    if (selectedIds.size === 0) {
      setOpen(false)
      return
    }

    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    setSelectedIds(new Set())
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nhiều sản phẩm?</AlertDialogTitle>
        </AlertDialogHeader>

        <p>Bạn có chắc muốn xóa {selectedIds.size} sản phẩm?</p>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Xóa tất cả
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
