"use client";

import { useDarkMode } from "@/contexts/DarkModeContext"; // thay useAdminDashboard bằng context
import { useState, useEffect, useRef, useCallback } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);
import { useAdminDashboard } from "@/components/useAdminDashboard"; // Đảm bảo đúng đường dẫn

// ─── TYPES ───────────────────────────────────────────────────────────────────
type InfrastorageTab = "overview" | "branch" | "infrastructure" | "storage" | "services";
type BuildingStatus = "Active" | "Maintenance" | "Closed";
type RoomStatus = "Available" | "Occupied" | "Maintenance" | "Reserved";
type StorageItemStatus = "InStock" | "LowStock" | "OutOfStock";
type ServiceStatus = "Active" | "Inactive";
type BuildingType =
  | "Hotel"
  | "Resort"
  | "Villa"
  | "Apartment"
  | "MixedUse";

type RoomType =
  | "Standard"
  | "Deluxe"
  | "Suite"
  | "Conference"
  | "ServiceRoom";


//---- Interface Building

interface Branch {
  id: string;

  // identity
  name: string;
  type: BuildingType;
  starRating: number;

  // location
  address: string;
  city: string;
  country: string;

  // scale
  totalFloors: number;
  totalRooms: number;
  totalArea: number; // m2

  // infrastructure
  elevatorCount: number;
  parkingCapacity: number;

  // management
  managedBy: string;
  staffCount: number;

  // operational
  status: BuildingStatus;
  openingDate: string;
}

// ---- Interface Room
interface Infrastructure {
  id: string;

  branchId: string; // FK -> Branch

  name: string;
  type: RoomType;

  floor: number;
  area: number; // m2
  capacity: number;

  pricePerNight: number;

  status: RoomStatus;

  hasWifi: boolean;
  hasAC: boolean;
  hasBathroom: boolean;
}

// ---- Interface Storage Item
interface Storage {
  id: string;

  branchId: string; // FK -> Branch

  name: string;
  category: string; // khăn, chăn, minibar, vệ sinh...

  quantity: number;
  unit: string; // pcs, box, set...

  importDate: string;
  expiryDate?: string | null;

  minThreshold: number;

  status: StorageItemStatus;
}

// ---- Interface Service
interface Service {
  id: string;

  branchId: string; // FK -> Branch

  name: string;
  category: "Basic" | "Premium" | "Facility";

  price: number;
  unit: string; // per day, per use...

  available24h: boolean;

  status: ServiceStatus;

  description?: string;
}

interface InfraStorageData {
  branches: Branch[];
  infrastructures: Infrastructure[];
  storageItems: Storage[];
  services: Service[];
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
import data from "@/data/infrastorageDummyData.json";

const infraData = data as InfraStorageData;
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function InfastoragePage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<InfrastorageTab>("overview");
  const [selectedBranch, setSelectedBranch] = useState("br-001");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [pendingImports, setPendingImports] = useState<any[]>([]);
  const [importFormData, setImportFormData] = useState({
    itemName: "",
    itemQty: "",
    itemSupplier: "",
  });
  const [showImportModal, setShowImportModal] = useState(false);

  // Branch data
  const branchesData: Record<string, any> = {
    "br-001": {
      name: "Riverside Premium Hotel & Spa",
      type: "5-Star Luxury Resort",
      address: "123 Bến Vân Đồn, Phường 6, Quận 4, TP. Hồ Chí Minh",
      contact: "(+84) 28 3822 1234",
      staff: "124 (Đang ca: 32)",
      area: "12,500 m²",
      floors: "25 Tầng",
      rooms: "350 Phòng",
      iot: "Trực tuyến (98% Thiết bị)",
      status: "Chi nhánh trọng điểm (HQ)",
      note: "Bảo trì hệ thống lạnh lầu 4 (Dự kiến xong: 16:00)",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    },
    "br-002": {
      name: "City Center Luxury Hotel",
      type: "Boutique Hotel",
      address: "45 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh",
      contact: "(+84) 28 3822 5566",
      staff: "85 (Đang ca: 15)",
      area: "5,000 m²",
      floors: "12 Tầng",
      rooms: "120 Phòng",
      iot: "Trực tuyến (100% Thiết bị)",
      status: "Chi nhánh nội đô",
      note: "Hoạt động bình thường",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
    },
    "br-003": {
      name: "Lortel Beachfront Resort",
      type: "Coastal Resort",
      address: "Trần Phú, TP. Nha Trang, Khánh Hòa",
      contact: "(+84) 258 3822 9999",
      staff: "210 (Đang ca: 45)",
      area: "45,000 m²",
      floors: "05 Tầng (Bungalow)",
      rooms: "280 Phòng",
      iot: "Cảnh báo (85% Thiết bị - Mất kết nối khu B)",
      status: "Resort nghỉ dưỡng",
      note: "Đang chuẩn bị cho mùa du lịch cao điểm",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    },
  };

