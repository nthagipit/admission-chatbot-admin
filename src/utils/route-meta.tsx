export interface Crumb {
  label: string;
  to?: string;
}

export interface PageMeta {
  title: string;
  crumbs: Crumb[];
}

interface Section {
  title: string;
  detailTitle?: string;
  listLabel?: string;
}

const SECTIONS: Record<string, Section> = {
  "knowledge-base": {
    title: "Knowledge Base",
    detailTitle: "Document details",
    listLabel: "Documents",
  },
  conversations: {
    title: "Conversations",
    detailTitle: "Conversation details",
  },
  users: { title: "Users", detailTitle: "User profile" },
  settings: { title: "Settings" },
};

/** Suy ra page title + breadcrumb từ URL (/admin/<section>/<id>). */
export function getPageMeta(pathname: string): PageMeta {
  const [, section, id] = pathname.split("/").filter(Boolean);
  const root: Crumb = { label: "Admin", to: "/admin" };

  if (!section)
    return { title: "Dashboard", crumbs: [root, { label: "Dashboard" }] };

  const meta = SECTIONS[section];
  if (!meta) return { title: "Page not found", crumbs: [root] };

  if (id) {
    const label = meta.detailTitle ?? "Details";
    return {
      title: label,
      crumbs: [root, { label: meta.title, to: `/admin/${section}` }, { label }],
    };
  }
  const crumbs: Crumb[] = [root, { label: meta.title }];
  if (meta.listLabel) crumbs.push({ label: meta.listLabel });
  return { title: meta.title, crumbs };
}
