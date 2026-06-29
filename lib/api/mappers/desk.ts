import type { SubmissionDto } from "../dto";

export function submissionReviewStatus(status: string): "pending" | "approved" | "rejected" {
  if (status === "accepted") return "approved";
  if (status === "rejected" || status === "withdrawn") return "rejected";
  return "pending";
}

export function submissionPrimaryAuthor(sub: SubmissionDto): string {
  const primary = sub.authors.find((a) => a.isPrimary);
  return primary?.name ?? sub.authors[0]?.name ?? "Author";
}
