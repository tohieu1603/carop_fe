import type { Car, Buyer, Offer, BlogPost } from "./types";

export const SEVERITY_LABELS = {
  low: { label: "Ngập nhẹ", color: "green", desc: "< 40cm — chủ yếu nội thất" },
  medium: { label: "Ngập trung bình", color: "amber", desc: "40-70cm — ảnh hưởng điện" },
  high: { label: "Ngập nặng", color: "red", desc: "> 70cm — ảnh hưởng động cơ" },
} as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_review: { label: "Chờ duyệt", color: "amber" },
  active: { label: "Đang bán", color: "neutral" },
  has_buyers: { label: "Có người mua", color: "green" },
  closing: { label: "Đang chốt deal", color: "blue" },
  closed: { label: "Đã chốt", color: "green" },
  rejected: { label: "Đã từ chối", color: "red" },
};

export const MOCK_CARS: Car[] = [
  {
    id: "XN-2024-0142", title: "Toyota Vios 1.5G AT 2020",
    brand: "Toyota", model: "Vios", year: 2020,
    price: 285000000, originalPrice: 520000000, newPrice: 580000000,
    location: "Hà Nội", floodDate: "2024-09-08", floodDepth: 45,
    floodLocation: "Hà Đông, Hà Nội", severity: "medium",
    mileage: 38000, transmission: "AT", fuel: "Xăng",
    vin: "JTDBT4K30L0123456", images: [],
    seller: { name: "Anh Tuấn", type: "individual", verified: true, rating: 4.7, deals: 2 },
    damage: { engine: "OK", interior: "Sàn ngập", electrical: "ECU thay", rust: "Chưa" },
    repairs: ["ECU", "Lọc gió", "Thảm sàn"], inspectionScore: 82,
    warranty: "6 tháng", listed: "2 ngày trước", views: 342,
    description: "Xe ngập 45cm tại Hà Đông, đã thay ECU và vệ sinh nội thất.",
  },
  {
    id: "XN-2024-0138", title: "Mazda CX-5 2.0 Premium 2019",
    brand: "Mazda", model: "CX-5", year: 2019,
    price: 425000000, originalPrice: 850000000, newPrice: 920000000,
    location: "Yên Bái", floodDate: "2024-09-09", floodDepth: 80,
    floodLocation: "Yên Bái", severity: "high",
    mileage: 52000, transmission: "AT", fuel: "Xăng",
    vin: "JM3KFBCM5K0234567", images: [],
    seller: { name: "Chị Hương", type: "individual", verified: true, rating: 4.9, deals: 1 },
    damage: { engine: "Cần đại tu", interior: "Hư hỏng nặng", electrical: "Toàn xe", rust: "Bắt đầu" },
    repairs: ["Đại tu động cơ", "Thay nội thất", "Hệ thống điện"], inspectionScore: 58,
    warranty: "3 tháng", listed: "5 ngày trước", views: 891,
    description: "Ngập nặng 80cm tại Yên Bái, cần sửa chữa lớn.",
  },
  {
    id: "XN-2024-0151", title: "Honda City RS 2022",
    brand: "Honda", model: "City", year: 2022,
    price: 358000000, originalPrice: 599000000, newPrice: 624000000,
    location: "TP.HCM", floodDate: "2024-09-10", floodDepth: 30,
    floodLocation: "Quận 7, TP.HCM", severity: "low",
    mileage: 18500, transmission: "CVT", fuel: "Xăng",
    vin: "MRHGM6650NP345678", images: [],
    seller: { name: "Nguyễn Văn Hải", type: "individual", verified: true, rating: 4.9, deals: 3 },
    damage: { engine: "OK", interior: "Thảm ướt", electrical: "OK", rust: "Chưa" },
    repairs: ["Thảm sàn", "Lọc gió"], inspectionScore: 91,
    warranty: "12 tháng", listed: "1 ngày trước", views: 198,
    description: "Ngập nhẹ 30cm, xe gần như nguyên bản.",
  },
  {
    id: "XN-2024-0129", title: "Hyundai Accent 1.4 AT 2021",
    brand: "Hyundai", model: "Accent", year: 2021,
    price: 245000000, originalPrice: 475000000, newPrice: 510000000,
    location: "Thái Nguyên", floodDate: "2024-09-08", floodDepth: 60,
    floodLocation: "Thái Nguyên", severity: "medium",
    mileage: 41000, transmission: "AT", fuel: "Xăng",
    vin: "MALB851CBMM456789", images: [],
    seller: { name: "Anh Minh", type: "individual", verified: true, rating: 4.6, deals: 1 },
    damage: { engine: "OK", interior: "Sàn ngập", electrical: "ECU thay", rust: "Chưa" },
    repairs: ["ECU", "Bình điện", "Sàn"], inspectionScore: 76,
    warranty: "6 tháng", listed: "1 tuần trước", views: 612,
    description: "Ngập 60cm tại Thái Nguyên, đã thay ECU và bình.",
  },
  {
    id: "XN-2024-0156", title: "Kia Seltos Premium 2023",
    brand: "Kia", model: "Seltos", year: 2023,
    price: 485000000, originalPrice: 779000000, newPrice: 799000000,
    location: "Hải Phòng", floodDate: "2024-09-10", floodDepth: 35,
    floodLocation: "Hải Phòng", severity: "low",
    mileage: 12800, transmission: "AT", fuel: "Xăng",
    vin: "KNAJ86A19P7567890", images: [],
    seller: { name: "Chị Linh", type: "individual", verified: true, rating: 5.0, deals: 1 },
    damage: { engine: "OK", interior: "Thảm ướt", electrical: "OK", rust: "Chưa" },
    repairs: ["Thảm", "Âm thanh"], inspectionScore: 89,
    warranty: "12 tháng", listed: "12 giờ trước", views: 423,
    description: "Ngập 35cm Hải Phòng, xe gần như nguyên bản.",
  },
  {
    id: "XN-2024-0118", title: "Ford Ranger XLS 2.2 2020",
    brand: "Ford", model: "Ranger", year: 2020,
    price: 395000000, originalPrice: 720000000, newPrice: 750000000,
    location: "Lào Cai", floodDate: "2024-09-09", floodDepth: 95,
    floodLocation: "Lào Cai", severity: "high",
    mileage: 78000, transmission: "AT", fuel: "Dầu",
    vin: "MNCLSFE40LW678901", images: [],
    seller: { name: "Anh Quân", type: "individual", verified: true, rating: 4.8, deals: 4 },
    damage: { engine: "Cần đại tu", interior: "Hư hỏng", electrical: "Toàn xe", rust: "Bắt đầu" },
    repairs: ["Đại tu", "Hộp số", "Điện", "Turbo"], inspectionScore: 52,
    warranty: "3 tháng", listed: "3 ngày trước", views: 1240,
    description: "Ngập sâu 95cm, cần đại tu lớn.",
  },
  {
    id: "XN-2024-0162", title: "VinFast Lux A2.0 2021",
    brand: "VinFast", model: "Lux A", year: 2021,
    price: 425000000, originalPrice: 920000000, newPrice: 950000000,
    location: "Quảng Ninh", floodDate: "2024-09-09", floodDepth: 55,
    floodLocation: "Quảng Ninh", severity: "medium",
    mileage: 45000, transmission: "AT", fuel: "Xăng",
    vin: "VF6LUX2A1MM789012", images: [],
    seller: { name: "Trần Quốc Bảo", type: "individual", verified: true, rating: 4.6, deals: 1 },
    damage: { engine: "OK", interior: "Da ướt", electrical: "ECU thay", rust: "Chưa" },
    repairs: ["ECU", "Nội thất da"], inspectionScore: 74,
    warranty: "6 tháng", listed: "4 ngày trước", views: 567,
    description: "Lux A ngập 55cm Quảng Ninh.",
  },
  {
    id: "XN-2024-0171", title: "Mitsubishi Xpander 1.5 AT 2022",
    brand: "Mitsubishi", model: "Xpander", year: 2022,
    price: 348000000, originalPrice: 598000000, newPrice: 620000000,
    location: "Bắc Ninh", floodDate: "2024-09-10", floodDepth: 40,
    floodLocation: "Bắc Ninh", severity: "medium",
    mileage: 28000, transmission: "AT", fuel: "Xăng",
    vin: "MMBXNA1AANM890123", images: [],
    seller: { name: "Chị Ngọc", type: "individual", verified: true, rating: 4.7, deals: 2 },
    damage: { engine: "OK", interior: "Sàn ngập", electrical: "OK", rust: "Chưa" },
    repairs: ["Lọc gió", "Bình", "Thảm", "Âm thanh"], inspectionScore: 81,
    warranty: "6 tháng", listed: "6 ngày trước", views: 489,
    description: "Xpander ngập 40cm, xe gia đình tốt.",
  },
];

