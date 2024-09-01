"use client"
import { useState, useEffect, useRef, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import mqttClientContext from "@/context/mqttClientContext";

// Data format
/*
{
    timeStamp: number
    value: number
}
*/

function LineChart({ data, label }) {
  const theme = useTheme();
  const canvasRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;
    Chart.defaults.color = theme.palette.text.primary;
    Chart.defaults.backgroundColor = theme.palette.text.primary;
    Chart.defaults.borderColor = theme.palette.grey[800];
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: label,
            data: [],
          }
        ],
      },
      options: {
        responsive: true,
      }
    });

    return () => {
      if (chartRef.current)
        chartRef.current.destroy();
    }
  }, [theme, label]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data.labels = data.map(curr => curr.timeStamp);
      chartRef.current.data.datasets[0].data = data.map(curr => curr.value);
      chartRef.current.update();
    }
  }, [data])

  return (
    <canvas ref={canvasRef}></canvas>
  );
}

export default function GraphDisplay() {
  const client = useContext(mqttClientContext);
  const [input, setInput] = useState([]);
  const [output, setOutput] = useState([]);

  useEffect(() => {
    if (!client.current) return;

    const handler = {
      "output/parameter/PID/input": (message) => setInput(prev => [...prev, { timeStamp: new Date().toLocaleTimeString(), value: Number(message) }]),
      "output/parameter/PID/output": (message) => setOutput(prev => [...prev, { timeStamp: new Date().toLocaleTimeString(), value: Number(message) }]),
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
      <LineChart data={input} label="input" />
      <LineChart data={output} label="output" />
    </>
  );
}