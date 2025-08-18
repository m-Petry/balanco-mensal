import React from "react";
import DatePicker from "react-datepicker";

export interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

/**
 * MonthPicker
 * A lightweight wrapper around react-datepicker configured for month/year selection only.
 */
export default function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  return (
    <div className={className}>
      <DatePicker
        selected={value}
        onChange={(date: Date | null) => {
          if (date) onChange(date);
        }}
        dateFormat="MMMM yyyy"
        showMonthYearPicker
        inline
      />
    </div>
  );
}
