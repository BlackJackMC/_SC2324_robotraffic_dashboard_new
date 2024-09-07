"use client"
import { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import mqttClientContext from "@/context/mqttClientContext";


// Data format
/*
{
    timeStamp: number
    value: number
}
*/
function CustomChart({ data, ...props }) {
  return (
    <LineChart height={300} xAxis={[{ data: data.map(curr => curr.timeStamp), scaleType: "time" }]} series={[{ data: data.map(curr => curr.value), label: props.label }]}/>
  );
}


export default function GraphDisplay() {
  const client = useContext(mqttClientContext);
  const [input, setInput] = useState([]);
  const [output, setOutput] = useState([]);

  useEffect(() => {
    if (!client.current) return;

    const handler = {
      "output/parameter/PID/input": (message) => setInput(prev => [...prev, { timeStamp: new Date(), value: Number(message) }]),
      "output/parameter/PID/output": (message) => setOutput(prev => [...prev, { timeStamp: new Date(), value: Number(message) }]),
    };

    client.current.on("connect", () => {
      client.current.on("message", (topic, message) => {
        if (handler[topic])
          handler[topic](message);
      })
    })
  }, [client]);

  return (
    <>
      <CustomChart data={input} label="input" />
      <CustomChart data={output} label="output" />
      <Button variant="contained" fullwidth onClick={() => { setInput([]); setOutput([]); }}>Clear graph</Button>
    </>
  );
}