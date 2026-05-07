"use client";
import Link from "next/link";
import { useListings } from "@/hooks/api/listings";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CarCard } from "@/components/CarCard";

export default function HomePage() {
  const { data, isLoading } = useListings({ limit: 8 });
  const items = data?.items ?? [];
  const featured = items.slice(0, 4);
  const recent = items;

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section style={{ background: "linear-gradient(180deg, var(--green-50), white)", padding: "72px 0 56px", borderBottom: "1px solid var(--border)" }}>
          <div className="container" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 12px", background: "white", border: "1px solid var(--green-200)", borderRadius: 999, fontSize: 12, color: "var(--green-700)", fontWeight: 600, marginBottom: 20 }}>
                ✓ Sàn xe ngập nước minh bạch #1 Việt Nam
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.05 }}>
                Mua xe ngập nước<br/><span style={{ color: "var(--green-700)" }}>minh bạch & an toàn</span>
              </h1>
              <p style={{ fontSize: 17, color: "var(--ink-600)", marginTop: 20, maxWidth: 520, lineHeight: 1.5 }}>
                Mỗi xe đều có báo cáo VIN chi tiết, kiểm định bởi kỹ sư xengap.vn, và bảo lãnh thanh toán qua tài khoản escrow.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <Link href="/browse" className="btn btn-primary btn-lg">Tìm xe ngay →</Link>
                <Link href="/sell" className="btn btn-secondary btn-lg">Đăng bán xe</Link>
              </div>
              <div style={{ display: "flex", gap: 32, marginTop: 40, fontSize: 13 }}>
                <div><div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--green-700)" }}>1,247</div><div style={{ color: "var(--ink-500)" }}>Xe đã giao dịch</div></div>
                <div><div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--green-700)" }}>98.2%</div><div style={{ color: "var(--ink-500)" }}>Khách hài lòng</div></div>
                <div><div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--green-700)" }}>24h</div><div style={{ color: "var(--ink-500)" }}>Phản hồi offer</div></div>
              </div>
            </div>
            <div className="card" style={{ padding: 24, background: "white" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tìm xe nhanh</div>
              <div style={{ display: "grid", gap: 12 }}>
                <input className="input" placeholder="Hãng, mẫu xe..."/>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <select className="input"><option>Tất cả mức ngập</option><option>Nhẹ (&lt;30cm)</option><option>Vừa (30-60cm)</option><option>Nặng (&gt;60cm)</option></select>
                  <select className="input"><option>Mọi giá</option><option>Dưới 300tr</option><option>300-500tr</option><option>Trên 500tr</option></select>
                </div>
                <Link href="/browse" className="btn btn-primary" style={{ justifyContent: "center" }}>Xem xe ngay</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="container" style={{ padding: "56px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Xe nổi bật</h2>
            <Link href="/browse" style={{ fontSize: 14, color: "var(--green-700)", fontWeight: 600 }}>Xem tất cả →</Link>
          </div>
          {isLoading ? (
            <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {featured.map(c => <CarCard key={c.id} car={c}/>)}
            </div>
          )}
        </section>

        {/* Trust */}
        <section style={{ background: "var(--bg-soft)", padding: "56px 0" }}>
          <div className="container">
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", textAlign: "center" }}>3 cam kết của xengap.vn</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 32 }}>
              {[
                { icon: "🛡", t: "Kiểm định độc lập", d: "Đội kỹ sư xengap.vn kiểm tra 80+ điểm trên mỗi xe trước khi đăng bán." },
                { icon: "🔒", t: "Tài khoản bảo lãnh", d: "Tiền cọc và thanh toán giữ tại escrow của xengap.vn cho đến khi giao xe thành công." },
                { icon: "📋", t: "Lịch sử VIN minh bạch", d: "Báo cáo đầy đủ ngày ngập, độ sâu, sửa chữa, đăng kiểm — không giấu diếm." },
              ].map(c => (
                <div key={c.t} className="card" style={{ padding: 24, background: "white" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{c.t}</div>
                  <div style={{ fontSize: 14, color: "var(--ink-600)", lineHeight: 1.5 }}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent */}
        <section className="container" style={{ padding: "56px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Mới đăng</h2>
            <Link href="/browse" style={{ fontSize: 14, color: "var(--green-700)", fontWeight: 600 }}>Xem tất cả →</Link>
          </div>
          {isLoading ? (
            <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {recent.map(c => <CarCard key={c.id} car={c}/>)}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
