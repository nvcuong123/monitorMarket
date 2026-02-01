import {
  bullishinvertedhammerstick,
  shootingstar,
  shootingstarunconfirmed,
  bullishmarubozu,
  bearishmarubozu,
  // threeblackcrows,
  // threewhitesoldiers,
  bullishhammerstick,
  bearishhammerstick,
  bearishinvertedhammerstick,
  hammerpattern,
  hammerpatternunconfirmed,
  hangingman,
  hangingmanunconfirmed,
  tweezertop,
  tweezerbottom,
  abandonedbaby,
  bullishengulfingpattern,
  bearishengulfingpattern,
  darkcloudcover,
  downsidetasukigap,
  piercingline,
} from "technicalindicators";

import { doji } from "../../indicators/candlestick/Doji.js";
import { gravestonedoji } from "../../indicators/candlestick/GraveStoneDoji.js";
import { dragonflydoji } from "../../indicators/candlestick/DragonFlyDoji.js";
import { bearishspinningtop } from "../../indicators/candlestick/BearishSpinningTop.js";
import { bullishspinningtop } from "../../indicators/candlestick/BullishSpinningTop.js";
import { morningstar } from "../../indicators/candlestick/MorningStar.js";
import { eveningstar } from "../../indicators/candlestick/EveningStar.js";
import { morningdojistar } from "../../indicators/candlestick/MorningDojiStar.js";
import { eveningdojistar } from "../../indicators/candlestick/EveningDojiStar.js";
import { threewhitesoldiers } from "../../indicators/candlestick/ThreeWhiteSoldiers.js";
import { threeblackcrows } from "../../indicators/candlestick/ThreeBlackCrows.js";

import { getCandleSourceType } from "../../indicators/utils/index.js";
import _ from "lodash";
import dayjs from "dayjs";

export const PATTERN_TYPES = {
  DOJI: "DOJI",
  DRAGONFLY_DOJI: "DRAGONFLY_DOJI",
  GRAVESTONE_DOJI: "GRAVESTONE_DOJI",
  BULLISH_MARUBOZU: "BULLISH_MARUBOZU",
  BEARISH_MARUBOZU: "BEARISH_MARUBOZU",
  BULLISH_HAMMER_STICK_LONG: "BULLISH_HAMMER_STICK_LONG",
  BEARISH_HAMMER_STICK_LONG: "BEARISH_HAMMER_STICK_LONG",
  BULLISH_INVERTED_HAMMER_STICK_LONG: "BULLISH_INVERTED_HAMMER_STICK_LONG",
  BEARISH_INVERTED_HAMMER_STICK_LONG: "BEARISH_INVERTED_HAMMER_STICK_LONG",
  BULLISH_SPINNING_TOP: "BULLISH_SPINNING_TOP",
  BEARISH_SPINNING_TOP: "BEARISH_SPINNING_TOP",
  BULLISH_ENGULFING_LONG: "BULLISH_ENGULFING_LONG",
  BEARISH_ENGULFING_SHORT: "BEARISH_ENGULFING_SHORT",
  PIERCING_LINE_LONG: "PIERCING_LINE_LONG",
  DARK_CLOUD_COVER_SHORT: "DARK_CLOUD_COVER_SHORT",
  DOWNSIDE_TASUKI_GAP_SHORT: "DOWNSIDE_TASUKI_GAP_SHORT",
  ABANDONED_BABY_LONG: "ABANDONED_BABY_LONG",
  MORNING_STAR_LONG: "MORNING_STAR_LONG",
  MORNING_DOJI_STAR_LONG: "MORNING_DOJI_STAR_LONG",
  EVENING_STAR_SHORT: "EVENING_STAR_SHORT",
  EVENING_DOJI_STAR_SHORT: "EVENING_DOJI_STAR_SHORT",
  THREE_BLACK_CROWS_SHORT: "THREE_BLACK_CROWS_SHORT",
  THREE_WHITE_SOLDIERS_LONG: "THREE_WHITE_SOLDIERS_LONG",
  DAT_THREE_BLACK_CROWS_SHORT: "Dat-three-black-crows",
  DAT_THREE_WHITE_SOLDIERS_LONG: "Dat-three-white-soldies",
};
export function IsPatternTypeLong(patternType) {
  switch (patternType) {
    case PATTERN_TYPES.BULLISH_HAMMER_STICK_LONG:
    case PATTERN_TYPES.BEARISH_HAMMER_STICK_LONG:
    case PATTERN_TYPES.BULLISH_INVERTED_HAMMER_STICK_LONG:
    case PATTERN_TYPES.BEARISH_INVERTED_HAMMER_STICK_LONG:
    case PATTERN_TYPES.BULLISH_ENGULFING_LONG:
    case PATTERN_TYPES.MORNING_STAR_LONG:
    case PATTERN_TYPES.MORNING_DOJI_STAR_LONG:
    case PATTERN_TYPES.THREE_WHITE_SOLDIERS_LONG:
    case PATTERN_TYPES.DAT_THREE_WHITE_SOLDIERS_LONG:
      return true;
    default:
      return false;
  }
}
const pattern1Candle = [
  {
    detectFunc: doji,
    returnObj: { detected: true, type: PATTERN_TYPES.DOJI },
  },
  {
    detectFunc: dragonflydoji,
    returnObj: { detected: true, type: PATTERN_TYPES.DRAGONFLY_DOJI },
  },
  {
    detectFunc: gravestonedoji,
    returnObj: { detected: true, type: PATTERN_TYPES.GRAVESTONE_DOJI },
  },
  {
    detectFunc: bullishmarubozu,
    returnObj: { detected: true, type: PATTERN_TYPES.BULLISH_MARUBOZU },
  },
  {
    detectFunc: bearishmarubozu,
    returnObj: { detected: true, type: PATTERN_TYPES.BEARISH_MARUBOZU },
  },
  {
    detectFunc: bullishhammerstick,
    returnObj: {
      detected: true,
      type: PATTERN_TYPES.BULLISH_HAMMER_STICK_LONG,
    },
  },
  {
    detectFunc: bearishhammerstick,
    returnObj: {
      detected: true,
      type: PATTERN_TYPES.BEARISH_HAMMER_STICK_LONG,
    },
  },
  {
    detectFunc: bullishinvertedhammerstick,
    returnObj: {
      detected: true,
      type: PATTERN_TYPES.BULLISH_INVERTED_HAMMER_STICK_LONG,
    },
  },
  {
    detectFunc: bearishinvertedhammerstick,
    returnObj: {
      detected: true,
      type: PATTERN_TYPES.BEARISH_INVERTED_HAMMER_STICK_LONG,
    },
  },
  {
    detectFunc: bullishspinningtop,
    returnObj: { detected: true, type: PATTERN_TYPES.BULLISH_SPINNING_TOP },
  },
  {
    detectFunc: bearishspinningtop,
    returnObj: { detected: true, type: PATTERN_TYPES.BEARISH_SPINNING_TOP },
  },
];

