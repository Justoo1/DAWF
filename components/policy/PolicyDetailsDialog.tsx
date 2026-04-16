"use client";

import { ReactNode, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Info } from "lucide-react";

interface PolicyDetailsDialogProps {
  policyId: string;
  title: string;
  createdAt: string;
  createdBy: string | null;
  attachmentName: string | null;
  contentHtml?: string;
  trigger?: ReactNode;
}

export function PolicyDetailsDialog(props: PolicyDetailsDialogProps) {
  const pdfViewerSrc = useMemo(
    () =>
      props.attachmentName
        ? `/api/policy-files/${props.policyId}#toolbar=0&navpanes=0&scrollbar=1`
        : null,
    [props.attachmentName, props.policyId]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button variant="outline" className="h-9 rounded-lg">
            <Info className="mr-2 h-4 w-4" />
            More information
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>
            Review policy details and attached document (if available).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Created:</span> {props.createdAt}
          </div>
          <div>
            <span className="font-medium text-foreground">Created by:</span>{" "}
            {props.createdBy ?? "Not captured"}
          </div>
          <div>
            <span className="font-medium text-foreground">Attachment:</span>{" "}
            {props.attachmentName ? props.attachmentName : "No file attached"}
          </div>
        </div>

        {props.contentHtml ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Policy content</div>
            <article
              className="policy-content prose prose-sm max-w-none rounded-md border bg-card p-4 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: props.contentHtml }}
            />
          </div>
        ) : null}

        {pdfViewerSrc ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              PDF preview
            </div>
            <div className="h-[65vh] w-full overflow-hidden rounded-md border bg-background">
              <iframe
                title="Policy PDF Preview"
                src={pdfViewerSrc}
                className="h-full w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Download controls are hidden in the embedded preview.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
