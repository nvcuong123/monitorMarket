import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({
  path: "/Users/sitruong_tr7/Work/TR7-Crypto/tr7-trading-bot/back-end/.env",
});

import GateIOFutures from "./gateio-futures.js";
import GateWebSocketApp from "./gateio-futures-ws.js";
import _ from "lodash";

// Access the environment variables in your code
const apiKey = process.env.USER_DATFUTURES_API_KEY_GATEIO_PERP_FUTURE;
const apiSecret = process.env.USER_DATFUTURES_API_SCRET_KEY_GATEIO_PERP_FUTURE;
// const apiKey = process.env.USER_TR7_API_KEY_GATEIO_PERP_FUTURE;
// const apiSecret = process.env.USER_TR7_API_SCRET_KEY_GATEIO_PERP_FUTURE;

const gateIOFuttures = new GateIOFutures(
  false,
  "test-api-key",
  apiKey,
  apiSecret
);
// NOTE: testnet does not support endpoint price trigger order

async function testing() {
  await gateIOFuttures.start();
  const currentDate = Math.floor(new Date().getTime() / 1000);
  let sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);
  sixMonthsAgo = Math.floor(sixMonthsAgo.getTime() / 1000); // Convert milliseconds to seconds
  console.log("Current Date:", currentDate);
  console.log("Six Months Ago:", sixMonthsAgo);

  const listPositionClose = (
    await gateIOFuttures.futuresApi.listPositionClose("usdt", {
      from: sixMonthsAgo,
      to: currentDate,
    })
  ).body;
  console.log("positons closed");
  let pnlP = 0;
  let pnlN = 0;
  _.forEach(listPositionClose, (position, index) => {
    if (index === 0 || index === _.size(listPositionClose) - 1) {
      console.log("position", position);
    }
    if (position.pnl > 0) {
      pnlP += Number(position.pnl);
    } else {
      pnlN += Number(position.pnl);
    }
  });
  console.log(
    "pnl duong",
    pnlP.toFixed(4),
    "pnl am",
    pnlN.toFixed(4),
    "tong",
    (pnlP + pnlN).toFixed(4)
  );

  // const priceTriggerOrders =
  //   await gateIOFuttures.fetchFuturesPriceTriggerOrders();
  // console.log("priceTriggerOrders", priceTriggerOrders);
  //
  // const ordersWTime = await gateIOFuttures.futuresApi.getOrdersWithTimeRange(
  //   "usdt",
  //   {}
  // );
  // console.log("ordersWTime", ordersWTime);
  // const contract = await gateIOFuttures.futuresApi.getFuturesContract(
  //   "usdt",
  //   "BTM_USDT"
  // );
  // console.log("contract", contract.body);
  // const position = await gateIOFuttures.futuresApi.getDualModePosition(
  //   "usdt",
  //   "BTM_USDT"
  // );
  // console.log("contract", position.body);
  // const contract = await gateIOFuttures.futuresApi.getFuturesContract(
  //   "usdt",
  //   "BTC_USDT"
  // );
  // console.log("contract", contract.body);
  // const contracts = await gateIOFuttures.fetchFuturesContracts();
  // console.log("contracts", contracts);
  // const trades = await gateIOFuttures.fetchFuturesTrades("BTC_USDT");
  // console.log("trades", trades);
  // const openOrders = await gateIOFuttures.fetchFuturesOpenOrders();
  // console.log("openOrders", openOrders);
  // const positions = await gateIOFuttures.fetchPositions();
  // console.log("positions", positions);
  // const accounts = await gateIOFuttures.fetchFuturesAccount();
  // console.log("accounts", accounts);
  // const placeOrder = await gateIOFuttures.futuresPlaceNewOrder({
  //   symbol: "BTCUSDT",
  //   mode: "Isolated",
  //   side: "Short",
  //   leverage: "5",
  //   type: "Market",
  //   amount: "100",
  //   price: "",
  //   tp: "10",
  //   sl: "10",
  //   tpslPercentType: 0,
  //   placeType: "new order",
  // });
  // const placeOrder = await gateIOFuttures.futuresPlaceNewOrder({
  //   symbol: "BTCUSDT",
  //   mode: "Isolated",
  //   side: "Long",
  //   leverage: "5",
  //   type: "Limit",
  //   amount: "100",
  //   price: "61130",
  //   tp: "10",
  //   sl: "10",
  //   tpslPercentType: 0,
  //   placeType: "new order",
  // });
  /**
   * placeOrder FuturesOrder {
  id: 3681249675,
  user: 12794036,
  createTime: 1715681601.762,
  finishTime: undefined,
  finishAs: undefined,
  status: 'open',
  contract: 'BTC_USDT',
  size: 16,
  iceberg: 0,
  price: '61130',
  close: undefined,
  isClose: false,
  reduceOnly: undefined,
  isReduceOnly: false,
  isLiq: false,
  tif: 'gtc',
  left: 16,
  fillPrice: '0',
  text: 'api',
  tkfr: '0.0005',
  mkfr: '0.00015',
  refu: 0,
  autoSize: undefined,
  stpId: 0,
  stpAct: '-',
  amendText: '-',
  bizInfo: 'dual'
}
   */
  // console.log("placeOrder", placeOrder);
  /**
 * USDT Contract
Base URLs:

Real Trading: wss://fx-ws.gateio.ws/v4/ws/usdt
TestNet: wss://fx-ws-testnet.gateio.ws/v4/ws/usdt
 */
  // Usage example
  // const app = new GateWebSocketApp(
  //   true,
  //   USER_TR7_API_KEY_GATEIO_PERP_FUTURE_TESTNET,
  //   USER_TR7_API_SCRET_KEY_GATEIO_PERP_FUTURE_TESTNET,
  //   (message) => {
  //     console.log("callback from ws", message);
  //   }
  // );
}
testing();
