
// This code creates a new order, and then picks the new order
// The order type is determined by the value passed into the createNewOrders function
// The order type is passed into the pickNewOrders function to determine which order to pick
// The order type is also passed into the createNewOrders function to determine which order to create

import { group } from "k6";
import createNewOrders from "./create-new-orders-test.js";
import pickNewOrders from "./pick-new-orders-test.js";
import { executeWithCustomProbability } from "../utils.js";

let orderInfo = {};
export default function () {
  const typeOfOrder = executeWithCustomProbability(80); // Value passed in represents a % chance that an outcome will be selected
  //In this case there is an 80% chane that the order will be of type AUTO. Change this value as needed

  group("createHISOrder", function () {
    orderInfo = createNewOrders(typeOfOrder);
  });

  group("pickNewOrders", function () {
    pickNewOrders(orderInfo[0], orderInfo[1]);
  });
}
