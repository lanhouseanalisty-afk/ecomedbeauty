import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function exportToCSV(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;

  const csvContent = [
    headers.join(";"),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        if (typeof value === "string" && value.includes(";")) return `"${value}"`;
        return value;
      }).join(";")
    )
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.json`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function formatDate(date: string | null | undefined, formatStr: string = "dd/MM/yyyy"): string {
  if (!date) return "-";
  try {
    return format(new Date(date), formatStr, { locale: ptBR });
  } catch {
    return date;
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "-";
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return date;
  }
}

export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0%";
  return `${formatNumber(value, 1)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: "success",
    pending: "warning", 
    processing: "info",
    completed: "success",
    delivered: "success",
    shipped: "primary",
    cancelled: "destructive",
    overdue: "destructive",
    paid: "success",
    inactive: "muted",
    draft: "muted",
    scheduled: "info",
    in_transit: "primary",
    exception: "destructive",
    expiring: "warning",
    expired: "muted",
    open: "info",
    resolved: "success",
    closed: "muted",
  };
  return colorMap[status] || "muted";
}
