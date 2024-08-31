"use client"
import { Container, Grid2 } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import mqtt from 'mqtt';

import mqttClientContext from "@/context/mqttClientContext";
import ParameterBoard from "@/layout/ParameterBoard";

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
      <Container maxWidth="lg" className="mt-3">
        <Grid2 container spacing={2}>
          <Grid2 size={4}><ParameterBoard /></Grid2>
          <Grid2 size={8}></Grid2>
        </Grid2>
      </Container >
    </mqttClientContext.Provider>
  );
}