import { group } from "k6";
import createNewOrders from "./create-new-orders-test.js";
import sendDispenseRequest from "./create-dispense-requests-test.js";
import pickNewOrders from "./pick-new-orders-test.js";

function executeWithCustomProbability(percent) {
  const autoOrderPercent = percent; // percent of orders are AUTO
  const random = Math.random(); // Generates a random number between 0 and 1

  let typeOfOrder;
  if (random <= autoOrderPercent / 100) {
    console.log("Automation order type created...");
    typeOfOrder = "AUTO";
  } else {
    console.log("Manual order type created...");
    typeOfOrder = "MANUAL";
  }

  // Perform other initialization tasks here (if needed)
  return typeOfOrder; // Return the determined typeOfOrder
}

// Main test logic
export default function () {
  const typeOfOrder = executeWithCustomProbability(80); // Change this value as needed
  let orderId;
  // Group requests or other test actions here
  group("createHISOrder", function () {
    orderId = createNewOrders(typeOfOrder);
    // Additional actions related to creating orders
  });

  group("sendDispenseRequest", function () {
    sendDispenseRequest(typeOfOrder);
    // Additional actions related to sending dispense requests
  });

  group("pickNewOrders", function () {
    pickNewOrders(orderId, typeOfOrder);
    // Additional actions related to picking new orders
  });
}
