import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Home, ShoppingBag, History, TrendingUp, Users, Ticket,
  Landmark, FileText, Smartphone, Phone, FileCheck, ChevronRight, ChevronDown,
  Wallet, Percent, Sun, Moon, Bell, User, LogOut, Settings, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Định nghĩa kiểu dữ liệu cho menu con
interface SubMenuItem {
  id: string;
  label: string;
  href: string;
}

// Định nghĩa kiểu dữ liệu cho menu chính
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
    icon: ShoppingBag,
    href: '/mua-tai-khoan',
    children: [
      { id: 'ff', label: 'Tài khoản Free Fire', href: '/mua-tai-khoan/free-fire' },
      { id: 'lien-quan', label: 'Tài khoản Liên Quân', href: '/mua-tai-khoan/lien-quan' },
      { id: 'pubg', label: 'Tài khoản PUBG', href: '/mua-tai-khoan/pubg' },
      { id: 'bloxfruits', label: 'Tài khoản Blox Fruits', href: '/mua-tai-khoan/blox-fruits' },
    ],
  },
  { id: 'history', label: 'Lịch Sử Mua Hàng', icon: History, href: '/lich-su-mua' },
  { id: 'ranking', label: 'Bảng Xếp Hạng', icon: TrendingUp, href: '/bang-xep-hang' },
  { id: 'affiliate', label: 'Tiếp Thị Liên Kết', icon: Users, href: '/tiep-thi-lien-ket' },
  { id: 'discount', label: 'Mã Giảm Giá', icon: Ticket, href: '/ma-giam-gia' },
];

// Dữ liệu nhóm NẠP TIỀN
const topupItems: MenuItem[] = [
  { id: 'bank', label: 'Ngân Hàng', icon: Landmark, href: '/nap-ngan-hang' },
  { id: 'invoice', label: 'Hóa Đơn', icon: FileText, href: '/nap-hoa-don' },
  { id: 'card', label: 'Nạp Thẻ', icon: Smartphone, href: '/nap-the' },
];

// Dữ liệu nhóm KHÁC
const otherItems: MenuItem[] = [
  { id: 'contact', label: 'Liên Hệ', icon: Phone, href: '/lien-he' },
  { id: 'policy', label: 'Chính Sách Tạo Website', icon: FileCheck, href: '/chinh-sach-tao-website' },
];

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // State quản lý đóng/mở Sidebar (trên mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State quản lý dropdown "Mua Tài Khoản"
  const [buyAccountDropdownOpen, setBuyAccountDropdownOpen] = useState(false);
  // State cho Dark/Light mode (mặc định dark)
  const [isDarkMode, setIsDarkMode] = useState(true);
  // State cho user menu dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // State từ Supabase
  const [balance, setBalance] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCTV, setIsCTV] = useState<boolean>(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Lấy thông tin user từ Supabase
  useEffect(() => {
    if (!user) return;

    // Lấy profile
    supabase
      .from('profiles')
      .select('display_name, avatar_url, balance, username')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || data.username || user.email?.split('@')[0] || 'User');
          setAvatarUrl(data.avatar_url || '');
          setBalance(data.balance || 0);
        }
      });

    // Kiểm tra role admin
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .then(({ data }) => {
        setIsAdmin(!!(data && data.length > 0));
      });

    // Kiểm tra role CTV
    supabase
      .from('ctv_assignments')
      .select('id')
      .eq('is_active', true)
      .then(({ data }) => {
        setIsCTV(!!(data && data.length > 0));
      });
  }, [user]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleBuyAccountDropdown = () => setBuyAccountDropdownOpen(!buyAccountDropdownOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  // Hàm render một mục menu (có thể có children)
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
              window.location.href = item.href;
              if (sidebarOpen) setSidebarOpen(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
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

        {/* Dropdown con (submenu) */}
        {hasChildren && isOpen && (
          <div className="ml-2 mt-1 space-y-1">
            {item.children?.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group cursor-pointer ml-4"
                onClick={() => {
                  window.location.href = child.href;
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
        {/* ==================== SIDEBAR ==================== */}
        <aside
          className={`
            fixed top-0 left-0 z-40 h-full w-64 bg-[#161925] border-r border-gray-800
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          {/* === Phần Đầu Sidebar: Logo + Ngôn ngữ + Số dư === */}
          <div className="p-4 border-b border-gray-800">
            {/* Logo neon - ShopkietZ.store */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-3 text-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <span className="font-black text-xl tracking-wider text-white uppercase">
                ShopkietZ.store
              </span>
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
                  SỐ DƯ {balance.toLocaleString('vi-VN')}đ
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

          {/* === Phần Thân Sidebar: Menu Điều Hướng === */}
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
            © 2024 ShopkietZ.store
          </div>
        </aside>

        {/* Overlay cho mobile khi sidebar mở */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ==================== KHU VỰC NỘI DUNG CHÍNH ==================== */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          {/* ==================== TOPBAR ==================== */}
          <header className="bg-[#161925] border-b border-gray-800 sticky top-0 z-30">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Bên trái Topbar: Hamburger Menu + Ví nhanh */}
                <div className="flex items-center gap-3">
                  {/* Nút Hamburger toggle Sidebar (chỉ hiện trên mobile) */}
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                    aria-label="Toggle Sidebar"
                  >
                    <Menu className="w-5 h-5 text-gray-300" />
                  </button>

                  {/* Widget số dư nhanh */}
                  <div className="flex items-center gap-2 bg-cyan-500/10 rounded-full px-3 py-1.5 border border-cyan-500/30">
                    <Wallet className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">
                      Ví: {balance.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Bên phải Topbar: Công cụ + Profile */}
                <div className="flex items-center gap-2">
                  {/* Nút Dark/Light mode */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Toggle Theme"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-300" />}
                  </button>

                  {/* Nút Chuông thông báo */}
                  <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5 text-gray-300" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Thanh dọc ngăn cách */}
                  <div className="w-px h-6 bg-gray-700 mx-1"></div>

                  {/* Profile người dùng */}
                  {user ? (
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {/* Avatar hình tròn */}
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {/* Tên tài khoản từ Supabase */}
                        <span className="text-sm font-medium text-gray-300 hidden sm:inline">
                          {displayName}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown menu user */}
                      {userMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#161925] border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                          <a
                            href="/trang-ca-nhan"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" /> Trang cá nhân
                          </a>
                          <a
                            href="/cai-dat"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" /> Cài đặt
                          </a>
                          {isAdmin && (
                            <a
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-orange-400 hover:bg-white/10 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Shield className="w-4 h-4" /> Admin Panel
                            </a>
                          )}
                          {isCTV && !isAdmin && (
                            <a
                              href="/ctv"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:bg-white/10 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <ShoppingBag className="w-4 h-4" /> CTV
                            </a>
                          )}
                          <div className="border-t border-gray-700 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href="/dang-nhap"
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      <User className="w-4 h-4" /> Đăng nhập
                    </a>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ==================== NỘI DUNG TRANG CHÍNH ==================== */}
          <main className="flex-1 p-6">
            {/* 
              Đây là khu vực nội dung chính của trang.
              Các component con sẽ được render ở đây.
              Ảnh có sẵn tại: src/assets/image_be39bed4.png
            */}
            <div className="text-center text-gray-400 mt-10">
              <p className="text-lg">Chào mừng bạn đến với ShopkietZ.store!</p>
              <p className="text-sm mt-2">Nội dung chính sẽ hiển thị tại đây</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Header;