"use client"
import { useEffect, useRef } from "react";
import *  as d3 from "d3";
import customTheme from "@/design/theme";

// Data format
/*
{
    timeStamp: number
    value: number
}
*/

function LineChart({ data, width, height }) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref)
      .attr("width", width)
      .attr("height", height)

    const xScale = d3.scaleTime()
      .domain([d3.min(data, d => d.timeStamp), d3.max(data, d => d.timeStamp)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.value) - 1000, d3.max(data, d => d.value) + 1000])
      .range([height, 0]);

    const line = d3.line()
      .x(d => xScale(d.timeStamp))
      .y(d => yScale(d.value))

    svg.selectAll("*").remove();

    svg.append("g")
      .call(d3.axisBottom(xScale).ticks(5))
      .attr("transform", `translate(0, ${height})`);

    svg.append("g")
      .call(d3.axisLeft(yScale).tick(5))

    svg.append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke", customTheme.palette.primary.main);


  }, [data, width, height]);

  return (
    <svg ref={ref}></svg>
  );
}

export default function GraphDisplay({ client }) {
  const [input, setInput] = useState([]);
  const [output, setOutput] = useState([]);

  useEffect(() => {
    if (client.current) {
      const handler = {
        "output/parameter/PID/input": (message) => { setInput(prev => [...prev, { timeStamp: Date().now(), value: parseFloat(message) }]) },
        "output/parameter/PID/output": (message) => { setOutput(prev => [...prev, { timeStamp: Date().now(), value: parseFloat(message) }]) },
      }

      client.current.on("connect", () => {
        client.current.subscribe(Object.keys(handler), (err) => { if (err) { console.error(`Error: ${err}`); } });
      });

      client.current.on("message", (topic, message) => {
        if (handler[topic]) {
          handler[topic](message);
        } else {
          console.warn(`No handler for ${topic}`);
        }
      });
    }
  }, [client]);

  return (
    <>
      
    </>
  );
}