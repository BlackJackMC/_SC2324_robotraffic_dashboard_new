"use client"
import { FormControl, FormLabel, FormControlLabel, FormGroup, Paper, Switch } from "@mui/material"
import { useContext, useEffect, useState } from "react";

import mqttClientContext from "@/context/mqttClientContext"
import ActionButton from "@/components/ActionButton";

const defaultState = {
  hall: false,
  motor: false,
  line: false,
  steering: false,
  parameter: false,
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      <FormControlLabel name={name} label={label} control={<Switch checked={state[name]} onChange={(e) => setState(prev => ({ ...prev, [name]: e.target.checked }))} />} {...props} />
      <ActionButton disabled={disabled} fullWidth={false} onClickHandler={() => restartService(name)} {...props}>Restart</ActionButton>
    </FormGroup>
  );
}

export default function SetupBoard() {
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
            <FormGroup>
              <ModuleControl name="hall" label="Hall sensor" state={state} setState={setState} />
              <ModuleControl name="motor" label="Motor" state={state} setState={setState} />
              <ModuleControl name="line" label="QTR sensor" state={state} setState={setState} />
              <ModuleControl name="steering" label="Servo" state={state} setState={setState} />
              <ModuleControl name="parameter" label="Parameter" disabled state={state} setState={setState} />
            </FormGroup>
          </FormControl>
        </Paper>
      </FormControl>
    </>
  );

}