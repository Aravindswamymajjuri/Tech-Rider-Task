import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyPage from "@/pages/PropertyPage";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Resources from "@/pages/Resources";
import Contact from "@/pages/Contact";
import ForgotPassword from "@/pages/ForgotPassword";
import AdminPage from "@/pages/dashboards/AdminPage";
import BuilderPage from "@/pages/dashboards/BuilderPage";
import BuyerPage from "@/pages/dashboards/BuyerPage";
import NRIPage from "@/pages/dashboards/NRIPage";
import AddPropertyPage from "@/pages/dashboards/AddPropertyPage";
import PropertyMetricsPage from "@/pages/dashboards/PropertyMetricsPage";
import WishlistPage from "@/pages/dashboards/WishlistPage";
import ComparePage from "@/pages/dashboards/ComparePage";
import SettingsPage from "@/pages/dashboards/SettingsPage";
import NotificationsPage from "@/pages/dashboards/NotificationsPage";
import { Privacy, Terms } from "@/pages/Legal";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyPage />} />

      <Route path="/register/:role" element={<Register />} />

      <Route path="/about" element={<About />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />

      {/* Role-scoped landing dashboards */}
      <Route path="/dashboard/admin" element={<AdminPage />} />
      <Route path="/dashboard/builder" element={<BuilderPage />} />
      <Route path="/dashboard/buyer" element={<BuyerPage />} />
      <Route path="/dashboard/nri" element={<NRIPage />} />

      {/* Wishlist / Compare — buyer / NRI / admin */}
      <Route path="/dashboard/wishlist" element={<WishlistPage />} />
      <Route path="/dashboard/compare" element={<ComparePage />} />

      {/* Cross-role pages */}
      <Route path="/dashboard/settings" element={<SettingsPage />} />
      <Route path="/dashboard/notifications" element={<NotificationsPage />} />

      {/* Builder/admin property management — role-neutral URLs */}
      <Route path="/dashboard/properties/new" element={<AddPropertyPage />} />
      <Route path="/dashboard/properties/:id" element={<PropertyMetricsPage />} />

      {/* Legacy URL redirects so old links keep working */}
      <Route path="/dashboard/buyer/property/new" element={<Navigate to="/dashboard/properties/new" replace />} />
      <Route path="/dashboard/buyer/property/:id" element={<LegacyMetricsRedirect />} />

      <Route path="/legal/privacy" element={<Privacy />} />
      <Route path="/legal/terms" element={<Terms />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function LegacyMetricsRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/properties/${id}`} replace />;
}
