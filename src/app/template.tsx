import type { ReactNode } from "react";
/** Re-mounts on every navigation → CSS page-enter transition (works without JS). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
