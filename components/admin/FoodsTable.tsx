'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Utensils,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Search,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminToolbar } from '@/components/admin/layout/AdminToolbar'
import { AdminSearchField } from '@/components/admin/layout/AdminSearchField'
import { AdminTableCard } from '@/components/admin/layout/AdminTableCard'
import { AdminPaginationBar } from '@/components/admin/layout/AdminPaginationBar'
import { AdminStatCard, AdminStatCardsWrapper } from '@/components/admin/layout/AdminStatCards'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  adminFilterSelectTriggerClass,
  adminSelectContentSurfaceClass,
  adminTableClassName,
  adminTbodyRowClass,
  adminTdClass,
  adminThClass,
  adminTheadRowClass,
  adminThSortableClass,
  adminToolbarDividerClass,
  adminToolbarFilterRowClass,
} from '@/lib/admin-ui'
import { fetchAllFoods, deleteFood } from '@/lib/actions/food.actions'
import { FoodValues, FoodVendorValues } from '@/lib/validation'
import FoodForm from './FoodForm'

interface FoodsTableProps {
  initialFoods?: FoodValues[]
  vendors?: FoodVendorValues[]
}

const PAGE_SIZE = 10

export function FoodsTable({ initialFoods = [], vendors = [] }: FoodsTableProps) {
  const { toast } = useToast()
  const [foods, setFoods] = useState<FoodValues[]>(initialFoods)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'category' | 'price' | 'vendorId' | 'isActive'
    direction: 'asc' | 'desc'
  }>({ key: 'name', direction: 'asc' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    setFoods(initialFoods)
  }, [initialFoods])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editFood, setEditFood] = useState<FoodValues | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadFoods = async () => {
    setLoading(true)
    const res = await fetchAllFoods()
    if (res.success && res.foods) {
      setFoods(res.foods as FoodValues[])
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsActionLoading(true)
    const res = await deleteFood(deleteId)
    if (res.success) {
      toast({ title: 'Success', description: 'Food item deleted successfully' })
      loadFoods()
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to delete', variant: 'destructive' })
    }
    setIsActionLoading(false)
    setDeleteId(null)
  }

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const openEdit = (food: FoodValues) => {
    setEditFood(food)
  }

  const handleEditSuccess = () => {
    setEditFood(null)
    loadFoods()
  }

  const filtered = useMemo(() => {
    let result = foods

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.category?.toLowerCase().includes(q)) ||
          (f.vendor?.name?.toLowerCase().includes(q))
      )
    }

    if (statusFilter !== 'all') {
      const activeVal = statusFilter === 'active'
      result = result.filter((f) => f.isActive === activeVal)
    }

    if (vendorFilter !== 'all') {
      result = result.filter((f) => f.vendorId === vendorFilter)
    }

    return result.sort((a, b) => {
      let aValue: any = a[sortConfig.key] ?? ''
      let bValue: any = b[sortConfig.key] ?? ''

      if (sortConfig.key === 'vendorId') {
        aValue = a.vendor?.name?.toLowerCase() ?? ''
        bValue = b.vendor?.name?.toLowerCase() ?? ''
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [search, statusFilter, vendorFilter, sortConfig, foods])

  const totalCount = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const slice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <>
      <AdminStatCardsWrapper>
        <AdminStatCard
          title='Total Foods'
          value={loading ? '-' : foods.length}
          icon={<Utensils size={20} strokeWidth={2.5} />}
        />
        <AdminStatCard
          title='Active Foods'
          value={loading ? '-' : foods.filter(f => f.isActive).length}
          icon={<Utensils size={20} strokeWidth={2.5} />}
        />
        <AdminStatCard
          title='Vendors'
          value={vendors.length}
          icon={<Utensils size={20} strokeWidth={2.5} />}
        />
      </AdminStatCardsWrapper>

      <AdminToolbar className='shadow-premium dark:shadow-black/30'>
        <div className={cn('p-6 px-8 flex items-center gap-4', adminToolbarDividerClass)}>
          <div className='flex-1'>
            <AdminSearchField
              placeholder='Search foods by name, category, or vendor…'
              value={search}
              onChange={setSearch}
            />
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={loadFoods}
            title='Refresh records'
            disabled={loading}
            className='shrink-0 h-11 w-11 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-700 dark:text-zinc-300'
          >
            <RefreshCw className={cn('h-4 w-4 text-slate-500 dark:text-zinc-400', loading && 'animate-spin')} />
          </Button>
        </div>

        <div className={adminToolbarFilterRowClass}>
          <div className='w-full sm:w-44'>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder='Status: All' />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value='all'>Status: All</SelectItem>
                <SelectItem value='active'>Active Only</SelectItem>
                <SelectItem value='inactive'>Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='w-full sm:w-44'>
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className={adminFilterSelectTriggerClass}>
                <SelectValue placeholder='Vendor: All' />
              </SelectTrigger>
              <SelectContent className={adminSelectContentSurfaceClass}>
                <SelectItem value='all'>Vendor: All</SelectItem>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id!}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(statusFilter !== 'all' || vendorFilter !== 'all' || search) && (
            <Button
              variant='ghost'
              className='text-xs text-slate-400 dark:text-zinc-500 hover:text-primary dark:hover:text-emerald-400 h-10 px-2'
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setVendorFilter('all')
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </AdminToolbar>

      <AdminTableCard
        title='Food Items'
        footer={
          <AdminPaginationBar
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            entityLabel='food items'
            onPageChange={setPage}
          />
        }
      >
        <table className={adminTableClassName()}>
          <thead>
            <tr className={adminTheadRowClass}>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort('name')}
              >
                <div className='flex items-center gap-2'>
                  Food Name
                  <SortIcon field='name' activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort('category')}
              >
                <div className='flex items-center gap-2'>
                  Category
                  <SortIcon field='category' activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort('vendorId')}
              >
                <div className='flex items-center gap-2'>
                  Vendor
                  <SortIcon field='vendorId' activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort('price')}
              >
                <div className='flex items-center gap-2'>
                  Price
                  <SortIcon field='price' activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th
                className={cn(adminThClass, adminThSortableClass)}
                onClick={() => handleSort('isActive')}
              >
                <div className='flex items-center gap-2'>
                  Status
                  <SortIcon field='isActive' activeField={sortConfig.key} direction={sortConfig.direction} />
                </div>
              </th>
              <th className={cn(adminThClass, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className='py-12 text-center text-muted-foreground'>
                  <div className='flex flex-col items-center gap-2'>
                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                    <span className='text-sm'>Loading foods...</span>
                  </div>
                </td>
              </tr>
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={6} className='py-12 text-center text-muted-foreground'>
                  No food items found.
                </td>
              </tr>
            ) : (
              slice.map((food) => (
                <tr
                  key={food.id}
                  tabIndex={0}
                  aria-label={`Edit food ${food.name}`}
                  className={cn(
                    adminTbodyRowClass,
                    'group cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
                  )}
                  onClick={() => openEdit(food)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openEdit(food)
                    }
                  }}
                >
                  <td className={adminTdClass}>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary'>
                        <Utensils className='h-5 w-5' aria-hidden />
                      </div>
                      <span className='font-semibold text-foreground underline-offset-2 group-hover:underline group-hover:text-primary dark:group-hover:text-emerald-400'>
                        {food.name}
                      </span>
                      {food.isSpecialOrder && (
                        <Badge variant='secondary' className='ml-2 rounded-full text-[10px]'>
                          Special
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <span className='text-sm text-muted-foreground'>
                      {food.category || '-'}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <span className='text-sm text-foreground'>
                      {food.vendor?.name || '-'}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <span className='text-sm font-semibold tabular-nums text-primary'>
                      {food.price ? `¢${food.price.toFixed(2)}` : '-'}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <Badge
                      variant={food.isActive ? 'secondary' : 'outline'}
                      className={food.isActive ? 'rounded-full bg-primary/10 font-medium text-primary hover:bg-primary/15' : 'rounded-full'}
                    >
                      {food.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td
                    className={cn(adminTdClass, 'text-right')}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted'
                        >
                          <MoreHorizontal className='h-5 w-5' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-48 p-1' align='end'>
                        <div className='flex flex-col gap-1'>
                          <Button
                            variant='ghost'
                            className='w-full justify-start gap-2 h-9 text-sm'
                            onClick={() => openEdit(food)}
                          >
                            <Edit className='h-4 w-4' />
                            Edit
                          </Button>
                          <div className='my-1 border-t border-border/60' />
                          <Button
                            variant='ghost'
                            className='w-full justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive hover:bg-destructive/10'
                            onClick={() => setDeleteId(food.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableCard>

      <Dialog open={!!editFood} onOpenChange={(o) => !o && setEditFood(null)}>
        <DialogContent className='flex max-h-[min(90vh,920px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[600px]'>
          <DialogHeader className='border-b border-border/60 px-6 py-4 text-left'>
            <DialogTitle>Edit Food</DialogTitle>
            <DialogDescription>
              Update food item details.
            </DialogDescription>
          </DialogHeader>
          
          <div className='min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6'>
            {editFood && (
              <FoodForm
                vendors={vendors}
                food={{
                  id: editFood.id!,
                  name: editFood.name,
                  description: editFood.description,
                  price: editFood.price,
                  category: editFood.category,
                  vendorId: editFood.vendorId,
                  isSpecialOrder: editFood.isSpecialOrder,
                }}
                isEdit={true}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditFood(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the food item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SortIcon({ field, activeField, direction }: { field: string, activeField: string, direction: 'asc' | 'desc' }) {
  if (field !== activeField) return <div className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5-5" /></svg></div>;
  return (
    <div className="w-4 h-4 text-primary">
      {direction === 'asc' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11l5-5 5 5M12 19V6"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M12 5v13"/></svg>
      )}
    </div>
  );
}
