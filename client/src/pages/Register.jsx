import { useParams, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { BuilderRegister } from "@/components/BuilderRegister";
import { BuyerRegister } from "@/components/BuyerRegister";
import { NRIRegister } from "@/components/NRIRegister";
import { PageSkeleton } from "@/components/PageSkeleton";

const hero = {
  builder: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&w=2000&q=70",
  buyer: "https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=2000&q=70",
  nri: "https://images.unsplash.com/photo-1518883220488-2cb8b04b00f6?auto=format&fit=crop&w=2000&q=70"
};

export default function Register() {
  const { role } = useParams();
  const [sp] = useSearchParams();
  const tone = role === "buyer" ? "sage" : "gold";
  const image = hero[role || "builder"];

  if (!role || !["builder", "buyer", "nri"].includes(role)) {
    return <PageSkeleton message="Unknown registration type" />;
  }

  return (
    <AuthLayout heroImage={image} tone={tone}>
      {role === "builder" && <BuilderRegister />}
      {role === "buyer" && <BuyerRegister initialType={sp.get("type") || "apartment"} />}
      {role === "nri" && <NRIRegister />}
    </AuthLayout>
  );
}
