"use client";
import { createTheme } from "@mui/material/styles";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const theme = createTheme({
	colorSchemes: {
		dark: true,
	},
	components: {
		MuiButton: {
			variants: [
				{
					props: { variant: "ghost" },
					style: ({ theme }) => ({
						color: theme.palette.text.primary,
					}),
				},
			],
		},
	},
	typography: poppins.style.fontFamily,
});
