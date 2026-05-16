"use client";

import Button from "@/components/ui/Button";

export default function InvoiceButton() {
  const handlePrint = () => {
    // Print invoice: minimal browser-native flow until a payment gateway/invoice renderer exists.
    window.print();
  };

  return (
    <Button variant="outline" className="bg-white" onClick={handlePrint}>
      <span className="material-icons text-sm mr-2">receipt_long</span>
      Invoice
    </Button>
  );
}
