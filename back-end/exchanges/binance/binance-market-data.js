import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

// import Binance from "node-binance-api";
import _ from "lodash";
import { changeObjectKey } from "../../utils/object-processing.js";
import { calculateRSI } from "../../modules/indicators/oscillators/rsi.js";
import { getOpenInterestHist } from "./binance-public-api.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { detectRsiSignal } from "../../modules/strategy/strategies/rsi.js";
import {
  IsPatternTypeLong,
  detectCandlePatterns,
  detectSingleCandle,
  detectCustomPatterns,
} from "../../modules/strategy/strategies/patterns.js";
import fetchingCoinglassData, {
  symbolList,
} from "../coinglass/fetch-coinglass.js";
import { getCandleMinMax } from "../../modules/indicators/utils/index.js";
import { broadcastNotification } from "../../index.js";
import { getUpdateAllExchangesData } from "../exchanges-manager.js";
// import { binance } from "./binance-public-api.js";
import Binance from "node-binance-api";
import { startExchangesOI } from "../exchanges-manager.js";
import schedule from "node-schedule";

export const binance = new Binance().options({
  test: false,
  APIKEY: "",
  APISECRET: "",
  // reconnect: true,
});

console.log("binance:option", binance.getOptions());
// console.log("process.env", process.env);
dayjs.extend(utc);
dayjs.extend(timezone);
const HO_CHI_MINH_TZ = "Asia/Ho_Chi_Minh";
dayjs.tz.setDefault(HO_CHI_MINH_TZ); // Set UTC+7 as default timezone
console.log("Current date and time:", new Date());
console.log("timezone", dayjs().format());
console.log("timezone.tz", dayjs().tz(HO_CHI_MINH_TZ).format());

/**
 * web-socket for heatmap
 *
 * ref - https://www.binance.com/en/support/faq/what-is-the-heatmap-on-binance-futures-31c7078c841a456c9bb7c312dbc8a299
 *
 * data {
 *  market: "USD-M" / "COIN-M" / "Infrastructure" / "Layer-1" / "Layer-2" / "NFT"
 *  sizeby: "Trading Volume"/"24h Change"/"Market Cap"/"Trading Volume / market cap" -> decide the list of contracts
 *  indicator: "Performance 1h, %"/"Performance 24h, %"/"Performance 7D, %"/"Performance 30D, %"/
 *              "RSI 14D"/ "Funding Rates" / "Volatility D, %" -> decide the color
 *  range: "Top 10 coins" / "Top 20 coins" / "Top 30 coins" / "Top 10 coins"
 * }
 *
 * will calculate and broadcast to clients with interval as 2s
 */
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
let completedStart = false;
const binanceHeatmap = {};
const minimums = {};
let markPrices = [];
let lastPrices = [];
let futuresSymbolList = [];
let binanceAlertsList = [];
const HIST_ALERT_NUMBER = 120;
const NUMBER_ALERT_TO_CLIENT = 60;
// const HIST_ALERT_NUMBER = 4;
let marketData = {};
//
const timeframeTimeMils = {
  "1m": MINUTE_1,
  "5m": MINUTE_5,
  "15m": MINUTE_15,
  "30m": MINUTE_30,
  "1h": HOUR_1,
  "4h": HOUR_4,
  "1d": DAY_1,
};
//
const NUMBER_CANDLES = 499; // [1,100) -> 1 weight; [100, 500)	-> 2 weight
console.log("NUMBER_CANDLES", NUMBER_CANDLES);
const NUMBER_SAVE_CANDLES = 20;
const NUM_CANDLE_TO_DETECT = 15; // warning: have to be less than NUMBER_SAVE_CANDLES
const NUMBER_CAL_TICKER = 3;
const TIMEFRAME_1M = "1m";
const TIMEFRAME_5M = "5m";
const TIMEFRAME_15M = "15m";
const TIMEFRAME_30M = "30m";
const TIMEFRAME_1H = "1h";
// const candleTimeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];
// const candleTimeframes = ["1m", "5m", "15m", "30m", "1h", "4h"];
const candleTimeframes = ["1m", "5m", "15m", "30m", "1h"];
const CANDLES_TIMEFRAME_MIN = "1m";
//
const MAX_SIGNAL_NUMBER = 500;
const MAX_SIGNAL_NUMBER_FOR_SYMBOL_TIMEFRAME = 50;
const DETECT_INTERVAL = SECOND_5;
let binanceSignals = {};
let nextCleanSignalsTime = dayjs();
let calculatedCandles = {};
// const strategyTimeframes = ["1m"];
const strategyTimeframes = ["1m", "5m", "15m", "30m", "1h"];

// const strategySymbols = ["BTCUSDT"];
const strategySymbols = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "TRBUSDT",
  "ARKUSDT",
  "GASUSDT",
  "UNFIUSDT",
  "INJUSDT",
  "1000FLOKIUSDT",
  "BLURUSDT",
  "LQTYUSDT",
  "TWTUSDT",
  "YGGUSDT",
  "ASTRUSDT",
  "SNTUSDT",
  "C98USDT",
  "TRBUSDT",
  "GRTUSDT",
  "IMXUSDT",
  "XVSUSDT",
];

const priceNotifyTimeframesThreshold = {
  // "1m": 1,
  "5m": 2,
  "15m": 3,
  "30m": 4,
  "1h": 5,
};
const rsiNotifyTimeframes = ["5m", "15m", "30m", "1h", "4h"];
const NUMBER_RSI_SAVE = 1;
const RSI_OVERBOUGHT = 80;
const RSI_OVERSOLD = 20;
// Open Interest
const OI_TIME_POINT_LATENCY = 35 * SECOND_1;
const openInterestHistTimeframesInterval = {
  "5m": { time: MINUTE_5, latency: 1 * MINUTE_1 },
  "15m": { time: MINUTE_15, latency: 3 * MINUTE_1 },
  "30m": { time: MINUTE_30, latency: 5 * MINUTE_1 },
  "1h": { time: HOUR_1, latency: 7 * MINUTE_1 },
  "4h": { time: HOUR_4, latency: 9 * MINUTE_1 },
};
const REAL_OI_INTERVAL_TIME = MINUTE_5;
const openInterestNotifyTimeframesNumTick = {
  "5m": MINUTE_5 / REAL_OI_INTERVAL_TIME,
  "15m": MINUTE_15 / REAL_OI_INTERVAL_TIME,
  "30m": MINUTE_30 / REAL_OI_INTERVAL_TIME,
  "1h": HOUR_1 / REAL_OI_INTERVAL_TIME,
  "4h": HOUR_4 / REAL_OI_INTERVAL_TIME,
};
const OI_NUMBER_TICK_MAX = HOUR_4 / REAL_OI_INTERVAL_TIME;
let marketRealOIs = {};
const NUMBER_HIST_OI = 1;
const OI_THRESHOLD = 5;
// Funding Rate
const NUMBER_FR = 3;
const FUNDING_RATE_INTERVAL = HOUR_4; //4h
const FUNDING_RATE_LATENCY = 5 * 1000; //5s
//
const lsWsTimeframeCandle = [];
const lsIntervalRealOIAllSymb = [];
const lsIntervalSymbFRHist = [];
const lsIntervalFRRealTime = [];
let wsContractInfo = 0;
let intvlDetectAlert = 0;
const lsIntvlDetectSignal = [];
let intvlCleanupSignal = 0;

