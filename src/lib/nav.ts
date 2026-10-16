// Which header page a path belongs to. The home page is Work (it's the works grid);
// case studies under /work/ belong to no page, so nothing is marked there.
export function isCurrentPage(href: string, pathname: string) {
  if (href === "/#work") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
