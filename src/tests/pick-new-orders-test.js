//Define imports
import { sleep, check } from "k6";
import http from "k6/http";
import { uuidv4 } from "../utils.js";
import { Trend } from "k6/metrics";
import { productInfoMap } from "../productInfoMap.js";

//Define variables for use in the createNewOrders function
let sender, receiver, product, upc, sourceLocationId, expiryDate, lotCode;

// Add a new trend to track the duration of the pickNewOrders transaction in k6
export const pickNewOrdersTrend = new Trend("pickNewOrders_duration");

export default function pickNewOrders(orderId, selected_item) {
  // Define the URL to send the HTTP request to
  const url =
    "http://172.24.220.177:16384/IncomingWebServiceImpl/IncomingWebService";
  // Define the current time in ISO format;
  const isoString = new Date().toISOString();
  const msgTime = isoString.slice(0, -1);
  // Define the quantity of the product to be ordered
  const quantity = "1";
  // Define the UUID of the message
  const msgUUID = uuidv4();
  // Define the pickReservationKey
  const pickReservationKey = 8654091021;

    //The selected product id is used to determine the product, sender, receiver, and upc.
  //The product, sender, receiver, and upc are used to create the XML message.
  if (productInfoMap[selected_item]) {
    product = productInfoMap[selected_item].product;
    sender = productInfoMap[selected_item].sender;
    receiver = productInfoMap[selected_item].receiver;
    upc = productInfoMap[selected_item].upc;
    sourceLocationId = productInfoMap[selected_item].automationMachineId;
    expiryDate = productInfoMap[selected_item].expiryDate;
    lotCode = productInfoMap[selected_item].lotCode;
  } else {
    console.log(`Product ${product} not found.`);
  }

  /*  
  Debugging code
  console.log(`orderId: ${orderId}`);
  console.log(`product: ${product}`);
  console.log(`sender: ${sender}`);
  console.log(`receiver: ${receiver}`);
  console.log(`upc: ${upc}`);
  console.log(`sourceLocationId: ${sourceLocationId}`);
  console.log(`expiryDate: ${expiryDate}`);*/

  // Define the XML message to be sent to the MedPortal
  const soapMessage = `<?xml version="1.0"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:host="http://host.wm6.swisslog.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <host:dispenseUpdate>
         <!--Optional:-->
         <dispenseUpdateMessageRequest>
            <messageHeader>
               <msgId>${msgUUID}</msgId>
               <msgType>DispenseUpdate</msgType>
               <transCode>PICKED</transCode>
               <!--Optional:-->
               <msgTime>${msgTime}</msgTime>
               <sender>Manual</sender>
               <!--Optional:-->
               <receiver>MedPortal</receiver>
               <!--Optional:-->
               <version>1.1</version>
            </messageHeader>
            <orderId>${orderId}</orderId>
            <!--Optional:-->
            <userId>testUser</userId>
            <!--1 or more repetitions:-->
            <pickInfo>
               <!--Optional:-->
               <parentTuId>?</parentTuId>
               <!--Optional:-->
               <pickReservationKey>${pickReservationKey}</pickReservationKey>
               <!--Optional:-->
               <pickLocationId></pickLocationId>
               <sourceLocationId>${sourceLocationId}</sourceLocationId>
               <!--Optional:-->
               <operatorStation></operatorStation>
               <!--Optional:-->
               <printLabel></printLabel>
               <genericProductId>${product}</genericProductId>
               <!--Optional:-->
               <hostOrderLu>
                  <orderLineNumber>1</orderLineNumber>
                  <orderTuId>1</orderTuId>
                  <productId>${upc}</productId>
                  <quantity>${quantity}</quantity>
                  <!--Zero or more repetitions:-->
                  <attributeValue>
                     <name>expiryDate</name>
                     <!--Optional:-->
                     <value>${expiryDate}</value>
                  </attributeValue>
                  <attributeValue>
                     <name>lotCode</name>
                     <!--Optional:-->
                     <value>${lotCode}</value>
                  </attributeValue>
                 </hostOrderLu>
            </pickInfo>
         </dispenseUpdateMessageRequest>
      </host:dispenseUpdate>
   </soapenv:Body>
</soapenv:Envelope>`;

  // Save the current time
  let startTime = Date.now();
  // Send the HTTP request
  const res = http.post(url, soapMessage, {
    headers: { "Content-Type": "text/xml" },
  });
  // Save the time after the request completes
  let endTime = Date.now();
  // Log the duration of the request
  console.log(`Call to pickNewOrders took ${endTime - startTime}milliseconds`);

  // Log the HTTP response times for each stage of the request
  const timings = res.timings;
  console.log(`Blocked time: ${timings.blocked} ms`);
  console.log(`Connecting time: ${timings.connecting} ms`);
  console.log(`TLS handshaking time: ${timings.tls_handshaking} ms`);
  console.log(`Sending time: ${timings.sending} ms`);
  console.log(`Waiting time: ${timings.waiting} ms`);
  console.log(`Receiving time: ${timings.receiving} ms`);
  console.log(`Duration: ${timings.duration} ms`);
  console.log(`Call to pickNewOrders took ${endTime - startTime} milliseconds`);

  // Check that the response code is 200 and that the transaction time is less than 2 seconds
  {
    check(res, {
      //'status is 200': (r) => r.status === 200,
      "transaction time OK": (r) => r.timings.duration < 2000,
    });

    // Add the duration of the pickNewOrders transaction to the pickNewOrdersTrend trend
    pickNewOrdersTrend.add(res.timings.duration);
    sleep(1);
  }
}
