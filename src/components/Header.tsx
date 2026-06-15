import { Search, ShoppingCart, User, Gamepad2, ChevronDown, LogOut, Wallet, Shield, Phone, Mail, CreditCard, History as HistoryIcon, FileText, HelpCircle, Home, Package, Landmark, Smartphone, Menu, X, Bell, Sun, Moon, TrendingUp, Users, Ticket, FileCheck, Percent, Landmark as BankIcon, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";

// Định nghĩa kiểu dữ liệu cho menu con
interface SubMenuItem {
  id: string;
  label: string;
  href: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: SubMenuItem[];
}

// Dữ liệu menu chính
const mainMenuItems: MenuItem[] = [
  { id: 'home', label: 'Trang Chủ', icon: Home, href: '/' },
  {
    id: 'buy-account',
    label: 'Mua Tài Khoản',
    icon: ShoppingCart,
    href: '/mua-tai-khoan',
    children: [
      { id: 'ff', label: 'Tài khoản Free Fire', href: '/mua-tai-khoan/free-fire' },
      { id: 'lien-quan', label: 'Tài khoản Liên Quân', href: '/mua-tai-khoan/lien-quan' },
      { id: 'pubg', label: 'Tài khoản PUBG', href: '/mua-tai-khoan/pubg' },
    ],
  },
  { id: 'history', label: 'Lịch Sử Mua Hàng', icon: HistoryIcon, href: '/lich-su-mua' },
  { id: 'ranking', label: 'Bảng Xếp Hạng', icon: TrendingUp, href: '/bang-xep-hang' },
  { id: 'affiliate', label: 'Tiếp Thị Liên Kết', icon: Users, href: '/tiep-thi-lien-ket' },
  { id: 'discount', label: 'Mã Giảm Giá', icon: Ticket, href: '/ma-giam-gia' },
];

// Dữ liệu nhóm NẠP TIỀN
const topupItems: MenuItem[] = [
  { id: 'bank', label: 'Ngân Hàng', icon: BankIcon, href: '/nap-ngan-hang' },
  { id: 'invoice', label: 'Hóa Đơn', icon: FileText, href: '/nap-hoa-don' },
  { id: 'card', label: 'Nạp Thẻ', icon: Smartphone, href: '/nap-the' },
];

// Dữ liệu nhóm KHÁC
const otherItems: MenuItem[] = [
  { id: 'contact', label: 'Liên Hệ', icon: Phone, href: '/lien-he' },
  { id: 'policy', label: 'Chính Sách Tạo Website', icon: FileCheck, href: '/chinh-sach-tao-website' },
];

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buyAccountDropdownOpen, setBuyAccountDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCTV, setIsCTV] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const topupRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

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
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleBuyAccountDropdown = () => setBuyAccountDropdownOpen(!buyAccountDropdownOpen);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const isHistoryActive = ["/lich-su-nap", "/lich-su-mua", "/bien-dong-so-du", "/lich-su", "/lich-su-cay-thue"].some(p => currentPath.startsWith(p));
  const isTopupActive = ["/nap-tien", "/nap-the", "/nap-ngan-hang"].some(p => currentPath.startsWith(p));

  // Hàm render menu item cho sidebar
  const renderMenuItem = (item: MenuItem, isChild: boolean = false) => {
    const Icon = item.icon;
    const hasChildren = !!item.children;
    const isOpen = buyAccountDropdownOpen && item.id === 'buy-account';

    return (
      <div key={item.id} className="w-full">
        <div
          className={`
            flex items-center justify-between px-4 py-2.5 rounded-lg
            transition-all duration-200 cursor-pointer
            hover:bg-white/10 group
            ${isChild ? 'ml-6' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleBuyAccountDropdown();
            } else if (item.href) {
              navigate(item.href);
              if (sidebarOpen) setSidebarOpen(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </div>
          {hasChildren && (
            <div className="text-gray-400">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="ml-2 mt-1 space-y-1">
            {item.children?.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group cursor-pointer ml-4"
                onClick={() => {
                  navigate(child.href);
                  if (sidebarOpen) setSidebarOpen(false);
                }}
              >
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {child.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#12141c]">
        {/* Sidebar */}
        <aside
          ref={sidebarRef as any}
          className={`
            fixed top-0 left-0 z-40 h-full w-64 bg-[#161925] border-r border-gray-800
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          {/* Header Sidebar: Logo + Ngôn ngữ + Số dư */}
          <div className="p-4 border-b border-gray-800">
            {/* Logo neon */}
            <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-3 text-center shadow-glow">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-8 object-contain" />
              ) : (
                <span className="font-black text-xl tracking-wider text-white uppercase">
                  SHOPKIETZ
                </span>
              )}
            </div>

            {/* Lựa chọn ngôn ngữ và tiền tệ */}
            <div className="mt-3 space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Select Language:</span>
                <span className="text-gray-300">Vietnamese</span>
              </div>
              <div className="flex justify-between">
                <span>Select Currency:</span>
                <span className="text-gray-300">VND -</span>
              </div>
            </div>

            {/* Khung số dư và giảm giá */}
            <div className="mt-3 flex items-center justify-between bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/30">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">
                  SỐ DƯ {(balance ?? 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Percent className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">
                  GIẢM: 0%
                </span>
              </div>
            </div>
          </div>

          {/* Phần thân menu */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Menu chính */}
            <div className="px-3 space-y-1">
              {mainMenuItems.map((item) => renderMenuItem(item))}
            </div>

            {/* Nhóm NẠP TIỀN */}
            <div className="mt-6 px-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                NẠP TIỀN
              </h3>
              <div className="space-y-1">
                {topupItems.map((item) => renderMenuItem(item))}
              </div>
            </div>

            {/* Nhóm KHÁC */}
            <div className="mt-6 px-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                KHÁC
              </h3>
              <div className="space-y-1">
                {otherItems.map((item) => renderMenuItem(item))}
              </div>
            </div>
          </div>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-800 text-center text-xs text-gray-500">
            © 2024 SHOPKIETZ.STORE
          </div>
        </aside>

        {/* Overlay cho mobile khi sidebar mở */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Khu vực nội dung chính bên phải */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          {/* Topbar */}
          <header className="bg-card border-b border-border sticky top-0 z-50">
            {/* Top bar nhỏ phía trên */}
            <div className="border-b border-border/50 bg-muted/30">
              <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <a href="https://discord.gg/ZONOshop" target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Phone className="w-3 h-3" /> Discord: dsc.gg/ZONOshop
                  </a>
                  <span className="hidden sm:flex items-center gap-1">
                    <Mail className="w-3 h-3" /> support@ZONOshop.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Left side: Hamburger + Logo */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                  >
                    <Menu className="w-5 h-5 text-gray-300" />
                  </button>
                  <a href="/" className="flex items-center gap-2 shrink-0 min-w-0">
                    {logoUrl && (
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain shrink-0" />
                    )}
                    <span className="font-display font-bold text-xl sm:text-2xl tracking-tight gradient-primary bg-clip-text text-transparent hidden sm:block">
                      SHOPKIETZ
                    </span>
                  </a>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
                  <div className="relative">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full bg-muted border border-border rounded-lg py-2.5 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-border transition-all" />
                    <button type="submit" className="absolute right-1 top-1 bottom-1 px-3 gradient-primary rounded-md flex items-center justify-center hover:opacity-90 transition-opacity">
                      <Search className="w-4 h-4 text-primary-foreground" />
                    </button>
                  </div>
                </form>

                {/* Right side: Notifications + Profile */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Nút thông báo */}
                  <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5 text-gray-300" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User menu */}
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

              {/* Nav with dropdowns */}
              <nav className={`mt-3 ${mobileMenuOpen ? "flex flex-col" : "hidden"} md:flex md:flex-row md:items-center gap-2 pb-1 relative z-40`}>
                {user && (
                  <button
                    onClick={() => navigate("/nap-the")}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors shrink-0"
                    title="Nạp tiền"
                  >
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary whitespace-nowrap">
                      Ví: <span className="text-yellow-500 font-bold">{(balance ?? 0).toLocaleString("vi-VN")}đ</span>
                    </span>
                  </button>
                )}

                <button onClick={() => navigate("/")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath === "/" ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <Home className="w-4 h-4" /> Trang chủ
                </button>

                {/* Nạp tiền dropdown */}
                <div className="relative" ref={topupRef}>
                  <button onClick={() => setTopupOpen(!topupOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isTopupActive ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    <CreditCard className="w-4 h-4" /> Nạp tiền
                    <ChevronDown className={`w-3 h-3 transition-transform ${topupOpen ? "rotate-180" : ""}`} />
                  </button>
                  {topupOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px] z-[100] animate-fade-in">
                      <div className="px-3 py-2 border-b border-border flex items-center gap-2 text-primary font-bold text-xs">
                        <Landmark className="w-4 h-4" /> Chọn phương thức nạp
                      </div>
                      <button onClick={() => { navigate("/nap-ngan-hang"); setTopupOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Landmark className="w-4 h-4 text-primary" /> Ngân hàng
                      </button>
                      <button onClick={() => { navigate("/nap-the"); setTopupOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Smartphone className="w-4 h-4 text-accent" /> Thẻ cào
                      </button>
                    </div>
                  )}
                </div>

                {/* Lịch sử dropdown */}
                <div className="relative" ref={historyRef}>
                  <button onClick={() => setHistoryOpen(!historyOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isHistoryActive ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    <HistoryIcon className="w-4 h-4" /> Lịch sử
                    <ChevronDown className={`w-3 h-3 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
                  </button>
                  {historyOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[220px] z-[100] animate-fade-in">
                      <button onClick={() => { navigate("/lich-su-mua"); setHistoryOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <ShoppingCart className="w-4 h-4 text-primary" /> Lịch sử mua hàng
                      </button>
                      <button onClick={() => { navigate("/lich-su-nap"); setHistoryOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Wallet className="w-4 h-4 text-primary" /> Lịch sử nạp tiền
                      </button>
                      <button onClick={() => { navigate("/bien-dong-so-du"); setHistoryOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4 text-primary" /> Biến động số dư
                      </button>
                      <button onClick={() => { navigate("/lich-su-cay-thue"); setHistoryOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Package className="w-4 h-4 text-accent" /> Lịch sử cày thuê
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => navigate("/quy-dinh-nap-the")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/quy-dinh-nap-the") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <FileText className="w-4 h-4" /> Quy định nạp thẻ
                </button>
                <button onClick={() => navigate("/faq")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${currentPath.startsWith("/faq") ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <HelpCircle className="w-4 h-4" /> FAQ
                </button>
              </nav>
            </div>
          </header>
        </div>
      </div>
    </div>
  );
};

export default Header;