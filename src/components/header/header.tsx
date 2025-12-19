  "use client";

  import { useState, useEffect, useRef } from "react";
  import Link from "next/link";
  import { useSession, signOut } from "next-auth/react";
  import { motion, AnimatePresence } from "framer-motion";

  import {
    ChevronDown,
    SearchIcon,
    ShoppingCartIcon,
    UserIcon,
  } from "lucide-react";

  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";

  import { useCart } from "@/lib/cart-context";
  import { useAuthModal } from "@/lib/auth-context";

  import { getAllCategories } from "@/lib/api/categories";
  import { searchProducts } from "@/lib/api/search";

  type Category = {
    id: string;
    name: string;
    slug: string;
    gender: "MALE" | "FEMALE" | "UNISEX";
    imageUrl?: string | null;
  };

  export function Header() {
    const { data: session } = useSession();
    const { getTotalItems, setIsCartOpen } = useCart();
    const { setIsOpen, setMode } = useAuthModal();

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeGender, setActiveGender] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // SEARCH STATES
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [aiKeywords, setAiKeywords] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const timer = useRef<any>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => setMounted(true), []);

    // Load categories
    useEffect(() => {
      async function loadCategories() {
        const result = await getAllCategories();
        if (result?.success) setCategories(result.data);
      }
      loadCategories();
    }, []);

    // Load history
    useEffect(() => {
      const saved = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      setHistory(saved);
    }, []);

    function saveHistory(keyword: string) {
      let newHistory = [keyword, ...history.filter((h) => h !== keyword)];
      newHistory = newHistory.slice(0, 8);

      setHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }

    // Debounce search
    useEffect(() => {
      if (!query.trim()) {
        setResults([]);
        setAiKeywords([]);
        setLoadingSearch(false);
        return;
      }

      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        setLoadingSearch(true);

        // 🔍 Search products
        const data = await searchProducts(query);
        if (data.success) setResults(data.data);

        // 🤖 AI keyword
        loadAIKeywords(query);

        setLoadingSearch(false);
      }, 300);

      return () => clearTimeout(timer.current);
    }, [query]);

    // Load AI Keywords
    async function loadAIKeywords(q: string) {
      try {
        const res = await fetch("/api/search/keywords", {
          method: "POST",
          body: JSON.stringify({ query: q }),
        });
        const json = await res.json();
        if (json.success) setAiKeywords(json.data);
      } catch {
        setAiKeywords([]);
      }
    }

    // Click outside search
    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
          setShowSearch(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Click outside user menu
    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(e.target as Node) &&
          !userButtonRef.current?.contains(e.target as Node)
        ) {
          setMenuOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const male = categories.filter((c) => c.gender === "MALE");
    const female = categories.filter((c) => c.gender === "FEMALE");
    const unisex = categories.filter((c) => c.gender === "UNISEX");

    const totalItems = mounted ? getTotalItems() : 0;

    // SLUG
    function slugify(text: string) {
      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
    }

    return (
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="custom-container mx-auto px-4 flex items-center justify-between h-16">

          {/* LOGO + MINI MENU */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold">-R</Link>

            <div ref={triggerRef} className="hidden md:flex items-center gap-8 text-sm font-medium">
              {["MALE", "FEMALE", "UNISEX"].map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGender(activeGender === g ? null : g)}
                  className="cursor-pointer hover:opacity-70 flex items-center gap-1"
                >
                  {g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Unisex"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${activeGender === g ? "rotate-180" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH + CART + USER */}
          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveHistory(query);
                      window.location.href = `/search?q=${query}`;
                    }
                  }}
                  placeholder="Tìm kiếm..."
                  className="w-64"
                />
               <SearchIcon
  className="w-5 h-5 cursor-pointer"
  onClick={() => {
    if (!query.trim()) return;
    saveHistory(query);
    window.location.href = `/search?q=${query}`;
  }}
/>

              </div>

              {/* DROPDOWN */}
              {showSearch && (
                <div className="absolute left-0 right-0 bg-white border shadow-lg rounded-md mt-2 z-50 max-h-[450px] overflow-y-auto">

                  {/* loading */}
                  {loadingSearch && (
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent animate-spin rounded-full"></div>
                      <span className="text-sm text-gray-500">Đang tìm kiếm...</span>
                    </div>
                  )}

                  {/* HISTORY */}
{history.length > 0 && (
  <div className="px-3 py-2">
    <p className="text-xs text-gray-500 mb-1">Lịch sử tìm kiếm</p>

    <div className="flex gap-2">
      {history.slice(0, 3).map((h, i) => (
        <button
          key={i}
          onClick={() => {
            setQuery(h);
            saveHistory(h);
            window.location.href = `/search?q=${h}`;
          }}
          className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
        >
          {h}
        </button>
      ))}
    </div>
  </div>
)}



                  {/* AI KEYWORDS */}
                  {aiKeywords.length > 0 && (
                    <div className="px-3 py-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Từ khóa gợi ý</p>

                      <div className="flex flex-wrap gap-2 ">
                        {aiKeywords.map((kw, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setQuery(kw);
                              saveHistory(kw);
                              window.location.href = `/search?q=${kw}`;
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* CATEGORY */}
                  {query.length > 1 && (
                    <div className="px-3 py-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Danh mục liên quan</p>

                      {categories
                        .filter((cat) =>
                          cat.name.toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/${cat.gender.toLowerCase()}/${cat.slug}`}
                            className="block py-1 text-sm hover:bg-gray-100 rounded px-2"
                            onClick={() => saveHistory(cat.name)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                    </div>
                  )}
                  {/* RESULTS */}
                  {results.length > 0 && (
                    <div className="border-t">
                      {results.map((p) => (
                        <Link
                          href={`/product/${p.slug}`}
                          key={p.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100"
                          onClick={() => {
                            saveHistory(p.name);
                            setShowSearch(false);
                            setQuery("");
                          }}
                        >
                          <img
                            src={p.images?.[0]?.url || "/no-image.png"}
                            className="w-10 h-10 rounded object-cover"
                            alt={p.name}
                          />
                          <span className="text-sm">{p.name}</span>
                        </Link>
                      ))}

                      <button
                        onClick={() => (window.location.href = `/search?q=${query}`)}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 border-t cursor-pointer" 
                      >
                        Xem tất cả kết quả →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CART */}
            <button onClick={() => setIsCartOpen(true)} className="relative cursor-pointer">
              <ShoppingCartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* USER */}
            {!session ? (
              <Button onClick={() => { setMode("login"); setIsOpen(true); }}>
                Đăng nhập
              </Button>
            ) : (
              <div className="relative">
                <Button
                  ref={userButtonRef}
                  size="icon"
                  variant="ghost"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="rounded-full border cursor-pointer"
                >
                  <UserIcon className="w-5 h-5" />
                </Button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      ref={userMenuRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-3 z-50"
                    >
                      <p className="font-medium text-sm">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{session.user?.email}</p>

                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="block py-2 hover:bg-gray-100 rounded-md px-2"
                        >
                          Trang quản trị
                        </Link>
                      )}
                        <Link
                          href="/profile"
                          className="block py-2 hover:bg-gray-100 rounded-md px-2"
                        >
                          Hồ sơ
                        </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-red-600 w-full py-2 hover:bg-red-50 rounded-md text-left px-2"
                      >
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* MINI MENU */}
        {activeGender && (
          <div
            ref={dropdownRef}
            className="hidden md:block bg-white border-t shadow-lg absolute left-0 right-0"
          >
            <div className="custom-container mx-auto px-4 py-6">
              <div className="grid grid-cols-4 gap-8">
                {(activeGender === "MALE" ? male : activeGender === "FEMALE" ? female : unisex).map(
                  (cat) => (
                    <Link
                      key={cat.id}
                      href={`/${activeGender.toLowerCase()}/${slugify(cat.name)}`}
                      onClick={() => setActiveGender(null)}
                      className="flex items-center gap-4 hover:scale-105 transition-transform"
                    >
                      <div className="w-14 h-14 rounded-md overflow-hidden">
                        <img
                          src={cat.imageUrl || "/no-image.png"}
                          alt={cat.name}
                          loading="lazy"
                          className="w-full h-full object-fill"
                        />
                      </div>
                      <span className="font-medium text-black">{cat.name}</span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }
