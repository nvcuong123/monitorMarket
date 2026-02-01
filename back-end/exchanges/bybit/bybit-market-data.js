import axios from "axios";
import _ from "lodash";

const bybitBaseUrlV5Testnet = "https://api-testnet.bybit.com/v5";
const bybitBaseUrlV5 = "https://api.bybit.com/v5";
const byBitUrlMarket = "/market";

const bybitIntervalTimes = ["5min", "15min", "30min", "1h", "4h", "1d"];
const bybitTimeframeMapping = (binanceTimeframe) => {
  let timeframe = binanceTimeframe;
  timeframe = _.replace(timeframe, "m", "min");
  return timeframe;
};

// https://bybit-exchange.github.io/docs/v5/intro#api-rate-limit-adjustment
// The default limit is 10/s for all users
const reqLimitRate = (1 * 1000) / 10 + 1000; // plus 1000ms for safety
const bybitFetching = async (config) => {
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
// consider 5m as realtime
async function getOpenInterest(symbol = "BTCUSDT") {
  const timeframe = "5m";
  const limit = 1;
  const intervalTime = bybitTimeframeMapping(timeframe);
  let config = {
    method: "get",
    url: `${bybitBaseUrlV5}${byBitUrlMarket}/open-interest?category=linear&symbol=${symbol}&intervalTime=${intervalTime}&limit=${limit}`,
    headers: {},
  };
  // console.log("fetchOpenInterest:config", config);

  const realtimeOI = await bybitFetching(config);
  // console.log("getOpenInterest", symbol, realtimeOI);
  if (realtimeOI.retCode === 0) {
    return realtimeOI.result.list[0].openInterest;
  } else {
    return undefined;
  }
}

/**intervalTime string[] required
Possible values: [5min, 15min, 30min, 1h, 4h, 1d]
 */
async function fetchOpenInterestHistory(symbol = "BTCUSDT", timeframe = "1h") {
  const intervalTime = bybitTimeframeMapping(timeframe);
  if (!_.includes(bybitIntervalTimes, intervalTime)) return {};
  //
  const limit = 2;
  let config = {
    method: "get",
    url: `${bybitBaseUrlV5}${byBitUrlMarket}/open-interest?category=linear&symbol=${symbol}&intervalTime=${intervalTime}&limit=${limit}`,
    headers: {},
  };
  // console.log("fetchOpenInterest:config", config);
  const openInterest = (await bybitFetching(config)).result.list;
  // console.log(openInterest);
  const lastOI = _.first(openInterest);
  const prevOI = _.nth(openInterest, 1);
  return {
    symbol: symbol,
    timestamp: lastOI.timestamp,
    sumOpenInterest: lastOI.openInterest, // total open interest
    sumOpenInterestValue: "NA", // total open interest value
    prevSumOpenInterest: prevOI.openInterest,
    prevSumOpenInterestValue: "NA",
  };
}

/**category string[] required
    Possible values: [linear, inverse]
    Product type
  symbol string required
    Symbol name
  period string[] required
    Possible values: [5min, 15min, 30min, 1h, 4h, 1d]
    period
  limit integer
    Default value: 50
    Maximum 500
 */
async function fetchLongShortRatioHistory(
  symbol = "BTCUSDT",
  period = "1h",
  limit = 4
) {
  let config = {
    method: "get",
    url: `${bybitBaseUrlV5}${byBitUrlMarket}/account-ratio?category=linear&symbol=${symbol}&period=${period}&limit=${limit}`,
    headers: {},
  };
  const longShortRatio = await bybitFetching(config);
  // console.log("bybit", longShortRatio);
  return longShortRatio.result.list;
}

const bybitMarketData = {
  getOpenInterest,
  fetchOpenInterestHistory,
  fetchLongShortRatioHistory,
};

export default bybitMarketData;
