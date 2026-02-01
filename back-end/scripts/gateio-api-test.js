import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

// REST api
import GateApi from "gate-api";
const client = new GateApi.ApiClient();
// uncomment the next line to change base path
client.basePath = "https://fx-api-testnet.gateio.ws/api/v4";
// Configure Gate APIv4 key authentication:
client.setApiKeySecret(
  process.env.GATEIO_TR7_API_KEY_PERP_FUTURE_TESTNET,
  process.env.GATEIO_TR7_API_SCRET_KEY_PERP_FUTURE_TESTNET
);

const api = new GateApi.FuturesApi(client);
const settle = "usdt"; // 'btc' | 'usdt' | 'usd' | Settle currency
const opts = {
  contract: "BTC_USDT", // string | Futures contract, return related data only if specified
};
// api.listFuturesTickers(settle, opts).then(
//   (value) =>
//     console.log("API called successfully. Returned data: ", value.body),
//   (error) => console.error(error)
// );
// api.listFuturesContracts(settle).then(
//   (value) =>
//     console.log("API called successfully. Returned data: ", value.body),
//   (error) => console.error(error)
// );
const contract = "BTC_USDT"; // string | Futures contract
api.getFuturesContract(settle, contract).then(
  (value) =>
    console.log("API called successfully. Returned data: ", value.body),
  (error) => console.error(error)
);

// const contract = "BTC_USDT"; // string | Futures contract
// const status = "open"; // 'open' | 'finished' | Only list the orders with this status
// const opts = {
//   limit: 100, // number | Maximum number of records to be returned in a single list
//   offset: 0, // number | List offset, starting from 0
//   lastId: "12345", // string | Specify list staring point using the `id` of last record in previous list-query results
// };
// api.listFuturesOrders(settle, contract, status, opts).then(
//   (value) =>
//     console.log("API called successfully. Returned data: ", value.body),
//   (error) => console.error(error)
// );
/*
// Web socket
const crypto = require("crypto");

const WebSocket = require("ws");
const GateApi = require("gate-api");

let wsclient = new WebSocket("wss://api.gateio.ws/ws/v4/");

wsclient["on"]("message", (data) => {
  const obj = JSON.parse(data);
  console.log(JSON.stringify(obj));
  // enjoy with data
});

wsclient["on"]("open", () => {
  console.log("Connected to Service");
  subscribe2Orders();
});

function subscribe2Orders() {
  const time = parseInt(new Date().getTime() / 1000);
  const message = `channel=${"spot.orders"}&event=${"subscribe"}&time=${time}`;

  const hash = crypto
    .createHmac(
      "sha512",
      "b41a1ae315ef35a3d56497e6e694cd335724f7d6e5afd910efb770f0892c5f30"
    )
    .update(message)
    .digest("hex");

  const request = {
    id: time * 1e6,
    time: time,
    channel: "spot.orders",
    event: "subscribe",
    payload: ["BTC_USDT"],
    auth: {
      method: "api_key",
      KEY: "dba2b5c9f323747679ad704d7c2d0306",
      SIGN: hash,
    },
  };

  wsclient.send(JSON.stringify(request));
}
*/