const pattern2Candles = [
  {
    detectFunc: bullishengulfingpattern,
    returnObj: { detected: true, type: PATTERN_TYPES.BULLISH_ENGULFING_LONG },
  },
  {
    detectFunc: bearishengulfingpattern,
    returnObj: { detected: true, type: PATTERN_TYPES.BEARISH_ENGULFING_SHORT },
  },
  // {
  //   detectFunc: piercingline,
  //   returnObj: { detected: true, type: PATTERN_TYPES.PIERCING_LINE_LONG },
  // },
  // {
  //   detectFunc: darkcloudcover,
  //   returnObj: { detected: true, type: PATTERN_TYPES.DARK_CLOUD_COVER_SHORT },
  // },
];

const pattern3Candles = [
  // // {
  // //   detectFunc: downsidetasukigap,
  // //   returnObj: { detected: true, type: PATTERN_TYPES.DOWNSIDE_TASUKI_GAP_SHORT },
  // // },
  // // {
  // //   detectFunc: abandonedbaby,
  // //   returnObj: { detected: true, type: PATTERN_TYPES.ABANDONED_BABY_LONG },
  // // },
  // {
  //   detectFunc: morningstar,
  //   returnObj: { detected: true, type: PATTERN_TYPES.MORNING_STAR_LONG },
  // },
  // // {
  // //   detectFunc: morningdojistar,
  // //   returnObj: { detected: true, type: PATTERN_TYPES.MORNING_DOJI_STAR_LONG },
  // // },
  // {
  //   detectFunc: eveningstar,
  //   returnObj: { detected: true, type: PATTERN_TYPES.EVENING_STAR_SHORT },
  // },
  // // {
  // //   detectFunc: eveningdojistar,
  // //   returnObj: { detected: true, type: PATTERN_TYPES.EVENING_DOJI_STAR_SHORT },
  // // },
  {
    detectFunc: threeblackcrows,
    returnObj: { detected: true, type: PATTERN_TYPES.THREE_BLACK_CROWS_SHORT },
  },
  {
    detectFunc: threewhitesoldiers,
    returnObj: {
      detected: true,
      type: PATTERN_TYPES.THREE_WHITE_SOLDIERS_LONG,
    },
  },
];
const pattern5Candles = [
  // {
  //   detectFunc: hammerpattern,
  //   returnObj: { detected: true, type: PATTERN_TYPES.HAMMER_PATTERN_LONG },
  // },
  // {
  //   detectFunc: hammerpatternunconfirmed,
  //   returnObj: { detected: true, type: PATTERN_TYPES.HAMMER_PATTERN_UNCONFIRMED_LONG },
  // },
  // {
  // detectFunc: hammerpattern,
  // returnObj: { detected: true, type: PATTERN_TYPES.HAMMER_PATTERN_LONG },
  // },
  // {
  //   detectFunc: hammerpatternunconfirmed,
  //   returnObj: { detected: true, type: PATTERN_TYPES.HAMMER_PATTERN_UNCONFIRMED_LONG },
  // },
  // {
  //   detectFunc: hangingman,
  //   returnObj: { detected: true, type: PATTERN_TYPES.HANGING_MAN_SHORT },
  // },
  // {
  //   detectFunc: hangingmanunconfirmed,
  //   returnObj: { detected: true, type: PATTERN_TYPES.HANGING_MAN_UNCONFIRMED_SHORT },
  // },
  // {
  //   detectFunc: shootingstar,
  //   returnObj: { detected: true, type: PATTERN_TYPES.SHOOTING_STAR_SHORT },
  // },
  // {
  //   detectFunc: shootingstarunconfirmed,
  //   returnObj: { detected: true, type: PATTERN_TYPES.SHOOTING_STAR_UNCONFIRMED_SHORT },
  // },
  // {
  //   detectFunc: tweezertop,
  //   returnObj: { detected: true, type: PATTERN_TYPES.TWEEZER_TOP_SHORT },
  // },
  // {
  //   detectFunc: tweezerbottom,
  //   returnObj: { detected: true, type: PATTERN_TYPES.TWEEZER_BOTTOM_LONG },
  // },
];

