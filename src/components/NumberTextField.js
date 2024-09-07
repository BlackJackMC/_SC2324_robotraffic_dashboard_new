import { TextField } from "@mui/material";

export default function NumberTextField({ disabled, ...props }) {
  return (
    <TextField slotProps={{ inputLabel: { classes: { asterisk: "hidden" } } }}
      fullWidth={true} required variant="standard" {...props} />
  );
}