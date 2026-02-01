import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import {
  fetchFundingRateHistoryUsd,
  timeFrameDisplayDate,
} from "../../Model/fetch-coinglass";
/** periodically fetch funding rate and display
 *
 */
const header = [
  "Time",
  "Binance",
  "Bybit",
  "OKX",
  "Huobi",
  "Gate",
  "Bitget",
  "CoinEx",
];
const FundingRateTable = (props) => {
  const fundingRateData = props.fundingRateData;
  var displayDate = false;
  if (timeFrameDisplayDate.includes(props.timeFrame)) {
    displayDate = true;
  }

  return (
    <div className="table-responsive">
      <Table responsive variant="light" size="sm" striped>
        <thead className="table-header">
          <tr>
            {header.map((item, index) => (
              <th key={index}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fundingRateData.map((element, index) => {
            let date = new Date(element.date);
            if (displayDate) {
              date = `${String(date.getDate()).padStart(2, "0")}, ${String(
                date.getHours()
              ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
                2,
                "0"
              )}`;
            } else {
              date = `${String(date.getHours()).padStart(2, "0")}:${String(
                date.getMinutes()
              ).padStart(2, "0")}`;
            }
            return (
              <tr key={index}>
                <td>{date}</td>
                <td
                  className={
                    element.binance > 0.01
                      ? "text-danger"
                      : element.binance < 0.01
                      ? "text-primary"
                      : ""
                  }
                >
                  {element.binance.toFixed(4)}%
                </td>
                <td
                  className={
                    element.bybit > 0.01
                      ? "text-danger"
                      : element.bybit < 0.01
                      ? "text-primary"
                      : ""
                  }
                >
                  {element.bybit.toFixed(4)}%
                </td>
                <td
                  className={
                    element.okx > 0.01
                      ? "text-danger"
                      : element.okx < 0.01
                      ? "text-primary"
                      : ""
                  }
                >
                  {element.okx.toFixed(4)}%
                </td>
                <td
                  className={
                    element.huobi > 0.01
                      ? "text-danger"
                      : element.huobi < 0.01
                      ? "text-primary"
                      : ""
                  }
                >
                  {element.huobi.toFixed(4)}%
                </td>
                <td
                  className={
                    element.gate > 0.01
                      ? "text-danger"
                      : element.gate < 0.01
                      ? "text-primary"
                      : ""
                  }
                >
                  {element.gate.toFixed(4)}%
                </td>
                {element.bitget ? (
                  <td
                    className={
                      element.bitget > 0.01
                        ? "text-danger"
                        : element.bitget < 0.01
                        ? "text-primary"
                        : ""
                    }
                  >
                    {element.bitget.toFixed(4)}%
                  </td>
                ) : (
                  <td></td>
                )}
                <td
                  className={
                    element.coinex > 0.01
                      ? "text-danger"
                      : element.coinex < 0.01
                      ? "text-primary"
                      : ""
                  }
                >
                  {element.coinex.toFixed(4)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const FundingRateChart = (props) => {
  const [fundingRate, $fundingRate] = useState(null);
  const [intervalId, $intervalId] = useState(0);
  const timeLive = props.timeLive;
  const symbol = props.symbol;
  const timeFrame = props.timeFrame;

  async function fetchingFundingRate(symbol, timeFrame) {
    var curFundRateHistory = [];

    var response = await fetchFundingRateHistoryUsd(symbol, timeFrame);
    const data = response.data;
    const dataMap = data.frDataMap;
    var iCount = 0;
    if (data.dateList.length > 0) {
      for (
        let index = data.dateList.length - 1;
        index < data.dateList.length;
        index--
      ) {
        const date = data.dateList[index];
        const binance = dataMap.Binance[index];
        const bitget = dataMap.Bitget[index];
        const bybit = dataMap.Bybit[index];
        const coinex = dataMap.CoinEx[index];
        const gate = dataMap.Gate[index];
        const huobi = dataMap.Huobi[index];
        const okx = dataMap.OKX ? dataMap.OKX[index] : 0;
        const dataRow = {
          date,
          binance,
          bitget,
          bybit,
          coinex,
          gate,
          huobi,
          okx,
        };
        curFundRateHistory[iCount] = dataRow;
        iCount++;
        if (iCount >= 20) {
          break;
        }
      }
    }

    return curFundRateHistory;
  }

  useEffect(() => {
    fetchingFundingRate(symbol, timeFrame).then((response) =>
      $fundingRate(response)
    );
    const id = setInterval(() => {
      fetchingFundingRate(symbol, timeFrame).then((response) =>
        $fundingRate(response)
      );
    }, timeLive);

    return () => clearInterval(id);
  }, [timeLive, symbol, timeFrame]);

  return (
    <div className="indicator-container">
      <div className="indicator-label">Funding Rate</div>
      <div className="indicator-body">
        {fundingRate !== null ? (
          <FundingRateTable
            fundingRateData={fundingRate}
            timeFrame={timeFrame}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default FundingRateChart;
