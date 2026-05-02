import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { NotifType } from "@/lib/types";

export type FilterValue = NotifType | "All";

const values: FilterValue[] = ["All", "Placement", "Result", "Event"];

interface Props {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}

export default function TypeFilter({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      size="small"
      sx={{ flexWrap: "wrap" }}
    >
      {values.map((v) => (
        <ToggleButton key={v} value={v}>
          {v}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
