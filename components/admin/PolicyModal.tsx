"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PolicyForm from './PolicyForm'
import type { PolicySummary } from '@/lib/actions/policy.actions'

interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  policy?: PolicySummary
  mode: 'create' | 'edit'
}

export const PolicyModal = ({
  isOpen,
  onClose,
  userEmail,
  policy,
  mode
}: PolicyModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {mode === 'edit' ? 'Edit Policy Document' : 'Create New Policy Document'}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-6">
          <PolicyForm 
            userEmail={userEmail}
            mode={mode}
            initialData={policy}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
