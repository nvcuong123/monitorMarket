import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import axios from "axios";
// import { binance } from "./binance-market-data.js";
import Binance from "node-binance-api";
import _ from "lodash";
import dayjs from "dayjs";

export const binance = new Binance().options({
  test: false,
  APIKEY: "",
  APISECRET: "",
  // reconnect: true,
});

export function checkBinanceFuturesRateLimit() {
  try {
    axios
      .get("https://fapi.binance.com/fapi/v1/ping")
      .then((response) => {
        console.log(
          "Used weight (1 min):",
          response.headers["x-mbx-used-weight-1m"]
        );
        console.log(
          "Used weight (5 min):",
          response.headers["x-mbx-used-weight-5m"]
        );
        console.log(
          "Used weight (15 min):",
          response.headers["x-mbx-used-weight-15m"]
        );
        console.log(
          "Order count (1 min):",
          response.headers["x-mbx-order-count-1m"]
        );
        console.log(
          "Order count (1 sec):",
          response.headers["x-mbx-order-count-1s"]
        );
        console.log(
          "Order count (10 sec):",
          response.headers["x-mbx-order-count-10s"]
        );
        console.log(
          "Order count (1 hour):",
          response.headers["x-mbx-order-count-1h"]
        );
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log("error inside checkBinanceFuturesRateLimit", error);
  }
}

// checkBinanceFuturesRateLimit();

// 500/5min/IP  -> increase to 10p for 500req for safty purpose
const reqLimitRate = 4000; //(10 * 60 * 1000) / 500 + 1000; // plus 1000ms for safety
const binanceFetching = async (config) => {
  const start = Date.now();
  const data = await axios(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });

  const json = await data;
  const end = Date.now();
  const duration = end - start;
  if (duration < reqLimitRate) {
    await new Promise((resolve) =>
      setTimeout(resolve, reqLimitRate - duration)
    );
  }
  return json;
};

/**[
  {
    symbol: 'BTCUSDT',
    sumOpenInterest: '89076.39900000',
    sumOpenInterestValue: '2443321086.37050000',
    timestamp: 1696296000000
  },
  {
    symbol: 'BTCUSDT',
    sumOpenInterest: '89098.70300000',
    sumOpenInterestValue: '2446195980.99470000',
    timestamp: 1696296300000
  }
] */
export async function getOpenInterestHist(
  symbol = "BTCUSDT",
  period = "5m",
  limit = 4
) {
  try {
    const url = `https://www.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log("error inside getOpenInterestHist", symbol, period, error);
  }
}
//
async function getOpenInterest(symbol) {
  return undefined;
  console.log(dayjs().format("HH:mm:ss:SSS"), "getOpenInterest", symbol);
  try {
    let config = {
      method: "get",
      url: `https://www.binance.com/fapi/v1/openInterest?symbol=${symbol}`,
      headers: {},
    };
    const realtimeOI = await binanceFetching(config); //binance.publicRequest(config.url);
    // console.log("openInterest", realtimeOI);
    return Number(realtimeOI.openInterest);
  } catch (error) {
    console.log("error inside getOpenInterest", symbol);
  }
  return undefined;
}
//
export async function openInterestHist(
  symbol = "BTCUSDT",
  period = "5m",
  limit = 4
) {
  try {
    let config = {
      method: "get",
      url: `https://www.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`,
      // url: `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`,
      headers: {},
    };
    const openInterest = await binance.publicRequest(config.url);
    const lastOI = _.last(openInterest);
    const prevOI = openInterest[openInterest.length - 2];
    const percentChange =
      ((Number(lastOI.sumOpenInterest) - Number(prevOI.sumOpenInterest)) *
        100) /
      Number(prevOI.sumOpenInterest);
    console.log("binance", period, percentChange.toFixed(2));
    return {
      symbol: symbol,
      timestamp: lastOI.timestamp,
      sumOpenInterest: lastOI.sumOpenInterest, // total open interest
      sumOpenInterestValue: lastOI.sumOpenInterestValue, // total open interest value
      prevSumOpenInterest: prevOI.sumOpenInterest,
      prevSumOpenInterestValue: prevOI.sumOpenInterestValue,
    };
  } catch (error) {
    console.log("error inside getOpenInterestHist", symbol, period, error);
  }
}

async function topLongShortAccountRatio(
  symbol = "BTCUSDT",
  period = "1h",
  limit = 2
) {
  let config = {
    method: "get",
    url: `https://fapi.binance.com/futures/data/topLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=${limit}`,
    headers: {},
  };
  const longShortRatio = await binance.publicRequest(config.url);
  console.log("longShortRatio", longShortRatio);
  return longShortRatio;
}
async function topLongShortPositionRatio(
  symbol = "BTCUSDT",
  period = "1h",
  limit = 2
) {
  let config = {
    method: "get",
    url: `https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=${symbol}&period=${period}&limit=${limit}`,
    headers: {},
  };
  const longShortRatio = await binance.publicRequest(config.url);
  // console.log("longShortRatio", longShortRatio);
  return longShortRatio;
}
async function globalLongShortAccountRatio(
  symbol = "BTCUSDT",
  period = "1h",
  limit = 2
) {
  let config = {
    method: "get",
    url: `https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=${limit}`,
    headers: {},
  };
  const longShortRatio = await binance.publicRequest(config.url);
  // console.log("longShortRatio", longShortRatio);
  return longShortRatio;
}
async function takerlongshortRatio(
  symbol = "BTCUSDT",
  period = "1h",
  limit = 2
) {
  let config = {
    method: "get",
    url: `https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=${symbol}&period=${period}&limit=${limit}`,
    headers: {},
  };
  const longShortRatio = await binance.publicRequest(config.url);
  // console.log("longShortRatio", longShortRatio);
  return longShortRatio;
}

export function isTimeToReloadFundingRateHist() {}

const binancePublicData = {
  getOpenInterestHist,
  getOpenInterest,
  openInterestHist,
  topLongShortAccountRatio,
  topLongShortPositionRatio,
  globalLongShortAccountRatio,
  takerlongshortRatio,
};
export default binancePublicData;