//
export const detectCandlePatterns = (candles) => {
  const detectedPatterns = [];
  // return detectedPatterns;

  // // 2 CANDLES
  // const detect2CandlesPattern = _.takeRight(candles, 2);
  // let input = {
  //   open: getCandleSourceType(detect2CandlesPattern, "open"),
  //   high: getCandleSourceType(detect2CandlesPattern, "high"),
  //   close: getCandleSourceType(detect2CandlesPattern, "close"),
  //   low: getCandleSourceType(detect2CandlesPattern, "low"),
  // };
  // _.forEach(pattern2Candles, (obj) => {
  //   if (obj.detectFunc(input) === true) {
  //     detectedPatterns.push(obj.returnObj);
  //   }
  // });

  // 3 CANDLES
  const detect3CandlesPattern = _.takeRight(candles, 3);
  let input = {
    open: getCandleSourceType(detect3CandlesPattern, "open"),
    high: getCandleSourceType(detect3CandlesPattern, "high"),
    close: getCandleSourceType(detect3CandlesPattern, "close"),
    low: getCandleSourceType(detect3CandlesPattern, "low"),
  };
  _.forEach(pattern3Candles, (obj) => {
    if (obj.detectFunc(input) === true) {
      detectedPatterns.push(obj.returnObj);
    }
  });

  // // 5 CANDLES
  // const detect5CandlesPattern = _.takeRight(candles, 5);
  // input = {
  //   open: getCandleSourceType(detect5CandlesPattern, "open"),
  //   high: getCandleSourceType(detect5CandlesPattern, "high"),
  //   close: getCandleSourceType(detect5CandlesPattern, "close"),
  //   low: getCandleSourceType(detect5CandlesPattern, "low"),
  // };
  // _.forEach(pattern5Candles, (obj) => {
  //   if (obj.detectFunc(input) === true) {
  //     detectedPatterns.push(obj.returnObj);
  //   }
  // });

  //
  return detectedPatterns;
};

export const detectSingleCandle = (candles) => {
  const detectedPatterns = [];
  return detectedPatterns;

  const detectCandles = _.takeRight(candles, 1);
  const input = {
    open: getCandleSourceType(detectCandles, "open"),
    high: getCandleSourceType(detectCandles, "high"),
    close: getCandleSourceType(detectCandles, "close"),
    low: getCandleSourceType(detectCandles, "low"),
  };
  //
  _.forEach(pattern1Candle, (obj) => {
    if (obj.detectFunc(input) === true) {
      detectedPatterns.push(obj.returnObj);
    }
  });

  //
  return detectedPatterns;
};
//
const formCandleFromSmallerTimeframe = (candles) => {
  const len = candles.length;
  const returnCandle = {
    time: candles[0].time,
    open: Number(candles[0].open),
    high: Math.max(...candles.map((candle) => candle.high)),
    low: Math.min(...candles.map((candle) => candle.low)),
    close: Number(candles[len - 1].close),
    volume: candles.reduce((total, candle) => total + Number(candle.volume), 0),
  };
  return returnCandle;
};

