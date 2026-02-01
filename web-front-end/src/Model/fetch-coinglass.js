// import fetch from "node-fetch";
// import axios from "axios";
export const timeFrameDisplayDate = ["h1", "h4", "h8", "h12", "h24", "all"];

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
const COINGLASS_API_URL =
  "https://try.readme.io/https://open-api.coinglass.com/public/v2";
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

export const fetchFundingRateHistoryUsd = async (symbol, timeFrame) => {
  var urlFundingRateHistoryUsd = `${COINGLASS_API_URL}/${FUNDING_USD_HISTORY}?symbol=${symbol}&time_type=${timeFrame}`;
  // console.log("production urlFundingRateHistoryUsd", urlFundingRateHistoryUsd);
  if (process.env.NODE_ENV !== "production") {
    urlFundingRateHistoryUsd = `/public/v2/${FUNDING_USD_HISTORY}?symbol=${symbol}&time_type=${timeFrame}`;
  }
  // console.log("urlFundingRateHistoryUsd", urlFundingRateHistoryUsd);

  const data = window
    .fetch(urlFundingRateHistoryUsd, options)
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
  // console.log("production urlOpenInterest", urlOpenInterest);
  if (process.env.NODE_ENV !== "production") {
    urlOpenInterest = `/public/v2/${OPEN_INTEREST}?symbol=${symbol}`;
  }
  // console.log("urlOpenInterest", urlOpenInterest);

  const data = window
    .fetch(urlOpenInterest, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));

  const json = await data;

  return json;
};

export const fetchOpenInterestHistoryUsd = async (symbol, timeFrame) => {
  var urlOpenInterestHistoryUsd = `${COINGLASS_API_URL}/${OPEN_INTEREST_HISTORY}?symbol=${symbol}&time_type=${timeFrame}&currency=USD`;
  // console.log(
  //   "production urlOpenInterestHistoryUsd",
  //   urlOpenInterestHistoryUsd
  // );
  if (process.env.NODE_ENV !== "production") {
    urlOpenInterestHistoryUsd = `/public/v2/${OPEN_INTEREST_HISTORY}?symbol=${symbol}&time_type=${timeFrame}&currency=USD`;
  }
  // console.log("urlOpenInterestHistoryUsd", urlOpenInterestHistoryUsd);

  const data = window
    .fetch(urlOpenInterestHistoryUsd, options)
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
  if (process.env.NODE_ENV !== "production") {
    urlLongShortHistory = `/public/v2/${LONG_SHORT_HISTORY}?time_type=${timeFrame}&symbol=${symbol}`;
  }
  // console.log("urlOpenInterest", urlOpenInterest);

  const data = window
    .fetch(urlLongShortHistory, options)
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
  // console.log("production urlOpenInterest", urlOpenInterest);
  if (process.env.NODE_ENV !== "production") {
    urlLongShortHistory = `/public/v2/${LONG_SHORT}?time_type=${timeFrame}&symbol=${symbol}`;
  }
  // console.log("urlOpenInterest", urlOpenInterest);

  const data = window
    .fetch(urlLongShortHistory, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));

  const json = await data;

  return json;
};

const fetchingCoinglassData = async () => {};
export default fetchingCoinglassData;
