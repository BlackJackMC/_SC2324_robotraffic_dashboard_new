"use client"
import { FormControl, FormLabel, FormGroup, Paper, Typography } from "@mui/material"
import { useContext, useEffect, useState, useRef } from "react";

import mqttClientContext from "@/context/mqttClientContext"
import ActionButton from "@/components/ActionButton";

const defaultState = {
  hall: false,
  motor: false,
  line: 0,
  steering: false,
  parameter: false,
  mqtt: false,
  car: false,
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function useRestartService() {
  const client = useContext(mqttClientContext);

  async function restartService(name) {
    if (!client.current) return;
    await client.current.publishAsync(`input/control/${name}`, "shutdown");
    await delay(2000);
    await client.current.publishAsync(`input/control/${name}`, "setup");
  }

  return { restartService };
}


function BooleanStatusDisplay({ label, state, onState, offState }) {
  return (
    <Typography>{label}: <Typography component="span" color={state ? "success" : "error"}>{state ? onState : offState}</Typography></Typography>
  );
}

function NumberStatusDisplay({ label, state }) {
  return (
    <Typography>{label}: {state}</Typography>
  );
}

function RestartServiceButton({ disabled, name, children, ...props }) {
  const { restartService } = useRestartService();

  return (
    <ActionButton disabled={disabled} fullWidth={false} onClickHandler={() => restartService(name)} {...props}>{children}</ActionButton>
  );
}

function ModuleControl({ name, display, ...props }) {
  return (
    <FormGroup className="flex flex-row justify-between mb-4">
      {display}
      <RestartServiceButton name={name} {...props}>Restart</RestartServiceButton>
    </FormGroup>
  );
}

export default function SetupBoard() {
  const statusCheckerRef = useRef();
  const client = useContext(mqttClientContext);
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    if (!client.current) return;
    const handler = {
      "output/state": async (message) => {
        const input = await JSON.parse(message);
        setState(prev => ({ ...prev, ...input }));
      },
    };

    client.current.on("connect", () => {
      setState(prev => ({ ...prev, mqtt: true }));
      client.current.on("message", (topic, message) => {
        setState(prev => ({ ...prev, car: true }));
        if (statusCheckerRef.current) clearTimeout(statusCheckerRef.current);
        statusCheckerRef.current = setTimeout(() => setState(prev => ({ ...prev, ...defaultState, mqtt: client.current.connected })), 3000);
        if (handler[topic]) handler[topic](message);
      });
    });
    client.current.on("disconnect", () => setState(prev => ({ ...prev, car: false })));

    const getStateLoop = setInterval(async () => {
      await client.current.publishAsync("input/control/state", "state");
    }, 1000);


    return () => {
      clearInterval(getStateLoop);
    }

  }, [client]);

  return (
    <>
      <FormControl component="form" className="block">
        <Paper className="py-10 px-6 mb-4">
          <FormControl component="fieldset" className="block">
            <FormLabel component="legend">State</FormLabel>
            <FormGroup>
              <ModuleControl name="hall" display={<BooleanStatusDisplay label="Hall sensor" state={state["hall"]} onState="Online" offState="Offline" />} />
              <ModuleControl name="motor" display={<BooleanStatusDisplay label="Motor" state={state["motor"]} onState="Online" offState="Offline" />} />
              <ModuleControl name="line" display={<NumberStatusDisplay label="QTR sensor" state={`${(Number(state["line"]) * 100).toFixed(2)}%`}></NumberStatusDisplay>} />
              <ModuleControl name="steering" display={<BooleanStatusDisplay label="Servo" state={state["steering"]} onState="Online" offState="Offline" />} />
              <ModuleControl name="parameter" display={<BooleanStatusDisplay label="Parameter" state={state["parameter"]} onState="Online" offState="Offline" />} disabled />
            </FormGroup>
            <RestartServiceButton name="all" color="error" fullWidth={true}>Reset</RestartServiceButton>
          </FormControl>
        </Paper>
        <Paper className="py-10 px-6 mb-4">
          <BooleanStatusDisplay label="MQTT" state={state["mqtt"]} onState="Connected" offState="Disconnected" />
          <BooleanStatusDisplay label="Car" state={state["car"]} onState="Connected" offState="Disconnected" />
        </Paper>
      </FormControl>
    </>
  );

}