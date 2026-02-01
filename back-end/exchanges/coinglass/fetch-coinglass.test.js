import fetchingCoinglassData from "./fetch-coinglass.js";
import dayjs from "dayjs";
import _ from "lodash";

async function fetchOiAndLongShortRatio() {
  const symbolLst = [
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
  for (let symbIdx = 0; symbIdx < symbolLst.length; symbIdx++) {
    const symbol = symbolLst[symbIdx];

    const coinglassSymbol = _.replace(symbol, "USDT", "");
    console.log("fetchOpenInterest", symbol, dayjs().format("HH:mm:ss:SSS"));
    const symbCoinglassOI = await fetchingCoinglassData.fetchOpenInterest(
      coinglassSymbol
    );
    console.log(
      "symbCoinglassOI.success",
      coinglassSymbol,
      symbCoinglassOI.success
    );
    const coinglassOIData = symbCoinglassOI.data;
    const cgOiAllExchange = coinglassOIData.find(
      (item, index) => _.toLower(item.exchangeName) === "all"
    );
    const cgOiBinance = coinglassOIData.find(
      (item, index) => _.toLower(item.exchangeName) === "binance"
    );
    const coinglassOi = {
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
    // console.log("coinglassOi", coinglassSymbol, coinglassOi);
    console.log(
      "fetchExchangeShortRatio",
      symbol,
      dayjs().format("HH:mm:ss:SSS")
    );
    const symbCoinglassLongShortRatio =
      await fetchingCoinglassData.fetchExchangeShortRatio(
        coinglassSymbol,
        "h1"
      );
    console.log(
      "symbCoinglassLongShortRatio.success",
      coinglassSymbol,
      symbCoinglassLongShortRatio.success
    );
    // const longShortRatio = symbCoinglassLongShortRatio.data[0];
    // const longShortRatioBinance = _.find(
    //   longShortRatio.list,
    //   (longShortEx) => _.toLower(longShortEx.exchangeName) === "binance"
    // );
    // console.log(
    //   "longShortRatioBinance",
    //   coinglassSymbol,
    //   longShortRatioBinance
    // );
  }
}
fetchOiAndLongShortRatio();

// const COINGLASS_TIMEFRAME = "1h";
// async function getUpdateCoinglassData() {
//   const timeframe = COINGLASS_TIMEFRAME;
//   const tfSignalsList = [
//     {
//       time: dayjs(),
//       symbol: "BTCUSDT",
//       timeframe: "1h",
//       timestamp: 1701216000000,
//       type: "BULLISH_ENGULFING_LONG",
//       rsi: 66.86,
//       oiChange: -0.15904297395789294,
//       priceChange: 0.49493065430570815,
//     },
//     {
//       time: dayjs(),
//       symbol: "BANDUSDT",
//       timeframe: "1h",
//       timestamp: 1701216000000,
//       type: "BEARISH_ENGULFING_SHORT",
//       rsi: 60.41,
//       oiChange: -0.2079061943620418,
//       priceChange: 0.5474582296480496,
//     },
//   ];
//   console.log("tfSignalsList", tfSignalsList);
//   const removedSignals = _.remove(tfSignalsList, (signal) => {
//     const removeTime = dayjs().subtract(2, "hour");
//     dayjs(signal.timestamp).isBefore(removeTime);
//   });
//   const justDetectedSignalList = tfSignalsList;
//   console.log(
//     "justDetectedSignalList",
//     _.map(justDetectedSignalList, (signal) => signal.symbol)
//   );
//   const symbolLst = _.uniq(
//     _.map(justDetectedSignalList, (signal) => signal.symbol)
//   );
//   console.log("symbolLst", symbolLst);
//   // get symbol list of detected signals
//   for (let symbIdx = 0; symbIdx < symbolLst.length; symbIdx++) {
//     const symbol = symbolLst[symbIdx];
//     const coinglassSymbol = _.replace(symbol, "USDT", "");
//     // fetch oi and long/short ratio, set to signal data
//     const symbCoinglassOI = await fetchingCoinglassData.fetchOpenInterest(
//       coinglassSymbol
//     );
//     const symbCoinglassLongShortRatio =
//       await fetchingCoinglassData.fetchExchangeShortRatio(
//         coinglassSymbol,
//         "h1"
//       );
//     // set data to all signals
//     _.forEach(justDetectedSignalList, (signal) => {
//       if (signal.symbol === symbol) {
//         if (symbCoinglassOI.success) {
//           const coinglassOIData = symbCoinglassOI.data;
//           const cgOiAllExchange = coinglassOIData.find(
//             (item, index) => _.toLower(item.exchangeName) === "all"
//           );
//           const cgOiBinance = coinglassOIData.find(
//             (item, index) => _.toLower(item.exchangeName) === "binance"
//           );
//           //
//           signal["cgOi"] = {
//             allExchange: {
//               openInterest: cgOiAllExchange.openInterest,
//               oichangePercent: cgOiAllExchange.oichangePercent,
//               openInterestAmount: cgOiAllExchange.openInterestAmount,
//               h1OIChangePercent: cgOiAllExchange.h1OIChangePercent,
//             },
//             binance: {
//               openInterest: cgOiBinance.openInterest,
//               oichangePercent: cgOiBinance.oichangePercent,
//               openInterestAmount: cgOiBinance.openInterestAmount,
//               h1OIChangePercent: cgOiBinance.h1OIChangePercent,
//             },
//           };
//         }
//         //
//         if (symbCoinglassLongShortRatio.success) {
//           const longShortRatio = symbCoinglassLongShortRatio.data[0];
//           // console.log("longShortRatio.list", longShortRatio.list);
//           const longShortRatioBinance = _.find(
//             longShortRatio.list,
//             (longShortEx) => _.toLower(longShortEx.exchangeName) === "binance"
//           );
//           //
//           signal["cgLongShort"] = {
//             allExchange: {
//               longRate: longShortRatio.longRate,
//               shortRate: longShortRatio.shortRate,
//               totalVolUsd: longShortRatio.totalVolUsd,
//             },
//             binance: {
//               longRate: longShortRatioBinance.longRate,
//               shortRate: longShortRatioBinance.shortRate,
//               totalVolUsd: longShortRatioBinance.totalVolUsd,
//             },
//           };
//         }
//       }
//     });
//     //
//     console.log("justDetectedSignalList", justDetectedSignalList);
//     // console.log("binanceSignals", symbol, binanceSignals[symbol][timeframe]);
//   }
// }

// getUpdateCoinglassData();
