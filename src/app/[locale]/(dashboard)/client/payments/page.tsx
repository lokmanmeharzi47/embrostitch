import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface OrderPayment {
  id: string;
  title: string;
  price: number | string | null;
  status: "pending" | "completed" | "rejected" | string;
  created_at: string;
}

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function getPriceValue(price: OrderPayment["price"]) {
  return Number(price) || 0;
}

function formatAmount(price: OrderPayment["price"]) {
  return `${getPriceValue(price).toLocaleString()} DZD`;
}

export default async function ClientPaymentsPage() {
  const t = await getTranslations('Payments');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, title, price, status, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load payment history: ${error.message}`);
  }

  const clientOrders = (orders || []) as OrderPayment[];
  const lifetimeSpending = clientOrders
    .filter((order) => order.status === "completed")
    .reduce((total, order) => total + getPriceValue(order.price), 0);
  const awaitingApproval = clientOrders
    .filter((order) => order.status === "pending")
    .reduce((total, order) => total + getPriceValue(order.price), 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('title')}</h1>
          <p className="text-muted-foreground max-w-xl">
            Suivez vos paiements de commandes réels et votre activité de dépenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white" disabled>
            <span className="material-icons text-sm mr-2">download</span>
            {t('comingSoon')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t('lifetimeSpending')}</h3>
          <p className="text-2xl font-bold text-foreground">{lifetimeSpending.toLocaleString()} DZD</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t('awaitingApproval')}</h3>
          <p className="text-2xl font-bold text-amber-600">{awaitingApproval.toLocaleString()} DZD</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {clientOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">{t('noPayments')}</h2>
            <p className="text-sm text-muted-foreground">
              Vos paiements apparaîtront ici une fois que vous aurez passé une commande.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">{t('transactionId')}</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">{t('description')}</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">{t('amount')}</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientOrders.map((order) => {
                    const statusClass =
                      statusBadgeClasses[order.status] || "bg-secondary text-muted-foreground border-border";

                    return (
                      <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{order.title}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">{formatAmount(order.price)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground bg-secondary/20">
              Showing {clientOrders.length} payment record{clientOrders.length === 1 ? "" : "s"}
            </div>
          </>
        )}
      </div>
    </>
  );
}
