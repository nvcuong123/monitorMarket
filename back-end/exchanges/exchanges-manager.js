import dayjs from "dayjs";
import binancePublicData from "./binance/binance-public-api.js";
// import binanceMarketData from "./binance/binance-market-data.js";
import bitgetMarketData from "./bitget/bitget-market-data.js";
import bybitMarketData from "./bybit/bybit-market-data.js";
import okexMarketData from "./okex/okex-market-data.js";
import _ from "lodash";
//
const SECOND_1 = 1000;
const SECOND_5 = 5 * SECOND_1;
const MINUTE_1 = 1 * 60 * SECOND_1;
const MINUTE_5 = 5 * MINUTE_1;
const MINUTE_15 = 15 * MINUTE_1;
const MINUTE_30 = 30 * MINUTE_1;
const HOUR_1 = 1 * 60 * MINUTE_1;
const HOUR_4 = 4 * HOUR_1;
const DAY_1 = 1 * 24 * HOUR_1;
//
// const OPEN_INTEREST_INTERVAL = 5000;
const OPEN_INTEREST_INTERVAL = MINUTE_1;
const openInterestTimeframesToNumTick = {
  "5m": MINUTE_5 / OPEN_INTEREST_INTERVAL,
  "15m": MINUTE_15 / OPEN_INTEREST_INTERVAL,
  "30m": MINUTE_30 / OPEN_INTEREST_INTERVAL,
  "1h": HOUR_1 / OPEN_INTEREST_INTERVAL,
  "4h": HOUR_4 / OPEN_INTEREST_INTERVAL,
};
const SYMBOL_OI_MAX = 200;
const SYMBOL_OI_MIN = 61;
// const SYMBOL_OI_MAX = 10;
// const SYMBOL_OI_MIN = 6;

