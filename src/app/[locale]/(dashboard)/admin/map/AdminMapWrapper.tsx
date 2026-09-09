"use client";

import dynamic from "next/dynamic";
import { type AdminCreator } from "@/components/map/AdminAtelierMap";

const AdminAtelierMap = dynamic(
  () => import("@/components/map/AdminAtelierMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted animate-pulse rounded-xl flex flex-col items-center justify-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">Chargement de la carte des ateliers...</span>
      </div>
    ),
  }
);

interface AdminMapWrapperProps {
  creators: AdminCreator[];
  initialSelectedCreatorId?: string | null;
}

export default function AdminMapWrapper({
  creators,
  initialSelectedCreatorId,
}: AdminMapWrapperProps) {
  return (
    <AdminAtelierMap
      initialCreators={creators}
      initialSelectedCreatorId={initialSelectedCreatorId}
    />
  );
}
