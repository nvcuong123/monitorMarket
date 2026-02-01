import * as dotenv from "dotenv";
import _ from "lodash";
import { RSI } from "technicalindicators";
import { calculateRSI } from "../modules/indicators/oscillators/rsi.js";
import axios from "axios";
import dayjs from "dayjs";
import { doji } from "../modules/indicators/candlestick/Doji.js";
import { morningstar } from "../modules/indicators/candlestick/MorningStar.js";
import { morningdojistar } from "../modules/indicators/candlestick/MorningDojiStar.js";
import { eveningstar } from "../modules/indicators/candlestick/EveningStar.js";
import { eveningdojistar } from "../modules/indicators/candlestick/EveningDojiStar.js";
import CandlestickFinder from "../modules/indicators/candlestick/CandlestickFinder.js";

//import dayjs from 'dayjs' // ES 2015
console.log(dayjs().format("DD/MM HH:mm:ss"));
dotenv.config();
//
const BINANCE_TR7_API_KEY_PERP_FUTURE_TESTNET =
  "3a7ee0a61e380e089ce98c08b7415e350752b9a19b25135ea622ae9c1a8f26c7";
const BINANCE_TR7_API_SCRET_KEY_PERP_FUTURE_TESTNET =
  "d0c46f03a491996c3fcb7ea346408e4ebf36396d56ecbb0265102ee369301763";
