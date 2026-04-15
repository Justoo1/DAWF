import { redirect } from "next/navigation";

export default function ChangeInitialPasswordPage() {
  redirect("/sign-in");
}
