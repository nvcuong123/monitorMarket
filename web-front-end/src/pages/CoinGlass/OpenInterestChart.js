import React, { useEffect } from "react";
import { useState } from "react";
import {
  coinglassExchangeList,
  fetchOpenInterestHistoryUsd,
  timeFrameDisplayDate,
} from "../../Model/fetch-coinglass";
import { Form, Dropdown, DropdownButton } from "react-bootstrap";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
const MAX_NUMBER_POINT_OI = 30;
const OpenInterestHistoryChart = (props) => {
  var displayDate = false;
  if (timeFrameDisplayDate.includes(props.timeFrame)) {
    displayDate = true;
  }

  const dataMap = props.openInterestData.dataMap;
  var dateList = props.openInterestData.dateList.slice();
  dateList = dateList.reverse().slice(0, MAX_NUMBER_POINT_OI).reverse();
  var priceList = props.openInterestData.priceList.slice();
  priceList = priceList.reverse().slice(0, MAX_NUMBER_POINT_OI).reverse();
  const exchange = props.exchange;
  const symbol = props.symbol;

  let options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
        text: "",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };
  let oiDataList = [];
  for (var key in dataMap) {
    if (key === exchange) {
      oiDataList = dataMap[key].slice();
      oiDataList = oiDataList.reverse().slice(0, MAX_NUMBER_POINT_OI).reverse();
    }
  }
  let chartTimeList = [];
  dateList.map((item) => {
    let date = new Date(item);
    if (displayDate) {
      date = `${String(date.getDate()).padStart(2, "0")}, ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    } else {
      date = `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    }
    return chartTimeList.push(date);
  });

  let data = {
    labels: chartTimeList,
    datasets: [
      {
        label: `${exchange} OI`,
        data: oiDataList,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "y",
      },
      {
        label: `${symbol} Price`,
        data: priceList,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
};

const ExchangeSelect = (props) => {
  function handleExchangeSelect(selection) {
    props.exchangeSelectHandler(selection);
  }
  return (
    <>
      <DropdownButton
        id="dropdown-exchange"
        title={props.curExchange}
        size="sm"
        variant="secondary"
        menuVariant="dark"
        onSelect={handleExchangeSelect}
      >
        {props.exchangeList &&
          props.exchangeList.map((item, index) => {
            return (
              <Dropdown.Item eventKey={item} key={index}>
                {item}
              </Dropdown.Item>
            );
          })}
      </DropdownButton>
    </>
  );
};

const OpenInterestChart = (props) => {
  const [openInterestData, $openInterestData] = useState(null);
  const [exchange, $exchange] = useState("exchange");
  const [exchangeList, $exchangeList] = useState(["Binance"]);
  const timeLive = props.timeLive;
  const symbol = props.symbol;
  const timeFrame = props.timeFrame;

  async function fetchingOIHistoryUsd(symbol, timeFrame) {
    const response = await fetchOpenInterestHistoryUsd(symbol, timeFrame);
    return response.data;
  }

  function exchangeSelectHandler(selection) {
    $exchange(selection);
  }

  useEffect(() => {
    fetchingOIHistoryUsd(symbol, timeFrame).then((response) => {
      // console.log("fetchingOIHistoryUsd", response);
      $openInterestData(response);
      let tmpExchangeList = [];
      const dataMap = response.dataMap;
      coinglassExchangeList.map((item) => {
        if (dataMap.hasOwnProperty(item)) {
          return tmpExchangeList.push(item);
        } else {
          return null;
        }
      });

      const dateList = response.dateList;
      dateList.map((item) => {
        const date = new Date(item).toLocaleString();
        return date;
      });
      $exchangeList(tmpExchangeList);
      $exchange(tmpExchangeList[0]);
    });
    const id = setInterval(() => {
      fetchingOIHistoryUsd(symbol, timeFrame).then((response) =>
        $openInterestData(response)
      );
    }, timeLive);

    return () => clearInterval(id);
  }, [timeLive, symbol, timeFrame]);

  return (
    <div className="indicator-container">
      <div className="indicator-label">
        <div>Open Interest</div>
        <ExchangeSelect
          curExchange={exchange}
          exchangeList={exchangeList}
          exchangeSelectHandler={exchangeSelectHandler}
        />
      </div>
      <div className="indicator-body">
        {openInterestData && openInterestData.dataMap && (
          <OpenInterestHistoryChart
            openInterestData={openInterestData}
            exchange={exchange}
            symbol={symbol}
            timeFrame={timeFrame}
          />
        )}
      </div>
    </div>
  );
};

export default OpenInterestChart;
