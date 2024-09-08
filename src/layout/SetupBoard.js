"use client"
import { FormControl, FormLabel, FormGroup, Paper, Typography } from "@mui/material"
import { useContext, useEffect, useState, useRef } from "react";

import mqttClientContext from "@/context/mqttClientContext"
import ActionButton from "@/components/ActionButton";

const defaultState = {
  hall: false,
  motor: false,
  line: false,
  steering: false,
  parameter: false,
  mqtt: false,
  car: false,
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function StatusDisplay({ label, state, onState, offState }) {
  return (
    <Typography>{label}: <Typography component="span" color={state ? "success" : "error"}>{state ? onState : offState}</Typography></Typography>
  );
}

function ModuleControl({ name, label, state, setState, disabled, ...props }) {
  const client = useContext(mqttClientContext);
  const restartService = async (name) => {
    if (!client.current) return;
    await client.current.publishAsync(`input/control/${name}`, "shutdown");
    await delay(2000);
    await client.current.publishAsync(`input/control/${name}`, "setup");
  }

  return (
    <FormGroup className="flex flex-row justify-between mb-4">
      <StatusDisplay label={label} state={state[name]} onState="Online" offState="Offline" />
      <ActionButton disabled={disabled} fullWidth={false} onClickHandler={() => restartService(name)} {...props}>Restart</ActionButton>
    </FormGroup>
  );
}

export default function SetupBoard() {
  const buttonContainerRef = useRef();
  const client = useContext(mqttClientContext);
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    if (!client.current) return;

    const handler = {
      "output/state": async (message) => {
        const input = await JSON.parse(message);
        setState(prev => ({ ...prev, ...input }));
      }
    };

    client.current.on("connect", () => {
      setState(prev => ({ ...prev, mqtt: true }));
      client.current.on("message", (topic, message) => {
        if (handler[topic]) handler[topic](message);
      });
    })
  }, [client]);

  return (
    <>
      <FormControl component="form" className="block">
        <Paper className="py-10 px-6 mb-4">
          <FormControl component="fieldset" className="block">
            <FormLabel component="legend">State</FormLabel>
            <FormGroup ref={buttonContainerRef}>
              <ModuleControl name="hall" label="Hall sensor" state={state} setState={setState} />
              <ModuleControl name="motor" label="Motor" state={state} setState={setState} />
              <ModuleControl name="line" label="QTR sensor" state={state} setState={setState} />
              <ModuleControl name="steering" label="Servo" state={state} setState={setState} />
              <ModuleControl name="parameter" label="Parameter" disabled state={state} setState={setState} />
            </FormGroup>
            <ActionButton onClickHandler={() => {
              if (buttonContainerRef.current) buttonContainerRef.current.querySelectorAll("button").forEach((button) => button.click());
            }}>Restart all</ActionButton>
          </FormControl>
        </Paper>
        <Paper className="py-10 px-6 mb-4">
          <StatusDisplay label="MQTT" state={state["mqtt"]} onState="Connected" offState="Disconnected"/>
          <StatusDisplay label="Car" state={state["car"]} onState="Connected" offState="Disconnected"/>
        </Paper>
      </FormControl>
    </>
  );

}