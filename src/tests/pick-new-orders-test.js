import { sleep, check } from "k6";
import http from "k6/http";
import { uuidv4 } from "../utils.js";
import { Trend } from "k6/metrics";
import { productInfoMap } from "../productInfoMap.js";

let sender, receiver, product, upc, sourceLocationId, expiryDate, lotCode;

export const pickNewOrdersTrend = new Trend("pickNewOrders_duration");

export default function pickNewOrders(orderId, selected_item) {
  const url =
    "http://172.24.220.177:16384/IncomingWebServiceImpl/IncomingWebService";
  const isoString = new Date().toISOString();
  const msgTime = isoString.slice(0, -1);
  const quantity = "1";
  const msgUUID = uuidv4();
  const pickReservationKey = 8654091021;

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

  /*  console.log(`orderId: ${orderId}`);
  console.log(`product: ${product}`);
  console.log(`sender: ${sender}`);
  console.log(`receiver: ${receiver}`);
  console.log(`upc: ${upc}`);
  console.log(`sourceLocationId: ${sourceLocationId}`);
  console.log(`expiryDate: ${expiryDate}`);*/

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

  let startTime = Date.now();
  const res = http.post(url, soapMessage, {
    headers: { "Content-Type": "text/xml" },
  });
  let endTime = Date.now();
  console.log(`Call to pickNewOrders took ${endTime - startTime}milliseconds`);

  const timings = res.timings;
  console.log(`Blocked time: ${timings.blocked} ms`);
  console.log(`Connecting time: ${timings.connecting} ms`);
  console.log(`TLS handshaking time: ${timings.tls_handshaking} ms`);
  console.log(`Sending time: ${timings.sending} ms`);
  console.log(`Waiting time: ${timings.waiting} ms`);
  console.log(`Receiving time: ${timings.receiving} ms`);
  console.log(`Duration: ${timings.duration} ms`);
  console.log(`Call to pickNewOrders took ${endTime - startTime} milliseconds`);

  {
    check(res, {
      //'status is 200': (r) => r.status === 200,
      "transaction time OK": (r) => r.timings.duration < 2000,
    });

    pickNewOrdersTrend.add(res.timings.duration);
    sleep(1);
  }
}
