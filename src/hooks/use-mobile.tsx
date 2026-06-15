import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// Kiểu dữ liệu trả về cho device info
interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Khởi tạo đồng bộ ngay khi render (tránh flash sai trên client)
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Debounce resize event để tránh gọi quá nhiều lần
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    // Check ngay lập tức
    checkMobile();
    
    // Lắng nghe sự kiện resize và xoay màn hình
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
}

// Hook chi tiết hơn (trả về mobile, tablet, desktop, kích thước)
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => {
    if (typeof window !== 'undefined') {
      return {
        isMobile: window.innerWidth < MOBILE_BREAKPOINT,
        isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT,
        isDesktop: window.innerWidth >= TABLET_BREAKPOINT,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 0,
      height: 0,
    };
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: window.innerWidth < MOBILE_BREAKPOINT,
        isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT,
        isDesktop: window.innerWidth >= TABLET_BREAKPOINT,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDeviceInfo, 150);
    };

    updateDeviceInfo();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Hook kiểm tra tablet
export function useIsTablet(): boolean {
  const { isTablet } = useDeviceInfo();
  return isTablet;
}

// Hook kiểm tra desktop
export function useIsDesktop(): boolean {
  const { isDesktop } = useDeviceInfo();
  return isDesktop;
}

// Hook lấy kích thước màn hình realtime
export function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 150);
    };

    updateSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateSize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  return size;
}

// Breakpoint constants để dùng chung
export const BREAKPOINTS = {
  mobile: MOBILE_BREAKPOINT,
  tablet: TABLET_BREAKPOINT,
};