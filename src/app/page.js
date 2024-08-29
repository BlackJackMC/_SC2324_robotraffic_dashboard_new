"use client"
import ParameterBoard from "@/layout/ParameterBoard";
import { Container, Grid2 } from "@mui/material";


export default function Home() {
  return (
    <Container maxWidth="lg" className="mt-3">
      <Grid2 container spacing={2}>
        <Grid2 size={4}>
          <ParameterBoard />
        </Grid2>
        <Grid2 size={8}>

        </Grid2>
      </Grid2>
    </Container >
  );
}