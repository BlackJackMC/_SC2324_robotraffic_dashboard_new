"use client"
import { useState, useEffect, useContext } from 'react';
import { TextField, Box, Grid2, FormControlLabel, FormGroup, Switch, Slider, Button, Typography, Paper } from "@mui/material";

import mqttClientContext from "@/context/mqttClientContext";

const defaultData = {
  P: 0,
  I: 0,
  D: 0,
  speed: 0,
  setpoint: 0,
  currentCheckpoint: 0,
  canGo: 0,
  direction: 1,
};

function NumberTextField({ ...props }) {
  return (
    <TextField slotProps={{ inputLabel: { classes: { asterisk: "hidden" } }, htmlInput: { step: props.step ? props.step : 0.01 } }} fullWidth required type="number" variant="standard" {...props} />
  );
}

export default function ParameterBoard() {
  const client = useContext(mqttClientContext);
  //Should be a component but Im in a rush
  const [isSending, setSending] = useState(false);
  const [isFetching, setFetching] = useState(false);
  //
  const [data, setData] = useState(defaultData);

  const handleSend = async () => {
    setSending(true);
    if (client.current) {
      const output = JSON.stringify(data);
      console.log(output);
      await client.current.publishAsync("input/parameter", output, { retain: true });
    }
    setSending(false);
  }
  const handleFetch = async () => {
    setFetching(true);
    if (client.current) {
      await client.current.publishAsync("input/parameter/all", "all");
    }
    setFetching(false);
  }

  useEffect(() => {
    if (!client.current) return;
    const handler = {
      "input/parameter": async (message) => {
        const input = await JSON.parse(message);
        setData(prev => ({ ...prev, ...input }));
      },
    };

    client.current.on("connect", () => {
      client.current.on("message", (topic, message) => {
        if (handler[topic])
          handler[topic](message);
      });
    })
  }, [client]);

  return (
    <Paper className="py-10 px-6">
      <FormGroup>
        <Grid2 container rowSpacing={4} columnSpacing={2}>
          <Grid2 size={4} ><NumberTextField label="P" name="P" value={data.P} onChange={(e) => setData(prev => ({ ...prev, P: e.target.value }))} /></Grid2>
          <Grid2 size={4} ><NumberTextField label="I" name="I" value={data.I} onChange={(e) => setData(prev => ({ ...prev, I: e.target.value }))} /></Grid2>
          <Grid2 size={4} ><NumberTextField label="D" name="D" value={data.D} onChange={(e) => setData(prev => ({ ...prev, D: e.target.value }))} /></Grid2>
          <Grid2 size={12}><NumberTextField label="setpoint" name="setpoint" value={data.setpoint} onChange={(e) => setData(prev => ({ ...prev, setpoint: e.target.value }))} /></Grid2>
          <Grid2 className="flex flex-col justify-center" size={12}>
            <Typography gutterBottom>Current checkpoint</Typography>
            <Slider defaultValue={0} min={0} max={2} step={1} marks={[{ value: 1, label: "west" }, { value: 2, label: "south" }]} value={data.currentCheckpoint} onChange={(e) => setData(prev => ({ ...prev, currentCheckpoint: e.target.value }))} />
          </Grid2>
          <Grid2 className="flex flex-col justify-center" size={8}><Slider defaultValue={150} min={0} max={255} step={5} value={data.speed} onChange={(e) => setData(prev => ({ ...prev, speed: e.target.value }))} /></Grid2>
          <Grid2 size={4}><NumberTextField label="speed" name="speed" value={data.speed} onChange={(e) => setData(prev => ({ ...prev, speed: e.target.value }))} /></Grid2>
          <Grid2 size={6}><FormControlLabel control={<Switch onChange={(e) => setData(prev => ({ ...prev, canGo: (e.target.checked ? 1 : 0) }))} checked={data.canGo} />} label={data.canGo ? "Go" : "Stop"} name="can go" /></Grid2>
          <Grid2 size={6}><FormControlLabel control={<Switch onChange={(e) => setData(prev => ({ ...prev, direction: (e.target.checked ? 1 : 0) }))} checked={data.direction} />} label={data.direction ? "Forward" : "Backward"} name="direction" /></Grid2>
          <Grid2 size={12}><Button variant="contained" fullWidth disabled={isSending} onClick={() => handleSend()}>Send</Button></Grid2>
          <Grid2 size={12}><Button variant="contained" fullWidth disabled={isFetching} onClick={() => handleFetch()}>Get from car</Button></Grid2>
        </Grid2>
      </FormGroup>
    </Paper>
  );
}