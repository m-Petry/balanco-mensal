import * as React from "react";
import { ptBR } from "date-fns/locale";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";

export interface MuiMonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export default function MuiMonthPicker({ value, onChange, className }: MuiMonthPickerProps) {
  return (
    <div className={className}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={value}
          onChange={(newValue) => {
            if (newValue) onChange(newValue as Date);
          }}
          views={["year", "month"]}
          slotProps={{
            actionBar: { actions: [] },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}