  // Infrastructure data
  const infraData = [
    {
      item: "Hệ thống PCCC",
      area: "Toàn tòa nhà",
      status: "Hoạt động tốt",
      time: "18/05/2026 - 09:00",
    },
    {
      item: "Thang máy số 3",
      area: "Sảnh chính",
      status: "Đang bảo trì",
      time: "20/05/2026 - 14:20",
    },
    {
      item: "Máy phát điện dự phòng",
      area: "Tầng hầm B2",
      status: "Sẵn sàng",
      time: "15/05/2026 - 08:30",
    },
    {
      item: "Hệ thống Chiller",
      area: "Tầng kỹ thuật",
      status: "Hoạt động tốt",
      time: "19/05/2026 - 10:00",
    },
    {
      item: "Camera an ninh (CCTV)",
      area: "Hành lang lầu 1-5",
      status: "Hoạt động tốt",
      time: "20/05/2026 - 07:45",
    },
    {
      item: "Hệ thống xử lý nước",
      area: "Khu vực hồ bơi",
      status: "Cần kiểm tra",
      time: "20/05/2026 - 11:30",
    },
    {
      item: "Wifi tầng trệt",
      area: "Khu vực Cafe",
      status: "Sự cố kết nối",
      time: "20/05/2026 - 15:10",
    },
  ];

  // Warehouse data
  const warehouseData = [
    { name: "Bộ chăn ga Standard", qty: 150, min: 50, rating: "Tốt" },
    { name: "Khăn tắm loại A", qty: 45, min: 100, rating: "Cần nhập thêm" },
    { name: "Dầu gội / Sữa tắm (thùng)", qty: 12, min: 5, rating: "Tốt" },
    { name: "Nước suối đóng chai", qty: 500, min: 200, rating: "Tốt" },
    {
      name: "Bộ đồ dùng cá nhân (Amenity)",
      qty: 30,
      min: 150,
      rating: "Cần nhập thêm",
    },
    {
      name: "Giấy vệ sinh cao cấp",
      qty: 25,
      min: 30,
      rating: "Sắp hết",
    },
    { name: "Dép đi trong phòng", qty: 80, min: 40, rating: "Tốt" },
  ];

  // Services data
  const servicesData = [
    {
      name: "Buffet Sáng",
      price: "350,000 VND",
      status: "Hoạt động",
      reason: "-",
    },
    {
      name: "Giặt ủi lấy liền",
      price: "Theo bảng giá",
      status: "Hoạt động",
      reason: "-",
    },
    {
      name: "Hồ bơi vô cực",
      price: "Miễn phí (Khách lưu trú)",
      status: "Tạm ngưng",
      reason: "Thay nước định kỳ",
    },
    {
      name: "Dịch vụ Spa & Massage",
      price: "800,000 VND",
      status: "Hoạt động",
      reason: "-",
    },
    {
      name: "Xe đưa đón sân bay",
      price: "500,000 VND/lượt",
      status: "Hoạt động",
      reason: "-",
    },
    {
      name: "Phòng Gym 24/7",
      price: "Miễn phí",
      status: "Hoạt động",
      reason: "-",
    },
    {
      name: "Bar sân thượng",
      price: "Theo menu",
      status: "Tạm ngưng",
      reason: "Sửa chữa sàn gỗ",
    },
  ];

