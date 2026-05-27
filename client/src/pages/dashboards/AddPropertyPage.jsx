import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/session";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { AddPropertyForm } from "@/components/AddPropertyForm";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function AddPropertyPage() {
  const { user, loading } = useSession();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  // Only builders or admins can list new properties.
  if (user.role !== "builder" && user.role !== "admin") {
    return <Navigate to={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/nri"} replace />;
  }

  return (
    <DashboardShell
      title="Add New Property"
      subtitle="Fill in the details below to list a new property. All fields marked with * are required."
      user={{ name: user.name, role: user.role }}
      tone="gold"
      nav={
        <>
          <NavLink to="/dashboard/admin">Overview</NavLink>
          <NavLink to="/properties">Properties</NavLink>
          <NavLink to="/dashboard/properties/new">Add Property</NavLink>
        </>
      }
    >
      <AddPropertyForm />
    </DashboardShell>
  );
}
