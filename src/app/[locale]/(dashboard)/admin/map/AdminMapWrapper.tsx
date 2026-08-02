"use client"
import dynamic from "next/dynamic"
import { Atelier } from "@/components/map/AtelierMapClient"

const AtelierMapClient = dynamic(
  () => import("@/components/map/AtelierMapClient"),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl flex items-center justify-center"><span className="text-muted-foreground">Loading Map...</span></div> }
)

export default function AdminMapWrapper({ ateliers }: { ateliers: Atelier[] }) {
  return <AtelierMapClient ateliers={ateliers} />
}
