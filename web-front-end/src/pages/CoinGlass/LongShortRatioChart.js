import React from "react";
import { useState, useEffect } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import VerticalBarChart from "../../component/VerticalBarChart";
import {
  fetchExchangeShortRatio,
  fetchLongShortRatioHistory,
  timeFrameDisplayDate,
} from "../../Model/fetch-coinglass";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from "chart.js";
import { Chart, Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

const LongShortTypeSelect = (props) => {
  function handleTypeSelect(selection) {
    props.typeListSelectHandler(selection);
  }
  return (
    <>
      <DropdownButton
        id="dropdown-exchange"
        title={props.curType}
        size="sm"
        variant="secondary"
        menuVariant="dark"
        onSelect={handleTypeSelect}
      >
        {props.typeList &&
          props.typeList.map((item, index) => {
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

const MAX_LONG_SHORT_POINT = 30;
const LongShortLiveChart = (props) => {
  const dataList = props.exchangeLongShortRatio.list;
  let exchangeList = [];
  let shortsRateList = [];
  let longRateList = [];
  exchangeList.push("All");
  longRateList.push(props.exchangeLongShortRatio.longRate);
  shortsRateList.push(props.exchangeLongShortRatio.shortRate);
  dataList.map((item, index) => {
    exchangeList.push(item.exchangeName);
    longRateList.push(item.longRate);
    shortsRateList.push(item.shortRate);
    return index;
  });

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
        stacked: true,
        beginAtZero: true,
      },
    },
  };
  let data = {
    labels: exchangeList,
    datasets: [
      {
        type: "bar",
        label: `long rate`,
        data: longRateList,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgb(75, 192, 192, 0.7)",
        yAxisID: "y",
        stack: "Stack 0",
        datalabels: {
          color: "#36A2EB",
        },
      },
      {
        type: "bar",
        label: `short rate`,
        data: shortsRateList,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgb(255, 99, 132, 0.7)",
        yAxisID: "y",
        stack: "Stack 0",
        datalabels: {
          color: "#36A2EB",
        },
      },
    ],
  };

  return (
    <div>
      <Chart options={options} data={data} plugins={[ChartDataLabels]} />
    </div>
  );
};

const LongShortHistoryChart = (props) => {
  var displayDate = false;
  if (timeFrameDisplayDate.includes(props.timeFrame)) {
    displayDate = true;
  }
  let dateList = [];
  // let priceList = [];
  let shortsRateList = [];
  let longRateList = [];
  let longShortRateList = [];

  dateList = props.longShortHistoryData.dateList.slice();
  dateList = dateList.reverse().slice(0, MAX_LONG_SHORT_POINT).reverse();
  // priceList = props.longShortHistoryData.priceList.slice();
  // priceList = priceList.reverse().slice(0, MAX_LONG_SHORT_POINT).reverse();
  shortsRateList = props.longShortHistoryData.shortsRateList.slice();
  shortsRateList = shortsRateList
    .reverse()
    .slice(0, MAX_LONG_SHORT_POINT)
    .reverse();
  longRateList = props.longShortHistoryData.longRateList.slice();
  longRateList = longRateList
    .reverse()
    .slice(0, MAX_LONG_SHORT_POINT)
    .reverse();
  longShortRateList = props.longShortHistoryData.longShortRateList.slice();
  longShortRateList = longShortRateList
    .reverse()
    .slice(0, MAX_LONG_SHORT_POINT)
    .reverse();

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
        stacked: true,
        beginAtZero: true,
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        // beginAtZero: true,
      },
    },
  };
  let data = {
    labels: chartTimeList,
    datasets: [
      {
        label: `long/short ratio`,
        data: longShortRateList,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgb(53, 162, 235)",
        yAxisID: "y1",
      },
      {
        type: "bar",
        label: `long rate`,
        data: longRateList,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgb(75, 192, 192, 0.7)",
        yAxisID: "y",
        stack: "Stack 0",
      },
      {
        type: "bar",
        label: `short rate`,
        data: shortsRateList,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgb(255, 99, 132, 0.7)",
        yAxisID: "y",
        stack: "Stack 0",
      },
    ],
  };

  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
};

const typeList = ["History", "Live"];
const LongShortRatioChart = (props) => {
  const [longShortHistoryData, $longShortHistoryData] = useState();
  const [exchangeLongShortRatio, $exchangeLongShortRatio] = useState();

  const [type, $type] = useState(typeList[0]);
  const timeLive = props.timeLive;
  const symbol = props.symbol;
  const timeFrame = props.timeFrame;
  function typeListSelectHandler(type) {
    $type(type);
  }

  useEffect(() => {
    var id = 0;
    if (type === typeList[0]) {
      fetchLongShortRatioHistory(symbol, timeFrame).then((response) => {
        $longShortHistoryData(response.data);
      });
      id = setInterval(() => {
        fetchLongShortRatioHistory(symbol, timeFrame).then((response) => {
          $longShortHistoryData(response.data);
        });
      }, timeLive);
    } else if (type === typeList[1]) {
      fetchExchangeShortRatio(symbol, timeFrame).then((response) => {
        $exchangeLongShortRatio(response.data[0]);
      });
      id = setInterval(() => {
        fetchExchangeShortRatio(symbol, timeFrame).then((response) => {
          $exchangeLongShortRatio(response.data[0]);
        });
      }, timeLive);
    }

    return () => clearInterval(id);
  }, [timeLive, symbol, timeFrame, type]);

  return (
    <div className="indicator-container">
      <div className="indicator-label">
        <div>Long/Short Ratio</div>
        <LongShortTypeSelect
          curType={type}
          typeList={typeList}
          typeListSelectHandler={typeListSelectHandler}
        />
      </div>
      <div className="indicator-body">
        {type === typeList[0] &&
          longShortHistoryData &&
          longShortHistoryData.dateList && (
            <LongShortHistoryChart
              longShortHistoryData={longShortHistoryData}
              symbol={symbol}
              timeFrame={timeFrame}
            />
          )}
        {type === typeList[1] &&
          exchangeLongShortRatio &&
          exchangeLongShortRatio.list && (
            <LongShortLiveChart
              exchangeLongShortRatio={exchangeLongShortRatio}
              symbol={symbol}
              timeFrame={timeFrame}
            />
          )}
      </div>
    </div>
  );
};

export default LongShortRatioChart;
