"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Compass,
  Save,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Layers,
  Minimize2,
  Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  saveCreatorLocationAction,
  clearCreatorCoordinatesAction,
} from "@/app/[locale]/(dashboard)/admin/map/actions";
import {
  ALGERIA_CENTER,
  ALGERIA_DEFAULT_ZOOM,
  ALGERIA_WILAYAS,
  getWilayaName,
} from "@/lib/data/algeria";
import { resolveAtelierPosition, type LatLng } from "@/lib/map-helpers";
import { cn } from "@/lib/utils";

let rtlPluginLoaded = false;
function ensureRtlPlugin() {
  if (rtlPluginLoaded || typeof window === "undefined") return;
  rtlPluginLoaded = true;
  try {
    mapboxgl.setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.4.0/mapbox-gl-rtl-text.js",
      undefined,
      true
    );
  } catch {
    // Plugin may already be initialized
  }
}

export interface AdminCreator {
  id: string;
  shopName: string | null;
  ownerFirstName: string;
  ownerLastName: string;
  ownerAvatarUrl: string | null;
  ownerPhone: string | null;
  specialty: string[];
  category: string | null;
  isVerified: boolean;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface AdminAtelierMapProps {
  initialCreators: AdminCreator[];
  initialSelectedCreatorId?: string | null;
}

export default function AdminAtelierMap({
  initialCreators,
  initialSelectedCreatorId,
}: AdminAtelierMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [creators, setCreators] = useState<AdminCreator[]>(initialCreators);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "placed" | "unplaced">("all");
  
  // Selected creator for viewing or editing
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    initialSelectedCreatorId || null
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorMinimized, setIsEditorMinimized] = useState(false);
  const [isPlacingOnMap, setIsPlacingOnMap] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formWilaya, setFormWilaya] = useState("");
  const [formCommune, setFormCommune] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formLat, setFormLat] = useState<string>("");
  const [formLng, setFormLng] = useState<string>("");

  useEffect(() => {
    ensureRtlPlugin();
  }, []);

  // Sync initial creator if passed via query param
  useEffect(() => {
    if (initialSelectedCreatorId) {
      const found = creators.find((c) => c.id === initialSelectedCreatorId);
      if (found) {
        openEditor(found);
      }
    }
  }, [initialSelectedCreatorId]);

  // Compute positioned creators
  const positionedCreators = useMemo(() => {
    return creators
      .map((c) => {
        const pos = resolveAtelierPosition({
          id: c.id,
          wilaya: c.wilaya,
          latitude: c.latitude,
          longitude: c.longitude,
        });
        if (!pos) return null;
        return { ...c, position: pos, hasExplicitCoords: c.latitude !== null && c.longitude !== null };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [creators]);

  const stats = useMemo(() => {
    const total = creators.length;
    const withExplicitGps = creators.filter((c) => c.latitude !== null && c.longitude !== null).length;
    const withAnyPosition = positionedCreators.length;
    const withoutPosition = total - withAnyPosition;
    return { total, withExplicitGps, withAnyPosition, withoutPosition };
  }, [creators, positionedCreators]);

  // Filter list
  const filteredCreators = useMemo(() => {
    let list = creators;

    if (filterTab === "placed") {
      list = list.filter((c) => c.latitude !== null && c.longitude !== null);
    } else if (filterTab === "unplaced") {
      list = list.filter((c) => c.latitude === null || c.longitude === null);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => {
        const fullName = `${c.ownerFirstName} ${c.ownerLastName}`.toLowerCase();
        const shop = (c.shopName || "").toLowerCase();
        const wilaya = (c.wilaya || "").toLowerCase();
        const commune = (c.commune || "").toLowerCase();
        return fullName.includes(q) || shop.includes(q) || wilaya.includes(q) || commune.includes(q);
      });
    }

    return list;
  }, [creators, filterTab, search]);

  const selectedCreator = useMemo(() => {
    return creators.find((c) => c.id === selectedCreatorId) || null;
  }, [creators, selectedCreatorId]);

  const flyTo = useCallback((lat: number, lng: number, zoom = 12) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 800 });
  }, []);

  const openEditor = (creator: AdminCreator) => {
    setSelectedCreatorId(creator.id);
    setFormWilaya(creator.wilaya || "");
    setFormCommune(creator.commune || "");
    setFormAddress(creator.address || "");
    setFormLat(creator.latitude !== null ? String(creator.latitude) : "");
    setFormLng(creator.longitude !== null ? String(creator.longitude) : "");
    setIsEditorOpen(true);
    setIsEditorMinimized(false);
    setIsPlacingOnMap(true);

    if (creator.latitude !== null && creator.longitude !== null) {
      flyTo(creator.latitude, creator.longitude, 13);
    } else if (creator.wilaya) {
      const w = ALGERIA_WILAYAS.find(
        (item) => item.name_fr.toLowerCase() === creator.wilaya!.toLowerCase()
      );
      if (w) flyTo(w.lat, w.lng, 9);
    }
  };

  const handleWilayaChange = (wilayaName: string) => {
    setFormWilaya(wilayaName);
    const found = ALGERIA_WILAYAS.find(
      (w) => w.name_fr.toLowerCase() === wilayaName.toLowerCase()
    );
    if (found) {
      // If coordinates aren't explicitly set yet, suggest the wilaya center
      if (!formLat || !formLng) {
        setFormLat(String(found.lat));
        setFormLng(String(found.lng));
      }
      flyTo(found.lat, found.lng, 9);
    }
  };

  const handleMapClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!isEditorOpen) return;
    const { lng, lat } = e.lngLat;
    setFormLat(lat.toFixed(6));
    setFormLng(lng.toFixed(6));
    toast.success(`Position pointée : ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { id: "gps-point" });
  };

  const handleSavePosition = async () => {
    if (!selectedCreator) return;

    const parsedLat = formLat.trim() !== "" ? parseFloat(formLat) : null;
    const parsedLng = formLng.trim() !== "" ? parseFloat(formLng) : null;

    if (parsedLat !== null && (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
      toast.error("La latitude doit être comprise entre -90 et 90.");
      return;
    }
    if (parsedLng !== null && (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      toast.error("La longitude doit être comprise entre -180 et 180.");
      return;
    }

    setSaving(true);

    // Keep snapshot for rollback
    const previousCreators = creators;
    const targetId = selectedCreator.id;
    const newWilaya = formWilaya.trim() || null;
    const newCommune = formCommune.trim() || null;
    const newAddress = formAddress.trim() || null;

    // 1. INSTANT OPTIMISTIC UPDATE: update local state & close panel immediately (0ms delay)
    setCreators((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              wilaya: newWilaya,
              commune: newCommune,
              address: newAddress,
              latitude: parsedLat,
              longitude: parsedLng,
            }
          : c
      )
    );

    setIsPlacingOnMap(false);
    setIsEditorOpen(false);
    setIsEditorMinimized(false);

    if (parsedLat !== null && parsedLng !== null) {
      flyTo(parsedLat, parsedLng, 13);
    }

    toast.success("Position GPS enregistrée avec succès !", { id: "gps-save" });

    // 2. RUN FAST SERVER ACTION IN BACKGROUND (<20ms)
    try {
      const res = await saveCreatorLocationAction({
        creatorId: targetId,
        wilaya: newWilaya,
        commune: newCommune,
        address: newAddress,
        latitude: parsedLat,
        longitude: parsedLng,
      });

      if (!res.success) {
        console.error("Save creator location action failed:", res.error);
        // Rollback on failure
        setCreators(previousCreators);
        setIsEditorOpen(true);
        toast.error("Erreur de sauvegarde : " + res.error, { id: "gps-save" });
      }
    } catch (err: any) {
      console.error("Save creator location action threw error:", err);
      setCreators(previousCreators);
      setIsEditorOpen(true);
      toast.error("Erreur lors de la sauvegarde : " + (err?.message || "Inconnue"), { id: "gps-save" });
    } finally {
      setSaving(false);
    }
  };

  const handleClearCoordinates = async () => {
    if (!selectedCreator) return;
    if (!confirm("Voulez-vous supprimer les coordonnées GPS de cette créatrice ?")) return;

    setSaving(true);
    const previousCreators = creators;
    const targetId = selectedCreator.id;

    // Optimistic clear
    setFormLat("");
    setFormLng("");
    setCreators((prev) =>
      prev.map((c) =>
        c.id === targetId ? { ...c, latitude: null, longitude: null } : c
      )
    );
    toast.success("Coordonnées GPS supprimées.", { id: "gps-clear" });

    try {
      const res = await clearCreatorCoordinatesAction(targetId);
      if (!res.success) {
        setCreators(previousCreators);
        toast.error("Erreur lors de la suppression : " + res.error, { id: "gps-clear" });
      }
    } catch (err: any) {
      setCreators(previousCreators);
      toast.error("Erreur lors de la suppression : " + (err?.message || "Inconnue"), { id: "gps-clear" });
    } finally {
      setSaving(false);
    }
  };

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-secondary/30 p-8 text-center rounded-xl">
        <MapPin className="h-10 w-10 text-primary/40" />
        <p className="max-w-md text-sm font-medium text-muted-foreground">
          Jeton Mapbox (NEXT_PUBLIC_MAPBOX_TOKEN) manquant dans la configuration.
        </p>
      </div>
    );
  }

  // Active temporary pin preview coordinates
  const previewLat = formLat && !isNaN(Number(formLat)) ? Number(formLat) : null;
  const previewLng = formLng && !isNaN(Number(formLng)) ? Number(formLng) : null;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Top Admin Action Bar */}
      <div className="bg-card border-b border-border px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span>Total : {stats.total} créatrices</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>GPS Exact : {stats.withExplicitGps}</span>
          </div>

          {stats.withoutPosition > 0 ? (
            <button
              onClick={() => setFilterTab("unplaced")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                filterTab === "unplaced"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              )}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Sans position : {stats.withoutPosition}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Toutes positionnées
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPlacingOnMap && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium animate-pulse">
              <Crosshair className="h-4 w-4" />
              <span>Cliquez sur la carte pour déposer l'épingle</span>
              <button
                onClick={() => setIsPlacingOnMap(false)}
                className="ml-2 hover:bg-white/20 rounded p-0.5"
                title="Quitter le mode pointage"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              if (creators.length > 0) {
                openEditor(creators[0]);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span>Positionner un créateur</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Sidebar + Map */}
      <div className="relative flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Creators Directory Sidebar */}
        <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0 h-[280px] md:h-full z-10 shadow-sm">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, wilaya..."
                className="w-full pl-9 pr-4 py-2 bg-secondary/60 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-secondary/50 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterTab("all")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-md font-medium transition-all text-center cursor-pointer",
                  filterTab === "all"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Tous ({creators.length})
              </button>
              <button
                onClick={() => setFilterTab("placed")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-md font-medium transition-all text-center cursor-pointer",
                  filterTab === "placed"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                GPS OK ({stats.withExplicitGps})
              </button>
              <button
                onClick={() => setFilterTab("unplaced")}
                className={cn(
                  "flex-1 py-1 px-2 rounded-md font-medium transition-all text-center cursor-pointer",
                  filterTab === "unplaced"
                    ? "bg-card text-amber-600 shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sans GPS ({creators.length - stats.withExplicitGps})
              </button>
            </div>
          </div>

          {/* Creators List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredCreators.length > 0 ? (
              filteredCreators.map((creator) => {
                const isSelected = selectedCreatorId === creator.id;
                const hasGps = creator.latitude !== null && creator.longitude !== null;
                const initials = `${creator.ownerFirstName?.charAt(0) || ""}${creator.ownerLastName?.charAt(0) || ""}` || "CR";

                return (
                  <div
                    key={creator.id}
                    onClick={() => {
                      setSelectedCreatorId(creator.id);
                      if (hasGps) {
                        flyTo(creator.latitude!, creator.longitude!, 13);
                      } else if (creator.wilaya) {
                        const w = ALGERIA_WILAYAS.find(
                          (item) => item.name_fr.toLowerCase() === creator.wilaya!.toLowerCase()
                        );
                        if (w) flyTo(w.lat, w.lng, 9);
                      }
                    }}
                    className={cn(
                      "p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors group",
                      isSelected
                        ? "bg-primary/5 border-s-4 border-s-primary"
                        : "hover:bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-xs text-primary overflow-hidden">
                        {creator.ownerAvatarUrl ? (
                          <img
                            src={creator.ownerAvatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-foreground truncate">
                            {creator.ownerFirstName} {creator.ownerLastName}
                          </p>
                          {creator.isVerified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        {creator.shopName && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {creator.shopName}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary font-medium text-foreground">
                            {creator.wilaya || "Wilaya non définie"}
                          </span>
                          {hasGps ? (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              GPS OK
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                              <AlertCircle className="h-3 w-3" />
                              Sans GPS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditor(creator);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-white text-[11px] font-bold text-foreground transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Modifier la position GPS"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Éditer</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Aucune créatrice trouvée
              </div>
            )}
          </div>
        </aside>

        {/* Interactive Map */}
        <div className="relative flex-1 h-full min-h-[300px]">
          <Map
            ref={mapRef}
            mapboxAccessToken={mapboxToken}
            initialViewState={{
              latitude: ALGERIA_CENTER.lat,
              longitude: ALGERIA_CENTER.lng,
              zoom: ALGERIA_DEFAULT_ZOOM,
            }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: "100%", height: "100%" }}
            onClick={handleMapClick}
            cursor={isEditorOpen ? "crosshair" : "grab"}
          >
            <NavigationControl position="bottom-left" />

            {/* Positioned Atelier Markers */}
            {positionedCreators
              .filter((creator) => !isEditorOpen || creator.id !== selectedCreatorId)
              .map((creator) => {
                const isSelected = selectedCreatorId === creator.id;
                const hasExactCoords = creator.hasExplicitCoords;

                return (
                  <Marker
                    key={creator.id}
                    longitude={creator.position.lng}
                    latitude={creator.position.lat}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      if (isEditorOpen) return;
                      setSelectedCreatorId(creator.id);
                    }}
                  >
                    <button
                      type="button"
                      disabled={isEditorOpen}
                      className={cn(
                        "flex items-center justify-center rounded-full border-2 shadow-md transition-all duration-200",
                        isEditorOpen ? "opacity-35 cursor-default" : "cursor-pointer",
                        isSelected
                          ? "h-10 w-10 border-primary bg-primary text-white scale-110 ring-4 ring-primary/20 z-20"
                          : hasExactCoords
                          ? "h-8 w-8 border-emerald-500 bg-white text-emerald-600 hover:scale-110 z-10"
                          : "h-7 w-7 border-amber-500 bg-white text-amber-600 hover:scale-110 opacity-80"
                      )}
                      title={`${creator.ownerFirstName} ${creator.ownerLastName} (${creator.wilaya || "Non défini"})`}
                    >
                      <MapPin className={cn(isSelected ? "h-5 w-5" : "h-4 w-4")} fill="currentColor" />
                    </button>
                  </Marker>
                );
              })}

            {/* Temporary Marker when Editing/Placing Position */}
            {isEditorOpen && previewLat !== null && previewLng !== null && (
              <Marker
                longitude={previewLng}
                latitude={previewLat}
                anchor="bottom"
                draggable
                onDrag={(e) => {
                  setFormLat(e.lngLat.lat.toFixed(6));
                  setFormLng(e.lngLat.lng.toFixed(6));
                }}
                onDragEnd={(e) => {
                  setFormLat(e.lngLat.lat.toFixed(6));
                  setFormLng(e.lngLat.lng.toFixed(6));
                  toast.success(
                    `Épingle placée : ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`,
                    { id: "gps-drag" }
                  );
                }}
              >
                <div
                  className="flex flex-col items-center cursor-grab active:cursor-grabbing group select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-2xl whitespace-nowrap mb-1.5 flex items-center gap-1 border border-white/50 animate-bounce">
                    <Crosshair className="h-3 w-3" />
                    <span>Glisser pour ajuster</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white shadow-2xl ring-4 ring-primary/30">
                      <MapPin className="h-6 w-6" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </Marker>
            )}

            {/* Popup on Selected Creator when not in editor */}
            {!isEditorOpen && selectedCreator && (
              (() => {
                const pos = resolveAtelierPosition({
                  id: selectedCreator.id,
                  wilaya: selectedCreator.wilaya,
                  latitude: selectedCreator.latitude,
                  longitude: selectedCreator.longitude,
                });
                if (!pos) return null;

                return (
                  <Popup
                    longitude={pos.lng}
                    latitude={pos.lat}
                    anchor="top"
                    onClose={() => setSelectedCreatorId(null)}
                    closeButton={true}
                    className="admin-map-popup"
                  >
                    <div className="p-3 max-w-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-foreground">
                          {selectedCreator.ownerFirstName} {selectedCreator.ownerLastName}
                        </div>
                        {selectedCreator.isVerified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Vérifiée
                          </span>
                        )}
                      </div>

                      {selectedCreator.shopName && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {selectedCreator.shopName}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border">
                        <p>📍 <strong>Wilaya :</strong> {selectedCreator.wilaya || "—"}</p>
                        <p>🏘️ <strong>Commune :</strong> {selectedCreator.commune || "—"}</p>
                        <p>🏢 <strong>Adresse :</strong> {selectedCreator.address || "—"}</p>
                        <p>
                          🌐 <strong>GPS :</strong>{" "}
                          {selectedCreator.latitude !== null && selectedCreator.longitude !== null ? (
                            <span className="text-emerald-600 font-mono text-[11px]">
                              {selectedCreator.latitude.toFixed(4)}, {selectedCreator.longitude.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Non défini</span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => openEditor(selectedCreator)}
                          className="w-full py-1.5 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Modifier la position
                        </button>
                      </div>
                    </div>
                  </Popup>
                );
              })()
            )}
          </Map>

          {/* Quick Floating Guidance Bar when Editor is Open */}
          {isEditorOpen && selectedCreator && (
            <div className="absolute top-4 left-4 z-20 bg-card/95 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 max-w-md pointer-events-auto">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Crosshair className="h-4 w-4 animate-pulse" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">
                  Positionnement : {selectedCreator.ownerFirstName} {selectedCreator.ownerLastName}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Cliquez directement sur la carte ou glissez l'épingle pour modifier la position.
                </p>
              </div>
              {previewLat !== null && previewLng !== null && (
                <button
                  type="button"
                  onClick={() => flyTo(previewLat, previewLng, 14)}
                  className="ml-auto text-[11px] font-bold text-primary hover:underline shrink-0 cursor-pointer"
                >
                  Centrer
                </button>
              )}
            </div>
          )}

          {/* Floating Non-Blocking Position Editor Panel */}
          {isEditorOpen && selectedCreator && (
            <div className="absolute top-4 right-4 bottom-4 z-30 w-[calc(100%-2rem)] max-w-sm sm:max-w-md pointer-events-auto flex flex-col">
              {isEditorMinimized ? (
                /* Minimized floating bottom-right bar */
                <div className="mt-auto bg-card/98 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 flex flex-col gap-2.5 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">
                          {selectedCreator.ownerFirstName} {selectedCreator.ownerLastName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {previewLat !== null && previewLng !== null ? (
                            <span className="text-emerald-600 font-mono font-semibold">
                              📍 {previewLat.toFixed(4)}, {previewLng.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Cliquez sur la carte</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsEditorMinimized(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Agrandir le formulaire"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Détails</span>
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSavePosition}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{saving ? "..." : "Enregistrer"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditorOpen(false);
                          setIsEditorMinimized(false);
                        }}
                        className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Fermer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-primary bg-primary/5 rounded-lg px-2.5 py-1 text-center font-medium">
                    🎯 Mode édition actif : Cliquez n'importe où sur la carte ou glissez l'épingle pour positionner l'atelier.
                  </p>
                </div>
              ) : (
                /* Full Floating Card */
                <div className="w-full bg-card/98 backdrop-blur-md border border-border rounded-2xl shadow-2xl flex flex-col h-full max-h-[88vh] overflow-hidden animate-in slide-in-from-right-4 duration-300">
                  {/* Modal Header */}
                  <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-foreground">
                          Position de la Créatrice
                        </h3>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                          {selectedCreator.ownerFirstName} {selectedCreator.ownerLastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsEditorMinimized(true)}
                        className="px-2 py-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="Réduire pour voir toute la carte"
                      >
                        <Minimize2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Réduire</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditorOpen(false);
                          setIsPlacingOnMap(false);
                        }}
                        className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* Creator Overview Banner */}
                    <div className="bg-secondary/40 border border-border rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                        {selectedCreator.ownerFirstName.charAt(0)}
                        {selectedCreator.ownerLastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {selectedCreator.ownerFirstName} {selectedCreator.ownerLastName}
                        </p>
                        <p className="text-muted-foreground text-[10px] truncate">
                          {selectedCreator.shopName || "Atelier indépendant"} • {selectedCreator.ownerPhone || "Téléphone non renseigné"}
                        </p>
                      </div>
                    </div>

                    {/* Wilaya Selection */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground flex items-center justify-between">
                        <span>Wilaya (58 Wilayas)</span>
                        {formWilaya && (
                          <button
                            type="button"
                            onClick={() => handleWilayaChange(formWilaya)}
                            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-normal cursor-pointer"
                          >
                            <Compass className="h-3 w-3" />
                            Centrer carte
                          </button>
                        )}
                      </label>
                      <select
                        value={formWilaya}
                        onChange={(e) => handleWilayaChange(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Sélectionner une Wilaya...</option>
                        {ALGERIA_WILAYAS.map((w) => (
                          <option key={w.code} value={w.name_fr}>
                            {w.code} - {w.name_fr} ({w.name_ar})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Commune & Address */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-bold text-foreground">Commune / Ville</label>
                        <input
                          type="text"
                          value={formCommune}
                          onChange={(e) => setFormCommune(e.target.value)}
                          placeholder="Ex: Bab El Oued, Sidi M'Hamed..."
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-foreground">Adresse complète / Rue</label>
                        <input
                          type="text"
                          value={formAddress}
                          onChange={(e) => setFormAddress(e.target.value)}
                          placeholder="Ex: 12 Rue Didouche Mourad..."
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* GPS Coordinates Section */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-foreground flex items-center gap-1.5">
                          <Crosshair className="h-3.5 w-3.5 text-primary" />
                          <span>Coordonnées GPS Directes</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setIsEditorMinimized(true);
                            toast("Cliquez sur la carte ou glissez l'épingle pour positionner l'atelier !", { icon: "📍" });
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all flex items-center gap-1 cursor-pointer"
                          title="Réduire pour pointer directement sur la carte en grand"
                        >
                          <Crosshair className="h-3 w-3" />
                          <span>Pointer plein écran</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground">Latitude (ex: 36.7528)</span>
                          <input
                            type="number"
                            step="any"
                            value={formLat}
                            onChange={(e) => setFormLat(e.target.value)}
                            placeholder="36.7528"
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground">Longitude (ex: 3.0420)</span>
                          <input
                            type="number"
                            step="any"
                            value={formLng}
                            onChange={(e) => setFormLng(e.target.value)}
                            placeholder="3.0420"
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>

                      {previewLat !== null && previewLng !== null && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between text-emerald-700">
                          <span className="text-[11px] font-mono">
                            📍 {previewLat.toFixed(5)}, {previewLng.toFixed(5)}
                          </span>
                          <button
                            type="button"
                            onClick={() => flyTo(previewLat, previewLng, 14)}
                            className="text-[11px] font-bold underline hover:text-emerald-900 cursor-pointer"
                          >
                            Centrer sur carte
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-5 py-3.5 border-t border-border bg-secondary/30 flex items-center justify-between gap-3 shrink-0">
                    {selectedCreator.latitude !== null && selectedCreator.longitude !== null ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleClearCoordinates}
                        className="px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Supprimer les coordonnées GPS"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Effacer GPS
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setIsEditorOpen(false);
                          setIsPlacingOnMap(false);
                        }}
                        className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSavePosition}
                        className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
