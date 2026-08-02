"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  type TooltipValueType,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DailyData {
  date: string;
  orders: number;
  revenue: number;
  users: number;
}

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

export default function AdminStatsPage() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [roleDist, setRoleDist] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [categoryDist, setCategoryDist] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [kpis, setKpis] = useState({
    revenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();

        const [
          { data: profiles, error: profilesError },
          { data: orders, error: ordersError },
          { data: creatorProfiles, error: cpError }
        ] = await Promise.all([
          supabase.from("profiles").select("id, role, created_at"),
          supabase.from("orders").select("id, price, status, created_at"),
          supabase.from("creator_profiles").select("category")
        ]);

        if (profilesError) console.error("Profiles error:", profilesError);
        if (ordersError) console.error("Orders error:", ordersError);
        if (cpError) console.error("Creator profiles error:", cpError);

        const completedOrders =
          orders?.filter((o) => o.status === "completed") || [];
        const totalRevenue = completedOrders.reduce(
          (s, o) => s + Number(o.price),
          0
        );
        const avgValue =
          completedOrders.length > 0
            ? totalRevenue / completedOrders.length
            : 0;

        setKpis({
          revenue: totalRevenue,
          avgOrderValue: avgValue,
          completedOrders: completedOrders.length,
          activeUsers: profiles?.length || 0,
        });

        // Role distribution
        const clientCount =
          profiles?.filter((p) => p.role === "client").length || 0;
        const coutCount =
          profiles?.filter((p) => p.role === "creator").length || 0;
        const adminCount =
          profiles?.filter((p) => p.role === "admin").length || 0;
        setRoleDist([
          { name: "Clients", value: clientCount, color: "#5048e5" },
          { name: "Créatrices", value: coutCount, color: "#818cf8" },
          { name: "Admins", value: adminCount, color: "#22c55e" },
        ]);

        // Category distribution
        const catMap: Record<string, number> = {};
        creatorProfiles?.forEach((cp) => {
          const cat = cp.category || "Autre";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const catColors = [
          "#5048e5",
          "#818cf8",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
        ];
        setCategoryDist(
          Object.entries(catMap).map(([name, value], i) => ({
            name:
              name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
            value,
            color: catColors[i % catColors.length],
          }))
        );

        // Daily data
        const days = parseInt(period);
        const daily: DailyData[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const label = date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          });
          const dayOrders =
            orders?.filter((o) => o.created_at?.startsWith(dateStr)) || [];
          const dayUsers =
            profiles?.filter((p) => p.created_at?.startsWith(dateStr)) || [];
          daily.push({
            date: label,
            orders: dayOrders.length,
            revenue: dayOrders.reduce((s, o) => s + Number(o.price), 0),
            users: dayUsers.length,
          });
        }
        setDailyData(daily);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(80, 72, 229); // Primary color
    doc.text("MALIXA - Rapport Statistique", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Genere le: ${new Date().toLocaleString("fr-FR")}`, 14, 30);
    doc.text(`Periode: ${period} derniers jours`, 14, 35);
    
    doc.setDrawColor(230);
    doc.line(14, 40, 196, 40);

    // KPI Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Resumé des Indicateurs Clés", 14, 50);
    
    const kpiData = [
      ["Revenus Totaux", `${kpis.revenue.toLocaleString()} DA`],
      ["Valeur Moyenne Commande", `${Math.round(kpis.avgOrderValue).toLocaleString()} DA`],
      ["Commandes Terminées", kpis.completedOrders.toString()],
      ["Utilisateurs Actifs", kpis.activeUsers.toString()]
    ];

    autoTable(doc, {
      startY: 55,
      head: [["Indicateur", "Valeur"]],
      body: kpiData,
      theme: "striped",
      headStyles: { fillColor: [80, 72, 229] },
    });

    // Daily Activity Section
    const nextY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 15;
    doc.text("Activité Quotidienne Détaille", 14, nextY);

    const tableData = dailyData.map(day => [
      day.date,
      day.orders.toString(),
      `${day.revenue.toLocaleString()} DA`,
      day.users.toString()
    ]);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Date", "Commandes", "Revenus", "Inscriptions"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [100, 116, 139] },
    });

    doc.save(`rapport_malixa_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Statistiques Plateforme
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Performance détaillée de l&apos;écosystème MALIXA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-2 bg-secondary/50 focus:outline-none focus:border-primary"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 mois</option>
          </select>
          <Button variant="outline" className="bg-white" onClick={handleExport}>
            <span className="material-icons text-sm mr-2">download</span>
            Exporter
          </Button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Revenus Total",
            value: `${kpis.revenue.toLocaleString()} DA`,
            icon: "payments",
            color: "text-success",
            note: "Basé sur les prix des commandes saisis — en attente de l'intégration du gateway de paiement",
          },
          {
            label: "Valeur Moy. Commande",
            value: `${Math.round(kpis.avgOrderValue).toLocaleString()} DA`,
            icon: "receipt_long",
            color: "text-primary",
          },
          {
            label: "Commandes Terminées",
            value: kpis.completedOrders.toString(),
            icon: "check_circle",
            color: "text-success",
          },
          {
            label: "Utilisateurs Actifs",
            value: kpis.activeUsers.toLocaleString(),
            icon: "group",
            color: "text-primary",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-icons ${kpi.color} text-lg`}>
                {kpi.icon}
              </span>
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            {'note' in kpi && kpi.note && (
              <p className="text-[10px] text-amber-600 mt-2 leading-relaxed font-medium">
                ⚠ {kpi.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Over Time */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Revenus dans le temps
          </h2>
          {dailyData.some((d) => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient
                    id="revGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e5e5"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#737373", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#737373", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: TooltipValueType | undefined) => [
                    `${Number(value ?? 0).toLocaleString()} DA`,
                    "Revenus",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <span className="material-icons text-4xl mb-2 opacity-30">
                show_chart
              </span>
              <p className="text-sm">Aucune donnée de revenus</p>
            </div>
          )}
        </div>

        {/* New User Registrations */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Nouvelles Inscriptions
          </h2>
          {dailyData.some((d) => d.users > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e5e5"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#737373", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#737373", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="users"
                  name="Inscriptions"
                  fill="#5048e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <span className="material-icons text-4xl mb-2 opacity-30">
                person_add
              </span>
              <p className="text-sm">Aucune inscription récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">
            Répartition des Rôles
          </h2>
          {roleDist.some((r) => r.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roleDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {roleDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Aucune donnée</p>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">
            Catégories des Créatrices
          </h2>
          {categoryDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {categoryDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
              <span className="material-icons text-4xl mb-2 opacity-30">
                category
              </span>
              <p className="text-sm">
                Aucune catégorie de couturière définie
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
