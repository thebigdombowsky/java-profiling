import { sleep, check } from "k6";
import http from "k6/http";
import { uuidv4 } from "../utils.js";
import { Trend } from "k6/metrics";

export const sendDispenseRequestTrend = new Trend(
  "sendDispenseRequest_duration",
);

export default function sendDispenseRequest(orderId, orderType) {
  const url =
    "http://172.24.220.177:16384/AutomationMockWebServiceImpl/MedPortalIntegrationWebService?WSDL";
  const isoString = new Date().toISOString();
  const msgTime = isoString.slice(0, -1);
  const quantity = "1";
  const msgUUID = uuidv4();
  const orderID = orderId;

  const orderTypeMap = {
    AUTO: {
      product: "1877075",
      upc: "0110304093414018",
      automationMachineId: "BP04",
      sender: "BoxPicker",
      receiver: "MedPortal",
    },
    MANUAL: {
      product: "1000945",
      upc: "0100382903064144",
      automationMachineId: "",
      sender: "Shelves",
      receiver: "MedPortal",
    },
  };

  const orderInfo = orderTypeMap[orderType];
  let product, automationMachineId;

  if (orderInfo) {
    product = orderInfo.product;
    automationMachineId = orderInfo.automationMachineId;
    //upc = orderInfo.upc;
  } else {
    console.log(`Order type ${orderType} not found.`);
  }

  const soapMessage = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> xmlns:pps="http://swisslog.com/ppsys" xmlns:typ="http://swisslog.com/ppsys/types"
    <soap:Body>
        <pps:dispenseRequest xmlns:pps="http://swisslog.com/ppsys">
            <pps:request xmlns:typ="http://swisslog.com/ppsys/types">
                <typ:MessageHeader>
                    <typ:MsgId>${msgUUID}</typ:MsgId>
                    <typ:MsgTime>${msgTime}</typ:MsgTime>
                    <typ:MsgType>DispenseRequest</typ:MsgType>
                    <typ:Receiver>${orderType.receiver}</typ:Receiver>
                    <typ:Sender>${orderType.sender}</typ:Sender>
                    <typ:TransCode>NEW</typ:TransCode>
                    <typ:Version>1.0</typ:Version>
                </typ:MessageHeader>
                <typ:PatientInfo>
                    </typ:ExtraInfos>
                    <typ:pointOfCare>Cardiac</typ:pointOfCare>
                </typ:PatientInfo>
                <typ:DispenseInfos>
                    <typ:DispenseInfo>
                        <typ:AdministrationDate>${msgTime}</typ:AdministrationDate>
                        <typ:AdministrationTime>${msgTime}</typ:AdministrationTime>
                        <typ:AutomationMachineId>${automationMachineId}</typ:AutomationMachineId>
                        <typ:GenericProductId>${product}</typ:GenericProductId>
                        <typ:OrderLineNumber>1</typ:OrderLineNumber>
                        <typ:Quantity>${quantity}</typ:Quantity>
                        <typ:QuantityOrdered>${quantity}</typ:QuantityOrdered>
                        <typ:ReservationKey>23</typ:ReservationKey>
                    </typ:DispenseInfo>
                </typ:DispenseInfos>
                <typ:ExtraInfos>
                    <typ:ExtraInfo>
                        <typ:FieldCode></typ:FieldCode>
                        <typ:Value></typ:Value>
                    </typ:ExtraInfo>
                </typ:ExtraInfos>
                <typ:OrderId>${orderID}</typ:OrderId>
                <typ:OrderType>NEW</typ:OrderType>
                <typ:Priority>99</typ:Priority>
            </pps:request>
        </pps:dispenseRequest>
    </soap:Body>
</soap:Envelope>`;

  // When making a SOAP POST request we must not forget to set the content type to text/xml
  let startTime = Date.now();
  const res = http.get(url, soapMessage, {
    headers: { "Content-Type": "text/xml" },
  });
  let endTime = Date.now();
  const timings = res.timings;
  console.log(`Blocked time: ${timings.blocked} ms`);
  console.log(`Connecting time: ${timings.connecting} ms`);
  console.log(`TLS handshaking time: ${timings.tls_handshaking} ms`);
  console.log(`Sending time: ${timings.sending} ms`);
  console.log(`Waiting time: ${timings.waiting} ms`);
  console.log(`Receiving time: ${timings.receiving} ms`);
  console.log(`Duration: ${timings.duration} ms`);
  console.log(
    `Call to dispenseRequests took ${endTime - startTime} milliseconds`,
  );

  {
    check(res, {
      "status is 200": (r) => r.status === 200,
      "transaction time OK": (r) => r.timings.duration < 2000,
    });

    sendDispenseRequestTrend.add(res.timings.duration);
    sleep(1);
  }
}
