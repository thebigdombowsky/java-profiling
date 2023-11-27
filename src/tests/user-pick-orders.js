// Creator: k6 Browser Recorder 0.6.2

import { sleep, group } from "k6";
import http from "k6/http";

function logCookie(c) {
  const output = `
     ${c.name}: ${c.value}
     tdomain: ${c.domain}
     tpath: ${c.path}
     texpires: ${c.expires}
     thttpOnly: ${c.http_only}
  `;
  console.log(output);
}

export default function main() {
  let response;

  group("Main Page", function () {
    response = http.get("https://pm21x-perf-shva.sl-hc.com/", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "null",
        "upgrade-insecure-requests": "1",
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    });
    let jar = http.cookieJar();
    let cookies = jar.cookiesForURL(response.url);
    console.log("CC::" + JSON.stringify(cookies));
    sleep(1.1);
  });

  group("Login", function () {
    response = http.post(
      "https://pm21x-perf-shva.sl-hc.com/auth/realms/Swisslog/login-actions/authenticate?session_code=Lo8-ZxHIaxjEle0LsTlMjtUpggW_WSt4WYVnUHMtWDs&execution=e6c9ac7c-3f11-471d-abb9-26637393fe44&client_id=medportal&tab_id=KssTUDWY38g",
      {
        username: "systemadmin",
        password: "max",
      },
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          origin: "null",
          "upgrade-insecure-requests": "1",
          "sec-ch-ua":
            '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
        },
      },
    );
    for (const name in response.cookies) {
      if (response.cookies.hasOwnProperty(name) !== undefined) {
        console.log("Login");
        logCookie(response.cookies[name][0]);
      }
    }
  });

  response = http.post(
    "https://pm21x-perf-shva.sl-hc.com/auth/realms/Swisslog/protocol/openid-connect/token",
    {
      code: "117d1aad-fa1b-41f2-902e-2eecffbb69c9.3bde5ca5-ad19-4ab3-9ed9-b2a6f2d5ec60.7838fcd2-dfdf-49f1-9ade-8ce1539740ae",
      grant_type: "authorization_code",
      client_id: "medportal",
      redirect_uri: "https://pm21x-perf-shva.sl-hc.com/",
    },
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-1");
      logCookie(response.cookies[name][0]);
    }
  }

  let access_token1 =
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJoVW9DZ2g2aTYwQmZCTmIxc25uUVlvWUZ6NExqLWhhckZvbnZvcnpPWjNjIn0.eyJleHAiOjE2MDA3NDQxMzYsImlhdCI6MTYwMDc0MzgzNiwiYXV0aF90aW1lIjoxNjAwNzQyMTkzLCJqdGkiOiIyZDI1MmYyOS1iYmJhLTQ5N2QtOTZmZC00NDliZDQwNjRhODEiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMTEvYXV0aC9yZWFsbXMvU3dpc3Nsb2ciLCJzdWIiOiJlNmJhZmQ0Ny0yZWM1LTQwMzMtYjgxMy02ZDU2OWRlMDYzZWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzd2lzc2xvZy1wb3J0YWwiLCJzZXNzaW9uX3N0YXRlIjoiMjJhNzk4NTktNzZkZi00NDZmLWI2ZjQtOTIwOGFhNjYzYzdmIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJETUFETUlOUGVybWlzc2lvbiIsIlByUiIsIlByVSIsIlBSIiwiUHJEIiwib2ZmbGluZV9hY2Nlc3MiLCJJUiIsInVtYV9hdXRob3JpemF0aW9uIiwiUGZDIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgb3JnLWF1dGh6LWNsaWVudC1zY29wZSIsInVzZXJfbmFtZSI6ImF1dG90ZXN0LXVzZXIiLCJvcmdBdXRoeiI6Ii86UHJVLFByUixQckQ7L0hRMi9TWjpQUixQZkMsRE1BRE1JTlBlcm1pc3Npb24sSVI7L0hROkRNQURNSU5QZXJtaXNzaW9uOy9IUS9OWjpJUiIsInVzZXJuYW1lIjoiYXV0b3Rlc3QtdXNlciJ9.UnAtsQR0MHGZh6szJjzZ5qEigB8HD2TZNEjKQbJ2Gzcp-cdhtmPvpzxk5tSo4Ek0-U2aE2V2H9yvqnpU1LS04r4pSgQLup03PhzhPgeDuXQc75v42NKufX_FtD-V6vgUlnMgmoPt2sMKvCv6CVX6Fa7XiagZjnsVFNJeSZQ7eomk-4pWBTaNv-JA3TELz6TMS0_coHbcY2Zj4u8JI6EtVAHhAjeaU-Jpgf_ic-iVtj9w7XBRGARpfx0OQUg9KyS3szhXfXvvt58p5YYxkFYtrzBJpSY1F8F-7BYdboz_2BTbKKjj4xH1iCD1qNyfsoQUYyPe1RedeLyVM955CDK3rQ";

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/auth/realms/Swisslog/account",
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${access_token1}`,
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        referer: "https://pm21x-perf-shva.sl-hc.com/",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  console.log(response);
  console.log(response.cookies.valueOf());
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-2");
      logCookie(response.cookies[name][0]);
    }
  }

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/medportal/rest/api/user/profile?t=1699543627370",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `bearer ${access_token1}`,
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-3");
      logCookie(response.cookies[name][0]);
    }
  }

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/medportal/rest/api/user/permissions?t=1699543627369",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `bearer ${access_token1}}`,
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-4");
      logCookie(response.cookies[name][0]);
    }
  }

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/preference1/api/preferences/DrugEnum/locale/en/data",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `bearer ${access_token1}`,
        "content-type": "application/json",
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-5");
      logCookie(response.cookies[name][0]);
    }
  }
  sleep(0.8);

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/medportal/rest/api/locations?t=1699543628126",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `bearer ${access_token1}`,
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-6");
      logCookie(response.cookies[name][0]);
    }
  }

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/medportal/rest/api/expired/products?facilityId=facility%252FIURXISCIU%252FIURXISC-ISC%2520PHARMACY%2520DISTRIBUTION&facilityId=facility%252FIURXISCIU%252FIURXISC-ISC%2520PHARMACY%2520DISTRIBUTION",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `bearer ${access_token1}`,
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-7");
      logCookie(response.cookies[name][0]);
    }
  }

  response = http.get(
    "https://pm21x-perf-shva.sl-hc.com/medportal/rest/api/stockouts?facilityId=facility%252FIURXISCIU%252FIURXISC-ISC%2520PHARMACY%2520DISTRIBUTION&facilityId=facility%252FIURXISCIU%252FIURXISC-ISC%2520PHARMACY%2520DISTRIBUTION",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `bearer ${access_token1}`,
        "sec-ch-ua":
          '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    },
  );
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Login-8");
      logCookie(response.cookies[name][0]);
    }
  }

  sleep(14.8);

  group("Pick New Orders", function () {
    response = http.post(
      "https://pm21x-perf-shva.sl-hc.com/medportal/com/swisslog/wm6/medportal/web/page/pick/neworder/MP012_01_NewOrder.xhtml?dswid=8674",
      {
        "javax.faces.partial.ajax": "true",
        "javax.faces.source": "pageForm:scrollableAreaHeightUpdater",
        "javax.faces.partial.execute":
          "pageForm:scrollableAreaHeight pageForm:scrollableAreaHeightUpdater",
        "pageForm:scrollableAreaHeightUpdater":
          "pageForm:scrollableAreaHeightUpdater",
        pageForm: "pageForm",
        "pageForm:tableFilter:defaultFilterInput": "",
        "pageForm:tableFilter:scanProductId": "",
        "pageForm:tableFilter:j_idt73:simpleDateNot": "false",
        "pageForm:tableFilter:j_idt73:j_idt87_input": "11.09.2023",
        "pageForm:tableFilter:j_idt73:j_idt89_input": "11.09.2023",
        "pageForm:tableFilter:j_idt73:anyNoneSelector": "false",
        "pageForm:tableFilter:j_idt73:complexDateNot": "false",
        "pageForm:tableFilter:j_idt73:complexDateInput": "",
        "pageForm:tableFilter:j_idt73_activeIndex": "0",
        "pageForm:orderTable:rowsPerPageSelector:rowPerPage_input": "50",
        "pageForm:orderTable:rowsPerPageSelector:rowPerPage_focus": "",
        "pageForm:orderTable_scrollState": "0,0",
        "pageForm:scrollableAreaHeight": "181px",
        "javax.faces.ViewState": "1931413480274199225:1453469987666827859",
      },
      {
        headers: {
          accept: "application/xml, text/xml, */*; q=0.01",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "faces-request": "partial/ajax",
          "x-requested-with": "XMLHttpRequest",
          "sec-ch-ua":
            '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
        },
      },
    );
  });
  for (const name in response.cookies) {
    if (response.cookies.hasOwnProperty(name) !== undefined) {
      console.log("Pick New Orders");
      logCookie(response.cookies[name][0]);
    }
  }
  sleep(8.1);
}
