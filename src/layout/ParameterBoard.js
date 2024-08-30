"use client"
import { useState, useEffect } from 'react';
import { TextField, Box, Grid2, FormControlLabel, FormGroup, Switch, Slider, Button, Typography } from "@mui/material";

function NumberTextField({ ...props }) {
  return (
    <>
      <TextField slotProps={{ inputLabel: { classes: { asterisk: "hidden" } }, htmlInput: { step: props.step ? props.step : 0.01 } }} fullWidth required type="number" variant="standard" {...props} />
    </>
  );
}

export default function ParameterBoard({ client }) {
  const [isSending, setSending] = useState(false);
  const [P, setP] = useState(0);
  const [I, setI] = useState(0);
  const [D, setD] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [target, setTarget] = useState(0);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [canGo, setCanGo] = useState(false);
  const [direction, setDirection] = useState(true);

  const handleSend = () => {
    if (client.current) {
      setSending(true);
      client.current.publish("input/parameter/PID/P", P.toString(), { retain: true });
      client.current.publish("input/parameter/PID/I", I.toString(), { retain: true });
      client.current.publish("input/parameter/PID/D", D.toString(), { retain: true });
      client.current.publish("input/parameter/setpoint", target.toString(), { retain: true });
      client.current.publish("input/parameter/canGo", (canGo ? 1 : 0).toString(), { retain: true });
      client.current.publish("input/parameter/current_checkpoint", currentCheckpoint.toString(), { retain: true });
      client.current.publish("input/parameter/speed", speed.toString(), { retain: true });
      client.current.publish("input/parameter/direction", (direction ? 1 : 0).toString(), { retain: true });
      setSending(false);
    }
  }

  useEffect(() => {
    if (client.current) {
      const handler = {
        "input/parameter/PID/P": (message) => { setP(parseInt(message)); },
        "input/parameter/PID/I": (message) => { setI(parseInt(message)); },
        "input/parameter/PID/D": (message) => { setD(parseInt(message)); },
        "input/parameter/speed": (message) => { setSpeed(parseInt(message)); },
        "input/parameter/canGo": (message) => { setCanGo(parseInt(message) > 0); },
        "input/parameter/direction": (message) => { setDirection(parseInt(message) > 0); },
      }

      client.current.on("connect", () => {
        client.current.subscribe(Object.keys(handler), (err) => { if (err) { console.error(`Error: ${err}`); } });
      });

      client.current.on("message", (topic, message) => {
        console.log(topic, parseInt(message));
        if (handler[topic]) {
          handler[topic](message);
        } else {
          console.warn(`No handler for ${topic}`);
        }
      });
    }
  }, [client]);


  return (
    <Box className="flex flex-col" component="form" onSubmit={(e) => { e.preventDefault(); console.log("Enter"); handleSend(); }}>
      <FormGroup>
        <Grid2 container spacing={2}>
          <Grid2 className="mt-4" size={4} ><NumberTextField label="P" name="P" value={P} onChange={(e) => setP(e.target.value)} /></Grid2>
          <Grid2 className="mt-4" size={4} ><NumberTextField label="I" name="I" value={I} onChange={(e) => setI(e.target.value)} /></Grid2>
          <Grid2 className="mt-4" size={4} ><NumberTextField label="D" name="D" value={D} onChange={(e) => setD(e.target.value)} /></Grid2>
          <Grid2 className="mt-4" size={12}><NumberTextField label="setpoint" name="setpoint" value={target} onChange={(e) => setTarget(e.target.value)} /></Grid2>
          <Grid2 className="mt-4 flex flex-col justify-center" size={12}><Typography gutterBottom>Current checkpoint</Typography><Slider defaultValue={0} min={0} max={2} step={1} marks={[{ value: 1, label: "west" }, { value: 2, label: "south" }]} value={currentCheckpoint} onChange={(e) => setCurrentCheckpoint(e.target.value)} /></Grid2>
          <Grid2 className="mt-4 flex flex-col justify-center" size={8}><Slider defaultValue={150} min={0} max={255} step={5} value={speed} onChange={(e) => setSpeed(e.target.value)} /></Grid2>
          <Grid2 className="mt-4" size={4}><NumberTextField label="speed" name="speed" value={speed} onChange={(e) => setSpeed(e.target.value)} /></Grid2>
          <Grid2 className="mt-4" size={6}><FormControlLabel control={<Switch onChange={(e) => { setCanGo(e.target.checked); }} checked={canGo} />} label={canGo ? "Go" : "Stop"} name="can go" /></Grid2>
          <Grid2 className="mt-4" size={6}><FormControlLabel control={<Switch onChange={(e) => { setDirection(e.target.checked); }} checked={direction} />} label={direction ? "Forward" : "Backward"} name="direction" /></Grid2>
          <Grid2 className="mt-4" size={12}><Button variant="contained" fullWidth disabled={isSending} onClick={() => handleSend()}>Send</Button></Grid2>
        </Grid2>
      </FormGroup>
    </Box>
  );
}