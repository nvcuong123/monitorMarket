import axios from "axios";
import dayjs from "dayjs";
import {
  exchangeTimeframeToDayJsTimeUnit,
  exchangeTimeframeToTimeValue,
} from "../../utils/object-processing.js";
import _ from "lodash";

const okexBaseUrl = "https://www.okx.com";
const okexPeriods = ["5m", "1H", "1D"];
const okexSymbolMapping = (binanceSymbol) => {
  const currency = _.replace(binanceSymbol, "USDT", "");
  return currency;
};
const okesSwapInstrumentId = (binanceSymbol) => {
  const currency = _.replace(binanceSymbol, "USDT", "-USDT-SWAP");
  return currency;
};
const okexTimeframeMapping = (binanceTimeframe) => {
  let timeframe = binanceTimeframe;
  timeframe = _.replace(timeframe, "h", "H");
  timeframe = _.replace(timeframe, "d", "D");
  return timeframe;
};

// Rate Limit: 5 requests per 2 seconds
const reqLimitRate = (2 * 1000) / 5 + 1000; // plus 1000ms for safety
const okexFetching = async (config) => {
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
// Get mark price
async function fetchMarkPrice(instId = "BTC-USDT-SWAP") {
  let config = {
    method: "get",
    url: `${okexBaseUrl}/api/v5/public/mark-price?instType=SWAP&instId=${instId}`,
    headers: {},
  };
  // console.log("fetchOpenInterest:config", config);
  const response = await okexFetching(config);
  // console.log(response);
  if (response.code === "0") {
    return response.data[0].markPx;
  }
  return undefined;
}
// Get open interest: GET /api/v5/public/open-interest
export async function getOpenInterest(symbol) {
  let instType = "SWAP";
  const instId = okesSwapInstrumentId(symbol);
  let config = {
    method: "get",
    url: `${okexBaseUrl}/api/v5/public/open-interest?instType=${instType}&instId=${instId}`,
    headers: {},
  };
  // console.log("getOpenInterest:config", config);
  const swapResp = await okexFetching(config);
  // console.log(response);
  if (swapResp.code === "0") {
    return Number(swapResp.data[0].oiCcy);
  }
  return undefined;
}

// https://www.okx.com/api/v5/public/instruments?instType=FUTURES
// https://www.okx.com/api/v5/rubik/stat/trading-data/support-coin
// period [5m/1H/1D]
async function fetchOpenInterestHistory(
  symbol = "BTCUSDT",
  timeframe = "1h",
  limit = 4
) {
  const currency = okexSymbolMapping(symbol);
  const period = okexTimeframeMapping(timeframe);
  //
  if (!_.includes(okexPeriods, period)) return {};
  //
  const timeframeValue = exchangeTimeframeToTimeValue(period);
  const end = dayjs().valueOf();
  const begin = dayjs()
    .subtract(limit * timeframeValue)
    .valueOf();
  //
  let config = {
    method: "get",
    url: `${okexBaseUrl}/api/v5/rubik/stat/contracts/open-interest-volume?ccy=${currency}&period=${period}&begin=${begin}&end=${end}`,
    headers: {},
  };
  //
  const markPrice = await fetchMarkPrice(okesSwapInstrumentId(symbol));
  // console.log("markPrice", markPrice);
  // console.log("fetchOpenInterest:config", config);
  if (markPrice !== undefined) {
    const openInterestResp = await okexFetching(config);
    // console.log(openInterestResp);
    if (openInterestResp.code === "0") {
      const openInterest = openInterestResp.data;
      const lastOI = _.last(openInterest);
      const prevOI = openInterest[openInterest.length - 2];
      return {
        symbol: symbol,
        timestamp: lastOI[0],
        sumOpenInterest: (Number(lastOI[1]) / markPrice).toFixed(8), // total open interest
        sumOpenInterestValue: lastOI[1], // total open interest value
        prevSumOpenInterest: (Number(prevOI[1]) / markPrice).toFixed(8),
        prevSumOpenInterestValue: prevOI[1],
      };
    }
  }
  return {};
}

//
async function fetchLongShortRatioHistory(
  currency = "BTC",
  period = "1H",
  limit = 4
) {
  if (!_.includes(okexPeriods, period)) return {};

  const timeframeValue = exchangeTimeframeToTimeValue(period);
  const end = dayjs().valueOf();
  const begin = dayjs()
    .subtract(limit * timeframeValue)
    .valueOf();
  let config = {
    method: "get",
    url: `${okexBaseUrl}/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=${currency}&period=${period}&begin=${begin}&end=${end}`,
    headers: {},
  };
  const longShortRatio = await okexFetching(config);
  return longShortRatio.data;
}

//
const okexMarketData = {
  getOpenInterest,
  fetchOpenInterestHistory,
  fetchLongShortRatioHistory,
};

export default okexMarketData;
