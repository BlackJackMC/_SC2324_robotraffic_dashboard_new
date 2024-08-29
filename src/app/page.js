"use client"
import { useState, useEffect, useRef } from 'react';
import { TextField, Box, Container, Grid2, Typography, FormControlLabel, FormGroup, Switch } from "@mui/material";
import mqtt from 'mqtt';

function NumberTextField({ label, name, value, onChange, ...props }) {
  return (
    <>
      <TextField className="mt-4" slotProps={{ inputLabel: { shrink: true, }, htmlInput: { step: 0.01 } }} fullWidth required type="number" label={label} name={name} value={value} onChange={onChange} {...props} />
    </>
  );
}


export default function Home() {
  const [P, setP] = useState(0);
  const [I, setI] = useState(0);
  const [D, setD] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [target, setTarget] = useState(0);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [canGo, setCanGo] = useState(true);
  const [direction, setDirection] = useState(true);

  const client = useRef(null);

  useEffect(() => {
    client.current = mqtt.connect(process.env["NEXT_PUBLIC_MQTT_URL"],
      {
        username: process.env["NEXT_PUBLIC_MQTT_USERNAME"],
        password: process.env["NEXT_PUBLIC_MQTT_PASS"],
      });

    const handler = {
      "output/parameter/PID/P": (message) => { setP(parseInt(message)); },
      "output/parameter/PID/I": (message) => { setI(parseInt(message)); },
      "output/parameter/PID/D": (message) => { setD(parseInt(message)); },
      "output/parameter/setpoint": (message) => { setTarget(parseInt(message)); },
      "output/parameter/canGo": (message) => { setCanGo(parseInt(message) >= 0); },
      "output/parameter/current_checkpoint": (message) => { setCurrentCheckpoint(parseInt(message)); },
      "output/parameter/speed": (message) => { setSpeed(parseInt(message)); },
      "output/parameter/direction": (message) => { setDirection(parseInt(message)); },
    }

    client.current.on("connect", () => {
      Object.keys(handler).forEach((topic) => {
        client.current.subscribe(topic, (err) => { if (err) { console.error(`Error: ${err}`); } });
      });
    });

    client.current.on("message", (topic, message) => {
      if (handler[topic]) {
        handler[topic](message);
      } else {
        console.warn(`No handler for ${topic}`);
      }
    });

    return () => {
      if (client.current) client.current.end();
    };
  }, []);

  useEffect(() => {if (client.current) client.current.publish("input/parameter/PID/P", P.toString())}, [P]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/PID/I", I.toString())}, [I]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/PID/D", D.toString())}, [D]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/setpoint", target.toString())}, [target]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/canGo", (canGo ? 1 : 0).toString())}, [canGo]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/current_checkpoint", currentCheckpoint.toString())}, [currentCheckpoint]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/speed", speed.toString())}, [speed]);
  useEffect(() => {if (client.current) client.current.publish("input/parameter/direction", (direction ? 1 : 0).toString())}, [direction]);


  return (
    <Container component="main" maxWidth="lg" className="mt-3">
      <Grid2 container spacing={2}>
        <Grid2 size={4}>
          <Box className="flex flex-col" component="form" onSubmit={(e) => { e.preventDefault(); }}>
            <FormGroup>
              <NumberTextField label="P" name="P" value={P} onChange={(e) => setP(e.target.value)} />
              <NumberTextField label="I" name="I" value={I} onChange={(e) => setI(e.target.value)} />
              <NumberTextField label="D" name="D" value={D} onChange={(e) => setD(e.target.value)} />
              <NumberTextField label="setpoint" name="setpoint" value={target} onChange={(e) => setTarget(e.target.value)} />
              <NumberTextField label="current checkpoint" name="current checkpoint" value={currentCheckpoint} onChange={(e) => setCurrentCheckpoint(e.target.value)} />
              <NumberTextField label="speed" name="speed" value={speed} onChange={(e) => setSpeed(e.target.value)} />
              <FormControlLabel control={<Switch onChange={(e) => { setCanGo(e.target.checked); }} checked={canGo} />} label={canGo ? "Go" : "Stop"} name="can go" />
              <FormControlLabel control={<Switch onChange={(e) => { setDirection(e.target.checked); }} checked={direction} />} label={direction ? "Forward" : "Backward"} name="direction" />
            </FormGroup>
          </Box>
        </Grid2>
        <Grid2 size={8}>
          <Box component="div" className="flex flex-col">
          </Box>
        </Grid2>
      </Grid2>
    </Container >
  );
}