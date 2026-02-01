import { useEffect, useState } from "react";
import React from "react";
import useWebSocket from "react-use-websocket";
import Change24H from "../../../components/Change24H";
import TradingVol24H from "../../../components/TradingVol24H";
import { Dropdown, DropdownButton } from "react-bootstrap";
import {
  fundingRateColors,
  percentRangeColors,
} from "../../../components/ColorRange";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const productionUrl = window.location.origin.replace("https", "wss");
const socketUrl =
  (process.env.NODE_ENV === "production"
    ? productionUrl
    : "ws://127.0.0.1:3000") + "/heatmap";
console.log("socketUrl", socketUrl);

const IndicatorSelect = (props) => {
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
const TopRangeSelect = (props) => {
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

const indicatorList = ["Performance 24h, %", "Funding Rates"];
const topRangeList = {
  "Top 10 coins": 10,
  "Top 20 coins": 20,
  "Top 30 coins": 30,
  "Top 50 coins": 50,
};

const ColorLegend = (props) => {
  const colors =
    props.indicator === "Funding Rates"
      ? fundingRateColors
      : percentRangeColors;

  return (
    <div className="mx-2 d-flex flex-row align-items-center">
      {colors.map((rangeColor, idx) => {
        let minstr = rangeColor.min.toString();
        let maxstr = rangeColor.max.toString();
        if (props.indicator !== "Funding Rates") {
          if (rangeColor.min !== -Infinity) minstr += "%";
          if (rangeColor.max !== Infinity) maxstr += "%";
        }

        return (
          <OverlayTrigger
            key={idx}
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip id={idx}>
                {rangeColor.min < 0
                  ? `${minstr} > ${maxstr}`
                  : rangeColor.min === 0 && rangeColor.max === 0
                  ? `${minstr}`
                  : `${minstr} < ${maxstr}`}
              </Tooltip>
            }
          >
            <div
              className="color-pattern mx-1"
              style={{ backgroundColor: rangeColor.color }}
            ></div>
          </OverlayTrigger>
        );
      })}
    </div>
  );
};

const BinanceHeatmap = () => {
  const [indicator, $indicator] = useState(indicatorList[0]);
  const [topRange, $topRange] = useState(Object.keys(topRangeList)[1]);
  function indicatorListSelectHandler(indicator) {
    $indicator(indicator);
  }
  function topRangeListSelectHandler(topRange) {
    $topRange(topRange);
  }
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,
    retryOnError: true,
    reconnectAttempts: 1000,
    reconnectInterval: 3000,
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: () => true,
    onOpen: (event) => console.log("opened ws", event),
    onClose: (closeEvent) => console.log("ws closed", closeEvent),
    onError: (errEvent) => console.log("error", errEvent),
    onReconnectStop: (numAttemp) => console.log("reconnect stopped", numAttemp),
  });
  const [binanceHeatmap, $binanceHeatmap] = useState({});
  useEffect(() => {
    if (lastMessage !== null) {
      const json = JSON.parse(lastMessage.data);
      $binanceHeatmap(json);
    }
  }, [lastMessage]);

  return (
    <div>
      <div className="heatmap-filter d-flex flex-row justify-content-between">
        <div className="d-flex flex-row flex-wrap justify-content-start my-2">
          <div className="mx-2 mb-1">
            <TopRangeSelect
              curType={topRange}
              typeList={Object.keys(topRangeList)}
              typeListSelectHandler={topRangeListSelectHandler}
            />
          </div>
          <div className="mx-2 d-flex flex-row justify-content-start">
            <IndicatorSelect
              curType={indicator}
              typeList={indicatorList}
              typeListSelectHandler={indicatorListSelectHandler}
            />
            <ColorLegend indicator={indicator} />
          </div>
        </div>
        {/* <div className="d-flex flex-row w-50 justify-content-end mb-1"></div> */}
      </div>
      <div className="d-flex flex-row flex-wrap justify-content-between align-content-around">
        <div className="heatmap-chart mb-2">
          {readyState && binanceHeatmap.change24Hs && (
            <Change24H
              change24Hs={binanceHeatmap.change24Hs}
              // prices={binanceHeatmap.prices}
              pricePrecisions={binanceHeatmap.pricePrecisions}
              indicator={indicator}
              topRangeValue={topRangeList[topRange]}
              fundingRates={binanceHeatmap.fundingRates}
            />
          )}
        </div>
        <div className="heatmap-chart mb-2">
          {readyState && binanceHeatmap.change24Hs && (
            <TradingVol24H
              tradingVol24H={binanceHeatmap.tradingVol24H}
              // change24Hs={binanceHeatmap.change24Hs}
              // prices={binanceHeatmap.prices}
              pricePrecisions={binanceHeatmap.pricePrecisions}
              indicator={indicator}
              topRangeValue={topRangeList[topRange]}
              fundingRates={binanceHeatmap.fundingRates}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BinanceHeatmap;