//
function setSymbolListForTesting() {
  let symbolList = futuresSymbolList;
  // test
  // await startLoadingMarketDataForSymbols(["BONDUSDT"]);
  // symbolList = ["AMBUSDT", "IDEXUSDT", "STRAXUSDT", "KSMUSDT"];
  // symbolList = ["ANKRUSDT", "REEFUSDT", "SFPUSDT", "RVNUSDT", "RUNEUSDT"];
  const testSymbList = [
    // "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "TRBUSDT",
    "ARKUSDT",
    "GASUSDT",
    "UNFIUSDT",
    "INJUSDT",
    "1000FLOKIUSDT",
    "BLURUSDT",
    "LQTYUSDT",
    "TWTUSDT",
    "YGGUSDT",
    "ASTRUSDT",
    "SNTUSDT",
    "C98USDT",
    "TRBUSDT",
    "GRTUSDT",
    "IMXUSDT",
    "XVSUSDT",
  ];
  // symbolList = testSymbList;
  const NUMBER_SYMBOL_MAX = 15;
  if (symbolList.length > NUMBER_SYMBOL_MAX) {
    symbolList = symbolList.slice(0, NUMBER_SYMBOL_MAX);
  }
  return symbolList;
}
//
const fetchExchangeInfo = async () => {
  const info = await binance.futuresExchangeInfo(); // 1 weight
  const keys = Object.keys(info);
  if (keys.includes("code")) {
    console.log("binance-market-data:start:info", info);
  } else {
    console.log("binance-market-data:start:keys", keys);
    //
    if (!_.isEmpty(info)) {
      // const rateLimits = info.rateLimits;
      // console.log("rateLimits", rateLimits);
      const filterSymbols = info.symbols.filter(
        (symbolInfo) =>
          symbolInfo.contractType === "PERPETUAL" &&
          symbolInfo.status === "TRADING"
      );
      filterSymbols.map((symbolInfo) => {
        let filters = { status: symbolInfo.status };
        for (let filter of symbolInfo.filters) {
          if (filter.filterType == "MIN_NOTIONAL") {
            filters.minNotional = filter.notional;
          } else if (filter.filterType == "PRICE_FILTER") {
            filters.minPrice = filter.minPrice;
            filters.maxPrice = filter.maxPrice;
            filters.tickSize = filter.tickSize;
          } else if (filter.filterType == "LOT_SIZE") {
            filters.stepSize = filter.stepSize;
            filters.minQty = filter.minQty;
            filters.maxQty = filter.maxQty;
          }
        }
        // filters.baseAssetPrecision = symbolInfo.baseAssetPrecision;
        // filters.quoteAssetPrecision = symbolInfo.quoteAssetPrecision;
        filters.orderTypes = symbolInfo.orderTypes;
        filters.icebergAllowed = symbolInfo.icebergAllowed;
        minimums[symbolInfo.symbol] = filters;
        futuresSymbolList.push(symbolInfo.symbol);
      });
      futuresSymbolList = futuresSymbolList.filter((symbol) =>
        symbol.includes("USDT")
      );
      // test
      // futuresSymbolList = setSymbolListForTesting();
      console.log("futuresSymbolList", futuresSymbolList);
      //
      const pricePrecisions = {};
      Object.keys(minimums).map((symbol) => {
        const precision = minimums[symbol].tickSize.indexOf("1") - 1 || 0;
        pricePrecisions[symbol] = precision > 0 ? precision : 0;
      });
      binanceHeatmap.pricePrecisions = _.clone(pricePrecisions);
    }
  }
};

/**
 * {
      timestamp: dayjs(),
      symbol,
      timeframe,
      type: SIGNAL_RSI,
      subtype: rsiDetect.type,
    }
 */

function putSignals(signalObj) {
  function IsThisObjectExist(obj) {
    if (
      binanceSignals[obj.symbol][obj.timeframe].find(
        (element) =>
          element.timestamp === obj.timestamp && element.type === obj.type
      )
    ) {
      return true;
    }
    return false;
  }
  //
  try {
    if (!IsThisObjectExist(signalObj)) {
      const saveObj = { time: dayjs(), ...signalObj };
      const timeString = saveObj.time.format("DD/MM HH:mm:ss:SSS");
      const symbol = signalObj.symbol;
      const timeframe = signalObj.timeframe;
      binanceSignals[symbol][timeframe].push(saveObj);
    }
  } catch (error) {
    console.error(
      `Error in putSignals for symbol ${signalObj.symbol} and timeframe ${signalObj.timeframe}:`,
      error
    );
  }
}
//

const MIN_CANDlE_TO_DETECT = 2; // pattern 2 candles
const signalsDetecting = (symbol, timeframe, candles) => {
  try {
    if (!completedStart || !_.includes(strategyTimeframes, timeframe)) {
      return;
    }

    // if (
    //   !completedStart ||
    //   !_.includes(strategyTimeframes, timeframe) ||
    //   !_.includes(strategySymbols, symbol)
    // ) {
    //   return;
    // }

    let detectCandles = _.takeRight(candles, NUM_CANDLE_TO_DETECT);
    const curCandle = _.last(detectCandles);
    // symbol === "BTCUSDT" &&
    //   console.log("signalsDetecting>", symbol, timeframe, "candle:", curCandle);
    if (curCandle === undefined) {
      return;
    }
    if (curCandle.closeTime > dayjs()) {
      detectCandles = _.slice(detectCandles, 0, detectCandles.length - 1);
    }
    if (detectCandles.length < MIN_CANDlE_TO_DETECT) {
      return;
    }
    const lastCandle = _.last(detectCandles);
    // return if have detected this candle already
    if (
      calculatedCandles[symbol][timeframe] &&
      calculatedCandles[symbol][timeframe].closeTime === lastCandle.closeTime
    ) {
      return;
    }
    calculatedCandles[symbol][timeframe].closeTime = lastCandle.closeTime;
    symbol === "BTCUSDT" &&
      //   timeframe === "1m" &&
      console.log(
        dayjs().format("DD/MM HH:mm:ss"),
        "last candle:",
        symbol,
        timeframe,
        dayjs(lastCandle.closeTime).format("DD/MM HH:mm:ss")
      );
    // rsi - calculate with 499 candles
    const lastRsi = _.last(
      calculateRSI(candles, {
        sourceType: "close",
        period: 14,
      })
    );
    // const rsiDetect = detectRsiSignal(candles, {
    //   rsiPeriod: 14,
    //   rsiOversold: 25,
    //   rsiOverbought: 75,
    // });
    // if (rsiDetect.detected === true) {
    //   putSignals(
    //     {
    //       symbol,
    //       timeframe,
    //       timestamp: lastCandle.closeTime,
    //       type: rsiDetect.type,
    //       rsi: lastRsi,
    //     },
    //     logCandles
    //   );
    // }
    //
    const lastTicker = _.last(marketData[symbol].tickers[timeframe]);
    let candlePatterns = [];
    if (timeframe === TIMEFRAME_1M) {
      candlePatterns = detectCustomPatterns(symbol, timeframe, candles);
      _.forEach(candlePatterns, (candlePattern) => {
        if (candlePattern.detected === true) {
          //
          const rsis5m = marketData[symbol].rsis[TIMEFRAME_5M];
          const lastRsi5m = _.last(rsis5m);
          const oi5m = marketData[symbol].openInterests.tickers[TIMEFRAME_5M];
          const lastTicker5m = _.last(marketData[symbol].tickers[TIMEFRAME_5M]);
          //
          putSignals({
            symbol,
            timeframe: TIMEFRAME_5M,
            timestamp: lastCandle.time,
            type: candlePattern.type,
            rsi: lastRsi5m,
            oiChange: oi5m?.realTimeChange,
            priceChange: lastTicker5m?.priceChange,
          });
          setTimeout(() => {
            console.log("start eval. ", symbol, candlePattern.type);
            const candles = marketData[symbol].candles[TIMEFRAME_1M];
            let detectCandles = _.takeRight(candles, 7);
            const curCandle = _.last(detectCandles);
            if (curCandle === undefined) {
              detectCandles.splice(-1, 1);
            }
            if (curCandle.closeTime > dayjs()) {
              detectCandles = _.slice(
                detectCandles,
                0,
                detectCandles.length - 1
              );
            }
            // evaluate result as with lowest - highest of those 2 candles
            // console.log("detectCandles", detectCandles);
            const candleIdx = detectCandles.findIndex(
              (candle) => candle.time === lastCandle.time
            );
            const evaluateCandles = _.slice(
              detectCandles,
              candleIdx + 1,
              candleIdx + 3
            );
            // console.log("evaluateCandles", evaluateCandles);
            // calculate and put to signal
            const entryPrice = evaluateCandles[0].open;
            const resultCandles = evaluateCandles;
            const lowestPrice = getCandleMinMax(resultCandles, "min");
            const highestPrice = getCandleMinMax(resultCandles, "max");
            // update result into the signal
            const updateSignal = binanceSignals[symbol][TIMEFRAME_5M].find(
              (element) =>
                element.timestamp === lastCandle.time &&
                element.type === candlePattern.type
            );
            if (!_.isEmpty(updateSignal)) {
              const isLong = IsPatternTypeLong(updateSignal.type);
              // type is long or short?
              updateSignal["result"] = {
                evalType: "2-candles",
                entryPrice,
                lowestPrice,
                highestPrice,
                correct: isLong
                  ? highestPrice > entryPrice
                  : lowestPrice < entryPrice,
              };
            }
          }, 130 * 1000); // 130s for 2 1m candles
          //
          putNotifyAndAlert({
            time: Date.now(),
            alertType: "PATTERN",
            patternType: candlePattern.type,
            timestamp: lastTicker.timestamp,
            symbol,
            timeframe: TIMEFRAME_5M,
            price: lastTicker.price,
            priceChange: lastTicker5m?.priceChange,
          });
        }
      });
    } else {
      // // other patterns
      // candlePatterns = detectCandlePatterns(detectCandles);
      // const oi = marketData[symbol].openInterests.tickers[timeframe];
      // _.forEach(candlePatterns, (candlePattern) => {
      //   if (candlePattern.detected === true) {
      //     putSignals({
      //       symbol,
      //       timeframe,
      //       timestamp: lastCandle.time,
      //       type: candlePattern.type,
      //       rsi: lastRsi,
      //       oiChange: oi?.realTimeChange,
      //       priceChange: lastTicker?.priceChange,
      //     });
      //   }
      // });
    }
  } catch (error) {
    console.error(
      `Error in signalsDetecting for symbol ${symbol} and timeframe ${timeframe}:`,
      error
    );
  }
};

