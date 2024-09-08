"use client"
import { useState } from "react";
import { Button } from "@mui/material";

export default function ActionButton({ children, onClickHandler, disabled, ...props }) {
  const [isDisabled, setDisabled] = useState(false);
  return (
    <Button fullWidth={true} variant="contained" disabled={isDisabled || disabled} onClick={async () => { if (!disabled) { setDisabled(true); await onClickHandler(); setDisabled(false); } }} {...props}>{children}</Button>
  );
}