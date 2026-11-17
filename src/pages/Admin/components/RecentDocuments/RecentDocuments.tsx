import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";
import Card from "@/components/ui/Card";
import { td, th, tr } from "@/components/ui/Table/TableStyle";
import type { RecentDocument } from "@/types/dashboard";
import { formatDateTime } from "@/utils/format";
import { TableSkeleton } from "@/components/ui/Skeleton";

export function RecentDocuments({ items }: { items?: RecentDocument[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-ink">Recent documents</h2>
        <Link
          to="/admin/knowledge-base"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all
        </Link>
      </div>
      {!items ? (
        <TableSkeleton rows={4} cols={4} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Document name</th>
                <th className={th}>File type</th>
                <th className={th}>Upload date</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => (
                <tr key={doc.id} className={tr}>
                  <td className={td}>
                    <Link
                      to={`/admin/knowledge-base/${doc.id}`}
                      className="flex items-center gap-2.5 font-medium hover:text-primary-700"
                    >
                      <FileText className="size-4 shrink-0 text-ink-muted" />
                      <span className="truncate">{doc.name}</span>
                    </Link>
                  </td>
                  <td className={td}>{doc.fileType}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    {formatDateTime(doc.uploadedAt)}
                  </td>
                  <td className={td}>
                    <StatusBadge status={doc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