const alertDetecting = (symbol, timeframe, tfTickers, rsis) => {
  try {
    // symbol === "BTCUSDT" &&
    //   timeframe === "1m" &&
    //   console.log(
    //     symbol,
    //     timeframe,
    //     "last ticker:open",
    //     dayjs(_.last(tfTickers).timestamp).format("HH:mm:ss:SSS")
    //   );
    if (!_.isEmpty(tfTickers)) {
      let lastTicker = _.last(tfTickers);
      const priceNotifyTfs = _.keys(priceNotifyTimeframesThreshold);
      if (
        priceNotifyTfs.includes(timeframe) &&
        Math.abs(lastTicker.priceChange) >
          priceNotifyTimeframesThreshold[timeframe]
      ) {
        putNotifyAndAlert({
          time: Date.now(),
          alertType: "PRICE_CHANGE",
          timestamp: lastTicker.timestamp,
          symbol,
          timeframe,
          price: lastTicker.price,
          priceChange: lastTicker.priceChange,
        });
      }
      // RSI alert
      let lastRsi = _.last(rsis);
      if (
        rsiNotifyTimeframes.includes(timeframe) &&
        (lastRsi > RSI_OVERBOUGHT || lastRsi < RSI_OVERSOLD)
      ) {
        putNotifyAndAlert({
          time: Date.now(),
          alertType: "RSI",
          timestamp: lastTicker.timestamp,
          symbol,
          timeframe,
          rsi: lastRsi,
          rsiType: lastRsi > RSI_OVERBOUGHT ? "RSI_OVERBOUGHT" : "RSI_OVERSOLD",
        });
      }
    }
  } catch (error) {
    console.error(
      `Error in alertDetecting for symbol ${symbol} and timeframe ${timeframe}:`,
      error
    );
  }
};

const detectAlert = async (symbolList) => {
  // console.log("detectAlert:start", dayjs().format("HH:mm:ss:SSS"));
  // const symbolList = _.keys(marketData);
  for (let symbIdx = 0; symbIdx < symbolList.length; symbIdx++) {
    const symbol = symbolList[symbIdx];
    const marketDataForSymbol = marketData[symbol];
    const timeframeList = _.keys(marketDataForSymbol.candles);
    for (let tfIdx = 0; tfIdx < timeframeList.length; tfIdx++) {
      const timeframe = timeframeList[tfIdx];
      const tfTickers = marketDataForSymbol.tickers[timeframe];
      const rsis = marketDataForSymbol.rsis[timeframe];
      // check and put alerts
      alertDetecting(symbol, timeframe, tfTickers, rsis);
    }
  }
  // clean up alert
  if (binanceAlertsList.length > HIST_ALERT_NUMBER) {
    const alertLenBefore = binanceAlertsList.length;
    binanceAlertsList.splice(0, binanceAlertsList.length - HIST_ALERT_NUMBER);
    console.log(
      "alert:len before>",
      alertLenBefore,
      "after>",
      binanceAlertsList.length
    );
  }
  // console.log("detectAlert:finish", dayjs().format("HH:mm:ss:SSS"));
};
/**
 * cleanup signals list at 7:03am everyday
 * keep history of 1 day old
 */
// const CLEANUP_SIGNALS_INTERVAL = 7 * MINUTE_1;
const CLEANUP_SIGNALS_INTERVAL = DAY_1;
// cleanup at 6:17 am (utc+7)
const CLEANUP_SIGNALS_TIMEPOINT_HOUR = 6;
const CLEANUP_SIGNALS_TIMEPOINT_MINUTE = 17;

// const SIGNAL_HISTORY_TIME_MINUTE = 10;
const SIGNAL_HISTORY_TIME_DAY = 1;
async function startCleanupSignals() {
  async function cleanUpSignals() {
    // console.log("cleanUpSignals:start", dayjs().format("HH:mm:ss:SSS"));
    cleanUpSignalList(dayjs().subtract(SIGNAL_HISTORY_TIME_DAY, "day"));
    // cleanUpSignalList(dayjs().subtract(SIGNAL_HISTORY_TIME_MINUTE, "minute"));
    // console.log("cleanUpSignals:finish", dayjs().format("HH:mm:ss:SSS"));
  }
  // next time point to cleanup
  let nextTimepointCleanUp = dayjs()
    .tz(HO_CHI_MINH_TZ)
    .startOf("day")
    .hour(CLEANUP_SIGNALS_TIMEPOINT_HOUR)
    .minute(CLEANUP_SIGNALS_TIMEPOINT_MINUTE);
  if (dayjs().isAfter(nextTimepointCleanUp)) {
    nextTimepointCleanUp = nextTimepointCleanUp.add(1, "day");
  }
  // console.log(
  //   "startCleanupSignals:nextTimepointCleanUp",
  //   nextTimepointCleanUp.format("DD:MM HH:mm:ss:SSS")
  // );
  nextTimepointCleanUp = nextTimepointCleanUp.valueOf() - dayjs().valueOf();
  const nextTimeInSecond = Number(nextTimepointCleanUp / 1000).toFixed(0);
  const nextTimeInMin = Number(nextTimeInSecond / 60).toFixed(0);
  const nextTimeInHour = Number(nextTimeInMin / 60).toFixed(0);
  // console.log(
  //   "time to next timepoint",
  //   `${nextTimeInHour}h${nextTimeInMin % 60}m${nextTimeInSecond % 60}s`
  // );
  setTimeout(async () => {
    // console.log(
    //   "startCleanupSignals:timeout",
    //   dayjs().format("DD:MM HH:mm:ss:SSS")
    // );
    await cleanUpSignals();
    // then interval cleanup
    intvlCleanupSignal = setInterval(async () => {
      // console.log(
      //   "startCleanupSignals:interval",
      //   dayjs().format("DD:MM HH:mm:ss:SSS")
      // );
      await cleanUpSignals();
    }, CLEANUP_SIGNALS_INTERVAL);
  }, nextTimepointCleanUp);
}

/**
 *
 * @param {timeframe} timeframe to get timestamp of the open time of candle (candle.time)
 */
