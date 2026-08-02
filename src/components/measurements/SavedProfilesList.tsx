"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pencil, Trash2, UserRound, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SavedMeasurementProfile } from "./MeasurementsClient";

interface Props {
  profiles: SavedMeasurementProfile[];
  onProfilesChange: (profiles: SavedMeasurementProfile[]) => void;
  onUseProfile: (profile: SavedMeasurementProfile) => void;
}

interface EditState {
  label: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
}

export default function SavedProfilesList({ profiles, onProfilesChange, onUseProfile }: Props) {
  const t = useTranslations("Measurements");
  const supabase = createClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (profile: SavedMeasurementProfile) => {
    setEditingId(profile.id);
    setEditState({
      label: profile.label,
      height: String(profile.height),
      bust: String(profile.bust),
      waist: String(profile.waist),
      hips: String(profile.hips),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const saveEdit = async (id: string) => {
    if (!editState) return;
    setSavingEdit(true);
    const { data, error } = await supabase
      .from("saved_measurements")
      .update({
        label: editState.label.trim() || t("defaultLabel"),
        height: Number(editState.height),
        bust: Number(editState.bust),
        waist: Number(editState.waist),
        hips: Number(editState.hips),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    setSavingEdit(false);
    if (!error && data) {
      onProfilesChange(profiles.map((p) => (p.id === id ? (data as SavedMeasurementProfile) : p)));
      cancelEdit();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    const { error } = await supabase.from("saved_measurements").delete().eq("id", id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (!error) {
      onProfilesChange(profiles.filter((p) => p.id !== id));
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <UserRound className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{t("noSavedProfiles")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {profiles.map((profile) => {
        const isEditing = editingId === profile.id;
        return (
          <div key={profile.id} className="rounded-2xl border border-border bg-card p-4">
            {isEditing && editState ? (
              <div className="space-y-3">
                <input
                  value={editState.label}
                  onChange={(e) => setEditState({ ...editState, label: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold outline-none focus:border-primary/40"
                  placeholder={t("labelPlaceholder")}
                />
                <div className="grid grid-cols-4 gap-2">
                  {(["height", "bust", "waist", "hips"] as const).map((field) => (
                    <input
                      key={field}
                      type="number"
                      value={editState[field]}
                      onChange={(e) => setEditState({ ...editState, [field]: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2 py-2 text-center text-xs outline-none focus:border-primary/40"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(profile.id)}
                    disabled={savingEdit}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {t("save")}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{profile.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("summaryLine", {
                      height: profile.height,
                      bust: profile.bust,
                      waist: profile.waist,
                      hips: profile.hips,
                    })}
                  </p>
                  {profile.recommended_size && (
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                      {profile.recommended_size}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => onUseProfile(profile)}
                    className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
                  >
                    {t("use")}
                  </button>
                  <button
                    onClick={() => startEdit(profile)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary"
                    aria-label={t("edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    disabled={deletingId === profile.id}
                    className={`flex h-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors ${
                      confirmDeleteId === profile.id
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border text-muted-foreground hover:text-destructive"
                    }`}
                    aria-label={t("delete")}
                  >
                    {deletingId === profile.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : confirmDeleteId === profile.id ? (
                      t("confirmDelete")
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
