import React, { useState, useRef } from "react";
import { CSVLink } from "react-csv";
import tr7TradingBot from "../../../Model/tr7-trading-bot.js";
import { CButton } from "@coreui/react";
import _ from "lodash";
import dayjs from "dayjs";
import {
  PercentChangeFormatter,
  PercentFormatter,
  NumberFormatter,
  CurrencyFormatterWithPrecision,
} from "../../../Utils/index.js";
import { useFuturesOrderInfo } from "../../../Provider/FuturesOrderInfo.js";
import { isProfitSignal } from "./BinanceSignals.js";

const headers = [
  { label: "STT", key: "index" },
  { label: "Time", key: "time" },
  { label: "Symbol", key: "symbol" },
  { label: "Timeframe", key: "timeframe" },
  { label: "Last Candle", key: "timestamp" },
  { label: "Type", key: "type" },
  { label: "RSI", key: "rsi" },
  { label: "Price", key: "priceChange" },
  // { label: "OI", key: "oiChange" },
  // { label: "CG OI All", key: "cgOiAll" },
  { label: "Aggregated OI", key: "aggOI" },
  // { label: "CG OI All/Binance", key: "cgOiAllBinance" },
  // { label: "CG Long/Short All", key: "cgLongShortAll" },
  { label: "Aggregated L/S (accounts)", key: "aggLongShort" },
  { label: "Candles result", key: "3CandlesResult" },
  { label: "Profit > 0.1%", key: "profit0point1" },
  { label: "Profit > 0.2%", key: "profit0point2" },
  { label: "Profit > 0.3%", key: "profit0point3" },
  { label: "Profit > 0.4%", key: "profit0point4" },
  { label: "Profit > 0.5%", key: "profit0point5" },
  { label: "Profit > 0.75%", key: "profit0point75" },
  { label: "Profit > 1.0%", key: "profit1point0" },
];
function formatSignalsDataToSave(signalsData, pricePrecisions) {
  return _.map(signalsData, (signal, index) => {
    let aggregatedOI = "";
    if (signal.exchanges && !_.isEmpty(signal.exchanges.openInterest)) {
      const percentChange = signal.exchanges.openInterest.all.percentChange;
      if (percentChange !== "NA") {
        aggregatedOI = PercentChangeFormatter(percentChange);
      } else {
        aggregatedOI = percentChange;
      }
    }
    let aggregatedLongShortRatio = "";
    if (signal.exchanges && signal.exchanges.globalLongShortAccountRatio) {
      aggregatedLongShortRatio = `${NumberFormatter(
        signal.exchanges.globalLongShortAccountRatio.all.longShortRatio
      )} (${PercentFormatter(
        signal.exchanges.globalLongShortAccountRatio.all.longAccount * 100
      )} /
                            ${PercentFormatter(
                              signal.exchanges.globalLongShortAccountRatio.all
                                .shortAccount * 100
                            )})`;
    }
    return {
      index: index + 1,
      time: dayjs(signal.time).format("DD/MM HH:mm:ss"),
      symbol: signal.symbol,
      timeframe: signal.timeframe,
      timestamp: dayjs(signal.timestamp).format("DD/MM HH:mm:ss"),
      type: _.toLower(signal.type),
      rsi: signal.rsi,
      priceChange: PercentChangeFormatter(signal.priceChange),
      // oiChange: PercentChangeFormatter(signal.oiChange),
      // cgOiAll:
      //   signal.cgOi &&
      //   `${PercentChangeFormatter(signal.cgOi.allExchange.h1OIChangePercent)}`,
      aggOI: aggregatedOI,
      // cgOiAllBinance:
      //   signal.cgOi &&
      //   `${PercentChangeFormatter(signal.cgOi.allExchange.h1OIChangePercent)} /
      //                     ${PercentChangeFormatter(
      //                       signal.cgOi.binance.h1OIChangePercent
      //                     )}`,
      // cgLongShortAll:
      //   signal.cgLongShort &&
      //   `${NumberFormatter(
      //     signal.cgLongShort.allExchange.longRate /
      //       signal.cgLongShort.allExchange.shortRate
      //   )} (${PercentChangeFormatter(signal.cgLongShort.allExchange.longRate)} /
      //                       ${PercentChangeFormatter(
      //                         signal.cgLongShort.allExchange.shortRate
      //                       )})`,
      aggLongShort: aggregatedLongShortRatio,
      "3CandlesResult":
        signal.result &&
        `${CurrencyFormatterWithPrecision(
          signal.result.entryPrice,
          pricePrecisions[signal.symbol]
        )}\n[${CurrencyFormatterWithPrecision(
          signal.result.lowestPrice,
          pricePrecisions[signal.symbol]
        )}(${PercentChangeFormatter(
          ((signal.result.lowestPrice - signal.result.entryPrice) * 100) /
            signal.result.entryPrice,
          3
        )}) - ${CurrencyFormatterWithPrecision(
          signal.result.highestPrice,
          pricePrecisions[signal.symbol]
        )}(${PercentChangeFormatter(
          ((signal.result.highestPrice - signal.result.entryPrice) * 100) /
            signal.result.entryPrice,
          3
        )})]`,
      profit0point1: isProfitSignal(signal, 0.1),
      profit0point2: isProfitSignal(signal, 0.2),
      profit0point3: isProfitSignal(signal, 0.3),
      profit0point4: isProfitSignal(signal, 0.4),
      profit0point5: isProfitSignal(signal, 0.5),
      profit0point75: isProfitSignal(signal, 0.75),
      profit1point0: isProfitSignal(signal, 1.0),
    };
  });
}

function SignalsDownload() {
  const { pricePrecisions } = useFuturesOrderInfo();
  const [data, setData] = useState([]);
  const csvLink = useRef(); // setup the ref that we'll use for the hidden CsvLink click once we've updated the data

  const fetchDataAndDownload = async () => {
    const response = await tr7TradingBot.fetchAllSignals();
    // console.log(response);
    if (response !== undefined) {
      const convertedSignal = formatSignalsDataToSave(
        response.data,
        pricePrecisions
      );
      setData(convertedSignal);
      // click the CSVLink component to trigger the CSV download
      setTimeout(() => {
        csvLink.current.link.click();
      }, 0);
    }
  };

  return (
    <div>
      <CButton size="sm" onClick={fetchDataAndDownload}>
        Save Signals
      </CButton>
      <CSVLink
        data={data}
        headers={headers}
        filename={`signals-${dayjs().format("DDMMHHmmss")}.csv`}
        ref={csvLink}
        style={{ display: "none" }}
      >
        Download Signals
      </CSVLink>
    </div>
  );
}

export default SignalsDownload;
