"use client"
import { useState, useEffect, useContext } from 'react';
import { Grid2, FormControlLabel, FormControl, FormGroup, Switch, Slider, Typography, Paper, FormLabel } from "@mui/material";


import mqttClientContext from "@/context/mqttClientContext";
import NumberTextField from "@/components/NumberTextField";
import ActionButton from "@/components/ActionButton";

const defaultData = {
  P: 0,
  I: 0,
  D: 0,
  speed: 0,
  setpoint: 0,
  currentCheckpoint: 0,
  canGo: 0,
  direction: 1,
  angle: 0,
  magnetic: 0,
};

export default function ParameterBoard() {
  const client = useContext(mqttClientContext);
  const [data, setData] = useState(defaultData);

  const handleSend = async () => {
    if (client.current) {
      const output = JSON.stringify(data);
      await client.current.publishAsync("input/parameter", output, { retain: true });
    }
  }
  const handleFetch = async () => {
    if (client.current) {
      await client.current.publishAsync("input/parameter/all", "all");
    }
  }

  useEffect(() => {
    if (!client.current) return;
    const handler = {
      "input/parameter": async (message) => {
        const input = await JSON.parse(message);
        for (let key in input) key in defaultData || delete input[key];
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
    <FormControl component="form">
      <Paper className="py-10 px-6 mb-4">
        <FormControl component="fieldset">
          <FormLabel component="legend">Parameter</FormLabel>
          <FormGroup>
            <Grid2 container rowSpacing={4} columnSpacing={2}>
              <Grid2 size={4} ><NumberTextField label="P" name="P" value={data.P} onChange={(e) => setData(prev => ({ ...prev, P: e.target.value }))} /></Grid2>
              <Grid2 size={4} ><NumberTextField label="I" name="I" value={data.I} onChange={(e) => setData(prev => ({ ...prev, I: e.target.value }))} /></Grid2>
              <Grid2 size={4} ><NumberTextField label="D" name="D" value={data.D} onChange={(e) => setData(prev => ({ ...prev, D: e.target.value }))} /></Grid2>
              <Grid2 size={4}><NumberTextField label="setpoint" name="setpoint" value={data.setpoint} onChange={(e) => setData(prev => ({ ...prev, setpoint: e.target.value }))} /></Grid2>
              <Grid2 size={4}><NumberTextField label="angle" name="angle" value={data.angle} onChange={(e) => setData(prev => ({ ...prev, angle: e.target.value }))} /></Grid2>
              <Grid2 size={4}><NumberTextField label="magnetic" name="magnetic" value={data.magnetic} onChange={(e) => setData(prev => ({ ...prev, magnetic: e.target.value }))} /></Grid2>
              <Grid2 className="flex flex-col justify-center" size={12}>
                <Typography gutterBottom>Current checkpoint</Typography>
                <Slider defaultValue={0} min={0} max={2} step={1} marks={[{ value: 1, label: "west" }, { value: 2, label: "south" }]} value={data.currentCheckpoint} onChange={(e) => setData(prev => ({ ...prev, currentCheckpoint: e.target.value }))} />
              </Grid2>
              <Grid2 className="flex flex-col justify-center" size={8}><Slider defaultValue={150} min={0} max={255} step={5} value={data.speed} onChange={(e) => setData(prev => ({ ...prev, speed: e.target.value }))} /></Grid2>
              <Grid2 size={4}><NumberTextField label="speed" name="speed" value={data.speed} onChange={(e) => setData(prev => ({ ...prev, speed: e.target.value }))} /></Grid2>
              <Grid2 size={6}><FormControlLabel control={<Switch onChange={(e) => setData(prev => ({ ...prev, canGo: (e.target.checked ? 1 : 0) }))} checked={data.canGo} />} label={data.canGo ? "Go" : "Stop"} name="can go" /></Grid2>
              <Grid2 size={6}><FormControlLabel control={<Switch onChange={(e) => setData(prev => ({ ...prev, direction: (e.target.checked ? 1 : 0) }))} checked={data.direction} />} label={data.direction ? "Forward" : "Backward"} name="direction" /></Grid2>
              <Grid2 size={12}><ActionButton onClickHandler={handleSend}>Send</ActionButton></Grid2>
              <Grid2 size={12}><ActionButton onClickHandler={handleFetch}>Get from car</ActionButton></Grid2>
            </Grid2>
          </FormGroup>
        </FormControl>
      </Paper>
      <Paper className="py-10 px-6 mb-4">
        <FormGroup>
          <FormLabel component="legend">Servo test</FormLabel>
          <ActionButton onClickHandler={async () => { await client.current.publishAsync("input/parameter/angle", data.angle.toString()); }}>Send angle</ActionButton>
        </FormGroup>
      </Paper>
    </FormControl>
  );
}