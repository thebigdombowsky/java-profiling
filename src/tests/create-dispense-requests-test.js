import { sleep, check } from "k6";
import http from "k6/http";
import { uuidv4 } from "../utils.js";
import { Trend } from "k6/metrics";

export const sendDispenseRequestTrend = new Trend(
  "sendDispenseRequest_duration",
);

export default function sendDispenseRequest(orderType) {
  const url =
    "http://172.24.220.177:16384/AutomationMockWebServiceImpl/MedPortalIntegrationWebService?WSDL";
  const isoString = new Date().toISOString();
  const msgTime = isoString.slice(0, -1);
  const quantity = "1";
  const msgUUID = uuidv4();

  const orderTypeMap = {
    AUTO: {
      product: "1877075",
      upc: "0130382903064145",
      automationMachineId: "BP04",
      sender: "BoxPicker",
      receiver: "MedPortal",
    },
    MANUAL: {
      product: "1000945",
      upc: "0100382903064144",
      automationMachineId: "BP04",
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
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <ns1:dispenseRequest xmlns:ns1="http://swisslog.com/ppsys">
            <ns1:request xmlns:ns2="http://swisslog.com/ppsys/types">
                <ns2:MessageHeader>
                    <ns2:MsgId>${msgUUID}</ns2:MsgId>
                    <ns2:MsgTime>${msgTime}</ns2:MsgTime>
                    <ns2:MsgType>DispenseRequest</ns2:MsgType>
                    <ns2:Receiver>${orderType.receiver}</ns2:Receiver>
                    <ns2:Sender>${orderType.sender}</ns2:Sender>
                    <ns2:TransCode>NEW</ns2:TransCode>
                    <ns2:Version>1.0</ns2:Version>
                </ns2:MessageHeader>
                <ns2:PatientInfo>
                    </ns2:ExtraInfos>
                    <ns2:pointOfCare>Cardiac</ns2:pointOfCare>
                </ns2:PatientInfo>
                <ns2:DispenseInfos>
                    <ns2:DispenseInfo>
                        <ns2:AdministrationDate>${msgTime}</ns2:AdministrationDate>
                        <ns2:AdministrationTime>${msgTime}</ns2:AdministrationTime>
                        <ns2:AutomationMachineId>$automationMachineId}</ns2:AutomationMachineId>
                        <ns2:GenericProductId>${product}</ns2:GenericProductId>
                        <ns2:OrderLineNumber>1</ns2:OrderLineNumber>
                        <ns2:Quantity>1</ns2:Quantity>
                        <ns2:QuantityOrdered>1</ns2:QuantityOrdered>
                        <ns2:ReservationKey>23</ns2:ReservationKey>
                    </ns2:DispenseInfo>
                </ns2:DispenseInfos>
                <ns2:ExtraInfos>
                    <ns2:ExtraInfo>
                        <ns2:FieldCode></ns2:FieldCode>
                        <ns2:Value></ns2:Value>
                    </ns2:ExtraInfo>
                </ns2:ExtraInfos>
                <ns2:OrderId></ns2:OrderId>
                <ns2:OrderType></ns2:OrderType>
                <ns2:Priority></ns2:Priority>
            </ns1:request>
        </ns1:dispenseRequest>
    </soap:Body>
</soap:Envelope>`;

  // When making a SOAP POST request we must not forget to set the content type to text/xml
  let startTime = Date.now();
  const res = http.get(url, soapMessage, {
    headers: { "Content-Type": "text/xml" },
  });
  let endTime = Date.now();
  console.log(
    `Call to createDispenseRequests took ${endTime - startTime} milliseconds`,
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
