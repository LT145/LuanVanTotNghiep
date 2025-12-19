"use client"

import { useEffect, useMemo, useState } from "react"
import UsersHeader from "./users-header"
import UsersFilters from "./users-filters"
import UsersStats from "./users-stats"
import UsersTable from "./users-table"
import UsersGrid from "./users-grid"
import UsersPagination from "./users-pagination"
import UserViewDialog from "./user-view-dialog"
import ConfirmDialog from "./confirm-dialog"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewUser, setViewUser] = useState<any>(null)

const [confirmUserId, setConfirmUserId] = useState<string | null>(null)
const handleToggleStatus = async (id: string) => {
  setConfirmUserId(id) // mở popup
}
const confirmToggle = async () => {
  if (!confirmUserId) return;

  await fetch(`/api/admin/users/toggle-status`, {
    method: "POST",
    body: JSON.stringify({ userId: confirmUserId }),
  });

  setUsers(prev =>
    prev.map(u =>
      u.id === confirmUserId
        ? { ...u, status: u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED" }
        : u
    )
  );

  setConfirmUserId(null);
};



  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/users")
        const json = await res.json()
        if (json.success) setUsers(json.data)
      } catch (err) {
        setError("Không thể tải dữ liệu người dùng")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // -------------------------
  // FILTER + SORT HOOKS
  // -------------------------
  const filteredUsers = useMemo(() => {
    let rs = [...users]

    if (search) {
      const keyword = search.toLowerCase()
      rs = rs.filter(
        (u) =>
          u.name.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword)
      )
    }

    rs.sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.name.localeCompare(b.name)
      if (sortField === "createdAt")
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

      return sortOrder === "asc" ? cmp : -cmp
    })

    return rs
  }, [users, search, sortField, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])


  // -------------------------
  // UI RENDER — SAFE (NO HOOKS HERE)
  // -------------------------
  return (
    <div className="min-h-screen p-6">

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center text-lg py-24">
          Đang tải người dùng...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <p className="text-red-500">{error}</p>
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={() => location.reload()}>
            Thử lại
          </button>
        </div>
      )}

      {/* Main UI */}
      {!loading && !error && (
        <>
          <UsersHeader />
          <UsersStats users={users} />

          <UsersFilters
            search={search}
            setSearch={setSearch}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {viewMode === "table" ? (
<UsersTable
  users={paginated}
  selectedIds={selectedIds}
  setSelectedIds={setSelectedIds}
  onView={(u:any) => setViewUser(u)}
  onToggleStatus={handleToggleStatus}
/>

          ) : (

<UsersGrid
  users={paginated}
  selectedIds={selectedIds}
  setSelectedIds={setSelectedIds}
  onView={(u:any) => setViewUser(u)}
  onToggleStatus={handleToggleStatus}
/>

          )}

          <UsersPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />

          <UserViewDialog user={viewUser} onClose={() => setViewUser(null)} />
          <ConfirmDialog
            open={confirmUserId !== null}
            title="Xác nhận thay đổi trạng thái"
            description="Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?"
            onConfirm={confirmToggle}
            onCancel={() => setConfirmUserId(null)}
          />
        </>
        
      )}
    </div>
  )
}