let aggregatedOI = {};
//
const symbolMapping = (binanceSymbol, exchange) => {
  let symbol = binanceSymbol;
  switch (exchange) {
    // case "bitget":
    //   coinglassSymbol = _.replace(symbol, "USDT", "");
    //   break;
    case "okex":
      symbol = _.replace(symbol, "USDT", "");
      break;

    default:
      break;
  }
  return symbol;
};
const timeframeMapping = (binanceTimeframe, exchange) => {
  let timeframe = binanceTimeframe;
  switch (exchange) {
    case "bybit":
      timeframe = _.replace(timeframe, "m", "min");
      break;

    case "okex":
      timeframe = _.replace(timeframe, "h", "H");
      timeframe = _.replace(timeframe, "d", "D");

      break;

    default:
      break;
  }
  // console.log("timeframeMapping", timeframe);
  return timeframe;
};
// long/short accounts ratio
async function fetchGlobalLongShortAccountRatio(
  symbol = "BTCUSDT",
  period = "5m"
) {
  const limit = 2;
  // binance
  const binanceLongShort = await binancePublicData.globalLongShortAccountRatio(
    symbol,
    period,
    limit
  );
  // bybit
  const bybitPeriod = timeframeMapping(period, "bybit");
  const bybitLongShort = await bybitMarketData.fetchLongShortRatioHistory(
    symbol,
    bybitPeriod,
    limit
  );
  // TODO: bitget
  const bitgetLongShort = await bitgetMarketData.fetchLongShortRatioHistory(
    symbol,
    period,
    limit
  );
  // okx
  const okexCurrency = symbolMapping(symbol, "okex");
  const okexPeriod = timeframeMapping(period, "okex");
  const okexLongShort = await okexMarketData.fetchLongShortRatioHistory(
    okexCurrency,
    okexPeriod,
    limit
  );
  // console.log("okexLongShort", okexLongShort);
  let lastOkexLongAcc = 0;
  let lastOkexShortAcc = 0;
  if (!_.isEmpty(okexLongShort)) {
    const lastOkex = _.first(okexLongShort);
    // console.log("lastOkex", lastOkex);
    const lastOkexLongShortRatio = Number(lastOkex[1]);
    lastOkexLongAcc = lastOkexLongShortRatio / (1 + lastOkexLongShortRatio);
    lastOkexShortAcc = 1 - lastOkexLongAcc;
  }
  // summary all
  const lastBinance = _.last(binanceLongShort);
  // console.log("lastBinance", lastBinance);
  // const lastBitget = _.last(bigetLongShort);
  // console.log("lastBitget", lastBitget);
  const lastBybit = _.first(bybitLongShort);
  // console.log("lastBybit", lastBybit);

  const longAccount =
    Number(lastBinance.longAccount) +
    Number(lastBybit.buyRatio) +
    Number(lastOkexLongAcc);
  const shortAccount =
    Number(lastBinance.shortAccount) +
    Number(lastBybit.sellRatio) +
    Number(lastOkexShortAcc);
  const totalAccount = longAccount + shortAccount;
  let longAccPercent = longAccount / totalAccount;
  let shortAccPercent = 1 - longAccPercent;
  //
  const allExchangesLongShortRatio = {
    all: {
      symbol: symbol,
      longAccount: longAccPercent,
      longShortRatio: longAccPercent / shortAccPercent,
      shortAccount: shortAccPercent,
      timestamp: dayjs().valueOf(),
    },
    // binance: lastBinance,
    // bitget: {},
    // bybit: lastBybit,
    // okex: lastOkex,
  };
  // console.log("allExchangesLongShortRatio", period, allExchangesLongShortRatio);
  return allExchangesLongShortRatio;
}
//
export async function fetchOpenInterest(symbol = "BTCUSDT", period = "5m") {
  // const prevAggOI = ;
  const numTick = openInterestTimeframesToNumTick[period];
  const symbolOIs = aggregatedOI[symbol];
  // console.log("fetchOpenInterest", symbol, symbolOIs);
  if (!_.isEmpty(symbolOIs)) {
    const curAggOI = _.last(symbolOIs);
    let percent = "NA";
    if (symbolOIs.length > numTick) {
      const prevAggOI = _.nth(symbolOIs, -(numTick + 1));
      // console.log("curAggOI", curAggOI, "prevAggOI", prevAggOI);
      percent = ((curAggOI - prevAggOI) * 100) / prevAggOI;
    }
    return {
      all: {
        symbol: symbol,
        timestamp: dayjs().valueOf(),
        sumOpenInterest: curAggOI, // total open interest
        percentChange: percent,
      },
    };
  }
  return {};

  // // fetch OIs
  // const binanceOI = await binancePublicData.openInterestHist(symbol, period);
  // const bybitOI = await bybitMarketData.fetchOpenInterestHistory(
  //   symbol,
  //   period
  // );
  // const okexOI = await okexMarketData.fetchOpenInterestHistory(symbol, period);
  // // cal.
  // const exchangeList = [binanceOI, bybitOI, okexOI];
  // let sumOpenInterest = 0;
  // let prevSumOpenInterest = 0;
  // _.forEach(exchangeList, (exchangeOI) => {
  //   if (!_.isEmpty(exchangeOI)) {
  //     sumOpenInterest += Number(exchangeOI.sumOpenInterest);
  //     prevSumOpenInterest += Number(exchangeOI.prevSumOpenInterest);
  //   }
  // });
  // const price =
  //   Number(binanceOI.sumOpenInterestValue) / Number(binanceOI.sumOpenInterest);
  // const prevPrice =
  //   Number(binanceOI.prevSumOpenInterestValue) /
  //   Number(binanceOI.prevSumOpenInterest);
  // let sumOpenInterestValue = sumOpenInterest * price;
  // let prevSumOpenInterestValue = prevSumOpenInterest * prevPrice;
  // let percentChange =
  //   ((sumOpenInterest - prevSumOpenInterest) * 100) / prevSumOpenInterest;

  // let aggregateOpenIntest = {
  //   all: {
  //     symbol: symbol,
  //     timestamp: binanceOI.timestamp,
  //     sumOpenInterest, // total open interest
  //     sumOpenInterestValue, // total open interest value
  //     prevSumOpenInterest,
  //     prevSumOpenInterestValue,
  //     percentChange,
  //   },
  // };

  // console.log("aggregateOpenIntest", aggregateOpenIntest);
  // return aggregateOpenIntest;
}
//
export async function getUpdateAllExchangesData(symbol, timeframe) {
  try {
    const globalLongShortAccountRatio = await fetchGlobalLongShortAccountRatio(
      symbol,
      timeframe
    );
    const openInterest = await fetchOpenInterest(symbol, timeframe);

    return {
      globalLongShortAccountRatio,
      openInterest,
    };
  } catch (error) {
    console.error(`Error in getUpdateAllExchangesData`, error);
  }
}
//
let lsIntvlExchangesOI = [];
export async function startExchangesOI(symbolList) {
  const exchangeList = {
    binance: binancePublicData,
    bybit: bybitMarketData,
    // bitget: bitgetMarketData,
    okex: okexMarketData,
  };
  // const symbolList = ["XMRUSDT", "DASHUSDT"];
  // const symbolList = await binanceMarketData.fetchFuturesSymbol();
  aggregatedOI = {};
  _.forEach(symbolList, (symbol) => {
    aggregatedOI[symbol] = [];
  });
  console.log("aggregatedOI", JSON.stringify(aggregatedOI));
  //
  async function getExchangesOI(exchanges, symbol) {
    // console.log(
    //   "getExchangesOI",
    //   symbol,
    //   "start>",
    //   dayjs().format("HH:mm:ss:SSS")
    // );
    let symbolRealtimeOI = 0;
    for (let idx = 0; idx < exchanges.length; idx++) {
      const exchange = exchanges[idx];
      const realtimeOI = await exchange.getOpenInterest(symbol);
      if (!!realtimeOI) {
        symbolRealtimeOI += Number(realtimeOI);
      }
    }
    // console.log("symbolRealtimeOI", symbol, symbolRealtimeOI);
    aggregatedOI[symbol].push(symbolRealtimeOI);
    if (aggregatedOI[symbol].length > SYMBOL_OI_MAX) {
      console.log("before", symbol, aggregatedOI[symbol].length);
      aggregatedOI[symbol] = aggregatedOI[symbol].slice(-SYMBOL_OI_MIN);
      console.log("after", symbol, aggregatedOI[symbol].length);
    }
    // console.log(
    //   "getExchangesOI",
    //   symbol,
    //   "completed>",
    //   dayjs().format("HH:mm:ss:SSS")
    // );
  }
  //
  if (!_.isEmpty(lsIntvlExchangesOI)) {
    lsIntvlExchangesOI.forEach((intervalId) => clearInterval(intervalId));
    lsIntvlExchangesOI.length = 0;
  }
  const exchanges = _.values(exchangeList);
  for (let i = 0; i < symbolList.length; i++) {
    const symbol = symbolList[i];
    await getExchangesOI(exchanges, symbol);
    const intvlExchangeOI = setInterval(async () => {
      getExchangesOI(exchanges, symbol);
    }, OPEN_INTEREST_INTERVAL);
    lsIntvlExchangesOI.push(intvlExchangeOI);
  }
}

//
const exchangesManager = {
  getUpdateAllExchangesData,
};

export default exchangesManager;
