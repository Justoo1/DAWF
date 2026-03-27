import Link from "next/link"
import {
  Baby,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FilePenLine,
  HeartHandshake,
  Layers,
  Pencil,
  Settings,
  Stethoscope,
  Trash2,
} from "lucide-react"

export default function CreateLeavePage() {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-100 dark:bg-zinc-950 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link href="/admin" className="hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-primary">Leave Management</span>
            </nav>
            <h2 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
              Create Leave
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="h-10 w-10 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-900 border border-primary/10 text-slate-600 hover:text-primary transition-colors"
              aria-label="Notifications"
              type="button"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              className="h-10 w-10 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-900 border border-primary/10 text-slate-600 hover:text-primary transition-colors"
              aria-label="Settings"
              type="button"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-primary/10">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FilePenLine className="h-5 w-5 text-primary" />
                Policy Configuration
              </h3>

              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Leave Name
                    </span>
                    <input
                      className="w-full h-12 bg-zinc-50 dark:bg-zinc-950/40 border border-primary/20 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 transition-all px-4"
                      placeholder="e.g. Annual Vacation Leave"
                      type="text"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                        Default Annual Days
                      </span>
                      <input
                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-950/40 border border-primary/20 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 transition-all px-4"
                        type="number"
                        defaultValue={20}
                      />
                    </label>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between border border-primary/10 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Flexibility Toggle
                      </span>
                      <span className="text-xs text-slate-500">
                        Allow manual adjustment by managers for individual employees
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-primary/10 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Layers className="h-5 w-5 text-primary" />
                  Active Categories
                </h3>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                  4 Active
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Annual Leave</p>
                      <p className="text-xs text-slate-500">20 Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:bg-primary/5 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-red-200/60 bg-white dark:bg-zinc-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sick Leave</p>
                      <p className="text-xs text-slate-500">10 Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:bg-primary/5 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-red-200/60 bg-white dark:bg-zinc-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                      <Baby className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Paternity Leave</p>
                      <p className="text-xs text-slate-500">5 Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:bg-primary/5 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-red-200/60 bg-white dark:bg-zinc-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Bereavement</p>
                      <p className="text-xs text-slate-500">3 Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-primary/10 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:bg-primary/5 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="h-9 px-3 rounded-lg border border-red-200/60 bg-white dark:bg-zinc-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 relative h-32 w-full rounded-lg overflow-hidden flex items-end p-4 border border-dashed border-primary/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <div className="relative z-10 flex flex-col">
                  <p className="text-xs font-bold text-primary">PRO TIP</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Keep policy names and annual days consistent across departments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 pt-8 flex justify-end border-t border-primary/10">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              type="button"
              className="px-8 h-12 rounded-lg border border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-10 h-12 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              Create Policy
            </button>
          </div>
        </footer>
      </div>
    </main>
  )
}
