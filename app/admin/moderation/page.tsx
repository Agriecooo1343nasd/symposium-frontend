import { redirect } from "next/navigation";

/** Live event controls live under Programme builder — avoid duplicate admin nav. */
export default function AdminModerationRedirect() {
  redirect("/admin/programme");
}
