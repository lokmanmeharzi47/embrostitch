"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string | null;
  city: string | null;
  phone: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers((data || []) as UserProfile[]);
      setFiltered((data || []) as UserProfile[]);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          (u.city && u.city.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const handleDelete = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Utilisateur supprimé");
    }
    setConfirmDelete(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("Rôle mis à jour");
    }
  };

  const roleColors: Record<string, string> = {
    client: "bg-primary/10 text-primary",
    creator: "bg-indigo-100 text-indigo-700",
    admin: "bg-warning/10 text-warning",
  };

  const roleLabels: Record<string, string> = {
    client: "Client",
    creator: "Créatrice",
    admin: "Admin",
  };

  if (loading) {
    return (
      <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="h-16 bg-muted rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} sur la
            plateforme.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tous les rôles</option>
            <option value="client">Clients</option>
            <option value="creator">Créatrices</option>
            <option value="creator">Creators</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Rôle</th>
                <th className="px-6 py-4 font-medium">Ville</th>
                <th className="px-6 py-4 font-medium">Inscrit le</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-secondary/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-xs">
                            {user.first_name.charAt(0)}
                            {user.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border-0 cursor-pointer ${
                          roleColors[user.role] || "bg-secondary"
                        }`}
                      >
                        <option value="client">Client</option>
                        <option value="creator">Créatrice</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {user.city || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {confirmDelete === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-destructive hover:bg-destructive/90 text-xs"
                            onClick={() => handleDelete(user.id)}
                          >
                            Confirmer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Supprimer"
                          onClick={() => setConfirmDelete(user.id)}
                        >
                          <span className="material-icons text-[18px]">
                            delete
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <span className="material-icons text-4xl text-muted-foreground/30 mb-2 block">
                      search_off
                    </span>
                    <p className="text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Affichage de {filtered.length} sur {users.length} utilisateurs
          </p>
        </div>
      </div>
    </>
  );
}
