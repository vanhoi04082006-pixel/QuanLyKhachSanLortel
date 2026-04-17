// src/app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar của bạn nằm ở đây */}
      <aside className="w-64 bg-slate-900">
        {/* Các Link dẫn đến /admin/inventory, /admin/finance... */}
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
        {/* Nội dung các trang con sẽ hiển thị tại children */}
        {children}
      </main>
    </div>
  );
}