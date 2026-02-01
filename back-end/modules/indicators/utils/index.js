import _ from "lodash";

/**
 * Get the data from candles
 * @param candles
 * @param sourceType
 */
export function getCandleSourceType(candles, sourceType) {
  switch (sourceType) {
    case "open":
      return candles.map((c) => Number(c.open));
    case "high":
      return candles.map((c) => Number(c.high));
    case "low":
      return candles.map((c) => Number(c.low));
    case "close":
      return candles.map((c) => Number(c.close));
    case "hl2":
      return candles.map((c) => Number((c.high + c.low) / 2));
    case "hlc3":
      return candles.map((c) => Number((c.high + c.low + c.close) / 3));
    case "hlcc4":
      return candles.map((c) => Number((c.high + c.low + c.close * 2) / 4));
    case "volume":
      return candles.map((c) => Number(c.volume));
    default:
      return candles.map((c) => Number(c.close));
  }
}

export function getCandleMinMax(candles, minMaxType) {
  if (minMaxType === "min") {
    return _.min(_.map(candles, (candle) => candle.low));
  } else if (minMaxType === "max") {
    return _.max(_.map(candles, (candle) => candle.high));
  }
}
