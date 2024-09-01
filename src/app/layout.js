import "./globals.css";
import { lightTheme, darkTheme } from "@/design/theme"
import CustomThemeProvider from "@/components/CustomThemeProvider";

export const metadata = {
  title: "Robotraffic dashboard",
  description: "A dashboard for robotraffic",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <CustomThemeProvider lightTheme={lightTheme} darkTheme={darkTheme}>
        <body>{children}</body>
      </CustomThemeProvider>
    </html>
  );
}