  // Update date time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("vi-VN", { hour12: false });
      setCurrentDateTime(`${dateStr} - ${timeStr}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentBranchData = () => branchesData[selectedBranch];

  const handleImportSubmit = () => {
    if (!importFormData.itemName || !importFormData.itemQty) return;

    const newImport = {
      id: Date.now(),
      name: importFormData.itemName,
      qty: importFormData.itemQty,
      supplier: importFormData.itemSupplier,
    };

    setPendingImports([...pendingImports, newImport]);
    setImportFormData({ itemName: "", itemQty: "", itemSupplier: "" });
    setShowImportModal(false);
  };

  const branchData = getCurrentBranchData();

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 shadow-2xl transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold tracking-tighter">LORTEL</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <nav className="space-y-4 flex-1">
            <a
              href="#"
              className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition text-sm"
            >
              Lễ tân
            </a>
            <a
              href="#"
              className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition text-sm"
            >
              Nhân sự
            </a>
            <a
              href="#"
              className="flex items-center p-3 bg-blue-600 rounded-lg font-bold text-sm"
            >
              Chi nhánh
            </a>
            <a
              href="#"
              className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition text-sm"
            >
              Tài vụ
            </a>
          </nav>
          <div className="text-[10px] text-slate-500 mt-auto uppercase font-bold">
            Infras Module v0.1
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-md transition"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="border-l pl-4">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              {currentDateTime}
            </span>
            <h1 className="text-sm font-black text-slate-900 uppercase">
              Quản lý hạ tầng & Dịch vụ
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Admin</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
            INF
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Nav */}
        <aside className="w-64 bg-slate-800 flex flex-col shrink-0">
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Danh mục quản lý
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center p-3 text-[11px] font-bold rounded transition text-left uppercase ${
                  activeTab === "overview"
                    ? "bg-slate-900 text-amber-400 border-r-4 border-amber-400"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                Tổng quan chi nhánh
              </button>
              <button
                onClick={() => setActiveTab("infrastructure")}
                className={`w-full flex items-center p-3 text-[11px] font-bold rounded transition text-left uppercase ${
                  activeTab === "infrastructure"
                    ? "bg-slate-900 text-amber-400 border-r-4 border-amber-400"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                Cơ sở hạ tầng
              </button>
              <button
                onClick={() => setActiveTab("storage")}
                className={`w-full flex items-center p-3 text-[11px] font-bold rounded transition text-left uppercase ${
                  activeTab === "storage"
                    ? "bg-slate-900 text-amber-400 border-r-4 border-amber-400"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                Kho bãi / Vật tư
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`w-full flex items-center p-3 text-[11px] font-bold rounded transition text-left uppercase ${
                  activeTab === "services"
                    ? "bg-slate-900 text-amber-400 border-r-4 border-amber-400"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                Dịch vụ khách sạn
              </button>
            </nav>
          </div>
          <div className="mt-auto p-4 bg-slate-900/50">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Trạng thái hệ thống</span>
              <span className="text-green-400">Ổn định</span>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <section className="flex-1 overflow-y-auto p-6">
          {/* Branch Selector */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Chi nhánh đang xem
            </h3>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-bold uppercase rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="br-001">Riverside Premium</option>
              <option value="br-002">City Center Luxury</option>
              <option value="br-003">Beachfront Resort</option>
            </select>
          </div>

          {/* Tab: Tổng quan chi nhánh */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                      {branchData.name}
                    </h2>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      {branchData.status}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-[11px]">
                    <p className="flex items-center">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Mã số:
                      </span>
                      <b className="text-slate-700">LR-{selectedBranch.toUpperCase()}-VN</b>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Phân loại:
                      </span>
                      <b className="text-slate-700">{branchData.type}</b>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Số tầng:
                      </span>
                      <b className="text-slate-700 text-blue-600 font-black">
                        {branchData.floors}
                      </b>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Số phòng:
                      </span>
                      <b className="text-slate-700 text-blue-600 font-black">
                        {branchData.rooms}
                      </b>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Nhân sự:
                      </span>
                      <b className="text-slate-700">{branchData.staff}</b>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Diện tích:
                      </span>
                      <b className="text-slate-700">{branchData.area}</b>
                    </p>
                    <p className="flex items-center col-span-full">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Hệ thống IoT:
                      </span>
                      <span
                        className={`flex items-center font-black uppercase text-[10px] ${
                          branchData.iot.includes("Cảnh báo")
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full animate-pulse mr-2 ${
                            branchData.iot.includes("Cảnh báo")
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                        />
                        {branchData.iot}
                      </span>
                    </p>
                    <p className="flex items-start col-span-full">
                      <span className="text-gray-400 font-bold uppercase text-[9px] w-24 shrink-0">
                        Địa chỉ:
                      </span>
                      <b className="text-slate-700">{branchData.address}</b>
                    </p>
                  </div>

                  <div
                    className={`mt-2 p-2 border-l-4 rounded ${
                      branchData.note.includes("bình thường")
                        ? "bg-green-50 border-green-500"
                        : "bg-red-50 border-red-500"
                    }`}
                  >
                    <p
                      className={`flex items-center ${
                        branchData.note.includes("bình thường")
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      <span className="font-black uppercase text-[9px] mr-3">
                        Thông báo:
                      </span>
                      <span className="font-medium text-[11px]">
                        {branchData.note}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Branch Image */}
                <div className="shrink-0 group relative">
                  <div className="w-64 h-40 bg-slate-200 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner">
                    <img
                      src={branchData.image}
                      alt={branchData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-transform active:scale-95">
                    <svg
                      className="w-3.5 h-3.5 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Cơ sở hạ tầng */}
          {activeTab === "infrastructure" && (
            <div className="bg-white rounded border h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-tighter">
                  Kiểm tra cơ sở hạ tầng
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 uppercase font-black">
                    <tr>
                      <th className="p-4 border-b">Hạng mục</th>
                      <th className="p-4 border-b">Vị trí / Khu vực</th>
                      <th className="p-4 border-b text-center">Trạng thái</th>
                      <th className="p-4 border-b text-right">Thời gian kiểm tra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {infraData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold uppercase text-slate-700">
                          {item.item}
                        </td>
                        <td className="p-4">{item.area}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              item.status === "Hoạt động tốt" ||
                              item.status === "Sẵn sàng"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-gray-500">
                          {item.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Kho bãi */}
          {activeTab === "storage" && (
            <div className="bg-white rounded border h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-tighter">
                  Quản lý vật phẩm & Kho bãi
                </h3>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-slate-800 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-slate-700"
                  >
                    Nhập kho
                  </button>
                  <button className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-slate-300">
                    Xuất báo cáo
                  </button>
                </div>
              </div>

              {pendingImports.length > 0 && (
                <div className="p-4 space-y-2 bg-slate-50 border-b">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2">
                    Yêu cầu nhập kho đang chờ
                  </h4>
                  {pendingImports.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-lg shadow-sm animate-pulse mb-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <div>
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">
                            {item.name}
                          </h4>
                          <p className="text-[9px] text-amber-700 font-bold uppercase">
                            Số lượng: {item.qty} | NCC: {item.supplier}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 uppercase font-black">
                    <tr>
                      <th className="p-4 border-b">Vật phẩm</th>
                      <th className="p-4 border-b text-center">Số lượng</th>
                      <th className="p-4 border-b text-center">Ngưỡng tối thiểu</th>
                      <th className="p-4 border-b text-center">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {warehouseData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold uppercase text-slate-700">
                          {item.name}
                        </td>
                        <td className="p-4 text-center font-mono text-lg">
                          {item.qty}
                        </td>
                        <td className="p-4 text-center text-gray-400 font-bold uppercase">
                          {item.min}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                              item.qty >= item.min
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Dịch vụ */}
          {activeTab === "services" && (
            <div className="bg-white rounded border h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-tighter">
                  Danh sách dịch vụ hoạt động
                </h3>
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-blue-700">
                  Cập nhật dịch vụ
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 uppercase font-black">
                    <tr>
                      <th className="p-4 border-b">Tên dịch vụ</th>
                      <th className="p-4 border-b">Đơn giá</th>
                      <th className="p-4 border-b text-center">Trạng thái</th>
                      <th className="p-4 border-b">Lý do (nếu tạm ngưng)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {servicesData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold uppercase text-slate-700">
                          {item.name}
                        </td>
                        <td className="p-4 font-bold text-blue-600">
                          {item.price}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              item.status === "Hoạt động"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 italic text-gray-400">
                          {item.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">
                Phiếu nhập kho mới
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Tên vật phẩm
                </label>
                <input
                  type="text"
                  value={importFormData.itemName}
                  onChange={(e) =>
                    setImportFormData({
                      ...importFormData,
                      itemName: e.target.value,
                    })
                  }
                  className="w-full border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="VD: Khăn tắm loại A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={importFormData.itemQty}
                    onChange={(e) =>
                      setImportFormData({
                        ...importFormData,
                        itemQty: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Nhà phân phối
                  </label>
                  <input
                    type="text"
                    value={importFormData.itemSupplier}
                    onChange={(e) =>
                      setImportFormData({
                        ...importFormData,
                        itemSupplier: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Tên NCC"
                  />
                </div>
              </div>
              <button
                onClick={handleImportSubmit}
                className="w-full bg-blue-600 text-white font-black py-3 rounded uppercase text-xs tracking-widest hover:bg-blue-700 transition"
              >
                Xác nhận nhập kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