export const MOCK_BUYERS: Buyer[] = [
  { id: "B-021", name: "Nguyễn Văn An", phone: "0901 234 ***", joined: "2024-08-12", deals: 0 },
  { id: "B-024", name: "Trần Thị Bình", phone: "0912 345 ***", joined: "2024-09-01", deals: 1 },
  { id: "B-031", name: "Lê Hoàng Cường", phone: "0987 654 ***", joined: "2024-09-08", deals: 0 },
  { id: "B-035", name: "Phạm Quốc Đạt", phone: "0938 222 ***", joined: "2024-09-15", deals: 2 },
  { id: "B-042", name: "Hoàng Thị Em", phone: "0966 111 ***", joined: "2024-09-20", deals: 0 },
  { id: "B-048", name: "Vũ Minh Phúc", phone: "0911 999 ***", joined: "2024-09-25", deals: 1 },
];

export const MOCK_OFFERS: Record<string, Offer[]> = {
  "XN-2024-0142": [
    { id: "OF-2401", buyerId: "B-021", amount: 270000000, message: "Em có thiện chí, xe em đã xem báo cáo.", date: "2024-09-22", status: "pending" },
    { id: "OF-2402", buyerId: "B-024", amount: 282000000, message: "Tôi mua trong tuần này nếu giá ổn.", date: "2024-09-23", status: "pending" },
    { id: "OF-2403", buyerId: "B-031", amount: 275000000, message: "Có thể đến xem xe vào thứ 7?", date: "2024-09-23", status: "pending" },
  ],
  "XN-2024-0138": [
    { id: "OF-2410", buyerId: "B-035", amount: 405000000, message: "", date: "2024-09-20", status: "pending" },
    { id: "OF-2411", buyerId: "B-042", amount: 420000000, message: "Mua được luôn nếu xe đúng.", date: "2024-09-22", status: "pending" },
  ],
  "XN-2024-0151": [{ id: "OF-2420", buyerId: "B-048", amount: 350000000, message: "", date: "2024-09-24", status: "pending" }],
  "XN-2024-0129": [
    { id: "OF-2430", buyerId: "B-021", amount: 235000000, message: "", date: "2024-09-19", status: "pending" },
    { id: "OF-2431", buyerId: "B-024", amount: 240000000, message: "", date: "2024-09-21", status: "pending" },
  ],
  "XN-2024-0156": [
    { id: "OF-2440", buyerId: "B-031", amount: 470000000, message: "Cần gấp, chốt 48h.", date: "2024-09-25", status: "pending" },
    { id: "OF-2441", buyerId: "B-035", amount: 478000000, message: "", date: "2024-09-25", status: "pending" },
    { id: "OF-2442", buyerId: "B-048", amount: 480000000, message: "", date: "2024-09-26", status: "pending" },
  ],
  "XN-2024-0118": [
    { id: "OF-2450", buyerId: "B-021", amount: 380000000, message: "", date: "2024-09-22", status: "pending" },
    { id: "OF-2451", buyerId: "B-031", amount: 390000000, message: "", date: "2024-09-23", status: "pending" },
  ],
  "XN-2024-0162": [{ id: "OF-2460", buyerId: "B-035", amount: 415000000, message: "", date: "2024-09-21", status: "pending" }],
  "XN-2024-0171": [
    { id: "OF-2470", buyerId: "B-024", amount: 340000000, message: "", date: "2024-09-23", status: "pending" },
    { id: "OF-2471", buyerId: "B-048", amount: 345000000, message: "", date: "2024-09-24", status: "pending" },
  ],
};

