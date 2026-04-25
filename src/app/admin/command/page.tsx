import { useState } from "react";
import { useAdminDashboard } from "@/components/useAdminDashboard";

type DeleteModalData = {
  title: string;
  message: string;
  onConfirm: () => void;
} | null;

export default function CommandPage() {
  const {
    bookings,
    setBookings,
    rooms,
    setRooms,
    customers,
    isBookingModalOpen,
    setIsBookingModalOpen,
    isRoomModalOpen,
    setIsRoomModalOpen,
    editBookingId,
    setEditBookingId,
    editRoomId,
    setEditRoomId,
    bookingFormRef,
    roomFormRef,
    showToast,
  } = useAdminDashboard();

  const [activeTab, setActiveTab] = useState<"bookings" | "rooms">("bookings");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<DeleteModalData>(null);

  // Delete modal handlers
  const openDeleteModal = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setDeleteModalData({ title, message, onConfirm });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteModalData(null);
  };

  const confirmDelete = () => {
    if (deleteModalData) {
      deleteModalData.onConfirm();
    }
    closeDeleteModal();
  };

  // Utility functions
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // ─── BOOKING CRUD ───────────────────────────────────────────────────────────
  const openBookingModal = (id: number | null = null) => {
    setEditBookingId(id);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setEditBookingId(null);
  };

  const saveBooking = () => {
    const form = bookingFormRef.current;
    if (!form) return;
    const customerSelect = form.querySelector(
      "#bookingCustomer",
    ) as HTMLSelectElement;
    const roomSelect = form.querySelector("#bookingRoom") as HTMLSelectElement;
    const checkinInput = form.querySelector(
      "#bookingCheckin",
    ) as HTMLInputElement;
    const checkoutInput = form.querySelector(
      "#bookingCheckout",
    ) as HTMLInputElement;
    const guestsInput = form.querySelector(
      "#bookingGuests",
    ) as HTMLInputElement;
    const notesInput = form.querySelector(
      "#bookingNotes",
    ) as HTMLTextAreaElement;

    const customerId = parseInt(customerSelect?.value || "0");
    const roomId = parseInt(roomSelect?.value || "0");
    const checkin = checkinInput?.value || "";
    const checkout = checkoutInput?.value || "";
    const guests = parseInt(guestsInput?.value || "2");
    const note = notesInput?.value || "";

    if (!customerId || !roomId || !checkin || !checkout) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    const room = rooms.find((r) => r.id === roomId);
    if (!customer || !room) return;

    const days = Math.max(
      1,
      Math.ceil(
        (new Date(checkout).getTime() - new Date(checkin).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const total = room.price * days;

    if (editBookingId) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editBookingId
            ? {
                ...b,
                customerId,
                customer: customer.name,
                roomId,
                room: room.name,
                checkin,
                checkout,
                guests,
                total,
                note,
              }
            : b,
        ),
      );
      showToast("Cập nhật đặt phòng thành công");
    } else {
      const newId = Math.max(...bookings.map((b) => b.id), 0) + 1;
      const newBooking = {
        id: newId,
        code: `BK${String(newId).padStart(3, "0")}`,
        customerId,
        customer: customer.name,
        roomId,
        room: room.name,
        checkin,
        checkout,
        guests,
        total,
        note,
        status: "pending" as const,
      };
      setBookings((prev) => [...prev, newBooking]);
      showToast("Thêm đặt phòng thành công");
    }
    closeBookingModal();
  };

  const deleteBooking = (id: number) => {
    openDeleteModal(
      "Xóa đặt phòng",
      "Bạn có chắc chắn muốn xóa đặt phòng này?",
      () => {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        showToast("Đã xóa đặt phòng");
      },
    );
  };

  // ─── ROOM CRUD ────────────────────────────────────────────────────────────
  const openRoomModal = (id: number | null = null) => {
    setEditRoomId(id);
    setIsRoomModalOpen(true);
  };

  const closeRoomModal = () => {
    setIsRoomModalOpen(false);
    setEditRoomId(null);
  };

  const saveRoom = () => {
    const form = roomFormRef.current;
    if (!form) return;
    const nameInput = form.querySelector("#roomName") as HTMLInputElement;
    const numberInput = form.querySelector("#roomNumber") as HTMLInputElement;
    const typeSelect = form.querySelector("#roomType") as HTMLSelectElement;
    const priceInput = form.querySelector("#roomPrice") as HTMLInputElement;
    const areaInput = form.querySelector("#roomArea") as HTMLInputElement;
    const capacityInput = form.querySelector(
      "#roomCapacity",
    ) as HTMLInputElement;
    const statusSelect = form.querySelector("#roomStatus") as HTMLSelectElement;
    const descInput = form.querySelector("#roomDesc") as HTMLTextAreaElement;
    const amenityWifi = form.querySelector("#amenityWifi") as HTMLInputElement;
    const amenityTv = form.querySelector("#amenityTv") as HTMLInputElement;
    const amenityAc = form.querySelector("#amenityAc") as HTMLInputElement;
    const amenityBath = form.querySelector("#amenityBath") as HTMLInputElement;

    const name = nameInput?.value || "";
    const number = numberInput?.value || "";
    const price = parseInt(priceInput?.value || "0");

    if (!name || !number || !price) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const amenities: string[] = [];
    if (amenityWifi?.checked) amenities.push("wifi");
    if (amenityTv?.checked) amenities.push("tv");
    if (amenityAc?.checked) amenities.push("ac");
    if (amenityBath?.checked) amenities.push("bath");

    const roomData = {
      name,
      number,
      type: typeSelect?.value || "Standard",
      price,
      area: parseInt(areaInput?.value || "0"),
      capacity: parseInt(capacityInput?.value || "2"),
      status: statusSelect?.value || "available",
      amenities,
      desc: descInput?.value || "",
    };

    if (editRoomId) {
      setRooms((prev) =>
        prev.map((r) => (r.id === editRoomId ? { ...r, ...roomData } : r)),
      );
      showToast("Cập nhật phòng thành công");
    } else {
      const newId = Math.max(...rooms.map((r) => r.id), 0) + 1;
      setRooms((prev) => [...prev, { id: newId, ...roomData }]);
      showToast("Thêm phòng thành công");
    }
    closeRoomModal();
  };

  const deleteRoom = (id: number) => {
    openDeleteModal("Xóa phòng", "Bạn có chắc chắn muốn xóa phòng này?", () => {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      showToast("Đã xóa phòng");
    });
  };

  // ─── RENDER CONTENT ──────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return (
          <div className="space-y-6">
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold">Quản lý đặt phòng</h1>
              <button
                onClick={() => openBookingModal(null)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                <i className="fas fa-plus mr-2"></i>Thêm đặt phòng
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="border rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:border-gray-600">
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                </select>
                <input
                  type="date"
                  className="border rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="date"
                  className="border rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-gray-800">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs">Mã</th>
                    <th className="px-6 py-3 text-left text-xs">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs">Phòng</th>
                    <th className="px-6 py-3 text-left text-xs">Ngày nhận</th>
                    <th className="px-6 py-3 text-left text-xs">Ngày trả</th>
                    <th className="px-6 py-3 text-left text-xs">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs">Tổng</th>
                    <th className="px-6 py-3 text-center text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b dark:border-gray-700">
                      <td className="px-6 py-3">{b.code}</td>
                      <td className="px-6 py-3">{b.customer}</td>
                      <td className="px-6 py-3">{b.room}</td>
                      <td className="px-6 py-3">{formatDate(b.checkin)}</td>
                      <td className="px-6 py-3">{formatDate(b.checkout)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`badge ${b.status === "confirmed" ? "badge-success" : b.status === "pending" ? "badge-warning" : "badge-info"}`}
                        >
                          {b.status === "confirmed"
                            ? "Đã xác nhận"
                            : b.status === "pending"
                              ? "Chờ"
                              : "Hoàn thành"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {formatCurrency(b.total)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          className="text-blue-600 mr-2"
                          onClick={() => openBookingModal(b.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => deleteBooking(b.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "rooms":
        return (
          <div className="space-y-6">
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold">Quản lý phòng</h1>
              <button
                onClick={() => openRoomModal(null)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                <i className="fas fa-plus mr-2"></i>Thêm phòng
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg dark:bg-gray-800">
                <p className="text-gray-500">Tổng số</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg dark:bg-gray-800">
                <p className="text-gray-500">Phòng trống</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter((r) => r.status === "available").length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg dark:bg-gray-800">
                <p className="text-gray-500">Đang có khách</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rooms.filter((r) => r.status === "occupied").length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg dark:bg-gray-800">
                <p className="text-gray-500">Bảo trì</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter((r) => r.status === "maintenance").length}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="room-card bg-white rounded-xl shadow-sm border overflow-hidden dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="relative h-40 bg-gray-200">
                    <img
                      src={`https://picsum.photos/id/${164 + r.id}/400/200`}
                      className="w-full h-full object-cover"
                      alt={r.name}
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full text-white ${
                        r.status === "available"
                          ? "bg-green-500"
                          : r.status === "occupied"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    >
                      {r.status === "available"
                        ? "Trống"
                        : r.status === "occupied"
                          ? "Đã đặt"
                          : "Bảo trì"}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{r.name}</h3>
                      <span className="text-emerald-600 font-bold">
                        {formatCurrency(r.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Phòng {r.number} • {r.area}m² • {r.capacity} người
                    </p>
                    <div className="flex gap-1 mt-2">
                      {r.amenities.map((a) => (
                        <span
                          key={a}
                          className="bg-gray-100 text-xs px-2 py-1 rounded dark:bg-gray-700"
                        >
                          <i
                            className={`fas fa-${a === "wifi" ? "wifi" : a === "tv" ? "tv" : a === "ac" ? "wind" : "bath"}`}
                          ></i>{" "}
                          {a.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t dark:border-gray-700">
                      <button
                        className="text-blue-600"
                        onClick={() => openRoomModal(r.id)}
                      >
                        <i className="fas fa-edit mr-1"></i>Sửa
                      </button>
                      <button
                        className="text-red-600"
                        onClick={() => deleteRoom(r.id)}
                      >
                        <i className="fas fa-trash mr-1"></i>Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm dark:bg-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các lệnh đặt phòng và phòng
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 flex gap-6">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-1 border-b-2 font-medium transition ${
                activeTab === "bookings"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <i className="fas fa-calendar mr-2"></i>Đặt phòng
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`py-4 px-1 border-b-2 font-medium transition ${
                activeTab === "rooms"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <i className="fas fa-door-open mr-2"></i>Phòng
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">{renderContent()}</div>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative modal-enter dark:bg-gray-800"
            ref={bookingFormRef}
          >
            <button
              onClick={closeBookingModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold">
                {editBookingId ? "Sửa đặt phòng" : "Thêm đặt phòng mới"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const booking = editBookingId
                  ? bookings.find((b) => b.id === editBookingId)
                  : null;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Khách hàng *
                        </label>
                        <select
                          id="bookingCustomer"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={booking?.customerId || ""}
                        >
                          <option value="">Chọn khách hàng</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phòng *
                        </label>
                        <select
                          id="bookingRoom"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={booking?.roomId || ""}
                        >
                          <option value="">Chọn phòng</option>
                          {rooms
                            .filter(
                              (r) =>
                                r.status === "available" ||
                                (booking && booking.roomId === r.id),
                            )
                            .map((r) => (
                              <option
                                key={r.id}
                                value={r.id}
                                data-price={r.price}
                              >
                                {r.name} - {formatCurrency(r.price)}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày nhận *
                        </label>
                        <input
                          type="date"
                          id="bookingCheckin"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={booking?.checkin || ""}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ngày trả *
                        </label>
                        <input
                          type="date"
                          id="bookingCheckout"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={booking?.checkout || ""}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Số khách
                        </label>
                        <input
                          type="number"
                          id="bookingGuests"
                          defaultValue={booking?.guests || 2}
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Mã khuyến mãi
                        </label>
                        <input
                          type="text"
                          id="bookingPromo"
                          placeholder="Nhập mã"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        id="bookingNotes"
                        rows={2}
                        className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                        defaultValue={booking?.note || ""}
                      ></textarea>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="p-6 border-t flex justify-end gap-3 dark:border-gray-700">
              <button
                onClick={closeBookingModal}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={saveBooking}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROOM MODAL */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative modal-enter dark:bg-gray-800"
            ref={roomFormRef}
          >
            <button
              onClick={closeRoomModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold">
                {editRoomId ? "Sửa phòng" : "Thêm phòng mới"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const room = editRoomId
                  ? rooms.find((r) => r.id === editRoomId)
                  : null;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tên phòng *
                        </label>
                        <input
                          type="text"
                          id="roomName"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={room?.name || ""}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Số phòng *
                        </label>
                        <input
                          type="text"
                          id="roomNumber"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={room?.number || ""}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Loại phòng
                        </label>
                        <select
                          id="roomType"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={room?.type || "Standard"}
                        >
                          <option>Standard</option>
                          <option>Deluxe</option>
                          <option>Suite</option>
                          <option>Family</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Giá/đêm *
                        </label>
                        <input
                          type="number"
                          id="roomPrice"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={room?.price || ""}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Diện tích (m²)
                        </label>
                        <input
                          type="number"
                          id="roomArea"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={room?.area || ""}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sức chứa
                        </label>
                        <input
                          type="number"
                          id="roomCapacity"
                          className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                          defaultValue={room?.capacity || 2}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tiện ích
                      </label>
                      <div className="flex gap-4">
                        <label>
                          <input
                            type="checkbox"
                            id="amenityWifi"
                            defaultChecked={
                              room?.amenities.includes("wifi") ?? true
                            }
                          />{" "}
                          WiFi
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            id="amenityTv"
                            defaultChecked={
                              room?.amenities.includes("tv") ?? true
                            }
                          />{" "}
                          TV
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            id="amenityAc"
                            defaultChecked={
                              room?.amenities.includes("ac") ?? true
                            }
                          />{" "}
                          Điều hòa
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            id="amenityBath"
                            defaultChecked={
                              room?.amenities.includes("bath") ?? false
                            }
                          />{" "}
                          Bồn tắm
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Trạng thái
                      </label>
                      <select
                        id="roomStatus"
                        className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                        defaultValue={room?.status || "available"}
                      >
                        <option value="available">Phòng trống</option>
                        <option value="occupied">Đang có khách</option>
                        <option value="maintenance">Đang bảo trì</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mô tả
                      </label>
                      <textarea
                        id="roomDesc"
                        rows={2}
                        className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600"
                        defaultValue={room?.desc || ""}
                      ></textarea>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="p-6 border-t flex justify-end gap-3 dark:border-gray-700">
              <button
                onClick={closeRoomModal}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={saveRoom}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
