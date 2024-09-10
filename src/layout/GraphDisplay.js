"use client"
import { useState, useEffect, useContext, useMemo } from "react";
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
    <LineChart height={300} xAxis={[{ data: data.map(curr => curr.timeStamp), scaleType: "time" }]} series={[{ data: data.map(curr => curr.value), label: props.label, showMark: false }]} />
  );
}


export default function GraphDisplay() {
  const client = useContext(mqttClientContext);
  const [input, setInput] = useState([]);
  const [output, setOutput] = useState([]);

  const clearGraph = useMemo(() => { return () => { setInput([]); setOutput([]); }; }, []);

  useEffect(() => {
    if (!client.current) return;

    const handler = {
      "output/parameter/PID/input": (message) => {
        setInput(prev => {
          const now = new Date();
          const updated = [...prev, { timeStamp: now, value: Number(message) }];
          return updated.filter(entry => (now - entry.timeStamp) <= 10000); 
        });
      },
      "output/parameter/PID/output": (message) => {
        setOutput(prev => {
          const now = new Date();
          const updated = [...prev, { timeStamp: now, value: Number(message) }];
          return updated.filter(entry => (now - entry.timeStamp) <= 10000);
        });
      },
    };

    client.current.on("connect", () => {
      client.current.on("message", (topic, message) => {
        if (handler[topic])
          handler[topic](message);
      })
    })
  }, [client]);


  return (
    <div className="flex flex-col items-end">
      <CustomChart data={input} label="input" />
      <CustomChart data={output} label="output" />
      <Button variant="contained" onClick={() => clearGraph()}>Clear graph</Button>
    </div>
  );
}