const getCandleTimestamp = (timeframe, offset = 0) => {
  const now = dayjs();
  const interval = timeframeTimeMils[timeframe]; // Extract the numerical value from the timeframe
  const roundedDown = now.subtract(now % interval); // Round down to the nearest interval
  // +1 because currently timestamp is set to open time of candle
  return roundedDown.subtract((offset + 1) * interval).valueOf(); // Return the timestamp in milliseconds
};
//
const getDetectedSignalsAsTimeframeAndTimestamp = (timeframe, timestamp) => {
  const tfSignalsList = _.flatMap(
    _.values(binanceSignals),
    (symbolSignals) => symbolSignals[timeframe]
  );
  // console.log(
  //   "tfSignalsList",
  //   _.map(tfSignalsList, (signal) => {
  //     return {
  //       symbol: signal.symbol,
  //       timestamp: dayjs(signal.timestamp).format("HH:mm:ss"),
  //       type: signal.type,
  //     };
  //   })
  // );
  const removedSignals = _.remove(
    tfSignalsList,
    (signal) => signal.timestamp != timestamp
  );
  const timestampDetectedSignals = tfSignalsList;
  // console.log(
  //   "timestampDetectedSignal",
  //   _.map(timestampDetectedSignals, (signal) => {
  //     return {
  //       symbol: signal.symbol,
  //       timestamp: dayjs(signal.timestamp).format("HH:mm:ss"),
  //       type: signal.type,
  //     };
  //   })
  // );
  return timestampDetectedSignals;
};
// for timeframe 1h
const COINGLASS_TIMEFRAME = "1h";
async function getUpdateCoinglassData() {
  try {
    const timeframe = COINGLASS_TIMEFRAME;
    const timestamp = getCandleTimestamp(timeframe);
    const justDetectedSignalList = getDetectedSignalsAsTimeframeAndTimestamp(
      timeframe,
      timestamp
    );
    const symbolLst = _.uniq(
      _.map(justDetectedSignalList, (signal) => signal.symbol)
    );
    // console.log("unique symbolLst", symbolLst);
    // get symbol list of detected signals
    for (let symbIdx = 0; symbIdx < symbolLst.length; symbIdx++) {
      // fetch oi and long/short ratio, set to signal data
      const symbol = symbolLst[symbIdx];
      // console.log(
      //   "fetchingCoinglassData",
      //   symbol,
      //   dayjs().format("HH:mm:ss:SSS")
      // );
      const coinglassSymbol = _.replace(symbol, "USDT", "");
      const symbCoinglassOI = await fetchingCoinglassData.fetchOpenInterest(
        coinglassSymbol
      );
      // console.log(
      //   "symbCoinglassOI.success",
      //   coinglassSymbol,
      //   symbCoinglassOI.success
      // );
      const symbCoinglassLongShortRatio =
        await fetchingCoinglassData.fetchExchangeShortRatio(
          coinglassSymbol,
          "h1"
        );
      // console.log(
      //   "symbCoinglassLongShortRatio.success",
      //   coinglassSymbol,
      //   symbCoinglassLongShortRatio.success
      // );
      // set data to all signals
      _.forEach(justDetectedSignalList, (signal) => {
        if (signal.symbol === symbol) {
          if (symbCoinglassOI.success) {
            const coinglassOIData = symbCoinglassOI.data;
            const cgOiAllExchange = coinglassOIData.find(
              (item, index) => _.toLower(item.exchangeName) === "all"
            );
            const cgOiBinance = coinglassOIData.find(
              (item, index) => _.toLower(item.exchangeName) === "binance"
            );
            //
            signal["cgOi"] = {
              allExchange: {
                openInterest: cgOiAllExchange.openInterest,
                oichangePercent: cgOiAllExchange.oichangePercent,
                openInterestAmount: cgOiAllExchange.openInterestAmount,
                h1OIChangePercent: cgOiAllExchange.h1OIChangePercent,
              },
              binance: {
                openInterest: cgOiBinance.openInterest,
                oichangePercent: cgOiBinance.oichangePercent,
                openInterestAmount: cgOiBinance.openInterestAmount,
                h1OIChangePercent: cgOiBinance.h1OIChangePercent,
              },
            };
          }
          //
          if (symbCoinglassLongShortRatio.success) {
            const longShortRatio = symbCoinglassLongShortRatio.data[0];
            // console.log("longShortRatio.list", longShortRatio.list);
            const longShortRatioBinance = _.find(
              longShortRatio.list,
              (longShortEx) => _.toLower(longShortEx.exchangeName) === "binance"
            );
            //
            signal["cgLongShort"] = {
              allExchange: {
                longRate: longShortRatio.longRate,
                shortRate: longShortRatio.shortRate,
                totalVolUsd: longShortRatio.totalVolUsd,
              },
              binance: {
                longRate: longShortRatioBinance.longRate,
                shortRate: longShortRatioBinance.shortRate,
                totalVolUsd: longShortRatioBinance.totalVolUsd,
              },
            };
          }
        }
      });
      //
      // log for verifying
      // const binanceSignalSymbolTimeframe = binanceSignals[symbol][timeframe];
      // console.log(
      //   "binanceSignals",
      //   symbol,
      //   _.map(binanceSignalSymbolTimeframe, (signal) => {
      //     return {
      //       symbol: signal.symbol,
      //       timestamp: dayjs(signal.timestamp).format("HH:mm:ss"),
      //       type: signal.type,
      //       cgOi: signal.cgOi,
      //       cgLongShort: signal.cgLongShort,
      //     };
      //   })
      // );
    }
  } catch (error) {
    console.error(`Error in getUpdateCoinglassData`, error);
  }
}

//
async function getUpdateExchangesData(timeframe) {
  try {
    const timestamp = getCandleTimestamp(timeframe);
    const justDetectedSignalList = getDetectedSignalsAsTimeframeAndTimestamp(
      timeframe,
      timestamp
    );
    const symbolLst = _.uniq(
      _.map(justDetectedSignalList, (signal) => signal.symbol)
    );
    // console.log("getUpdateExchangesData:unique-symbolLst", symbolLst);
    // get symbol list of detected signals
    for (let symbIdx = 0; symbIdx < symbolLst.length; symbIdx++) {
      const symbol = symbolLst[symbIdx];
      const exchangesData = await getUpdateAllExchangesData(symbol, timeframe);
      // set data to all signals
      _.forEach(justDetectedSignalList, (signal) => {
        if (signal.symbol === symbol) {
          signal["exchanges"] = exchangesData;
        }
      });
    }
  } catch (error) {}
}

//
const NUM_CANDLE_TO_EVALUATE_PATTERN = 3;
// evaluate
async function evaluateSignalResult(timeframe) {
  // timestamp which triggered signals of (current close candles - NUM_CANDLE_TO_EVALUATE_PATTERN candles)
  const timestamp = getCandleTimestamp(
    timeframe,
    NUM_CANDLE_TO_EVALUATE_PATTERN
  );
  // console.log(
  //   "evaluateSignalResult",
  //   timeframe,
  //   "signal:timestamp",
  //   dayjs(timestamp).format("DD:MM HH:mm:ss")
  // );
  // get all signals of the timeframe, at the timestamp (which triggered signal)
  const evaluateSignalList = getDetectedSignalsAsTimeframeAndTimestamp(
    timeframe,
    timestamp
  );
  // console.log(
  //   "evaluateSignalResult>evaluateSignalList",
  //   _.map(evaluateSignalList, (signal) => {
  //     return {
  //       symbol: signal.symbol,
  //       timestamp: dayjs(signal.timestamp).format("HH:mm:ss"),
  //       type: signal.type,
  //     };
  //   })
  // );
  const detectSymbList = _.uniq(
    _.map(evaluateSignalList, (signal) => signal.symbol)
  );
  for (let symbIdx = 0; symbIdx < detectSymbList.length; symbIdx++) {
    const symbol = detectSymbList[symbIdx];
    const marketDataForSymbol = marketData[symbol];
    // get candles
    const candles = marketDataForSymbol.candles[timeframe];
    let detectCandles = _.takeRight(
      candles,
      NUM_CANDLE_TO_EVALUATE_PATTERN + 2
    );
    const curCandle = _.last(detectCandles);
    if (curCandle === undefined) {
      detectCandles.splice(-1, 1);
    }
    if (curCandle.closeTime > dayjs()) {
      detectCandles = _.slice(detectCandles, 0, detectCandles.length - 1);
    }
    // evaluate result as with lowest - highest of those 3 candles
    const evaluateCandles = _.slice(
      detectCandles,
      -(NUM_CANDLE_TO_EVALUATE_PATTERN + 1)
    );
    const lastCandleIdx = evaluateCandles.length - 1;
    // console.log(
    //   "evaluateCandles.len",
    //   evaluateCandles.length,
    //   "candle[0]",
    //   dayjs(evaluateCandles[0].time).format("HH:mm:ss"),
    //   `candle[${NUM_CANDLE_TO_EVALUATE_PATTERN}]`,
    //   dayjs(evaluateCandles[lastCandleIdx].time).format("HH:mm:ss")
    // );
    const entryPrice = evaluateCandles[0].close;
    const resultCandles = evaluateCandles.slice(
      -NUM_CANDLE_TO_EVALUATE_PATTERN
    );
    const lowestPrice = getCandleMinMax(resultCandles, "min");
    const highestPrice = getCandleMinMax(resultCandles, "max");
    // update result into the signal
    _.forEach(evaluateSignalList, (signal) => {
      if (signal.symbol === symbol) {
        const isLong = IsPatternTypeLong(signal.type);
        // type is long or short?
        signal["result"] = {
          evalType: "3-candles",
          entryPrice,
          lowestPrice,
          highestPrice,
          correct: isLong
            ? highestPrice > entryPrice
            : lowestPrice < entryPrice,
        };
      }
    });
    // log for verifying
    // const binanceSignalSymbolTimeframe = binanceSignals[symbol][timeframe];
    // console.log(
    //   "binanceSignals",
    //   symbol,
    //   _.map(binanceSignalSymbolTimeframe, (signal) => {
    //     return {
    //       symbol: signal.symbol,
    //       timestamp: dayjs(signal.timestamp).format("HH:mm:ss"),
    //       type: signal.type,
    //       ...signal.result,
    //     };
    //   })
    // );
  }
}
async function startSignalsDetecting(symbolList) {
  // console.log("startSignalsDetecting:start", dayjs().format("HH:mm:ss:SSS"));
  // detect function
  async function detectSignals(detectSymbList, timeframe) {
    // console.log("detectSymbList", detectSymbList, "timeframe", timeframe);
    for (let symbIdx = 0; symbIdx < detectSymbList.length; symbIdx++) {
      const symbol = detectSymbList[symbIdx];
      const marketDataForSymbol = marketData[symbol];
      // console.log("marketDataForSymbol", symbol, marketDataForSymbol);
      const candles = marketDataForSymbol?.candles[timeframe];
      symbol === "BTCUSDT" && console.log("detectSignals>", symbol, timeframe);
      signalsDetecting(symbol, timeframe, candles);
    }
    if (timeframe !== TIMEFRAME_1M) {
      await getUpdateExchangesData(timeframe);
      // evaluate results of pattersn after 3 candles
      evaluateSignalResult(timeframe);
    }
  }
  // detect as timeframe
  for (let index = 0; index < strategyTimeframes.length; index++) {
    // first detect
    const timeframe = strategyTimeframes[index];
    await detectSignals(symbolList, timeframe);
    const timeframeInterval = timeframeTimeMils[timeframe];
    const nextTimepoint =
      timeframeInterval -
      (dayjs() % timeframeInterval) +
      index * SECOND_5 +
      SECOND_1;
    setTimeout(async () => {
      await detectSignals(symbolList, timeframe);
      const intvlDetectSignal = setInterval(async () => {
        detectSignals(symbolList, timeframe);
      }, timeframeInterval);
      lsIntvlDetectSignal.push(intvlDetectSignal);
    }, nextTimepoint);
  }
  // console.log("startSignalsDetecting:finish", dayjs().format("HH:mm:ss:SSS"));
}

