"use client"
import { useState } from "react";
import { Button } from "@mui/material";

export default function ActionButton({ children, ...props }) {
  const [isActive, setActive] = useState(false);

  return (
    <Button fullWidth={true} variant="contained" disabled={props.disabled ? disabled : isActive} onClick={() => { setActive(true); props.onClickHandler(); setActive(false); }} {...props}>{children}</Button>
  );
}