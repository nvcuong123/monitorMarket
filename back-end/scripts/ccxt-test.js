import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

// JavaScript
import ccxt from "ccxt";
// console.log(ccxt.exchanges);
(async () => {
  // const binance = new ccxt.binance({
  //   apiKey: process.env.BINANCE_TR7_API_KEY_PERP_FUTURE_TESTNET,
  //   secret: process.env.BINANCE_TR7_API_SCRET_KEY_PERP_FUTURE_TESTNET,
  //   options: {
  //     defaultType: "future",
  //     warnOnFetchOpenOrdersWithoutSymbol: false,
  //   },
  // });
  // binance.setSandboxMode(true);
  // console.log("balance", await binance.fetchBalance());
  // console.log("orderbook", await binance.fetchOrderBook("BTC/USDT"));
  //
  const gateio = new ccxt.gate({
    apiKey: process.env.USER_TR7_API_KEY_GATEIO_PERP_FUTURE_TESTNET,
    secret: process.env.USER_TR7_API_SCRET_KEY_GATEIO_PERP_FUTURE_TESTNET,
    options: {
      defaultType: "future",
      warnOnFetchOpenOrdersWithoutSymbol: false,
    },
  });
  gateio.setSandboxMode(true); //testnet
  await gateio.loadMarkets(true);
  // console.log(gateio.symbols);
  console.log("gateio:orders", await gateio.fetchOpenOrders("BTC_USDT"));
  console.log("gateio:positions", await gateio.fetchPositions());
})();