import Binance from "node-binance-api";
import { dragonflydoji } from "../modules/indicators/candlestick/DragonFlyDoji.js";
import { gravestonedoji } from "../modules/indicators/candlestick/GraveStoneDoji.js";
const binance = new Binance().options({
  test: false,
  APIKEY: "",
  APISECRET: "",
  // test: true,
  // APIKEY: BINANCE_TR7_API_KEY_PERP_FUTURE_TESTNET,
  // APISECRET: BINANCE_TR7_API_SCRET_KEY_PERP_FUTURE_TESTNET,
});
// console.log(process.env);
const testBinance = async function () {
  const info = await binance.futuresExchangeInfo();
  /* candlesticks: {
      "e": "kline",     // Event type
      "E": 123456789,   // Event time
      "s": "BNBBTC",    // Symbol
      "k": {
        "t": 123400000, // Kline start time
        "T": 123460000, // Kline close time
        "s": "BNBBTC",  // Symbol
        "i": "1m",      // Interval
        "f": 100,       // First trade ID
        "L": 200,       // Last trade ID
        "o": "0.0010",  // Open price
        "c": "0.0020",  // Close price
        "h": "0.0025",  // High price
        "l": "0.0015",  // Low price
        "v": "1000",    // Base asset volume
        "n": 100,       // Number of trades
        "x": false,     // Is this kline closed?
        "q": "1.0000",  // Quote asset volume
        "V": "500",     // Taker buy base asset volume
        "Q": "0.500",   // Taker buy quote asset volume
        "B": "123456"   // Ignore
      }
    }
  } 
  */
  // binance.websockets.candlesticks(["ETHUSDT"], "1m", (candlesticks) => {
  //   console.log(candlesticks);
  //   return;
  //   let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
  //   let {
  //     o: open,
  //     h: high,
  //     l: low,
  //     c: close,
  //     v: volume,
  //     n: trades,
  //     i: interval,
  //     x: isFinal,
  //     q: quoteVolume,
  //     V: buyVolume,
  //     Q: quoteBuyVolume,
  //   } = ticks;
  //   console.info(symbol + " " + interval + " candlestick update");
  //   console.info("open: " + open);
  //   console.info("high: " + high);
  //   console.info("low: " + low);
  //   console.info("close: " + close);
  //   console.info("volume: " + volume);
  //   console.info("isFinal: " + isFinal);
  // });

  // trade update
  // binance.websockets.trades(["BNBBTC", "ETHBTC"], (trades) => {
  //   let {
  //     e: eventType,
  //     E: eventTime,
  //     s: symbol,
  //     p: price,
  //     q: quantity,
  //     m: maker,
  //     a: tradeId,
  //   } = trades;
  //   console.info(
  //     symbol +
  //       " trade update. price: " +
  //       price +
  //       ", quantity: " +
  //       quantity +
  //       ", maker: " +
  //       maker
  //   );
  // });

  /**{
  eventType: '24hrMiniTicker',
  eventTime: 1683709305412,
  symbol: 'ETHUSDT',
  close: '1860.71',
  open: '1861.10',
  high: '1875.75',
  low: '1856.76',
  volume: '27944.082',
  quoteVolume: '52028417.49'
} */
  // binance.futuresMiniTickerStream("ETHUSDT", (miniTicker) => {
  //   console.info(miniTicker);
  // });
  /**{
  updateId: 31655981613,
  symbol: 'BTCUSDT',
  bestBid: '28352.00',
  bestBidQty: '20.609',
  bestAsk: '28396.50',
  bestAskQty: '0.010'
} */
  // binance.futuresBookTickerStream("BTCUSDT", (data) => console.log(data));
  // console.info(await binance.futuresAllOrders());

  // // market cap
  // console.info(
  //   await binance.publicRequest(
  //     "https://www.binance.com/bapi/composite/v1/private/bigdata/finance/kline/market/cap"
  //   )
  // );
  /** [
   * {
    eventType: '24hrTicker',
    eventTime: 1693896630415,
    symbol: 'BTCUSDT',
    priceChange: '-881.30',
    percentChange: '-3.305',
    averagePrice: '25969.34',
    close: '25787.70',
    closeQty: '0.037',
    open: '26669.00',
    high: '26669.00',
    low: '25550.00',
    volume: '113193.189',
    quoteVolume: '2939552449.57',
    openTime: 1693810200000,
    closeTime: 1693896630414,
    firstTradeId: 267817299,
    lastTradeId: 267870114,
    numTrades: 52803
  } 
]
// */
  // const exchangeInfo = await binance.futuresExchangeInfo();
  // console.log(exchangeInfo.timezone);
  // const data = await binance.futuresDaily("BTCUSDT");
  // // console.log(Object.keys(data));
  // // console.log(data["BTCUSDT"]);
  // console.log(data);
  // console.log(
  //   await binance.futuresCandles("BTCUSDT", "1h", {
  //     limit: 2,
  //     startTime: Date.now() - 1 * 60 * 60 * 1000,
  //   })
  // );

  //   console.info(await binance.futuresQuote("BTCUSDT"));
  //   console.info(await binance.futuresOpenInterest("BTCUSDT"));
  //   console.info(await binance.futuresFundingRate());
  // binance.futuresTickerStream("BTCUSDT", console.log);
  // setInterval(async () => {
  //   const change24H = [];
  //   // const curPrices = await binance.futuresPrices();
  //   /**[
  //   1499040000000,      // Open time
  //   "0.01634790",       // Open
  //   "0.80000000",       // High
  //   "0.01575800",       // Low
  //   "0.01577100",       // Close
  //   "148976.11427815",  // Volume
  //   1499644799999,      // Close time
  //   "2434.19055334",    // Quote asset volume
  //   308,                // Number of trades
  //   "1756.87402397",    // Taker buy base asset volume
  //   "28.46694368",      // Taker buy quote asset volume
  //   "17928899.62484339" // Ignore.
  // ] */
  //   // const klinePrev24H = await binance.futuresCandles("ETHUSDT", "1h", {
  //   //   limit: 1,
  //   //   startTime: Date.now() - 1 * 60 * 60 * 1000,
  //   // });
  //   // const kline1h = klinePrev24H[0];
  //   // console.log("klinePrev24H", {
  //   //   "open time": kline1h[0],
  //   //   open: kline1h[1],
  //   //   high: kline1h[2],
  //   //   low: kline1h[3],
  //   //   close: kline1h[4],
  //   //   volume: kline1h[5],
  //   //   "close time": kline1h[6],
  //   // });

  //   // sort
  //   // const change24HSorted = change24H.sort((contract1, contract2) => {
  //   //   if (contract1.priceChangePercent > contract2.priceChangePercent) {
  //   //     return -1;
  //   //   } else if (contract1.priceChangePercent < contract2.priceChangePercent) {
  //   //     return 1;
  //   //   } else {
  //   //     return 0;
  //   //   }
  //   // });

  //   // console.log(change24HSorted.slice(0, 10));

  // const prevPrice24H = await binance.futuresDaily();
  // console.log(prevPrice24H);
  //   const change24Hs = Object.values(prevPrice24H).sort(
  //     (contract1, contract2) => {
  //       if (
  //         Math.abs(contract1.priceChangePercent) >
  //         Math.abs(contract2.priceChangePercent)
  //       ) {
  //         return -1;
  //       } else if (
  //         Math.abs(contract1.priceChangePercent) <
  //         Math.abs(contract2.priceChangePercent)
  //       ) {
  //         return 1;
  //       } else {
  //         return 0;
  //       }
  //     }
  //   );
  //   console.log(
  //     change24Hs.slice(0, 10).map((contract) => {
  //       return {
  //         symbol: contract.symbol,
  //         // priceChange: contract.priceChange,
  //         priceChangePercent: contract.priceChangePercent,
  //         quoteVolume: contract.quoteVolume,
  //       };
  //     })
  //   );
  // }, 2000);
  // console.log(await binance.futuresFundingRate("", { limit: 500 }));
  // binance.futuresTickerStream(false, (resp) => {
  //   console.log(
  //     "BTCUSDT last price: ",
  //     resp.find((elemt) => elemt.symbol === "BTCUSDT").close
  //   );
  // });

  // binance.futuresMarkPriceStream((resp) => {
  //   // console.log(resp.find((elemt) => elemt.symbol === "ETHUSDT"));
  //   console.log(resp);
  // });

  // console.info(await binance.futuresMarkPrice());
  // console.info(JSON.stringify(await binance.futuresLeverageBracket()));
  // console.info(await binance.futuresAllOrders());
  // info = await binance.futuresExchangeInfo();

  // let futuresSymbolList = [];
  // info.symbols.map((obj) => {
  //   futuresSymbolList.push(obj.symbol);
  // });
  // let candlesData = {};
  // const timeframeList = ["1m", "3m", "5m", "15m", "30m", "1h"];
  // const startFetchCandlesData = (timeframeList, contractList) => {
  //   timeframeList.map((timeframe) => {
  //     candlesData[timeframe] = {};
  //     // Kline rest + stream: price, volume
  //     const socketEndpoints = binance.futuresChart(
  //       contractList,
  //       timeframe,
  //       (symbol, interval, respObj) => {
  //         const candles = Object.values(respObj);
  //         console.log(
  //           symbol,
  //           interval,
  //           "rsi",
  //           calculate(candles, { period: 14 })
  //         );
  //         candlesData[interval][symbol] = respObj;
  //         // console.log(Object.keys(candlesData[interval]));
  //       },
  //       20
  //     );

  //     // TODO: may need to save socket endpoint to terminate it later if not use any more
  //   });
  // };
  // startFetchCandlesData(timeframeList, futuresSymbolList);

  // // RSI
  // const values = [
  //   11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11,
  //   10,
  // ];
  // let result = RSI.calculate({ values, period: 14 });
  // console.log(result);
  // const candles = [
  //   { open: 12, high: 13, low: 10, close: 11 },
  //   { open: 13, high: 14, low: 11, close: 12 },
  //   { open: 14, high: 15, low: 12, close: 13 },
  //   { open: 15, high: 16, low: 13, close: 14 },
  //   { open: 16, high: 17, low: 14, close: 15 },
  //   { open: 17, high: 18, low: 15, close: 16 },
  //   { open: 18, high: 19, low: 16, close: 17 },
  //   { open: 19, high: 20, low: 17, close: 18 },
  //   { open: 20, high: 21, low: 18, close: 19 },
  //   { open: 19, high: 20, low: 19, close: 20 },
  //   { open: 18, high: 19, low: 18, close: 19 },
  //   { open: 17, high: 18, low: 17, close: 18 },
  //   { open: 16, high: 17, low: 16, close: 17 },
  //   { open: 15, high: 16, low: 15, close: 16 },
  //   { open: 14, high: 15, low: 14, close: 15 },
  //   { open: 13, high: 14, low: 13, close: 14 },
  //   { open: 12, high: 13, low: 12, close: 13 },
  //   { open: 11, high: 12, low: 11, close: 12 },
  //   { open: 10, high: 11, low: 10, close: 11 },
  //   { open: 9, high: 10, low: 9, close: 10 },
  // ];

  // let reslt = calculate(candles);
  // console.log(reslt);
  // binance.futuresChart(
  //   "XVSUSDT",
  //   "1m",
  //   (symbol, timeframe, respObj) => {
  //     const candles = Object.values(respObj);
  //     const rsis = calculateRSI(candles, {
  //       sourceType: "close",
  //       period: 14,
  //     });
  //     console.log(
  //       symbol,
  //       timeframe,
  //       "candles no.",
  //       candles.length,
  //       "rsis",
  //       rsis[rsis.length - 2],
  //       rsis[rsis.length - 1]
  //     );
  //   },
  //   1000
  // );

  // var inputRSI = {
  //   values: [
  //     127.75, 129.02, 132.75, 145.4, 148.98, 137.52, 147.38, 139.05, 137.23,
  //     149.3, 162.45, 178.95, 200.35, 221.9, 243.23, 243.52, 286.42, 280.27,
  //     277.35, 269.02, 263.23, 214.9,
  //   ],
  //   period: 14,
  // };
  // var expectedResult = [86.41, 86.43, 89.65, 86.5, 84.96, 80.54, 77.56, 58.06];

  // console.log(RSI.calculate(inputRSI));
  console.log(`futuresSubscribe("!contractInfo")`);
  binance.futuresSubscribe("!contractInfo", console.log);
  // binance.futuresSubscribe("!assetIndex@arr", console.log);
};

