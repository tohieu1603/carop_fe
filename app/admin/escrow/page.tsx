export default function AdminEscrowPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Bảo lãnh giao dịch</h1>
      <p style={{ color: "var(--ink-500)", marginTop: 8 }}>TODO: Hiển thị các giao dịch escrow đang giữ tiền cọc.</p>
      <div className="card" style={{ padding: 40, marginTop: 24, textAlign: "center", color: "var(--ink-500)" }}>
        Chưa có giao dịch escrow nào đang xử lý.
      </div>
    </div>
  );
}
