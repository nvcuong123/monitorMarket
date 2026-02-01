import FundingRateChart from "./FundingRateChart";
import OpenInterestChart from "./OpenInterestChart";
import LongShortRatioChart from "./LongShortRatioChart";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";
import { useState } from "react";
import { symbolList, timeFrameList } from "../../Model/fetch-coinglass";

const NavigationBar = (props) => {
  const [symbol, $symbol] = useState(props.symbol);
  const [time, $time] = useState(props.timeFrame);
  function handleTimeFrameSelect(selection) {
    $time(selection);
    props.timeFrameSelectHandler(selection);
  }
  function handleSymbolListSelect(selection) {
    $symbol(selection);
    props.symbolSelectHandler(selection);
  }
  function handleSymbolListSelectMenu(event) {
    $symbol(event.target.value);
    props.symbolSelectHandler(event.target.value);
  }

  return (
    <header className="App-header">
      {/* <div>TR7 Logo</div> */}
      <div>{props.symbol}-USDT</div>
      <div className="header-right">
        <DropdownButton
          id="dropdown-symbol"
          title={symbol}
          size="sm"
          variant="secondary"
          menuVariant="dark"
          onSelect={handleSymbolListSelect}
        >
          {symbolList.map((item, index) => {
            return (
              <Dropdown.Item eventKey={item} key={index}>
                {item}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
        <div className="header-gap"></div>
        <DropdownButton
          id="dropdown-timeframe"
          title={time}
          size="sm"
          variant="secondary"
          menuVariant="dark"
          onSelect={handleTimeFrameSelect}
        >
          {timeFrameList.map((item, index) => {
            return (
              <Dropdown.Item eventKey={item} key={index}>
                {item}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </div>
    </header>
  );
};

function CoinGlassData() {
  const [symbol, $symbol] = useState("BTC");
  const [timeFrame, $timeFrame] = useState("h1");
  function symbolSelectHandler(symbol) {
    $symbol(symbol);
  }
  function timeFrameSelectHandler(timeFrame) {
    $timeFrame(timeFrame);
  }

  return (
    <div className="">
      <NavigationBar
        symbol={symbol}
        timeFrame={timeFrame}
        symbolSelectHandler={symbolSelectHandler}
        timeFrameSelectHandler={timeFrameSelectHandler}
      />
      <div className="grid-container">
        <div className="grid-item">
          <iframe
            id="inlineFrameExample"
            title="Coinglass website"
            width="100%"
            height="100%"
            // src="https://www.binance.com/en"
            src="https://www.coinglass.com/BitcoinOpenInterest"
          ></iframe>
        </div>
        <div className="grid-item">
          <OpenInterestChart
            timeLive={10000}
            symbol={symbol}
            timeFrame={timeFrame}
          />
        </div>
        <div className="grid-item">
          <LongShortRatioChart
            timeLive={10000}
            symbol={symbol}
            timeFrame={timeFrame}
          />
        </div>
        <div className="grid-item">
          <FundingRateChart timeLive={10000} symbol={symbol} timeFrame={"h8"} />
        </div>
      </div>
    </div>
  );
}

export default CoinGlassData;
