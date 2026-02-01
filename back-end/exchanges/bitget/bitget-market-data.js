import axios from "axios";

const bitgetBaseUrlV5Testne = "https://api-testnet.bybit.com/v5";
const bitgettBaseUrlV5 = "https://api.bitget.com/api/v2/mix";
const bitgetUrlMarket = "/market";

// Frequency limit:10 times/1s
const reqLimitRate = (1 * 1000) / 10 + 1000; // plus 1000ms for safety
const bitgetFetching = async (config) => {
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

//
async function getOpenInterest(
  symbol = "BTCUSDT",
  intervalTime = "1h",
  limit = 4
) {
  let config = {
    method: "get",
    url: `${bitgettBaseUrlV5}${bitgetUrlMarket}/open-interest?symbol=${symbol}&productType=usdt-futures`,
    headers: {},
  };
  const realtimeOI = await bitgetFetching(config);
  // console.log("realtimeOI", realtimeOI);
  if (realtimeOI.code === "00000") {
    return realtimeOI.data.openInterestList[0].size;
  }

  return undefined;
}
// TODO:
async function fetchOpenInterestHistory(
  symbol = "BTCUSDT",
  intervalTime = "1h",
  limit = 4
) {
  let config = {
    method: "get",
    url: `${bitgettBaseUrlV5}${bitgetUrlMarket}/open-interest?symbol=${symbol}&productType=usdt-futures`,
    headers: {},
  };
  console.log("fetchOpenInterest:config", config);

  const openInterest = (await bitgetFetching(config)).data.openInterestList;
  // const lastOI = _.last(openInterest);
  // const prevOI = openInterest[openInterest.length - 2];
  // return {
  //   symbol: symbol,
  //   sumOpenInterest: lastOI.sumOpenInterest, // total open interest
  //   sumOpenInterestValue: lastOI.sumOpenInterestValue, // total open interest value
  //   timestamp: lastOI.timestamp,
  //   prevSumOpenInterestValue: prevOI.sumOpenInterestValue,
  // };

  return openInterest;
}
//
async function fetchLongShortRatioHistory(
  symbol = "BTCUSDT",
  period = "1h",
  limit = 4
) {
  return {};
  // TODO: not find out endpoint
  let config = {
    method: "get",
    url: `${bitgettBaseUrlV5}${bitgetUrlMarket}/open-interest?symbol=${symbol}&productType=usdt-futures`,
    headers: {},
  };
  const longShortRatio = await bybitFetching(config);
  // console.log("bitget", longShortRatio);
  return longShortRatio.result.list;
}

const bitgetMarketData = {
  getOpenInterest,
  // fetchOpenInterestHistory,
  fetchLongShortRatioHistory,
};

export default bitgetMarketData;
