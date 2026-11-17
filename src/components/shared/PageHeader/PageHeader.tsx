import type { ReactNode } from "react";

/** Mô tả trang + nút hành động chính. Tiêu đề trang nằm ở thanh Header phía trên. */
export default function PageHeader({
  description,
  actions,
}: {
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-muted">{description}</p>
      {actions}
    </div>
  );
}
