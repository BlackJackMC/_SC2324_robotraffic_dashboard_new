import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { customTheme } from "@/design/theme";

export const metadata = {
  title: "Robotraffic dashboard",
  description: "A dashboard for robotraffic",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider theme={customTheme}>
        <body>{children}</body>
      </ThemeProvider>
    </html>
  );
}
