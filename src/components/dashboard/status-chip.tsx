import type { ApplicationStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

function statusChipClass(status: ApplicationStatus): string {
  switch (status) {
    case "SUBMITTED":
      return "border-cognac bg-cognac text-[#F4E9DF]";
    case "IN_REVIEW":
      return "border-cognac/50 text-cognac-deep";
    case "INTERESTED":
    case "MATCHED":
    case "FINAL":
    case "HIRED":
      return "border-graphite text-foreground";
    default:
      return "border-hairline text-muted-foreground";
  }
}

export function StatusChip({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        "border px-2 py-1 font-mono text-[0.66rem] tracking-[0.08em] uppercase",
        statusChipClass(status),
      )}
    >
      {label}
    </span>
  );
}
