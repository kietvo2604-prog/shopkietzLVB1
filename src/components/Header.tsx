import { Search, ShoppingCart, User, Gamepad2, ChevronDown, LogOut, Wallet, Shield, Phone, Mail, CreditCard, History as HistoryIcon, FileText, HelpCircle, Home, Package, Landmark, Smartphone, Menu, X, TrendingUp, Gift, Users, Link, FileCheck, Headphones } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCTV, setIsCTV] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const topupRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

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
      if (topupRef.current && !topupRef.current.contains(e.target as Node)) setTopupOpen(false);
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setHistoryOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const isHistoryActive = ["/lich-su-nap", "/lich-su-mua", "/bien-dong-so-du", "/lich-su", "/lich-su-cay-thue"].some(p => currentPath.startsWith(p));
  const isTopupActive = ["/nap-tien", "/nap-the", "/nap-ngan-hang"].some(p => currentPath.startsWith(p));

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>🌐 Select Language:</span>
              <select className="bg-transparent border-none text-xs focus:outline-none">
                <option>Vietnamese</option>
                <option>English</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span>💰 Select Currency:</span>
              <select className="bg-transparent border-none text-xs focus:outline-none">
                <option>VND</option>
                <option>USD</option>
              </select>
            </div>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3 h-3" /> Hỗ trợ 24/7
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary font-semibold hidden md:block">Số Dư Đồ - Giảm: 0%</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0 min-w-0">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight gradient-primary bg-clip-text text-transparent">
                RANDOMALL.NET
              </span>
              <span className="text-[9px] text-muted-foreground hidden sm:block">SHOP RANDOM ĐA DẠNG GAME</span>
            </div>
          </a>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài khoản game, sản phẩm..."
                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-border transition-all" />
              <button type="submit" className="absolute right-1 top-1 bottom-1 px-3 gradient-primary rounded-md flex items-center justify-center hover:opacity-90 transition-opacity">
                <Search className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-muted border border-border rounded-lg hover:bg-border transition-colors">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[220px] z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {balance !== null && (
                        <div className="mt-2 bg-primary/10 border border-primary/20 rounded-md px-3 py-1.5">
                          <p className="text-xs font-bold text-primary">💰 Số dư: <span className="text-yellow-500">{balance.toLocaleString("vi-VN")}đ</span></p>
                        </div>
                      )}
                    </div>
                    <a href="/trang-ca-nhan" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <User className="w-4 h-4" /> Trang cá nhân
                    </a>
                    <a href="/lich-su-mua" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <ShoppingCart className="w-4 h-4" /> Đơn hàng của tôi
                    </a>
                    {isAdmin && (
                      <a href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neon-orange hover:bg-muted transition-colors">
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
              <a href="/dang-nhap" className="flex items-center gap-2 px-3 sm:px-4 py-2 gradient-primary rounded-lg font-semibold text-sm text-primary-foreground hover:opacity-90 transition-opacity">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </a>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg bg-muted border border-border">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation - Giống ảnh RANDOMALL.NET */}
        <nav className={`mt-3 ${mobileMenuOpen ? "flex flex-col" : "hidden"} md:flex md:flex-row md:items-center gap-1 pb-1 relative z-40 flex-wrap`}>
          {/* Nút hiển thị số dư */}
          {user && (
            <button
              onClick={() => navigate("/nap-tien")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors shrink-0 mr-1"
            >
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary whitespace-nowrap">
                Ví: <span className="text-yellow-500 font-bold">{(balance ?? 0).toLocaleString("vi-VN")}đ</span>
              </span>
            </button>
          )}

          {/* Trang Chủ */}
          <button onClick={() => navigate("/")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath === "/" ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <Home className="w-4 h-4" /> Trang Chủ
          </button>

          {/* Mua Tài Khoản */}
          <button onClick={() => navigate("/mua-tai-khoan")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/mua-tai-khoan") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <ShoppingCart className="w-4 h-4" /> Mua Tài Khoản
          </button>

          {/* Lịch Sử Mua Hàng */}
          <button onClick={() => navigate("/lich-su-mua")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/lich-su-mua") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <HistoryIcon className="w-4 h-4" /> Lịch Sử Mua Hàng
          </button>

          {/* Bảng Xếp Hạng */}
          <button onClick={() => navigate("/bang-xep-hang")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/bang-xep-hang") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <TrendingUp className="w-4 h-4" /> Bảng Xếp Hạng
          </button>

          {/* Tiếp Thị Liên Kết */}
          <button onClick={() => navigate("/tiep-thi-lien-ket")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/tiep-thi-lien-ket") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <Users className="w-4 h-4" /> Tiếp Thị Liên Kết
          </button>

          {/* Mã Giảm Giá */}
          <button onClick={() => navigate("/ma-giam-gia")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/ma-giam-gia") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            <Gift className="w-4 h-4" /> Mã Giảm Giá
          </button>

          {/* Nạp Tiền Dropdown */}
          <div className="relative" ref={topupRef}>
            <button onClick={() => setTopupOpen(!topupOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isTopupActive ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <CreditCard className="w-4 h-4" /> Nạp Tiền
              <ChevronDown className={`w-3 h-3 transition-transform ${topupOpen ? "rotate-180" : ""}`} />
            </button>
            {topupOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] z-[100] animate-fade-in">
                <div className="px-3 py-2 border-b border-border text-primary font-bold text-xs">
                  NẠP TIỀN
                </div>
                <button onClick={() => { navigate("/nap-ngan-hang"); setTopupOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <Landmark className="w-4 h-4 text-primary" /> Ngân Hàng
                </button>
                <button onClick={() => { navigate("/nap-hoa-don"); setTopupOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <FileText className="w-4 h-4 text-primary" /> Hoá Đơn
                </button>
                <button onClick={() => { navigate("/nap-the"); setTopupOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <Smartphone className="w-4 h-4 text-accent" /> Nạp Thẻ
                </button>
              </div>
            )}
          </div>

          {/* KHÁC Dropdown */}
          <div className="relative" ref={moreRef}>
            <button onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${moreOpen ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <Package className="w-4 h-4" /> KHÁC
              <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] z-[100] animate-fade-in">
                <div className="px-3 py-2 border-b border-border text-primary font-bold text-xs">
                  KHÁC
                </div>
                <button onClick={() => { navigate("/lien-he"); setMoreOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <Phone className="w-4 h-4 text-primary" /> Liên Hệ
                </button>
                <button onClick={() => { navigate("/chinh-sach-tao-website"); setMoreOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <FileCheck className="w-4 h-4 text-primary" /> Chính Sách Tạo Website
                </button>
                <button onClick={() => { navigate("/quy-dinh-nap-the"); setMoreOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <FileText className="w-4 h-4 text-primary" /> Quy định nạp thẻ
                </button>
                <button onClick={() => { navigate("/faq"); setMoreOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <HelpCircle className="w-4 h-4 text-primary" /> FAQ
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;