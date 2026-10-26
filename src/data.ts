export type Category = "Gaming" | "Ultrabook" | "Workstation" | "Everyday";

export interface Laptop {
  id: string;
  brand: string;
  model: string;
  category: Category;
  processor: string;
  ram: string;
  storage: string;
  gpu: string;
  display: string;
  price: number;
  stock: number;
  sku: string;
  added: string;
}

export const CATEGORIES: Category[] = ["Gaming", "Ultrabook", "Workstation", "Everyday"];

export const BRANDS = [
  "Dell",
  "HP",
  "Lenovo",
  "ASUS",
  "Apple",
  "Acer",
  "MSI",
  "Samsung",
  "Razer",
  "Honor",
];

export const RAM_OPTIONS = [
  "8 GB DDR4",
  "8 GB DDR5",
  "16 GB DDR4",
  "16 GB DDR5",
  "16 GB LPDDR5",
  "32 GB DDR5",
  "32 GB LPDDR5X",
  "64 GB DDR5",
];

export const STORAGE_OPTIONS = [
  "256 GB NVMe SSD",
  "512 GB NVMe SSD",
  "1 TB NVMe SSD",
  "2 TB NVMe SSD",
  "4 TB NVMe SSD",
];

export const CATEGORY_META: Record<Category, { chip: string; dot: string; image: string }> = {
  Gaming: { chip: "bg-chiprose text-[#8c2118]", dot: "bg-signal", image: "images/row-gaming.jpg" },
  Ultrabook: {
    chip: "bg-chipviolet text-[#3b2f83]",
    dot: "bg-[#5b4bc4]",
    image: "images/row-ultrabook.jpg",
  },
  Workstation: {
    chip: "bg-chipamber text-[#7a5410]",
    dot: "bg-[#c98a12]",
    image: "images/row-workstation.jpg",
  },
  Everyday: { chip: "bg-chipmint text-[#1f6241]", dot: "bg-[#2f8a5b]", image: "images/row-ultrabook.jpg" },
};

export const imageFor = (category: string) =>
  (CATEGORY_META[category as Category] ?? CATEGORY_META.Everyday).image;

export const inr = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

export const specLine = (l: Laptop) =>
  `${l.processor} | ${l.ram} | ${l.storage} | ${l.gpu}`;

export const ramGb = (ram: string) => parseInt(ram, 10) || 0;

export const SEED_LAPTOPS: Laptop[] = [
  {
    id: "l1",
    brand: "Dell",
    model: "XPS 15 9530",
    category: "Ultrabook",
    processor: "Intel Core i7-13700H",
    ram: "32 GB DDR5",
    storage: "1 TB NVMe SSD",
    gpu: "NVIDIA RTX 4060 8GB",
    display: '15.6" OLED 3.5K Touch',
    price: 174990,
    stock: 4,
    sku: "LXPS-9530-32",
    added: "2026-01-08",
  },
  {
    id: "l2",
    brand: "ASUS",
    model: "ROG Strix G16",
    category: "Gaming",
    processor: "Intel Core i9-13980HX",
    ram: "16 GB DDR5",
    storage: "1 TB NVMe SSD",
    gpu: "NVIDIA RTX 4070 8GB",
    display: '16" QHD 240Hz',
    price: 154990,
    stock: 7,
    sku: "LROG-G16-16",
    added: "2026-01-11",
  },
  {
    id: "l3",
    brand: "Apple",
    model: "MacBook Air M2",
    category: "Ultrabook",
    processor: "Apple M2 Chip",
    ram: "8 GB LPDDR5",
    storage: "256 GB NVMe SSD",
    gpu: "10-Core Integrated",
    display: '13.6" Liquid Retina',
    price: 99900,
    stock: 12,
    sku: "LMBA-M2-8",
    added: "2025-12-19",
  },
  {
    id: "l4",
    brand: "Lenovo",
    model: "ThinkPad P1 Gen 6",
    category: "Workstation",
    processor: "Intel Core i7-13800H",
    ram: "32 GB DDR5",
    storage: "1 TB NVMe SSD",
    gpu: "NVIDIA RTX 4060 8GB",
    display: '16" 4K IPS 500 nits',
    price: 189990,
    stock: 3,
    sku: "LTP-P1G6-32",
    added: "2026-01-04",
  },
  {
    id: "l5",
    brand: "HP",
    model: "Victus 15",
    category: "Gaming",
    processor: "Intel Core i5-12450H",
    ram: "8 GB DDR4",
    storage: "512 GB NVMe SSD",
    gpu: "NVIDIA RTX 3050 4GB",
    display: '15.6" FHD 144Hz',
    price: 56990,
    stock: 15,
    sku: "LVIC-15-8",
    added: "2025-12-02",
  },
  {
    id: "l6",
    brand: "Acer",
    model: "Swift Go 14",
    category: "Ultrabook",
    processor: "Intel Core Ultra 5 125H",
    ram: "16 GB LPDDR5",
    storage: "512 GB NVMe SSD",
    gpu: "Intel Arc Integrated",
    display: '14" OLED 2.8K 90Hz',
    price: 72990,
    stock: 9,
    sku: "LSWG-14-16",
    added: "2026-01-15",
  },
  {
    id: "l7",
    brand: "MSI",
    model: "Katana 17 B13V",
    category: "Gaming",
    processor: "Intel Core i7-13620H",
    ram: "16 GB DDR5",
    storage: "1 TB NVMe SSD",
    gpu: "NVIDIA RTX 4060 8GB",
    display: '17.3" FHD 144Hz',
    price: 104990,
    stock: 6,
    sku: "LKAT-17-16",
    added: "2025-12-28",
  },
  {
    id: "l8",
    brand: "Lenovo",
    model: "IdeaPad Slim 3",
    category: "Everyday",
    processor: "AMD Ryzen 5 7530U",
    ram: "16 GB DDR4",
    storage: "512 GB NVMe SSD",
    gpu: "AMD Radeon Graphics",
    display: '15.6" FHD IPS',
    price: 42490,
    stock: 21,
    sku: "LIPS-3-16",
    added: "2025-11-21",
  },
  {
    id: "l9",
    brand: "Apple",
    model: 'MacBook Pro 14" M3 Pro',
    category: "Workstation",
    processor: "Apple M3 Pro 11-Core",
    ram: "18 GB LPDDR5",
    storage: "512 GB NVMe SSD",
    gpu: "14-Core Integrated",
    display: '14.2" Liquid Retina XDR',
    price: 249900,
    stock: 2,
    sku: "LMBP-M3P-18",
    added: "2026-01-18",
  },
];
