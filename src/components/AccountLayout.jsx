import { NavLink, Outlet } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useAccount } from "@/lib/AccountContext";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";

const ACCOUNT_LINKS = [
  { label: "Profile", path: "/account", icon: User, end: true },
  { label: "Orders", path: "/account/orders", icon: Package },
  { label: "Addresses", path: "/account/addresses", icon: MapPin },
  { label: "Wishlist", path: "/account/wishlist", icon: Heart },
  { label: "Settings", path: "/account/settings", icon: Settings },
];

export default function AccountLayout() {
  const { logout, user } = useAuth();
  const { customer } = useAccount();

  return (
    <div className="bg-o29-bone min-h-screen">
      <Navbar />
      <main id="main" className="pt-28 md:pt-36 pb-24 px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-h2 font-medium text-o29-ink">My Account</h1>
          <p className="mt-1 text-sm text-o29-slate">
            {user?.email || customer?.email || "Welcome back"}
          </p>
          {!import.meta.env.VITE_SHOPIFY_CUSTOMER_SYNC_ENDPOINT && (
            <p className="mt-2 text-xs text-o29-slate">
              Account sync not configured — wishlist syncing is unavailable.
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {ACCOUNT_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-o29-ink text-o29-bone"
                        : "text-o29-slate hover:text-o29-ink hover:bg-o29-bone-2"
                    }`
                  }
                >
                  <link.icon size={16} />
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-3 text-sm text-o29-slate hover:text-o29-ink hover:bg-o29-bone-2 transition-colors text-left w-full"
              >
                <LogOut size={16} />
                Log out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
