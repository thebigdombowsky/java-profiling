import { sleep, check } from "k6";
import http from "k6/http";
import { uuidv4 } from "../utils.js";
import { Trend } from "k6/metrics";

export const receiveHISOrdersTrend = new Trend("receiveHISOrders_duration");

export default function createNewOrders(orderType) {
  const orderTypeMap = {
    AUTO: {
      product: "1877075",
      upc: "0130382903064145",
    },
    MANUAL: {
      product: "1000945",
      upc: "0100382903064144",
    },
  };

  const orderInfo = orderTypeMap[orderType];
  let product;

  if (orderInfo) {
    product = orderInfo.product;
    //upc = orderInfo.upc;
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
  // When making a SOAP POST request we must not forget to set the content type to text/xml
  let startTime = Date.now();
  const res = http.post(url, pharmacyOrderMsg, {
    headers: { "Content-Type": "text/xml" },
  });
  let endTime = Date.now();
  console.log(
    `Call to createNewOrders took ${endTime - startTime} milliseconds`,
  );

  {
    check(res, {
      "status is 200": (r) => r.status === 200,
      "transaction time OK": (r) => r.timings.duration < 2000,
    });

    receiveHISOrdersTrend.add(res.timings.duration);
    sleep(1);

    return msgUUID;
  }
}
