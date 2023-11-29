import { group } from "k6";
import createNewOrders from "./create-new-orders-test.js";
import pickNewOrders from "./pick-new-orders-test.js";
import { executeWithCustomProbability } from "../utils.js";

let orderInfo = {};
export default function () {
  const typeOfOrder = executeWithCustomProbability(80); // Change this value as needed

  // Group requests or other test actions here
  group("createHISOrder", function () {
    orderInfo = createNewOrders(typeOfOrder);
    // Additional actions related to creating orders
  });

  group("pickNewOrders", function () {
    pickNewOrders(orderInfo[0], orderInfo[1]);
    // Additional actions related to picking new orders
  });
}
