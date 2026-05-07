"use client";
// Loading spinner (client)
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="h-12 w-12 rounded-full border-4 border-[var(--brand)] border-t-[var(--accent)] animate-spin" />
    </div>
  );
}
