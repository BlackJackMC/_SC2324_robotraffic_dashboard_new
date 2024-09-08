"use client"
import { Container, Grid2 } from "@mui/material";
import { useEffect, useRef } from "react";
import mqtt from 'mqtt';

import mqttClientContext from "@/context/mqttClientContext";
import ParameterBoard from "@/layout/ParameterBoard";
import GraphDisplay from "@/layout/GraphDisplay";
import SetupBoard from "@/layout/SetupBoard";

export default function Dashboard() {
  const client = useRef(null);

  useEffect(() => {
    client.current = mqtt.connect(process.env["NEXT_PUBLIC_MQTT_URL"],
      {
        username: process.env["NEXT_PUBLIC_MQTT_USERNAME"],
        password: process.env["NEXT_PUBLIC_MQTT_PASS"],
      });

    const topic = [
      // "output/parameter/all",
      "input/parameter",
      "output/state",
      "output/parameter/PID/input",
      "output/parameter/PID/output",
    ];

    client.current.on("connect", () => {
      client.current.subscribe(topic)
    });

    return () => {
      if (client.current) client.current.end();
    };
  }, []);

  return (
    <mqttClientContext.Provider value={client}>
      <Container maxWidth="xl" className="mt-3">
        <Grid2 container spacing={2}>
          <Grid2 size={{ lg: 3, md: 6, sm: 12 }} order={{ sm: 1 }}><ParameterBoard /></Grid2>
          <Grid2 size={{ lg: 6, md: 12, sm: 12 }} order={{ lg: 2, sm: 3 }} className="h-svh max-h-svh"><GraphDisplay /></Grid2>
          <Grid2 size={{ lg: 3, md: 6, sm: 12 }} order={{ lg: 3, sm: 2 }}><SetupBoard /></Grid2>
        </Grid2>
      </Container >
    </mqttClientContext.Provider>
  );
}