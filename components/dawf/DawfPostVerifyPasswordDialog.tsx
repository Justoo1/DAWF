"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * After email verification, users land on `/dawf?emailVerified=1`. When they must
 * change an initial/admin-set password, show a clear modal with next steps.
 */
export function DawfPostVerifyPasswordDialog({
  mustChangePassword,
}: {
  mustChangePassword: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripped = useRef(false);
  const [justVerified] = useState(
    () => searchParams.get("emailVerified") === "1"
  );

  useEffect(() => {
    if (stripped.current) return;
    if (searchParams.get("emailVerified") === "1") {
      stripped.current = true;
      router.replace("/dawf", { scroll: false });
    }
  }, [router, searchParams]);

  if (!mustChangePassword) {
    return null;
  }

  return (
    <AlertDialog open={true} onOpenChange={() => {}}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {justVerified ? "You’re in — one more step" : "Set a new password"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-2">
            {justVerified ? (
              <span>
                Your email is verified and you&apos;re signed in. For security,
                replace your initial password with one only you know before you
                continue.
              </span>
            ) : (
              <span>
                Your administrator expects you to choose a new password to keep
                your account secure.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
          <AlertDialogAction asChild>
            <Link
              href="/change-initial-password"
              className="w-full sm:w-auto"
            >
              Change password now
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