async function cbkSymbTfCandleData(symbol, timeframe, respObj) {
  try {
    // from utc+7 2023-11-02T00:55:00.000Z to 2023-11-02T01:05:00.000Z
    // const LOG_START_TIME = dayjs("2023-11-09T17:55:00.000Z");
    // const LOG_STOP_TIME = dayjs("2023-11-09T18:05:00.000Z");
    // const LOG_START_TIME = dayjs("2023-11-09T14:00:00.000Z");
    // const LOG_STOP_TIME = dayjs("2023-11-11T14:00:00.000Z");

    // respObj: { <timestamp>(equal open time): <candle object>, ... }
    // if (!completedStart) return;
    // (timeframe === "1m" || timeframe === "1h") &&
    //   console.log(
    //     "cbkSymbTfCandleData:start",
    //     symbol,
    //     timeframe,
    //     dayjs().format("HH:mm:ss:SSS")
    //   );
    const candles = Object.values(respObj);
    /** <candle object> {
                time: 1696235640000,
                closeTime: 1696235699999,
                open: '28388.50',
                high: '28418.60',
                low: '28387.30',
                close: '28395.10',
                volume: '626.172',
                quoteVolume: '17784591.18880',
                takerBuyBaseVolume: '304.482',
                takerBuyQuoteVolume: '8648194.61990',
                trades: 4907,
                isFinal: false
              } */
    // candles data
    marketData[symbol].candles[timeframe] = _.takeRight(
      candles,
      NUMBER_SAVE_CANDLES
    );
    // rsi
    const rsis = calculateRSI(candles, {
      sourceType: "close",
      period: 14,
    });
    marketData[symbol].rsis[timeframe] = _.takeRight(rsis, NUMBER_RSI_SAVE);
    // calculate prev<timeframe>tickers
    const tfTickers = [];
    const calculateCandles = _.takeRight(candles, NUMBER_CAL_TICKER + 1);
    calculateCandles.forEach((candle, index) => {
      if (index === 0) return;
      let price;
      let priceChange; // amplitude change
      if (candle.close >= candle.open) {
        priceChange = ((candle.high - candle.low) * 100) / candle.low;
        price = candle.high;
      } else {
        priceChange = ((candle.low - candle.high) * 100) / candle.high;
        price = candle.low;
      }
      const quoteVolume = candle.quoteVolume;
      const prevQuoteVolume = calculateCandles[index - 1].quoteVolume;
      const quoteVolumeChange =
        ((quoteVolume - prevQuoteVolume) * 100) / prevQuoteVolume;
      tfTickers.push({
        timestamp: candle.time,
        isFinal: candle.isFinal,
        price,
        priceChange,
        quoteVolume,
        quoteVolumeChange,
      });
    });
    // save to marketData
    marketData[symbol].tickers[timeframe] = tfTickers;
    // // check and put alerts
    // alertDetecting(symbol, timeframe, tfTickers, rsis);
    // console.log("cbkSymbTfCandleData:finish", symbol, timeframe);
  } catch (error) {
    console.error(
      `Error in cbkSymbTfCandleData for symbol ${symbol} and timeframe ${timeframe}:`,
      error
    );
  }
}

const startFetchCandlesData = async (symbolList) => {
  if (_.isEmpty(symbolList)) return;
  //
  const LOADING_TIME_EACH_TIMEFRAME = 15 * SECOND_1;
  const candlePromisses = candleTimeframes.map((timeframe, index) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Kline rest + stream: price, volume
        const timeframeWsId = await binance.futuresChart(
          symbolList,
          timeframe,
          cbkSymbTfCandleData,
          NUMBER_CANDLES
        );
        lsWsTimeframeCandle.push(timeframeWsId);
        console.log("ws:", timeframe, "wsId", timeframeWsId);
        //
        resolve(timeframeWsId);
      }, index * LOADING_TIME_EACH_TIMEFRAME);
    });
  });

  const delayPromise = new Promise((resolve) =>
    setTimeout(resolve, candleTimeframes.length * LOADING_TIME_EACH_TIMEFRAME)
  );

  return Promise.all([candlePromisses, delayPromise]);
};

const alreadyHadRealOI = (symbol, timeframe) => {
  const timeframeNoTick = openInterestNotifyTimeframesNumTick[timeframe];
  // not get enough real time oi ticker => cal. regards to history oi
  // symbol === "BTCUSDT" &&
  //   console.log(
  //     "alreadyHadRealOI",
  //     symbol,
  //     timeframe,
  //     marketRealOIs[symbol].length >= timeframeNoTick,
  //     marketRealOIs[symbol].length,
  //     timeframeNoTick
  //   );
  if (marketRealOIs[symbol].length >= timeframeNoTick) {
    return true;
  }
  return false;
};
const alreadyHadRealOITf = (timeframe, symbolList) => {
  for (let symbIdx = 0; symbIdx < symbolList.length; symbIdx++) {
    if (!alreadyHadRealOI(symbolList[symbIdx], timeframe)) {
      return false;
    }
  }
  return true;
};

const reqLimitRate = (5 * 60 * 1000) / 1000 + 5; // plus 5ms for safety
const startFetchingOpenInterestRealTime = async (symbolList) => {
  //
  async function getSymbolOIRealTime(symbol, isLog) {
    try {
      if (marketRealOIs[symbol] === undefined) return;
      // real-time OI for this symbol (resp. is just number)
      // console.log("getSymbolOIRealTime", symbol);
      const symbRealOI = await binance.futuresOpenInterest(symbol); // 1 weight
      marketRealOIs[symbol].push(symbRealOI);
      _.takeRight(marketRealOIs[symbol], OI_NUMBER_TICK_MAX);
      //
      const symbCandles1M = marketData[symbol].candles[CANDLES_TIMEFRAME_MIN];
      const lastCandle = symbCandles1M[symbCandles1M.length - 1];
      const realOI = {
        symbol,
        sumOpenInterest: symbRealOI,
        sumOpenInterestValue: _.isEmpty(lastCandle)
          ? "NA"
          : symbRealOI * lastCandle.close,
        timestamp: Date.now(),
        realTimeChange: 0,
      };
      // process oi changes tickers
      marketData[symbol].openInterests["tickers"]["real"] = realOI;
      _.forEach(
        openInterestNotifyTimeframesNumTick,
        (timeframeNoTick, timeframe) => {
          let timeframeOI = {};
          // not get enough real time oi ticker => cal. regards to history oi
          if (marketRealOIs[symbol].length < timeframeNoTick + 1) {
            timeframeOI = _.last(
              marketData[symbol].openInterests["hist"][timeframe]
            );
          } else {
            const sumOpenInterest = _.nth(
              marketRealOIs[symbol],
              -(timeframeNoTick + 1)
            );
            timeframeOI = {
              symbol,
              sumOpenInterest: sumOpenInterest,
              sumOpenInterestValue: _.isEmpty(lastCandle)
                ? "NA"
                : symbRealOI * lastCandle.close,
              timestamp: Date.now() - timeframeNoTick * REAL_OI_INTERVAL_TIME,
            };
          }
          //
          if (!_.isEmpty(timeframeOI)) {
            marketData[symbol].openInterests["tickers"][timeframe] = {
              ...timeframeOI,
              realTimeChange:
                ((realOI.sumOpenInterest - timeframeOI.sumOpenInterest) * 100) /
                timeframeOI.sumOpenInterest,
              sumOpenInterest: realOI.sumOpenInterest,
              sumOpenInterestValue: realOI.sumOpenInterestValue,
            };
          }
        }
      );
      // isLog &&
      //   console.log(
      //     "OI realtime",
      //     symbol,
      //     "sumOpenInterest",
      //     symbRealOI,
      //     dayjs().format("HH:mm:ss:SSS")
      //   );
      // check for alert and notify
      _.forEach(
        marketData[symbol].openInterests["tickers"],
        (timeframeOI, timeframe) => {
          // console.log("timeframeOI, timeframe", timeframeOI, timeframe);
          if (Math.abs(timeframeOI.realTimeChange > OI_THRESHOLD)) {
            putNotifyAndAlert({
              time: Date.now(),
              alertType: "OI_CHANGE",
              alertSubType: "REALTIME_OI",
              ...timeframeOI,
              timeframe,
            });
          }
        }
      );
    } catch (error) {
      console.log("error in getSymbolOIRealTime:symbol", symbol, error);
      console.log("marketRealOIs", _.keys(marketRealOIs));
    }
  }
  //
  async function fetchOIRealTimeAllSymbol() {
    const listLen = symbolList.length;
    for (let i = 0; i < listLen; i++) {
      const symbol = symbolList[i];
      const start = Date.now();
      await getSymbolOIRealTime(
        symbol,
        i === 0 || i === listLen - 1 ? true : false
      );
      const end = Date.now();
      const duration = end - start;
      if (duration < reqLimitRate) {
        await new Promise((resolve) =>
          setTimeout(resolve, reqLimitRate - duration)
        );
      }
    }
  }
  //
  // console.log("first OI realtime", dayjs().format("HH:mm:ss:SSS"));
  await fetchOIRealTimeAllSymbol();
  //
  // let timeoutMs = 0;
  const next5mTimepoint = MINUTE_5 - (Date.now() % MINUTE_5);
  // const next2mTimepoint =
  //   next5mTimepoint < 3 * MINUTE_1
  //     ? next5mTimepoint + 2 * MINUTE_1
  //     : next5mTimepoint - 3 * MINUTE_1;
  // timeoutMs = next2mTimepoint;
  setTimeout(() => {
    setTimeout(async () => {
      // console.log("again OI realtime", dayjs().format("HH:mm:ss:SSS"));
      await fetchOIRealTimeAllSymbol();
      const intOIRealAllSymb = setInterval(async () => {
        // console.log("interval OI realtime", dayjs().format("HH:mm:ss:SSS"));
        await fetchOIRealTimeAllSymbol();
      }, REAL_OI_INTERVAL_TIME);
      lsIntervalRealOIAllSymb.push(intOIRealAllSymb);
      resolve();
    }, 2 * MINUTE_1);
  }, next5mTimepoint);
};