// testBinance();

// console.log("moment.locale", moment.locale());
// const format = "hh:mm:ss";
// var time = moment(); //gives you current time. no format required.
// // const time = moment('09:34:00', format);
// const beforeTime = moment("20:20:00", format);
// const afterTime = moment("20:24:00", format);

// if (time.isBetween(beforeTime, afterTime)) {
//   console.log("is between");
// } else {
//   console.log("is not between");
// }
// // prints 'is between'
// const alertList = [
//   { timestamp: Date.now(), symbol: "BTCUSDT", event: "PRICE" },
//   { timestamp: Date.now(), symbol: "BTCUSDT", event: "OI" },
//   { timestamp: Date.now(), symbol: "BTCUSDT", event: "RSI" },
//   { timestamp: Date.now(), symbol: "BTCUSDT", event: "VOLUME" },
// ];
// const marketData = {
//   BTCUSDT: {
//     symbol: "BTCUSDT",
//     candles: [],
//     rsi: {},
//     tickers: {},
//     openInterests: {},
//     fundingRates: {},
//   },
//   ETHUSDT: {
//     symbol: "ETHUSDT",
//     candles: [],
//     rsi: {},
//     tickers: {},
//     openInterests: {},
//     fundingRates: {},
//   },
// };
// const processingList = _.filter(marketData, (obj) => {
//   return !_.includes(alertList);
// });

