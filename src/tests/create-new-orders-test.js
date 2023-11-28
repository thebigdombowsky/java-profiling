import { sleep, check } from "k6";
import http from "k6/http";
import { uuidv4, weighted_random } from "../utils.js";
import { Trend } from "k6/metrics";
import {
  automationProductIds,
  manualProductIds,
  productInfoMap,
  weights,
} from "../productInfoMap.js";
export const receiveHISOrdersTrend = new Trend("receiveHISOrders_duration");

let selected_item, product, sender, receiver, upc;
export default function createNewOrders(orderType) {
  if (orderType === "AUTO") {
    selected_item = weighted_random(automationProductIds, weights);
    console.log(selected_item);
  } else if (orderType === "MANUAL") {
    selected_item = weighted_random(manualProductIds, weights);
    console.log(selected_item);
  }

  if (productInfoMap[selected_item]) {
    product = productInfoMap[selected_item].product;
    sender = productInfoMap[selected_item].sender;
    receiver = productInfoMap[selected_item].receiver;
    upc = productInfoMap[selected_item].upc;
  } else {
    console.log(`Order type ${orderType} not found.`);
  }

  const url =
    "http://172.24.220.177:16384/IncomingWebServiceImpl/IncomingWebService";
  const isoString = new Date().toISOString();
  const msgTime = isoString.slice(0, -1);
  const quantity = "1";
  const msgUUID = uuidv4();

  __ENV.WM6_ORDER_ID = msgUUID;

  const pharmacyOrderMsg = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:host="http://host.wm6.swisslog.com/">
       <soapenv:Header/>
       <soapenv:Body>
          <host:pharmacyOrder>
             <pharmacyOrderMessageRequest>
                <messageHeader>
                   <msgId>${msgUUID}</msgId>
                   <msgType>PharmacyOrder</msgType>
                   <transCode>NEW</transCode>
                  <msgTime>${msgTime}</msgTime>
                   <sender>HIS</sender>
                   <receiver>MedPortal</receiver>
                   <version>1.0</version>
                </messageHeader>
                <warehouseId>IUHMH-IUHMH-INPATIENT Pharmacy</warehouseId>
                <patient>
                   <patientId>${msgTime}</patientId>
                   <firstName>system</firstName>
                   <lastName>N/A</lastName>
                   <pointOfCare>Destination Location</pointOfCare>
                   <room>N/A</room>
                   <bed>N/A</bed>
                   <destination>Mock Location</destination>
                </patient>
                <order>
                   <orderId>${msgUUID}</orderId>
                   <orderType>MANUAL</orderType>
                   <orderGroupSequence>1</orderGroupSequence>
                   <dispatchDate>${msgTime}</dispatchDate>
                   <priority>99</priority>
                   <customer>Mock Customer</customer>
                   <owner>Mock Owner</owner>
                   <medPortalOrderLine>
                      <orderLineNumber>1</orderLineNumber>
                      <productId>${product}</productId>
                      <quantityOrdered>${quantity}</quantityOrdered>
                      <administrationDate>${msgTime}</administrationDate>
                   </medPortalOrderLine>
                </order>
             </pharmacyOrderMessageRequest>
          </host:pharmacyOrder>
       </soapenv:Body>
    </soapenv:Envelope>
    `;

  // 1. Save the current time
  const startTime = Date.now();
  // 2. Send the HTTP request
  const res = http.post(url, pharmacyOrderMsg, {
    headers: { "Content-Type": "text/xml" },
  });
  // 3. Save the time after the request completes
  const endTime = Date.now();
  console.log(
    `Call to pharmacyOrders took ${endTime - startTime} milliseconds`,
  );

  console.log(msgUUID);
  const timings = res.timings;
  console.log(`Blocked time: ${timings.blocked} ms`); // Time spent in a queue waiting for a network connection
  console.log(`Connecting time: ${timings.connecting} ms`); // Time spent setting up TCP connection
  console.log(`TLS handshaking time: ${timings.tls_handshaking} ms`); // Time spent completing a TLS handshake
  console.log(`Sending time: ${timings.sending} ms`); // Time spent sending the request
  console.log(`Waiting time: ${timings.waiting} ms`); // Time spent waiting for a response
  console.log(`Receiving time: ${timings.receiving} ms`); // Time spent receiving the response
  console.log(`Duration: ${timings.duration} ms`); // Total duration of the request

  {
    check(res, {
      "status is 200": (r) => r.status === 200,
      "transaction time OK": (r) => r.timings.duration < 2000,
    });

    receiveHISOrdersTrend.add(res.timings.duration);
    sleep(1);

    return [msgUUID, selected_item];
  }
}