const startFetchOpenInterestHist = async (symbolList) => {
  //
  async function getSymbTfOIHist(symbol, timeframe) {
    const respOIs = await getOpenInterestHist(
      symbol,
      timeframe,
      NUMBER_HIST_OI
    );
    if (!_.isEmpty(respOIs)) {
      marketData[symbol].openInterests["hist"][timeframe] = respOIs;
    }
  }
  //
  // wait for first fetching all symbols
  const openInterestTimeframes = _.keys(openInterestHistTimeframesInterval);

  async function getTfOIHist(timeframe, symbolList, blCheckRealOI) {
    const listLen = symbolList.length;
    for (let symbIdx = 0; symbIdx < listLen; symbIdx++) {
      const symbol = symbolList[symbIdx];
      if (blCheckRealOI && alreadyHadRealOI(symbol, timeframe)) {
        continue;
      }
      // symbIdx === 0 &&
      //   console.log(
      //     "getSymbolOIHist:start",
      //     timeframe,
      //     ">",
      //     symbol,
      //     dayjs().format("HH:mm:ss:SSS")
      //   );
      // first call
      const start = Date.now();
      await getSymbTfOIHist(symbol, timeframe);
      const end = Date.now();
      const duration = end - start;
      if (duration < reqLimitRate) {
        await new Promise((resolve) =>
          setTimeout(resolve, reqLimitRate - duration)
        );
      }
      // symbIdx === listLen - 1 &&
      //   console.log(
      //     "getSymbolOIHist:end",
      //     timeframe,
      //     ">",
      //     symbol,
      //     dayjs().format("HH:mm:ss:SSS")
      //   );
    }
  }

  for (let tfIdx = 0; tfIdx < openInterestTimeframes.length; tfIdx++) {
    const timeframe = openInterestTimeframes[tfIdx];
    const timeFrameMs = openInterestHistTimeframesInterval[timeframe].time;
    // first fetch
    await getTfOIHist(timeframe, symbolList, false);
    const tfLatency = openInterestHistTimeframesInterval[timeframe].latency;
    const timeToNextTimestamp =
      timeFrameMs - (Date.now() % timeFrameMs) + tfLatency;
    setTimeout(async () => {
      // fetch again
      if (completedStart) {
        // console.log("get OI again", timeframe, dayjs().format("HH:mm:ss:SSS"));
        await getTfOIHist(timeframe, symbolList, true);
      }
      //
      const intervalId = setInterval(async () => {
        if (completedStart) {
          if (alreadyHadRealOITf(timeframe, symbolList)) {
            // console.log("clearInterval", timeframe);
            clearInterval(intervalId);
            return;
          }
          // console.log(
          //   "interval fetching OI",
          //   timeframe,
          //   dayjs().format("HH:mm:ss:SSS")
          // );
          await getTfOIHist(timeframe, symbolList, true);
        }
      }, timeFrameMs);
    }, timeToNextTimestamp);
  }
};

const updateFundingRateRealTime = async (symbolList) => {
  // map data from binanceHeatmap
  symbolList.forEach(async (symbol) => {
    const realFR = binanceHeatmap.fundingRates.filter(
      (symbFR) => symbFR.symbol === symbol
    );
    marketData[symbol].fundingRates["real"] = {
      fundingTime: realFR[0].fundingTime || "NA",
      fundingRate: realFR[0].fundingRate || "NA",
    };
    // console.log(
    //   `marketData[${symbol}].fundingRates["real"]`,
    //   marketData[symbol].fundingRates["real"]
    // );
  });
};

/**
 * https://www.binance.com/en/support/faq/introduction-to-binance-futures-funding-rates-360033525031
 *
 * Funding payments with a settlement frequency of every eight hours occur at 00:00 (UTC), 08:00 (UTC), and 16:00 (UTC). Funding payments with a settlement frequency of every four hours occur at 00:00 (UTC), 04:00 (UTC), 08:00 (UTC), 12:00 (UTC), 16:00 (UTC), and 20:00 (UTC).
 */
const startFetchFundingRateHistory = async (symbolList) => {
  //
  async function fetchSymbFRHist(symbol) {
    const respFRs = await binance.futuresFundingRate(symbol, {
      limit: NUMBER_FR,
    });
    const symbFRs = respFRs.map((symFR) => {
      return {
        fundingTime: symFR.fundingTime,
        fundingRate: symFR.fundingRate,
      };
    });
    marketData[symbol].fundingRates["hist"] = symbFRs;
  }
  //
  for (let i = 0; i < symbolList.length; i++) {
    const symbol = symbolList[i];
    // first fetchSymbFRHist
    // console.log("first fetchSymbFRHist", symbol);
    fetchSymbFRHist(symbol);
    const timeToNextFRTime =
      FUNDING_RATE_INTERVAL -
      (Date.now() % FUNDING_RATE_INTERVAL) +
      FUNDING_RATE_LATENCY;
    setTimeout(() => {
      // fetchSymbFRHist again
      // console.log("fetchSymbFRHist again", symbol);
      fetchSymbFRHist(symbol);
      // interval fetchSymbFRHist
      const intervalSymbFRHist = setInterval(() => {
        // console.log("interval fetchSymbFRHist", symbol);
        fetchSymbFRHist(symbol);
      }, FUNDING_RATE_INTERVAL);
      lsIntervalSymbFRHist.push(intervalSymbFRHist);
    }, timeToNextFRTime);
  }
};

/*
Contract status(contractStatus，status):

PENDING_TRADING
TRADING
PRE_DELIVERING
DELIVERING
DELIVERED
PRE_SETTLE
SETTLING
CLOSE

!contractInfo [Object: null prototype]  = {
  e: 'contractInfo',
  E: 1697121000819,
  s: 'BIGTIMEUSDT',
  ps: 'BIGTIMEUSDT',
  ct: 'PERPETUAL',
  dt: 4133404800000,
  ot: 1697121000000,
  cs: 'PENDING_TRADING',
  bks: []
} 
*/

