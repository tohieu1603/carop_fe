import "./globals.css";
import type { Metadata } from "next";
import { OfferModal } from "@/components/OfferModal";
import { DemoControls } from "@/components/DemoControls";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "xengap.vn — Sàn giao dịch xe ngập nước minh bạch",
  description: "Mua bán xe ngập nước có kiểm định và bảo lãnh giao dịch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
          <OfferModal />
          <DemoControls />
        </Providers>
      </body>
    </html>
  );
}
