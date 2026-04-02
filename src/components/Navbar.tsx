import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileOpen(false);
  };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isAdminPage = location.startsWith("/admin");
  if (isAdminPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b08]/90 backdrop-blur-md border-b border-[#c9a84c]/15">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          data-testid="nav-logo"
          onClick={() => setLocation("/")}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.3)]">
            <Scissors className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="text-white font-serif text-lg font-bold">OneTouch</span>
            <span className="text-[#c9a84c]/70 text-xs ml-1.5 tracking-wider uppercase hidden sm:inline">Salon</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo("services")}
            className="text-gray-400 hover:text-[#ffd700] text-sm transition-colors font-medium"
          >
            Services
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="text-gray-400 hover:text-[#ffd700] text-sm transition-colors font-medium"
          >
            Contact
          </button>
          <button
            data-testid="nav-admin"
            onClick={() => setLocation("/admin")}
            className="text-[#c9a84c]/70 hover:text-[#ffd700] text-sm transition-colors flex items-center gap-1"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              <Button
                data-testid="nav-my-bookings"
                onClick={() => setLocation("/my-bookings")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm"
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </Button>
              <Button
                data-testid="nav-book-now"
                onClick={() => setLocation("/book")}
                size="sm"
                className="bg-gradient-to-r from-[#ffd700] to-[#e6c200] hover:from-[#e6c200] hover:to-[#cca800] text-black font-semibold rounded-full px-5 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
              >
                Book Now
              </Button>
              <Button
                data-testid="nav-logout"
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-red-400 w-8 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              data-testid="nav-signin"
              onClick={() => setLocation("/login")}
              size="sm"
              className="bg-gradient-to-r from-[#ffd700] to-[#e6c200] hover:from-[#e6c200] hover:to-[#cca800] text-black font-semibold rounded-full px-5"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          data-testid="nav-mobile-menu"
          className="md:hidden text-gray-400 hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0b08]/98 border-t border-[#c9a84c]/10 px-4 py-6 space-y-1">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 pb-4 mb-3 border-b border-[#c9a84c]/10">
                <div className="w-9 h-9 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#ffd700]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {currentUser.displayName || currentUser.phoneNumber || currentUser.email || "Guest"}
                  </p>
                  <p className="text-gray-500 text-xs">{currentUser.email || ""}</p>
                </div>
              </div>
              <MobileNavBtn onClick={() => scrollTo("services")}>Services</MobileNavBtn>
              <MobileNavBtn onClick={() => scrollTo("contact")}>Contact</MobileNavBtn>
              <MobileNavBtn onClick={() => { setLocation("/book"); setMobileOpen(false); }}>
                📅 Book Appointment
              </MobileNavBtn>
              <MobileNavBtn onClick={() => { setLocation("/my-bookings"); setMobileOpen(false); }}>
                📋 My Bookings
              </MobileNavBtn>
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-400 py-3 text-sm hover:text-red-300 px-2"
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <>
              <MobileNavBtn onClick={() => scrollTo("services")}>Services</MobileNavBtn>
              <MobileNavBtn onClick={() => scrollTo("contact")}>Contact</MobileNavBtn>
              <MobileNavBtn onClick={() => { setLocation("/admin"); setMobileOpen(false); }}>
                🔐 Admin Login
              </MobileNavBtn>
              <div className="pt-3">
                <Button
                  onClick={() => { setLocation("/login"); setMobileOpen(false); }}
                  className="w-full bg-gradient-to-r from-[#ffd700] to-[#e6c200] text-black font-semibold rounded-full"
                >
                  Sign In / Register
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function MobileNavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-gray-300 py-3 text-sm hover:text-white px-2 border-b border-[#c9a84c]/5 flex items-center justify-between"
    >
      {children}
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </button>
  );
}
