// import fetch from "node-fetch";
import axios from "axios";
import dayjs from "dayjs";
import _ from "lodash";

export const timeFrameDisplayDate = ["h1", "h4", "h8", "h12", "h24", "all"];
// curl --request GET \
//      --url 'https://open-api.coinglass.com/public/v2/long_short?time_type=h1&symbol=BTC' \
//      --header 'accept: application/json' \
//      --header 'coinglassSecret: 640ee594b3de4f8e97a7f95aaceec7bf'
export const coinglassExchangeList = [
  "Binance",
  "Bitmex",
  "Bybit",
  "CME",
  "OKX",
  "Deribit",
  "Kraken",
  "Bitfinex",
  "Huobi",
  "Bitget",
  "dYdX",
  "CoinEx",
  "Gate",
];

export const symbolList = [
  "BTC",
  "ETH",
  "BNB",
  "XRP",
  "LTC",
  "DOGE",
  "SOL",
  "DOT",
  "ADA",
  "MATIC",
  "ETC",
  "LINK",
  "APE",
  "BCH",
  "TRX",
  "EOS",
  "FIL",
  "CHZ",
  "OP",
  "AXS",
  "AVAX",
  "FTM",
  "ATOM",
  "DYDX",
  "NEAR",
  "APT",
  "1000SHIB",
  "1000LUNA",
];
export const timeFrameList = [
  // "m1",
  // "m5",
  // "m15",
  // "m30",
  "h1",
  "h4",
  // "h8",
  "h12",
  "h24",
  "all",
];
export const timeFrameList_OI = ["h1", "h4", "h12", "all"];

const COINGLASS_API_KEY = "640ee594b3de4f8e97a7f95aaceec7bf";
const COINGLASS_API_URL = "https://open-api.coinglass.com/public/v2";
const PERPETUAL_MARKET = "perpetual_market";
const FUNDING_RATE = "funding";
const FUNDING_USD_HISTORY = "funding_usd_history";
const OPEN_INTEREST = "open_interest";
const OPEN_INTEREST_HISTORY = "open_interest_history";
const LONG_SHORT_HISTORY = "long_short_history";
const LONG_SHORT = "long_short";

const options = {
  method: "GET",
  mode: "cors",
  headers: {
    accept: "application/json",
    coinglassSecret: COINGLASS_API_KEY,
  },
};
//
const reqLimitRate = (1 * 60 * 1000) / 30 + 1000; // plus 1000ms for safety
const coinglassFetching = async (coinglassUrl, options) => {
  const start = Date.now();
  const data = axios
    .get(coinglassUrl, options)
    .then((response) => {
      // console.log("fetchOpenInterest>response.data", response.data);
      return response.data;
    })
    .catch((err) => console.error(err));

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

export const fetchFundingRateHistoryUsd = async (symbol, timeFrame) => {
  var urlFundingRateHistoryUsd = `${COINGLASS_API_URL}/${FUNDING_USD_HISTORY}?symbol=${symbol}&time_type=${timeFrame}`;
  // console.log("production urlFundingRateHistoryUsd", urlFundingRateHistoryUsd);
  // if (process.env.NODE_ENV !== "production") {
  //   urlFundingRateHistoryUsd = `/public/v2/${FUNDING_USD_HISTORY}?symbol=${symbol}&time_type=${timeFrame}`;
  // }
  // console.log("urlFundingRateHistoryUsd", urlFundingRateHistoryUsd);

  const data = axios
    .get(urlFundingRateHistoryUsd, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};

export const fetchOpenInterest = async (symbol) => {
  var urlOpenInterest = `${COINGLASS_API_URL}/${OPEN_INTEREST}?symbol=${symbol}`;
  return coinglassFetching(urlOpenInterest, options);

  // const data = axios
  //   .get(urlOpenInterest, options)
  //   .then((response) => {
  //     // console.log("fetchOpenInterest>response.data", response.data);
  //     return response.data;
  //   })
  //   .catch((err) => console.error(err));

  // const json = await data;

  // return json;
};

export const fetchOpenInterestHistoryUsd = async (symbol, timeFrame) => {
  var urlOpenInterestHistoryUsd = `${COINGLASS_API_URL}/${OPEN_INTEREST_HISTORY}?symbol=${symbol}&time_type=${timeFrame}&currency=USD`;
  // console.log(
  //   "production urlOpenInterestHistoryUsd",
  //   urlOpenInterestHistoryUsd
  // );
  // if (process.env.NODE_ENV !== "production") {
  //   urlOpenInterestHistoryUsd = `/public/v2/${OPEN_INTEREST_HISTORY}?symbol=${symbol}&time_type=${timeFrame}&currency=USD`;
  // }
  // console.log("urlOpenInterestHistoryUsd", urlOpenInterestHistoryUsd);

  const data = axios
    .get(urlOpenInterestHistoryUsd, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};

export const fetchLongShortRatioHistory = async (symbol, timeFrame) => {
  var urlLongShortHistory = `${COINGLASS_API_URL}/${LONG_SHORT_HISTORY}?time_type=${timeFrame}&symbol=${symbol}`;
  // console.log("production urlOpenInterest", urlOpenInterest);
  // if (process.env.NODE_ENV !== "production") {
  //   urlLongShortHistory = `/public/v2/${LONG_SHORT_HISTORY}?time_type=${timeFrame}&symbol=${symbol}`;
  // }
  // console.log("urlOpenInterest", urlOpenInterest);

  const data = axios
    .get(urlLongShortHistory, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));

  const json = await data;

  return json;
};

export const fetchExchangeShortRatio = async (symbol, timeFrame) => {
  var urlLongShortHistory = `${COINGLASS_API_URL}/${LONG_SHORT}?time_type=${timeFrame}&symbol=${symbol}`;
  return coinglassFetching(urlLongShortHistory, options);

  // const data = axios
  //   .get(urlLongShortHistory, options)
  //   .then((response) => response.data)
  //   .catch((err) => console.error(err));

  // const json = await data;

  // return json;
};

const fetchingCoinglassData = {
  fetchOpenInterest,
  fetchExchangeShortRatio,
};

export default fetchingCoinglassData;
