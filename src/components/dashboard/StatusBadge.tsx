import React from 'react';

type StatusBadgeProps = {
  status: "Pending" | "In Progress" | "Completed" | "Shipped" | "Queued" | "Final Shipping" | "pending" | "accepted" | "in_progress" | "completed" | "rejected";
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "Completed":
      case "Shipped":
      case "Final Shipping":
      case "completed":
        return "bg-success/10 text-success border border-success/20";
      case "In Progress":
      case "in_progress":
      case "accepted":
        return "bg-primary/10 text-primary border border-primary/20";
      case "Pending":
      case "Queued":
      case "pending":
        return "bg-warning/10 text-warning border border-warning/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      default:
        return "bg-secondary text-muted-foreground border border-border";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "pending": return "En attente";
      case "accepted": return "Acceptée";
      case "in_progress": return "En cours";
      case "completed": return "Terminée";
      case "rejected": return "Refusée";
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles()}`}>
      {getLabel()}
    </span>
  );
}
