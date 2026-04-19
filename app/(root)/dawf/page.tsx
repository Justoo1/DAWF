import { redirect } from "next/navigation"

/** Legacy path; employee dashboard lives at `/home`. */
export default function LegacyDawfRedirect() {
  redirect("/home")
}
