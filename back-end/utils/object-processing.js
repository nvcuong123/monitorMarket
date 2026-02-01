import dayjs from "dayjs";
import _ from "lodash";

export function changeObjectKey(o, old_key, new_key) {
  if (old_key !== new_key && o[old_key]) {
    Object.defineProperty(
      o,
      new_key,
      Object.getOwnPropertyDescriptor(o, old_key)
    );
    delete o[old_key];
  }
}

export function exchangeTimeframeToDayJsTimeUnit(timeframe) {
  const timeframeLower = _.toLower(timeframe);
  if (timeframeLower.includes("m")) {
    return "minute";
  } else if (timeframeLower.includes("h")) {
    return "hour";
  } else if (timeframeLower.includes("d")) {
    return "day";
  }
}

const MINUTE_1 = 60 * 1000;
export function exchangeTimeframeToTimeValue(timeframe) {
  const timeframeLower = _.toLower(timeframe);
  let timeValue = 0;
  switch (timeframeLower) {
    case "5m":
      timeValue = 5 * MINUTE_1;
      break;
    case "15m":
      timeValue = 15 * MINUTE_1;
      break;
    case "30m":
      timeValue = 30 * MINUTE_1;
      break;
    case "1h":
      timeValue = 60 * MINUTE_1;
      break;
    case "1d":
      timeValue = 24 * 60 * MINUTE_1;
      break;
  }
  return timeValue;
}
