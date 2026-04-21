// src/app/admin/infastorage/page.tsx
"use client";

import { useState, useEffect } from "react";

// --- TYPES ---
type InfrasTab = "overview" | "infrastructure" | "warehouse" | "services";

interface BranchInfo {
  id: string;
  name: string;
  type: string;
  floors: number;
  rooms: number;
  staff: string;
  area: string;
  address: string;
  note: string;
  img: string;
}

// --- STATIC DATA ---
const branchData: Record<string, BranchInfo> = {
  "br-001": {
    id: "LR-BR-001-VN",
    name: "Riverside Premium Hotel & Spa",
    type: "5-Star Luxury Resort",
    floors: 25,
    rooms: 350,
    staff: "124 (Đang ca: 32)",
    area: "12,500 m²",
    address: "123 Bến Vân Đồn, Phường 6, Quận 4, TP. HCM",
    note: "Bảo trì hệ thống lạnh lầu 4 (Dự kiến xong: 16:00)",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
  },
  // Thêm các chi nhánh khác tại đây...
};

export default function InfrasPage() {
  const [activeTab, setActiveTab] = useState<InfrasTab>("overview");
  const [selectedBranch, setSelectedBranch] = useState("br-001");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const branch = branchData[selectedBranch];

  // Clock effect
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        `${now.toLocaleDateString("vi-VN")} - ${now.toLocaleTimeString("vi-VN", { hour12: false })}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold tracking-tighter">LORTEL</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <nav className="space-y-4 flex-1">
            <a href="#" className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition text-sm text-blue-400 font-bold">Hạ tầng</a>
            <a href="#" className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition text-sm">Tài vụ</a>
          </nav>
          <div className="text-[10px] text-slate-500 mt-auto uppercase font-bold">Infras Module v0.1</div>
        </div>
      </aside>

      {/* HEADER */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-md">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="border-l pl-4">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{currentTime}</span>
            <h1 className="text-sm font-black text-slate-900 uppercase">Quản lý hạ tầng & Dịch vụ</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT NAV */}
        <aside className="w-64 bg-slate-800 flex flex-col shrink-0">
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Danh mục quản lý</h3>
            <nav className="space-y-1">
              {(["overview", "infrastructure", "warehouse", "services"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left p-3 text-[11px] font-bold rounded transition uppercase ${
                    activeTab === tab ? "bg-slate-900 text-amber-400 border-r-4 border-amber-400" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tab === "overview" && "Tổng quan chi nhánh"}
                  {tab === "infrastructure" && "Cơ sở hạ tầng"}
                  {tab === "warehouse" && "Kho bãi / Vật tư"}
                  {tab === "services" && "Dịch vụ khách sạn"}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chi nhánh đang xem</h3>
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full max-w-xs bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-bold uppercase rounded p-2 outline-none cursor-pointer"
            >
              <option value="br-001">Riverside Premium</option>
              <option value="br-002">City Center Luxury</option>
            </select>
          </div>

          {activeTab === "overview" && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{branch.name}</h2>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Chi nhánh trọng điểm (HQ)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-[11px]">
                    <InfoRow label="Mã số" value={branch.id} />
                    <InfoRow label="Phân loại" value={branch.type} />
                    <InfoRow label="Số tầng" value={`${branch.floors} Tầng`} highlight />
                    <InfoRow label="Số phòng" value={`${branch.rooms} Phòng`} highlight />
                    <InfoRow label="Nhân sự" value={branch.staff} />
                    <InfoRow label="Diện tích" value={branch.area} />
                  </div>

                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="text-red-700 text-[11px]">
                      <span className="font-black uppercase text-[9px] mr-2">Thông báo:</span>
                      {branch.note}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <img src={branch.img} alt="Branch" className="w-64 h-40 object-cover rounded-lg border-2 border-slate-200 shadow-sm" />
                </div>
              </div>
            </div>
          )}
          
          {/* Thêm nội dung các Tab khác tương tự */}
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <p className="flex items-center">
      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">{label}:</span>
      <b className={`${highlight ? "text-blue-600 font-black" : "text-slate-700"}`}>{value}</b>
    </p>
  );
}