const getLastCloseCandle = (candles) => {
  let lastCandle = _.last(detectCandles);
  if (lastCandle === undefined) {
    return undefined;
  }
  if (lastCandle.closeTime > dayjs()) {
    lastCandle = _.nth(candles, -2);
  }
  return lastCandle;
};
const extractDetectCandles = (candles, length) => {
  const lastCandle = _.last(candles);
  if (lastCandle === undefined) {
    return undefined;
  }
  let start = candles.length - length;
  if (lastCandle.closeTime > dayjs()) {
    start -= 1;
  }
  return _.slice(candles, start, start + length);
};

export const detectCustomPatterns = (symbol, timeframe, candles) => {
  const detectedPatterns = [];
  // custom three white soldiers / three black crows
  if (timeframe === "1m") {
    // just detect at the 3rd minute of the 5m candles
    let detectCandles = extractDetectCandles(candles, 13);
    const lastCandle = _.last(detectCandles);
    const timeMinute = Math.floor(lastCandle.closeTime / 60000);
    // // test
    // if (timeMinute % 5 === 2) {
    //   detectedPatterns.push({
    //     detected: true,
    //     type: PATTERN_TYPES.DAT_THREE_BLACK_CROWS_SHORT,
    //   });
    // }
    // return detectedPatterns;
    //
    if (timeMinute % 5 === 2) {
      // console.log(
      //   "detectCustomPatterns",
      //   dayjs().format("DD/MM HH:mm:ss:SSS"),
      //   symbol,
      //   "lastCandle.closeTime",
      //   dayjs(lastCandle.closeTime).format("DD/MM HH:mm:ss:SSS")
      // );
      const first5mCandle = formCandleFromSmallerTimeframe(
        _.slice(detectCandles, 0, 5)
      );
      const second5mCandle = formCandleFromSmallerTimeframe(
        _.slice(detectCandles, 5, 10)
      );
      const third5mCandle = formCandleFromSmallerTimeframe(
        _.slice(detectCandles, 10, 13)
      );
      //
      const detect5mCandles = [first5mCandle, second5mCandle, third5mCandle];
      let input = {
        open: getCandleSourceType(detect5mCandles, "open"),
        high: getCandleSourceType(detect5mCandles, "high"),
        close: getCandleSourceType(detect5mCandles, "close"),
        low: getCandleSourceType(detect5mCandles, "low"),
      };
      // console.log("detect5mCandles", detect5mCandles, "input", input);
      // detect three white soldiers
      if (threewhitesoldiers(input)) {
        console.log(
          symbol,
          "dat-three-white-soldiers detected",
          dayjs().format("DD/MM HH:mm:ss:SSS")
        );
        // console.log(
        //   "detectCandles",
        //   _.map(detectCandles, (candle) => {
        //     return {
        //       open: candle.open,
        //       close: candle.close,
        //       high: candle.high,
        //       low: candle.low,
        //       volume: candle.volume,
        //       openTime: dayjs(candle.time).format("DD/MM HH:mm:ss:SSS"),
        //     };
        //   })
        // );
        // console.log("first5mCandle", first5mCandle);
        // console.log("second5mCandle", second5mCandle);
        // console.log("third5mCandle", third5mCandle);
        // more condition as body of candles increases
        if (
          Math.abs(first5mCandle.close - first5mCandle.open) <
            Math.abs(second5mCandle.close - second5mCandle.open) &&
          Math.abs(second5mCandle.close - second5mCandle.open) <
            Math.abs(third5mCandle.close - third5mCandle.open)
        ) {
          console.log("dat-three-white-soldiers body increases detected");
          detectedPatterns.push({
            detected: true,
            type: PATTERN_TYPES.DAT_THREE_WHITE_SOLDIERS_LONG,
          });
        }
      }
      // detect three black crows
      if (threeblackcrows(input)) {
        console.log(
          symbol,
          "dat-three-black-crows detected",
          dayjs().format("DD/MM HH:mm:ss:SSS")
        );
        // console.log(
        //   "detectCandles",
        //   _.map(detectCandles, (candle) => {
        //     return {
        //       open: candle.open,
        //       close: candle.close,
        //       high: candle.high,
        //       low: candle.low,
        //       volume: candle.volume,
        //     };
        //   })
        // );
        // console.log("first5mCandle", first5mCandle);
        // console.log("second5mCandle", second5mCandle);
        // console.log("third5mCandle", third5mCandle);
        // more condition as body of candles increases
        if (
          Math.abs(first5mCandle.close - first5mCandle.open) <
            Math.abs(second5mCandle.close - second5mCandle.open) &&
          Math.abs(second5mCandle.close - second5mCandle.open) <
            Math.abs(third5mCandle.close - third5mCandle.open)
        ) {
          console.log("dat-three-black-crows body increases detected");
          detectedPatterns.push({
            detected: true,
            type: PATTERN_TYPES.DAT_THREE_BLACK_CROWS_SHORT,
          });
        }
      }
    }
  }
  return detectedPatterns;
};
