import { UsersTable } from "@/components/users-table"
import { Pagination } from "@/components/pagination"

export function UsersList({ users = [], paginationData, onPageChange, onUserDelete, loading = false }) {
  return (
    <div className="space-y-6">
      <UsersTable users={users} onUserDelete={onUserDelete} />
      
      {paginationData && (
        <Pagination paginationData={paginationData} onPageChange={onPageChange} loading={loading} />
      )}
    </div>
  )
}
