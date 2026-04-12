import React from 'react';

import Button from '@/components/ui/Button';

const transactions = [
  { id: 'TXN-01', desc: 'Custom Silk Evening Gown (Deposit)', date: 'Oct 12, 2023', amount: '$150.00', status: 'Pending' },
  { id: 'TXN-02', desc: 'Bespoke 3-Piece Wool Suit (Final)', date: 'Oct 01, 2023', amount: '$320.00', status: 'Completed' },
  { id: 'TXN-03', desc: 'Hand-Embroidered Linen Shirt', date: 'Sep 05, 2023', amount: '$120.00', status: 'Completed' },
  { id: 'TXN-04', desc: 'Vintage Denim Restoration', date: 'Aug 21, 2023', amount: '$85.00', status: 'Completed' },
];

export default function ClientPaymentsPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Payment History</h1>
          <p className="text-muted-foreground max-w-xl">
            Manage your transactions, download invoices, and track your service spending.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="bg-white">
             <span className="material-icons text-sm mr-2">download</span>
             Export CSV
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Lifetime Spending</h3>
            <p className="text-2xl font-bold text-foreground">$4,250.00</p>
         </div>
         <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Awaiting Approval</h3>
            <p className="text-2xl font-bold text-warning">$150.00</p>
         </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Transaction ID</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Description</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Amount</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{txn.id}</td>
                  <td className="px-6 py-4 text-muted-foreground">{txn.desc}</td>
                  <td className="px-6 py-4 text-muted-foreground">{txn.date}</td>
                  <td className="px-6 py-4 font-bold text-foreground">{txn.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                      txn.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:underline font-medium text-xs">Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-6 py-4 flex items-center justify-between text-sm text-muted-foreground bg-secondary/20">
           <p>Showing 1 to 4 of 28 transactions</p>
           <div className="flex gap-2">
             <button className="px-3 py-1 rounded border border-border bg-white hover:bg-secondary disabled:opacity-50" disabled>&lt;</button>
             <button className="px-3 py-1 rounded border border-border bg-white hover:bg-secondary">&gt;</button>
           </div>
        </div>
      </div>

    </>
  );
}
