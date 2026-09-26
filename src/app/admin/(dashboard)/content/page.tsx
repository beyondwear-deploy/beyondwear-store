import { ContentManager } from "./ContentManager";

export const metadata = { title: "Admin — Edit content" };

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit content</h1>
        <p className="text-sm text-muted">Change any of the site&apos;s editable text and photos directly, no code needed.</p>
      </div>
      <ContentManager />
    </div>
  );
}
