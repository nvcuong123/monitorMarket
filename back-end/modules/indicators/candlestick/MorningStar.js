import CandlestickFinder from "./CandlestickFinder.js";
import { doji } from "./Doji.js";
import { dragonflydoji } from "./DragonFlyDoji.js";
import { gravestonedoji } from "./GraveStoneDoji.js";
import { bearishspinningtop } from "./BearishSpinningTop.js";
import { bullishspinningtop } from "./BullishSpinningTop.js";

export default class MorningStar extends CandlestickFinder {
  constructor() {
    super();
    this.name = "MorningStar";
    this.requiredCount = 3;
  }
  logic(data) {
    let firstdaysOpen = data.open[0];
    let firstdaysClose = data.close[0];
    let firstdaysHigh = data.high[0];
    let firstdaysLow = data.low[0];
    let seconddaysOpen = data.open[1];
    let seconddaysClose = data.close[1];
    let seconddaysHigh = data.high[1];
    let seconddaysLow = data.low[1];
    let thirddaysOpen = data.open[2];
    let thirddaysClose = data.close[2];
    let thirddaysHigh = data.high[2];
    let thirddaysLow = data.low[2];
    let firstdaysMidpoint = (firstdaysOpen + firstdaysClose) / 2;
    let isFirstBearish = firstdaysClose < firstdaysOpen;
    const secondCandleData = {
      open: [seconddaysOpen],
      close: [seconddaysClose],
      high: [seconddaysHigh],
      low: [seconddaysLow],
    };
    const isSecondDoji =
      doji(secondCandleData) ||
      dragonflydoji(secondCandleData) ||
      gravestonedoji(secondCandleData);
    const isSecondSpinning =
      bearishspinningtop(secondCandleData) ||
      bullishspinningtop(secondCandleData);
    let isThirdBullish = thirddaysOpen < thirddaysClose;
    let doesCloseAboveFirstMidpoint = thirddaysClose > firstdaysMidpoint;

    return (
      isFirstBearish &&
      (isSecondDoji || isSecondSpinning) &&
      isThirdBullish &&
      doesCloseAboveFirstMidpoint
    );
  }
}
export function morningstar(data) {
  return new MorningStar().hasPattern(data);
}
