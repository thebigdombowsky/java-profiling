// This code creates a new order, and then picks the new order
// The order type is determined by the value passed into the createNewOrders function
// The order type is passed into the pickNewOrders function to determine which order to pick
// The order type is also passed into the createNewOrders function to determine which order to create

import { group } from "k6";
import createNewOrders from "./create-new-orders-test.js";
import pickNewOrders from "./pick-new-orders-test.js";
import { executeWithCustomProbability } from "../utils.js";
import exec from "k6/execution";

let orderInfo = {};
export default function () {
  console.log(`Execution context

Instance info
-------------
Vus active: ${exec.instance.vusActive}
Iterations completed: ${exec.instance.iterationsCompleted}
Iterations interrupted:  ${exec.instance.iterationsInterrupted}
Iterations completed:  ${exec.instance.iterationsCompleted}
Iterations active:  ${exec.instance.vusActive}
Initialized vus:  ${exec.instance.vusInitialized}
Time passed from start of run(ms):  ${exec.instance.currentTestRunDuration}

Scenario info
-------------
Name of the running scenario: ${exec.scenario.name}
Executor type: ${exec.scenario.executor}
Scenario start timestamp: ${exec.scenario.startTime}
Percenatage complete: ${exec.scenario.progress}
Iteration in instance: ${exec.scenario.iterationInInstance}
Iteration in test: ${exec.scenario.iterationInTest}

Test info
---------
All test options: ${exec.test.options}

VU info
-------
Iteration id: ${exec.vu.iterationInInstance}
Iteration in scenario: ${exec.vu.iterationInScenario}
VU ID in instance: ${exec.vu.idInInstance}
VU ID in test: ${exec.vu.idInTest}
VU tags: ${exec.vu.metrics.tags}}`);

  const typeOfOrder = executeWithCustomProbability(80); // Value passed in represents a % chance that an outcome will be selected
  //In this case there is an 80% chane that the order will be of type AUTO. Change this value as needed

  group("createHISOrder", function () {
    orderInfo = createNewOrders(typeOfOrder);
  });

  group("pickNewOrders", function () {
    pickNewOrders(orderInfo[0], orderInfo[1]);
  });
}
