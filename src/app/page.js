"use client"
import ParameterBoard from "@/layout/ParameterBoard";
import { Container, Grid2 } from "@mui/material";
import { useEffect, useRef } from "react";
import mqtt from 'mqtt';


export default function Home() {
  const client = useRef(null);

  useEffect(() => {
    client.current = mqtt.connect(process.env["NEXT_PUBLIC_MQTT_URL"],
      {
        username: process.env["NEXT_PUBLIC_MQTT_USERNAME"],
        password: process.env["NEXT_PUBLIC_MQTT_PASS"],
      });

    return () => {
      if (client.current) client.current.end();
    };
  }, []);

  return (
    <Container maxWidth="lg" className="mt-3">
      <Grid2 container spacing={2}>
        <Grid2 size={4}>
          <ParameterBoard client={client} />
        </Grid2>
        <Grid2 size={8}>

        </Grid2>
      </Grid2>
    </Container >
  );
}