// setInterval(() => {
//   axios
//     .get("https://csd-trading-bot.onrender.com")
//     .then((response) => {
//       console.log("interval ping render");
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// }, 60000);

// var input = {
//   open: [36589.3, 36600.0, 36597.3],
//   high: [36606.1, 36605.0, 36597.3],
//   close: [36600.0, 36597.2, 36576.6],
//   low: [36588.4, 36586.0, 36564.3],
// };
var input = {
  open: [36582, 36594.4, 36568.6],
  high: [36594.4, 36594.4, 36568.6],
  close: [36594.4, 36568.6, 36546],
  low: [36580.6, 36568.5, 36542.4],
};
// // var imageBuffer = drawCandleStick(input);
// // console.log(imageBuffer);
// var result = eveningstar(input);
// console.log("Is Evening Star Pattern? :" + result);
// var result = eveningdojistar(input);
// console.log("Is Evening Doji Star Pattern? :" + result);

// var input = {
//   open: [250.04, 250.03, 249.9],
//   high: [250.07, 250.03, 249.98],
//   close: [250.02, 249.89, 249.98],
//   low: [250.0, 249.83, 249.87],
// };
var input = {
  open: [36582, 36594.4, 36568.6],
  high: [36594.4, 36594.4, 36568.6],
  close: [36594.4, 36568.6, 36546],
  low: [36580.6, 36568.5, 36542.4],
};
// var input = {
//   open: [138.889, 138.798, 138.826],
//   high: [138.89, 138.856, 138.982],
//   close: [138.798, 138.826, 138.959],
//   low: [138.769, 138.768, 138.825],
// };
// var input = {
//   open: [36602.2, 36584.1, 36589.0],
//   high: [36602.3, 36603.9, 36617.1],
//   close: [36584.2, 36589.0, 36608.0],
//   low: [36580.0, 36572.4, 36587.7],
// };

// var result = morningstar(input);
// console.log("Is Morning Star Pattern? :" + result);
// var result = morningdojistar(input);
// console.log("Is Morning Doji Star Pattern? :" + result);

var singleInput = {
  open: [36946.2],
  high: [36950.8],
  close: [36933.2],
  low: [36926.4],
};
// var singleInput = {
//   open: [30.1],
//   high: [32.1],
//   close: [30.13],
//   low: [28.1],
// };

var result = doji(singleInput);
console.log("Is Doji Pattern? :" + result);
var result = dragonflydoji(singleInput);
console.log("Is Dragon Fly Doji Pattern? :" + result);
var result = gravestonedoji(singleInput);
console.log("Is Grave Stone Doji Pattern? :" + result);

console.log(
  "is equal",
  new CandlestickFinder().approximateEqual(singleInput.open, singleInput.close)
);
