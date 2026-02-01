import CandlestickFinder from "./CandlestickFinder.js";
export default class ThreeBlackCrows extends CandlestickFinder {
  constructor() {
    super();
    this.name = "ThreeBlackCrows";
    this.requiredCount = 3;
  }
  logic(data) {
    let firstdaysOpen = Number(data.open[0]);
    let firstdaysClose = Number(data.close[0]);
    let firstdaysHigh = Number(data.high[0]);
    let firstdaysLow = Number(data.low[0]);
    let seconddaysOpen = Number(data.open[1]);
    let seconddaysClose = Number(data.close[1]);
    let seconddaysHigh = Number(data.high[1]);
    let seconddaysLow = Number(data.low[1]);
    let thirddaysOpen = Number(data.open[2]);
    let thirddaysClose = Number(data.close[2]);
    let thirddaysHigh = Number(data.high[2]);
    let thirddaysLow = Number(data.low[2]);
    let isDownTrend =
      firstdaysLow > seconddaysLow && seconddaysLow > thirddaysLow;
    let isAllBearish =
      firstdaysOpen > firstdaysClose &&
      seconddaysOpen > seconddaysClose &&
      thirddaysOpen > thirddaysClose;
    let doesOpenWithinPreviousBody =
      firstdaysOpen > seconddaysOpen &&
      seconddaysOpen > firstdaysClose &&
      seconddaysOpen > thirddaysOpen &&
      thirddaysOpen > seconddaysClose;
    return isDownTrend && isAllBearish && doesOpenWithinPreviousBody;
  }
}
export function threeblackcrows(data) {
  return new ThreeBlackCrows().hasPattern(data);
}
