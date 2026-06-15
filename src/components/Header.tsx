import { Search, ShoppingCart, User, Gamepad2, ChevronDown, LogOut, Wallet, Shield, Phone, Mail, CreditCard, History as HistoryIcon, FileText, HelpCircle, Home, Package, Landmark, Smartphone, Menu, X, Sparkles, TrendingUp, Gift, Star, Layers, Clock, Award, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";
import AnimatedLogo from "./AnimatedLogo";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCTV, setIsCTV] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const topupRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("shop_settings").select("key,value").eq("key", "shop_logo_url").maybeSingle().then(({ data }) => {
      if (data?.value) setLogoUrl(data.value);
    });
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setIsCTV(false); setBalance(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      setIsAdmin(!!(data && data.length > 0));
    });
    supabase.from("ctv_assignments").select("id").eq("is_active", true).then(({ data }) => {
      setIsCTV(!!(data && data.length > 0));
    });
    supabase.from("profiles").select("balance").eq("user_id", user.id).single().then(({ data }) => {
      setBalance(data?.balance ?? 0);
    });
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) setProductsOpen(false);
      if (topupRef.current && !topupRef.current.contains(e.target as Node)) setTopupOpen(false);
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setHistoryOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const isProductsActive = ["/mua-tai-khoan", "/random", "/game", "/products"].some(p => currentPath.startsWith(p));
  const isHistoryActive = ["/lich-su-nap", "/lich-su-mua", "/bien-dong-so-du", "/lich-su", "/lich-su-cay-thue"].some(p => currentPath.startsWith(p));
  const isTopupActive = ["/nap-tien", "/nap-the", "/nap-ngan-hang", "/nap"].some(p => currentPath.startsWith(p));

  const navItems = [
    { name: "Trang Chủ", path: "/", icon: Home },
    { name: "Mua Tài Khoản", path: "/mua-tai-khoan", icon: ShoppingCart, dropdown: true },
    { name: "Nạp Tiền", path: "/nap-tien", icon: Wallet, dropdown: true },
    { name: "Lịch Sử", path: "/lich-su", icon: HistoryIcon, dropdown: true },
    { name: "Bảng Xếp Hạng", path: "/bang-xep-hang", icon: TrendingUp },
    { name: "Tiếp Thị Liên Kết", path: "/affiliate", icon: Users },
    { name: "Mã Giảm Giá", path: "/ma-giam-gia", icon: Gift },
  ];

  return (
    <>
      {/* Top Bar - UY TÍN + SỐ 1 - Style như RANDOMALL.NET */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-2.5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-bold">
                <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                SHOP ACC UY TÍN NHẤT
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                SHOPKIETZ.STORE
              </span>
              <span className="hidden md:flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-300" />
                AUTO ALL 24/7
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline opacity-80">🌐 Ngôn ngữ:</span>
                <select className="bg-white/20 rounded-full px-3 py-1 text-white text-xs border border-white/30 focus:outline-none">
                  <option className="text-black">Tiếng Việt</option>
                  <option className="text-black">English</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline opacity-80">💰 Tiền tệ:</span>
                <select className="bg-white/20 rounded-full px-3 py-1 text-white text-xs border border-white/30 focus:outline-none">
                  <option className="text-black">VND</option>
                  <option className="text-black">USD</option>
                </select>
              </div>
              <a href="/lien-he" className="hidden md:flex items-center gap-1 text-white/80 hover:text-white transition-colors">
                <Phone className="w-3 h-3" /> Hỗ trợ 24/7
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section */}
            <a href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative">
                {logoUrl ? (
                  <img src={logoUrl} alt="ShopKietZ" className="w-12 h-12 rounded-xl object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-black text-2xl tracking-tight gradient-primary bg-clip-text text-transparent">
                  SHOPKIETZ.STORE
                </div>
                <div className="text-[10px] text-muted-foreground">SHOP ACC ROBLOX UY TÍN HÀNG ĐẦU</div>
              </div>
            </a>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-xl">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Tìm kiếm tài khoản game, sản phẩm..."
                  className="w-full bg-muted border-2 border-border rounded-full py-3 pl-5 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-lg transition-all group-hover:border-primary/50"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 gradient-primary rounded-full flex items-center justify-center hover:opacity-90 transition-all hover:scale-105"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Support Hotline */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex flex-col">
                  <p className="text-[10px] text-muted-foreground">HỖ TRỢ 24/7</p>
                  <p className="text-xs font-bold text-primary">SUPPORT ALL TIME</p>
                </div>
              </div>

              <ThemeToggle />

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted border-2 border-border rounded-full hover:border-primary hover:shadow-lg transition-all"
                  >
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-foreground max-w-[120px] truncate">{displayName}</p>
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-primary" />
                        <p className="text-[10px] font-bold text-yellow-500">{balance?.toLocaleString("vi-VN")}đ</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl py-2 min-w-[260px] z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-bold text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <div className="mt-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl px-3 py-2">
                          <p className="text-xs font-bold text-primary">💰 Số dư: <span className="text-yellow-500">{balance?.toLocaleString("vi-VN")}đ</span></p>
                        </div>
                      </div>
                      <a href="/trang-ca-nhan" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <User className="w-4 h-4" /> Trang cá nhân
                      </a>
                      <a href="/lich-su-mua" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <ShoppingCart className="w-4 h-4" /> Đơn hàng của tôi
                      </a>
                      {isAdmin && (
                        <a href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-500 hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </a>
                      )}
                      {isCTV && !isAdmin && (
                        <a href="/ctv" className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-muted transition-colors">
                          <Package className="w-4 h-4" /> CTV
                        </a>
                      )}
                      <div className="border-t border-border mt-1">
                        <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors">
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a href="/dang-nhap" className="flex items-center gap-2 px-4 py-2 gradient-primary rounded-full font-semibold text-sm text-primary-foreground hover:opacity-90 transition-opacity hover:scale-105">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </a>
              )}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg bg-muted border border-border">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation Bar - Style như RANDOMALL.NET */}
          <nav className={`mt-4 ${mobileMenuOpen ? "flex flex-col" : "hidden"} lg:flex lg:flex-row lg:items-center lg:justify-between gap-1 pb-1 z-40`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-1">
              {/* Nút hiển thị số dư */}
              {user && (
                <button
                  onClick={() => navigate("/nap-tien")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-all mr-2"
                >
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Ví: <span className="text-yellow-500">{balance?.toLocaleString("vi-VN")}đ</span>
                  </span>
                </button>
              )}

              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    currentPath === item.path || (item.dropdown && (isProductsActive || isTopupActive || isHistoryActive))
                      ? "gradient-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}

              {/* Nút Quy định và FAQ */}
              <button
                onClick={() => navigate("/quy-dinh-nap-the")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPath.startsWith("/quy-dinh-nap-the") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FileText className="w-4 h-4" /> Quy định
              </button>
              <button
                onClick={() => navigate("/faq")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPath.startsWith("/faq") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <HelpCircle className="w-4 h-4" /> FAQ
              </button>
            </div>

            {/* Contact info trên nav */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
              <a href="https://discord.gg/ShopkietZ" target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone className="w-3 h-3" /> Discord: dsc.gg/ShopkietZ
              </a>
              <a href="mailto:support@shopkietz.store" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
                <Mail className="w-3 h-3" /> support@shopkietz.store
              </a>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;