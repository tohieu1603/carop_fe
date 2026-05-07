import Link from "next/link";

export default function SellPage() {
  return (
    <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Trang chủ</Link>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Đăng bán xe ngập của bạn</h1>
      <p style={{ color: "var(--ink-600)", marginTop: 8 }}>
        Đội kiểm định xengap.vn sẽ liên hệ trong 24h. Bạn chỉ trả phí khi xe bán được.
      </p>

      <form style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        <div>
          <label className="label">Hãng & dòng xe</label>
          <input className="input" placeholder="VD: Toyota Vios 2020" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="label">Năm sản xuất</label>
            <input className="input" type="number" placeholder="2020" />
          </div>
          <div>
            <label className="label">Số km</label>
            <input className="input" type="number" placeholder="38000" />
          </div>
        </div>
        <div>
          <label className="label">Ngày & địa điểm ngập</label>
          <input className="input" placeholder="VD: 8/9/2024 — Hà Đông, Hà Nội" />
        </div>
        <div>
          <label className="label">Độ sâu ngập (cm)</label>
          <input className="input" type="number" placeholder="45" />
        </div>
        <div>
          <label className="label">Mô tả tình trạng</label>
          <textarea className="input" rows={4} placeholder="Mô tả ngắn gọn tình trạng xe..." />
        </div>
        <div>
          <label className="label">Giá mong muốn nhận về (VNĐ)</label>
          <input className="input" type="number" placeholder="250000000" />
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>
            xengap.vn sẽ niêm yết ở mức cao hơn để có dư địa thương lượng. Bạn nhận đúng số này.
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-lg" style={{ alignSelf: "flex-start" }}>Gửi đăng tin</button>
      </form>
    </main>
  );
}
