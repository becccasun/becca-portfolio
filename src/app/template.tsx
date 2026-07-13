/**
 * Re-mounts on every route change, so the CSS entrance animation in
 * globals.css plays between pages (roydenso.com-style fade-up).
 */
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