export const SELLER_MIN_PRICES: Record<string, number> = {
  "XN-2024-0142": 250000000, "XN-2024-0138": 380000000, "XN-2024-0151": 320000000,
  "XN-2024-0129": 215000000, "XN-2024-0156": 440000000, "XN-2024-0118": 358000000,
  "XN-2024-0162": 380000000, "XN-2024-0171": 312000000,
};

export const LISTING_STATUS: Record<string, string> = {
  "XN-2024-0142": "has_buyers", "XN-2024-0138": "has_buyers", "XN-2024-0151": "has_buyers",
  "XN-2024-0129": "has_buyers", "XN-2024-0156": "closing", "XN-2024-0118": "has_buyers",
  "XN-2024-0162": "has_buyers", "XN-2024-0171": "has_buyers",
};

export const MOCK_POSTS: BlogPost[] = [
  { slug: "kiem-tra-xe-ngap-7-buoc", title: "7 bước kiểm tra xe ngập nước trước khi mua",
    excerpt: "Quy trình 7 bước của 38 kỹ sư xengap.vn đang dùng để xác minh hơn 12,000 xe.",
    content: "Khi mua xe ngập nước, quy trình kiểm tra 7 bước sau là tối thiểu...",
    category: "Hướng dẫn mua", author: "KS. Trần Minh Đức", date: "15/09/2024", readTime: 9, featured: true },
  { slug: "thi-truong-xe-ngap-2024", title: "Thị trường xe ngập 2024: 1,200 giao dịch, giá giảm 38-65%",
    excerpt: "Phân tích dữ liệu giao dịch xengap.vn 9 tháng đầu năm.",
    content: "Năm 2024 đánh dấu nhiều biến động cho thị trường xe ngập...",
    category: "Phân tích thị trường", author: "Nguyễn Thuỳ Linh", date: "12/09/2024", readTime: 12, featured: true },
  { slug: "xe-ngap-nuoc-man-vs-ngot", title: "Xe ngập nước mặn vs nước ngọt: chênh lệch giá và rủi ro",
    excerpt: "Nước biển ăn mòn kim loại nhanh gấp 5 lần nước ngọt.",
    content: "Phân loại nước ngập là yếu tố quyết định mức giảm giá...",
    category: "Kiến thức kỹ thuật", author: "KS. Phạm Hữu Long", date: "08/09/2024", readTime: 7 },
  { slug: "thu-tuc-sang-ten-xe-ngap", title: "Thủ tục sang tên xe ngập nước",
    excerpt: "Hồ sơ, lệ phí, thời gian xử lý — và lưu ý đặc biệt.",
    content: "Sang tên xe ngập có một số điểm khác biệt cần chú ý...",
    category: "Pháp lý", author: "LS. Đặng Quốc Toàn", date: "05/09/2024", readTime: 6 },
  { slug: "bao-hiem-cho-xe-ngap", title: "Mua bảo hiểm cho xe đã từng ngập",
    excerpt: "Khảo sát 6 hãng bảo hiểm lớn — hãng nào nhận và mức phí.",
    content: "Sau khi xe đã ghi nhận lịch sử ngập, việc mua bảo hiểm phức tạp hơn...",
    category: "Bảo hiểm", author: "Vũ Khánh Huyền", date: "02/09/2024", readTime: 8 },
  { slug: "cau-chuyen-toyota-vios-ngap", title: "Câu chuyện chiếc Toyota Vios ngập 45cm",
    excerpt: "Từ bãi xe đến đường phố — hành trình 6 tháng.",
    content: "Tháng 9/2024, anh Tuấn ở Hà Đông phải bán chiếc Vios sau cơn bão...",
    category: "Câu chuyện thật", author: "Lê Quang Vũ", date: "28/08/2024", readTime: 10 },
];

export const BLOG_CATEGORIES = ["Tất cả", "Hướng dẫn mua", "Phân tích thị trường", "Kiến thức kỹ thuật", "Pháp lý", "Bảo hiểm", "Câu chuyện thật"];

export function getCarById(id: string) { return MOCK_CARS.find((c) => c.id === id); }
export function getOffersForCar(id: string) { return MOCK_OFFERS[id] || []; }
export function getBuyerById(id: string) { return MOCK_BUYERS.find((b) => b.id === id); }
export function getPostBySlug(slug: string) { return MOCK_POSTS.find((p) => p.slug === slug); }
