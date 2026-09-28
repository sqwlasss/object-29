import React, { lazy, Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AccountProvider } from '@/lib/AccountContext';
import { FavoritesProvider } from '@/lib/FavoritesContext';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));

// Account pages
const AccountLayout = lazy(() => import('./components/AccountLayout'));
const AccountProfile = lazy(() => import('./pages/account/Profile'));
const AccountOrders = lazy(() => import('./pages/account/Orders'));
const AccountAddresses = lazy(() => import('./pages/account/Addresses'));
const AccountWishlist = lazy(() => import('./pages/account/Wishlist'));
const AccountSettings = lazy(() => import('./pages/account/Settings'));

function LoadingSpinner() {
  // A 1px rule sweeping the container, not a spinner. Under
  // prefers-reduced-motion the animation collapses to 1ms rather than being
  // removed, so the bar simply sits still instead of vanishing.
  return (
    <div className="o29-field o29-field--bone fixed inset-0 flex items-start justify-center">
      <div className="mt-hold h-px w-40 bg-o29-rule">
        <div className="h-px w-full origin-left animate-rule-sweep bg-o29-ink" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <main id="main" className="o29-field o29-field--bone flex min-h-screen items-center justify-center px-gutter">
          <div className="max-w-reading">
            <h1 className="font-display text-h2 font-medium text-o29-ink">Something went wrong</h1>
            <p className="mt-4 text-sm text-o29-slate">
              The page failed to load. Refreshing usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="o29-meta o29-hit mt-6 flex items-center text-o29-ink underline underline-offset-4"
            >
              Refresh
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <LoadingSpinner />;
  }

  // Removed here: an `authError` branch that rendered <UserNotRegisteredError />
  // without importing it, and read `isLoadingPublicSettings`. AuthContext
  // provides neither value, so both were permanently undefined and the branch
  // was unreachable — it would have thrown a ReferenceError if it ever ran.
  // The component it referenced is deleted along with it.

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:handle" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<AccountProfile />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <CurrencyProvider>
              <AccountProvider>
                <FavoritesProvider>
                  <ScrollToTop />
                  <AuthenticatedApp />
                  <Toaster />
                  <CookieConsent />
                </FavoritesProvider>
              </AccountProvider>
            </CurrencyProvider>
          </QueryClientProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
