import React from "react";

export interface NativeMonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

// Simple, bug-free, native month picker using <input type="month">
export default function NativeMonthPicker({ value, onChange, className }: NativeMonthPickerProps) {
  // Format to yyyy-MM for input value
  const toMonthStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; // yyyy-MM
    if (!v) return;
    const [y, m] = v.split("-").map(Number);
    // Keep day = 1 for safety
    onChange(new Date(y, m - 1, 1));
  };

  return (
    <div className={className}>
      <input
        type="month"
        value={toMonthStr(value)}
        onChange={handleChange}
        className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