async function resetMarketData() {
  // close current ws
  if (!_.isEmpty(lsWsTimeframeCandle)) {
    _.forEach(lsWsTimeframeCandle, (wsEndpoint) => {
      console.log("terminate wsEndpoint:", wsEndpoint);
      binance.futuresTerminate(wsEndpoint);
    });
    lsWsTimeframeCandle.length = 0;
  }
  //
  if (_.isEmpty(lsIntervalRealOIAllSymb)) {
    lsIntervalRealOIAllSymb.forEach((intevalId) => clearInterval(intevalId));
    lsIntervalRealOIAllSymb.length = 0;
  }
  //
  if (!_.isEmpty(lsIntervalSymbFRHist)) {
    lsIntervalSymbFRHist.forEach((intervalId) => clearInterval(intervalId));
    lsIntervalSymbFRHist.length = 0;
  }
  //
  if (!_.isEmpty(lsIntervalFRRealTime)) {
    lsIntervalFRRealTime.forEach((intervalId) => clearInterval(intervalId));
    lsIntervalFRRealTime.length = 0;
  }
  //
  if (wsContractInfo !== 0) {
    binance.futuresTerminate(wsContractInfo);
    wsContractInfo = 0;
  }
  //
  if (intvlDetectAlert !== 0) clearInterval(intvlDetectAlert);
  //
  if (!_.isEmpty(lsIntvlDetectSignal)) {
    lsIntvlDetectSignal.forEach((intervalId) => clearInterval(intervalId));
    lsIntvlDetectSignal.length = 0;
  }
  //
  if (intvlCleanupSignal !== 0) clearInterval(intvlCleanupSignal);
  //
  // reset data
  // To truly wait for 1 minute before running the next command, consider using async/await with a Promise like so:
  console.log("Wait for 1 minute before proceeding.");
  await new Promise((resolve) => setTimeout(resolve, 60000));
  marketRealOIs = {};
  marketData = {};
  binanceSignals = {};
  calculatedCandles = {};
}
const startLoadingMarketDataForSymbols = async (symbolList) => {
  console.log(
    dayjs().format("DD/MM HH:mm:ss"),
    "startLoadingMarketDataForSymbols",
    symbolList
  );
  symbolList.forEach((symbol) => {
    marketRealOIs[symbol] = [];
    //
    marketData[symbol] = {};
    marketData[symbol].symbol = symbol;
    marketData[symbol].candles = {};
    marketData[symbol].rsis = {};
    marketData[symbol].tickers = {};
    candleTimeframes.forEach((timeframe) => {
      marketData[symbol].candles[timeframe] = {};
      marketData[symbol].rsis[timeframe] = [];
      marketData[symbol].tickers[timeframe] = [];
    });
    marketData[symbol].openInterests = {};
    marketData[symbol].openInterests["tickers"] = {};
    marketData[symbol].openInterests["hist"] = {};
    marketData[symbol].fundingRates = {};
    // for detecting signals
    binanceSignals[symbol] = [];
    calculatedCandles[symbol] = {};
    _.forEach(strategyTimeframes, (timeframe) => {
      binanceSignals[symbol][timeframe] = [];
      calculatedCandles[symbol][timeframe] = {};
    });
    // console.log("binanceSignals", binanceSignals);
  });
  // Data for analyzing
  console.log("startFetchCandlesData", dayjs().format("HH:mm:ss:SSS"));
  await startFetchCandlesData(symbolList);
  console.log("startFetchOpenInterestHist", dayjs().format("HH:mm:ss:SSS"));
  await startFetchOpenInterestHist(symbolList);
  console.log(
    "startFetchingOpenInterestRealTime",
    dayjs().format("HH:mm:ss:SSS")
  );
  await startFetchingOpenInterestRealTime(symbolList);
  console.log("startFetchFundingRateHistory", dayjs().format("HH:mm:ss:SSS"));
  await startFetchFundingRateHistory(symbolList);
  console.log(
    "after:startFetchFundingRateHistory",
    dayjs().format("HH:mm:ss:SSS")
  );
  //
  const intvlFRRealTime = setInterval(
    () => updateFundingRateRealTime(symbolList),
    5000
  );
  lsIntervalFRRealTime.push(intvlFRRealTime);
};
//
const startLoadingMarketData = async () => {
  // fetch exchange info
  await fetchExchangeInfo();
  // 24h change & volume
  await fetch24hRolling();
  // websocket for 24h changes?
  /**[ {
    eventType: '24hrTicker',
    eventTime: 1694663406001,
    symbol: 'RUNEUSDT',
    priceChange: '0.1340',
    percentChange: '9.079',
    averagePrice: '1.5610',
    close: '1.6100', // -> this is last price
    closeQty: '459',
    open: '1.4760',
    high: '1.6310',
    low: '1.4710',
    volume: '70693597',
    quoteVolume: '110351902.6790',
    openTime: 1694577000000,
    closeTime: 1694663405997,
    firstTradeId: 287929542,
    lastTradeId: 288170060,
    numTrades: 240519
  }
] */
  const ws24HTicker = binance.futuresTickerStream(false, (tickers) => {
    tickers.map((ticker) => {
      binanceHeatmap.prevDay[ticker.symbol] = ticker;
    });
    sort24hRolling();
  });
  console.log("ws24HTicker", ws24HTicker);
  // get markprices first time
  markPrices = await binance.futuresMarkPrice();
  lastPrices = await binance.futuresPrices();
  // console.log("last prices", lastPrices);
  setInterval(async () => {
    lastPrices = await binance.futuresPrices();
  }, 3000);
  // console.log("markPrices", markPrices);
  // funding rate stream (real time)
  /**[
  {
    eventType: 'markPriceUpdate',
    eventTime: 1694941393000,
    symbol: 'CFXUSDT',
    markPrice: '0.12266116',
    indexPrice: '0.12277192',
    fundingRate: '0.00007628',
    fundingTime: 1694966400000
  },
  {
    eventType: 'markPriceUpdate',
    eventTime: 1694941393000,
    symbol: 'PHBBUSD',
    markPrice: '0.59429724',
    indexPrice: '0.59822288',
    fundingRate: '0.00010000',
    fundingTime: 1694966400000
  },
 ] */
  const wsMarprice = binance.futuresMarkPriceStream((resp) => {
    // console.log("binance.futuresMarkPriceStream", resp);
    binanceHeatmap.fundingRates = _.clone(resp);
    markPrices = binanceHeatmap.fundingRates;
  });
  console.log("wsMarprice", wsMarprice);
  // market data - init data
  /**
   * marketData {
   *  "BTCUSDT": {
   *    "candles": [],
   *    rsi: {},
   *    tickers: {},
   *    openInterests: {},
   *    fundingRates: {}
   *  },
   *  "ETHUSDT": {
   *  },
   *  ...
   * }
   */
  await startObservingMarketData();
  // Schedule startObservingMarketData to run every day at 5 AM Ho Chi Minh City time
  schedule.scheduleJob(
    { hour: 5, minute: 0, tz: "Asia/Ho_Chi_Minh" },
    async function () {
      console.log(
        "startObservingMarketData scheduled task running at 5 AM Ho Chi Minh City time every day."
      );
      await startObservingMarketData();
    }
  );
  //
  completedStart = true;
  console.log("startLoadingMarketData: completedStart?", completedStart);
};

async function startObservingMarketData() {
  //
  await resetMarketData();
  // Assuming binanceHeatmap.change24Hs is an array of objects with a percentChange property
  // and futuresSymbolList is an array of symbols you want to ensure are included

  // First, filter the change24Hs list to include only symbols present in futuresSymbolList
  const filteredChange24Hs = binanceHeatmap.change24Hs.filter((item) =>
    futuresSymbolList.includes(item.symbol)
  );

  // Then sort the filtered list
  const sortedFilteredChange24Hs = filteredChange24Hs.sort(
    (a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange)
  );

  // Determine the number of coins based on the environment
  const numCoins = process.env.NODE_ENV === "production" ? 29 : 29;

  let ls24hVolatile = sortedFilteredChange24Hs
    .slice(0, numCoins)
    .map((item) => item.symbol);

  // Ensure ls24hVolatile contains BTCUSDT
  if (!ls24hVolatile.includes("BTCUSDT")) {
    ls24hVolatile.unshift("BTCUSDT");
  }

  const symbolList = ls24hVolatile;
  // test: just bnb
  // const symbolList = ["BNBUSDT"];
  console.log("symbolList", symbolList);

  const groupSymbolList = [];
  const NUMBER_SYMBOL_EACH_WS = 50;
  for (let i = 0; i < symbolList.length; i += NUMBER_SYMBOL_EACH_WS) {
    const chunk = symbolList.slice(i, i + NUMBER_SYMBOL_EACH_WS);
    groupSymbolList.push(chunk);
  }
  //
  for (let groupIdx = 0; groupIdx < groupSymbolList.length; groupIdx++) {
    const symbolListMarket = groupSymbolList[groupIdx];
    console.log(
      "load market data group",
      groupIdx + 1,
      "len",
      symbolListMarket.length
    );
    await startLoadingMarketDataForSymbols(symbolListMarket);
  }
  // ws for new contracts listed
  wsContractInfo = binance.futuresSubscribe("!contractInfo", async (resp) => {
    // console.log("!contractInfo", resp);
    const symbol = resp.s;
    if (
      resp.cs === "TRADING" &&
      !futuresSymbolList.includes(symbol) &&
      symbol.includes("USDT")
    ) {
      console.log("push new contract and loading first data", symbol);
      futuresSymbolList.push(symbol);
      // first load data for new contract
      await startLoadingMarketDataForSymbols([symbol]);
    }
  });
  // console.log("wsContractInfo", wsContractInfo);
  //
  startExchangesOI(symbolList);
  //
  // console.log("set interval detectAlert");
  intvlDetectAlert = setInterval(() => detectAlert(symbolList), SECOND_5);
  //
  // console.log("startSignalsDetecting");
  await startSignalsDetecting(symbolList);
  //
  // console.log("startCleanupSignals");
  startCleanupSignals();
  //
}

