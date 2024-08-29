'use client'
import { createTheme } from "@mui/material/styles";
import { Poppins } from "next/font/google";
import LinkBehaviour from "@/helper/LinkBehavior";

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '500', '600', '700'] });


const customTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: poppins.style.fontFamily
  },
  // components: {
  //   MuiLink: {
  //       defaultProps: {
  //           component: LinkBehaviour
  //       }
  //   },
  //   MuiButtonBase: {
  //       defaultProps: {
  //           LinkComponent: LinkBehaviour
  //       }
  //   }
  // },
});

module.exports = {customTheme};