import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Moon, Sun, Cpu, TrendingDown, Package, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoEtrift — ქართული ტექნიკის აგრეგატორი" },
      {
        name: "description",
        content:
          "GeoEtrift აერთიანებს ელექტრონიკისა და ტექნიკის განცხადებებს Mymarket-სა და Facebook Marketplace-დან.",
      },
      { property: "og:title", content: "GeoEtrift — ქართული ტექნიკის აგრეგატორი" },
      {
        property: "og:description",
        content:
          "მოძებნე iPhone, PlayStation და სხვა ტექნიკა საუკეთესო ფასად საქართველოში.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

type Source = "Mymarket" | "Facebook Marketplace";

interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  source: Source;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "iPhone 13 Pro Max - 256GB",
    price: "1850 ₾",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600",
    source: "Mymarket",
  },
  {
    id: 2,
    title: "PlayStation 5 Disc Edition",
    price: "1450 ₾",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600",
    source: "Facebook Marketplace",
  },
  {
    id: 3,
    title: "MacBook Air M2 13'' 512GB",
    price: "3200 ₾",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
    source: "Mymarket",
  },
  {
    id: 4,
    title: "Samsung Galaxy S24 Ultra",
    price: "2750 ₾",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
    source: "Facebook Marketplace",
  },
  {
    id: 5,
    title: "Sony WH-1000XM5 ყურსასმენი",
    price: "780 ₾",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
    source: "Mymarket",
  },
  {
    id: 6,
    title: "iPad Pro 11'' M4 - 256GB",
    price: "2400 ₾",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
    source: "Facebook Marketplace",
  },
  {
    id: 7,
    title: "Xbox Series X 1TB",
    price: "1380 ₾",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600",
    source: "Mymarket",
  },
  {
    id: 8,
    title: "Apple Watch Series 9 45mm",
    price: "950 ₾",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
    source: "Facebook Marketplace",
  },
  {
    id: 9,
    title: "DJI Mini 4 Pro დრონი",
    price: "2100 ₾",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600",
    source: "Mymarket",
  },
];

function parsePrice(p: string): number {
  return parseInt(p.replace(/\D/g, ""), 10) || 0;
}

function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | Source>("all");
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    // Try backend; fall back to mock data
    const controller = new AbortController();
    fetch("http://localhost:5000/api/search", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (platform !== "all") list = list.filter((p) => p.source === platform);
    const min = parseInt(minPrice, 10);
    const max = parseInt(maxPrice, 10);
    if (!isNaN(min)) list = list.filter((p) => parsePrice(p.price) >= min);
    if (!isNaN(max)) list = list.filter((p) => parsePrice(p.price) <= max);
    if (sort === "asc") list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === "desc") list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    return list;
  }, [products, query, platform, sort, minPrice, maxPrice]);

  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, avg: 0, min: 0 };
    const prices = filtered.map((p) => parsePrice(p.price));
    return {
      total: filtered.length,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
    };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">GeoEtrift</h1>
              <p className="text-[11px] text-muted-foreground">ქართული ტექნიკის აგრეგატორი</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark((d) => !d)}
            aria-label="თემის შეცვლა"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            იპოვე საუკეთესო ფასი ერთ ადგილას
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            შეადარე ელექტრონიკისა და ტექნიკის განცხადებები Mymarket-სა და Facebook
            Marketplace-დან რეალურ დროში.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Package className="h-4 w-4" />}
            label="ნაპოვნი განცხადებები"
            value={stats.total.toString()}
          />
          <StatCard
            icon={<BarChart3 className="h-4 w-4" />}
            label="საშუალო ფასი"
            value={`${stats.avg} ₾`}
          />
          <StatCard
            icon={<TrendingDown className="h-4 w-4" />}
            label="ყველაზე იაფი"
            value={`${stats.min} ₾`}
          />
        </section>

        {/* Filters */}
        <section className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ძებნა... მაგ. iPhone, PlayStation, MacBook"
              className="h-12 pl-10 text-base"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
              <SelectTrigger>
                <SelectValue placeholder="პლატფორმა" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა პლატფორმა</SelectItem>
                <SelectItem value="Mymarket">Mymarket</SelectItem>
                <SelectItem value="Facebook Marketplace">Facebook Marketplace</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger>
                <SelectValue placeholder="დალაგება ფასით" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">დალაგების გარეშე</SelectItem>
                <SelectItem value="asc">ფასი: დაბლიდან მაღლა</SelectItem>
                <SelectItem value="desc">ფასი: მაღლიდან დაბლა</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="მინ. ფასი ₾"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="მაქს. ფასი ₾"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </section>

        {/* Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground">იტვირთება...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">განცხადებები ვერ მოიძებნა</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} GeoEtrift — შექმნილია საქართველოში
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCard({ product }: { product: Product }) {
  const isMM = product.source === "Mymarket";
  return (
    <Card className="group overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge
          className={
            "absolute left-3 top-3 border-0 " +
            (isMM
              ? "bg-mymarket text-mymarket-foreground hover:bg-mymarket"
              : "bg-facebook text-facebook-foreground hover:bg-facebook")
          }
        >
          {isMM ? "Mymarket" : "Facebook"}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug">
          {product.title}
        </h3>
        <p className="mt-3 text-xl font-bold text-primary">{product.price}</p>
      </div>
    </Card>
  );
}