/**
 * Rule for Alerts
 *
 * Open Interest Volatility (5m, 15m, 30m, 1h, 8h, 24h)
 * Price Volatility (5m, 15m, 30m, 1h, 8h, 24h)
 *
 * web frontend as a list of contracts which reach the rule for alert
 * observe price and OI volatility of time frame 5m, 15m, 30m
 * alert for volatility of larger 5% → add to the table list
 * table list of contracts with information of: Price % + price, OI % + OI, Volume % + Volume, Funding Rate %, Long/Short Ratio
 */
function putNotifyAndAlert(notifyObj) {
  function IsThisObjectExist(obj) {
    const objTfMils = timeframeTimeMils[obj.timeframe];
    if (
      binanceAlertsList.find(
        (element) =>
          element.symbol === obj.symbol &&
          element.alertType === obj.alertType &&
          element.timeframe === obj.timeframe &&
          dayjs(obj.time)
            .subtract(objTfMils, "millisecond")
            .isBefore(dayjs(element.time))
      )
    ) {
      return true;
    }
    return false;
  }
  //
  try {
    if (!IsThisObjectExist(notifyObj)) {
      const timeString = dayjs(notifyObj.time).format("DD/MM HH:mm:ss:SSS");
      // console.log(
      //   "alert:",
      //   timeString,
      //   notifyObj.symbol,
      //   notifyObj.timeframe,
      //   notifyObj.alertType
      // );
      binanceAlertsList.push(notifyObj);
      //
      broadcastNotification(notifyObj);
    }
  } catch (error) {
    console.error(
      `Error in putNotifyAndAlert for symbol ${notifyObj.symbol} and timeframe ${notifyObj.timeframe}:`,
      error
    );
  }
}

function cleanUpSignalList(beforeTime) {
  try {
    // clean signals older beforeTime
    // console.log(
    //   "cleanUpSignalList>before",
    //   beforeTime.tz(HO_CHI_MINH_TZ).format("DD:MM HH:mm:ss:SSS")
    // );
    _.forEach(binanceSignals, (symbolSignals, key) => {
      _.forEach(_.values(symbolSignals), (symbTfSignals) => {
        _.remove(symbTfSignals, (signal) =>
          dayjs(signal.time).isBefore(beforeTime)
        );
      });
    });
  } catch (error) {
    console.log(error);
  }
}
/**
 * processing market data for alerts
 *
 * Rules:
 * - abs price change is greater than 5%
 * - abs OI change is greate than 5%
 * - rsi is oversold (less than 20) or over bought (greater than 80)
 * - abs volume change is greater than 5%
 */

const fetch24hRolling = async () => {
  /**{ WLDUSDT: [Object: null prototype] {
    symbol: 'WLDUSDT',
    priceChange: '-0.1771000',
    priceChangePercent: '-14.917',
    weightedAvgPrice: '1.0585432',
    lastPrice: '1.0101000',
    lastQty: '4875',
    openPrice: '1.1872000',
    highPrice: '1.1975000',
    lowPrice: '1.0100000',
    volume: '54859',
    quoteVolume: '58070.6203000',
    openTime: 1694573220000,
    closeTime: 1694659572825,
    firstId: 25861,
    lastId: 25949,
    count: 89
  },} */
  const prevPrice24H = await binance.futuresDaily(); // 40 weight
  console.log("fetch24hRolling:prevPrice24H", Object.keys(prevPrice24H).length);
  // replace priceChangePercent bye percentChange
  Object.keys(prevPrice24H).forEach((key) => {
    changeObjectKey(prevPrice24H[key], "priceChangePercent", "percentChange");
  });

  binanceHeatmap.prevDay = _.clone(prevPrice24H);
  sort24hRolling();
};

const sort24hRolling = () => {
  // console.log("sort24hRolling");
  if (!_.isEmpty(binanceHeatmap.prevDay)) {
    // const rolling24h = binanceHeatmap.prevDay;
    const rolling24hUsdt = Object.values(binanceHeatmap.prevDay).filter(
      (contract) => contract.symbol.includes("USDT")
    );
    // console.log("rolling24hUsdt", rolling24hUsdt);
    const change24Hs = rolling24hUsdt.sort((contract1, contract2) => {
      return (
        Math.abs(contract2.percentChange) - Math.abs(contract1.percentChange)
      );
    });
    binanceHeatmap.change24Hs = _.clone(change24Hs);
    const tradingVol24H = rolling24hUsdt.sort((contract1, contract2) => {
      return Number(contract2.quoteVolume) - Number(contract1.quoteVolume);
    });
    binanceHeatmap.tradingVol24H = _.clone(tradingVol24H);
  }
};
//
function getHeatmapData() {
  return binanceHeatmap;
}
//
function getAlertsData() {
  const dataList = _.takeRight(binanceAlertsList, NUMBER_ALERT_TO_CLIENT);
  // filter out symbol list
  const alertSymbList = _.uniq(
    _.map(_.reverse(dataList), (alertObj) => {
      return alertObj.symbol;
    })
  );
  const alertDataList = _.map(alertSymbList, (symbol) => {
    const returnObj = { symbol, data: marketData[symbol] };
    return returnObj;
  });
  const alertData = {
    symbols: alertSymbList,
    alertlist: dataList,
    marketdata: alertDataList,
  };

  return { tradingVol24H: binanceHeatmap.tradingVol24H, alertData };
}
//
function getSignalsData() {
  const filterSignals = [];
  _.forEach(binanceSignals, (symbolSignals, key) => {
    // console.log("symbolSignals", symbolSignals);
    _.forEach(_.values(symbolSignals), (symbTfSignals) => {
      // console.log("symbTfSignals", symbTfSignals);
      if (!_.isEmpty(symbTfSignals)) {
        filterSignals.push(...symbTfSignals);
      }
    });
  });
  let sortedSignals = _.sortBy(filterSignals, (signal) => signal.time);
  if (sortedSignals.length > MAX_SIGNAL_NUMBER) {
    sortedSignals = _.takeRight(sortedSignals, MAX_SIGNAL_NUMBER);
  }
  // console.log("sortedSignals", sortedSignals);

  return sortedSignals;
}
function getAllSignalsData() {
  const filterSignals = [];
  _.forEach(binanceSignals, (symbolSignals, key) => {
    // console.log("symbolSignals", symbolSignals);
    _.forEach(_.values(symbolSignals), (symbTfSignals) => {
      // console.log("symbTfSignals", symbTfSignals);
      if (!_.isEmpty(symbTfSignals)) {
        filterSignals.push(...symbTfSignals);
      }
    });
  });
  let sortedSignals = _.sortBy(filterSignals, (signal) => signal.time);
  return sortedSignals;
}

const fetchFuturesSymbol = async () => {
  if (_.isEmpty(futuresSymbolList)) {
    await fetchExchangeInfo();
  }
  return futuresSymbolList;
};
const fetchfuturesPricePrecisions = async () => {
  if (_.isEmpty(binanceHeatmap.pricePrecisions)) {
    await fetchExchangeInfo();
  }
  return binanceHeatmap.pricePrecisions;
};
/** market cap https://www.binance.com/bapi/composite/v1/private/bigdata/finance/kline/market/cap */
const futuresMarketCap = () => {};

startLoadingMarketData();

function getMarkPrice(symbol) {
  return markPrices.find((item) => item.symbol === symbol);
}
function getLastPrice(symbol) {
  return lastPrices[symbol];
}
function getLastPrices() {
  return lastPrices;
}

export default {
  completedStart,
  getAlertsData,
  getHeatmapData,
  getSignalsData,
  getAllSignalsData,
  fetchFuturesSymbol,
  fetchfuturesPricePrecisions,
  minimums,
  getMarkPrice,
  getLastPrice,
  getLastPrices,
  binanceAlertsList,
};
