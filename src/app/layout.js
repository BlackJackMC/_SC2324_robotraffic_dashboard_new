import "./globals.css";
import { theme } from "@/design/theme";
import { ThemeProvider } from "@mui/material";

export const metadata = {
	title: "Robotraffic dashboard",
	description: "A dashboard for robotraffic",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<ThemeProvider theme={theme}>
				<body>{children}</body>
			</ThemeProvider>
		</html>
	);
}
