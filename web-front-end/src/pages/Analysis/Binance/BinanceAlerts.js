import { useEffect, useState } from "react";
import React from "react";
import useWebSocket from "react-use-websocket";
import { Toast, ToastContainer } from "react-bootstrap";
import _ from "lodash";
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CSpinner,
  CButtonGroup,
  CFormCheck,
  CRow,
} from "@coreui/react";
import {
  CurrencyFormatter,
  PercentChangeFormatter,
  DateNow,
  DateFormatter,
  FundingRateFormat,
} from "../../../Utils";
import Symbol from "../../../components/Data/Symbol";
import BotAlert from "../../../components/BotAlert";
import Pill from "../../../components/Data/Pill";

const productionUrl = window.location.origin.replace("https", "wss");
const socketUrl =
  (process.env.NODE_ENV === "production"
    ? productionUrl
    : "ws://127.0.0.1:3000") + "/alerts";
console.log("socketUrl", socketUrl);

/**{
  time: 1696857471364,
  alertType: 'PRICE_CHANGE',
  timestamp: 1696857300000,
  symbol: 'BNTUSDT',
  timeframe: '5m',
  price: '0.5228000',
  priceChange: -2.0239880059969866
} 

{
  time: 1696860003596,
  alertType: 'RSI',
  timestamp: 1696860000000,
  symbol: 'QTUMUSDT',
  timeframe: '30m',
  rsi: 19.39,
  rsiType: 'RSI_OVERSOLD'
}

{
  alertType: 'OI_CHANGE',
  alertSubType: 'REALTIME_OI',
  time: 1696862013746,
  sumOpenInterest: '27621345',
  sumOpenInterestValue: 6667792.683,
  prevChange: 9.869097861511296,
  timestamp: 1696860900000,
  symbol: 'BNXUSDT',
  timeframe: '15m'
}
*/
/**ticker<xx>Last {
 * sFinal: false
  price: "0.9994000"
  priceChange: 0
  quoteVolume: "133.9196000"
  quoteVolumeChange: -23.863052008024187
  timestamp: 1696945920000} 
*/
const priceNotifyTimeframesThreshold = {
  "1m": 1,
  "5m": 2,
  "15m": 3,
  "30m": 4,
  "1h": 5,
};
const CTableDataCellPrice = (props) => {
  const { ticker, timeframe } = props;
  if (_.isEmpty(ticker)) {
    return <CTableDataCell />;
  } else {
    const cellColor =
      Math.abs(ticker.priceChange) > priceNotifyTimeframesThreshold[timeframe]
        ? "danger"
        : "";
    //
    return (
      <CTableDataCell color={cellColor} className="">
        {!_.isEmpty(ticker) && PercentChangeFormatter(ticker.priceChange)}
      </CTableDataCell>
    );
  }
};
const AlertPrice = (props) => {
  const tickers = props.tickers;
  const ticker1mLast = _.last(tickers["1m"]);
  const ticker5mLast = _.last(tickers["5m"]);
  const ticker15mLast = _.last(tickers["15m"]);
  const ticker30mLast = _.last(tickers["30m"]);
  const ticker1hLast = _.last(tickers["1h"]);

  return (
    <CCard color="" className="smaller-text">
      <CCardHeader>
        <div className="d-flex d-flex-row justify-content-between smaller-text">
          <strong>Price</strong>
          {/* <strong>{ticker1mLast.price}</strong> */}
          <strong>
            {!_.isEmpty(ticker1mLast) &&
              CurrencyFormatter.format(ticker1mLast.price)}
          </strong>
        </div>
      </CCardHeader>
      <CCardBody className="smaller-text">
        <CTable stripedColumns hover color="light">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell>1h</CTableHeaderCell>
              <CTableHeaderCell>30m</CTableHeaderCell>
              <CTableHeaderCell>15m</CTableHeaderCell>
              <CTableHeaderCell>5m</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              <CTableDataCellPrice ticker={ticker1hLast} timeframe="1h" />
              <CTableDataCellPrice ticker={ticker30mLast} timeframe="30m" />
              <CTableDataCellPrice ticker={ticker15mLast} timeframe="15m" />
              <CTableDataCellPrice ticker={ticker5mLast} timeframe="5m" />
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

const OI_THRESHOLD = 5;
const CTableDataCellOI = (props) => {
  const { openInterest, timeframe } = props;
  if (_.isEmpty(openInterest)) return <CTableDataCell />;

  const color =
    Math.abs(openInterest.realTimeChange) > OI_THRESHOLD ? "danger" : "";
  return (
    <CTableDataCell color={color}>
      {PercentChangeFormatter(openInterest.realTimeChange)}
    </CTableDataCell>
  );
};
const AlertOI = (props) => {
  const { openInterests } = props;
  //
  return (
    <CCard color="" className="smaller-text">
      <CCardHeader>
        <div
          className="d-flex d-flex-row justify-content-between"
          color="danger"
        >
          <strong>OI (real)</strong>
          <strong>
            {!_.isEmpty(openInterests) &&
              CurrencyFormatter.format(
                openInterests["real"].sumOpenInterestValue
              )}
            {/* {openInterests &&
              NumberFormatter(openInterests["real"].sumOpenInterest)} */}
          </strong>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable stripedColumns hover color="light">
          <CTableHead color="dark">
            <CTableRow>
              {/* <CTableHeaderCell>4h</CTableHeaderCell> */}
              <CTableHeaderCell>1h</CTableHeaderCell>
              <CTableHeaderCell>30m</CTableHeaderCell>
              <CTableHeaderCell>15m</CTableHeaderCell>
              <CTableHeaderCell>5m</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              {!_.isEmpty(openInterests) && (
                <>
                  {/* <CTableDataCellOI
                    openInterest={openInterests["4h"]}
                    timeframe="4h"
                  /> */}
                  <CTableDataCellOI
                    openInterest={openInterests["1h"]}
                    timeframe="1h"
                  />
                  <CTableDataCellOI
                    openInterest={openInterests["30m"]}
                    timeframe="30m"
                  />
                  <CTableDataCellOI
                    openInterest={openInterests["15m"]}
                    timeframe="15m"
                  />
                  <CTableDataCellOI
                    openInterest={openInterests["5m"]}
                    timeframe="5m"
                  />
                </>
              )}
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

const AlertVolume = (props) => {
  const { tickers, change24h } = props;
  const ticker1mLast = _.last(tickers["1m"]);
  const ticker5mLast = _.last(tickers["5m"]);
  const ticker15mLast = _.last(tickers["15m"]);
  const ticker30mLast = _.last(tickers["30m"]);
  const ticker1hLast = _.last(tickers["1h"]);
  //
  return (
    <CCard color="" className="smaller-text">
      <CCardHeader>
        <div className="d-flex d-flex-row justify-content-between">
          <strong>Volume (24h)</strong>
          <strong>{`${CurrencyFormatter.format(
            change24h.quoteVolume
          )} (${PercentChangeFormatter(change24h.percentChange)})`}</strong>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable stripedColumns hover color="light">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell>1h</CTableHeaderCell>
              <CTableHeaderCell>30m</CTableHeaderCell>
              <CTableHeaderCell>15m</CTableHeaderCell>
              <CTableHeaderCell>5m</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              <CTableDataCell>
                {!_.isEmpty(ticker1hLast) &&
                  PercentChangeFormatter(ticker1hLast.quoteVolumeChange)}
              </CTableDataCell>
              <CTableDataCell>
                {!_.isEmpty(ticker30mLast) &&
                  PercentChangeFormatter(ticker30mLast.quoteVolumeChange)}
              </CTableDataCell>
              <CTableDataCell>
                {!_.isEmpty(ticker15mLast) &&
                  PercentChangeFormatter(ticker15mLast.quoteVolumeChange)}
              </CTableDataCell>
              <CTableDataCell>
                {!_.isEmpty(ticker5mLast) &&
                  PercentChangeFormatter(ticker5mLast.quoteVolumeChange)}
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

const RSI_OVERBOUGHT = 80;
const RSI_OVERSOLD = 20;
const CTableDataCellRsi = (props) => {
  const { rsi } = props;
  const color = rsi > RSI_OVERBOUGHT || rsi < RSI_OVERSOLD ? "danger" : "";
  return <CTableDataCell color={color}>{rsi}</CTableDataCell>;
};
const AlertRsi = (props) => {
  const { rsi } = props;
  //
  return (
    <CCard color="" className="smaller-text">
      <CCardHeader>
        <div className="d-flex d-flex-row justify-content-between">
          <strong>RSI (1m)</strong>
          <strong>{_.last(rsi["1m"])}</strong>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable stripedColumns hover color="light">
          <CTableHead color="dark">
            <CTableRow>
              {/* <CTableHeaderCell>4h</CTableHeaderCell> */}
              <CTableHeaderCell>1h</CTableHeaderCell>
              <CTableHeaderCell>30m</CTableHeaderCell>
              <CTableHeaderCell>15m</CTableHeaderCell>
              <CTableHeaderCell>5m</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              {/* <CTableDataCellRsi rsi={_.last(rsi["4h"])} /> */}
              <CTableDataCellRsi rsi={_.last(rsi["1h"])} />
              <CTableDataCellRsi rsi={_.last(rsi["30m"])} />
              <CTableDataCellRsi rsi={_.last(rsi["15m"])} />
              <CTableDataCellRsi rsi={_.last(rsi["5m"])} />
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};
const AlertFundingRate = (props) => {
  const { fundingRates } = props;
  //
  return (
    <CCard color="" className="smaller-text">
      <CCardHeader>
        <div className="d-flex d-flex-row justify-content-between">
          <strong>Funding Rate (real)</strong>
          <strong>
            {!_.isEmpty(fundingRates["real"]) &&
              `${FundingRateFormat(fundingRates["real"]?.fundingRate * 100)}`}
          </strong>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable stripedColumns hover color="light">
          <CTableHead color="dark">
            <CTableRow>
              {!_.isEmpty(fundingRates["hist"]) &&
                _.map(fundingRates["hist"], (frData) => {
                  return (
                    <CTableHeaderCell>
                      {DateFormatter(frData.fundingTime)}
                    </CTableHeaderCell>
                  );
                })}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              {!_.isEmpty(fundingRates["hist"]) &&
                _.map(fundingRates["hist"], (frData) => {
                  return (
                    <CTableHeaderCell>
                      {`${FundingRateFormat(frData.fundingRate * 100)}`}
                    </CTableHeaderCell>
                  );
                })}
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};
const AlertCard = (props) => {
  const { symbol, alert, symbolData, tradingVol24H } = props;
  const { candles, fundingRates, openInterests, rsis, tickers } = symbolData;
  const binanceUrl = `https://www.binance.com/en/futures/${symbol}`;
  const change24h = _.find(
    tradingVol24H,
    (contract, idx) => contract.symbol === symbol
  );

  //
  return (
    <CCard color="secondary" className="mb-2">
      <CCardHeader>
        <div className="d-flex justify-content-between flex-wrap">
          <div className="col-12 col-md-8 d-flex d-flex-row flex-wrap justify-content-start align-items-center mb-1">
            <div className="">
              <Symbol symbol={symbol} />
            </div>
            <div className="mx-2">
              <Pill
                info={
                  alert.alertType === "RSI" ? alert.rsiType : alert.alertType
                }
              />
            </div>
            <Pill info={alert.timeframe} />
          </div>
          <div className="smaller-text ">{DateFormatter(alert.time)}</div>
        </div>
      </CCardHeader>
      <CCardBody className="d-flex flex-wrap justify-content-around">
        <CRow className="g-1">
          <CCol xs={12} md={6} xl={4}>
            <AlertPrice tickers={tickers} />
          </CCol>
          <CCol xs={12} md={6} xl={4}>
            <AlertVolume tickers={tickers} change24h={change24h} />
          </CCol>
          <CCol xs={12} md={6} xl={4}>
            <AlertOI openInterests={openInterests["tickers"]} />
          </CCol>
          <CCol xs={12} md={6} xl={4}>
            <AlertRsi rsi={rsis} />
          </CCol>
          <CCol xs={12} md={6} xl={4}>
            <AlertFundingRate fundingRates={fundingRates} />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

/**
 *
 * @param {row of each symbol} props
 * @returns
 */
const AlertRow = (props) => {
  const { symbol, alert, symbolData, tradingVol24H } = props;
  const { candles, fundingRates, openInterests, rsis, tickers } = symbolData;
  const binanceUrl = `https://www.binance.com/en/futures/${symbol}`;
  const change24h = _.find(
    tradingVol24H,
    (contract, idx) => contract.symbol === symbol
  );
  // const volume24h = contract24hData?.quoteVolume || "NA";
  //
  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };
  //
  return (
    <CTableRow color="">
      <CTableDataCell
        className="custom-link"
        onClick={() => openInNewTab(binanceUrl)}
      >
        <h7>{DateFormatter(alert.time)}</h7>
        <div className="w-100"></div>
        <h7>{alert.alertType}</h7>
        <div className="w-100"></div>
        <Symbol symbol={symbol} />
      </CTableDataCell>
      <CTableDataCell>
        <AlertPrice tickers={tickers} />
        {/* </CTableDataCell>
      <CTableDataCell> */}
        <AlertVolume tickers={tickers} change24h={change24h} />
      </CTableDataCell>
      <CTableDataCell>
        <AlertOI openInterests={openInterests["tickers"]} />
        {/* </CTableDataCell>
      <CTableDataCell> */}
        <AlertRsi rsi={rsis} />
      </CTableDataCell>
      <CTableDataCell>
        <AlertFundingRate fundingRates={fundingRates} />
      </CTableDataCell>
    </CTableRow>
  );
};

const TYPE_ALERT_TABLE = "realtime-data";
const TYPE_ALERT_CARDS = "cards";
const TYPE_ALERT_SIGNALS = "signals";

const BinanceAlerts = () => {
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    socketUrl,
    {
      share: true,
      retryOnError: true,
      reconnectAttempts: 1000,
      reconnectInterval: 3000,
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: () => true,
      onOpen: (event) => console.log("opened ws", event),
      onClose: (closeEvent) => console.log("ws closed", closeEvent),
      onError: (errEvent) => console.log("error", errEvent),
      onReconnectStop: (numAttemp) =>
        console.log("reconnect stopped", numAttemp),
    }
  );
  useEffect(() => {
    function reconnectWebSocket() {
      console.log("reconnectWebSocket");
      const websocket = getWebSocket();

      if (websocket.readyState === WebSocket.CLOSED) {
        console.log("websocket.reconnect();");
        websocket.reconnect();
      }
    }
    // Event listener for when the network connection is re-established
    window.addEventListener("online", reconnectWebSocket);

    return () => {
      // Cleanup: remove event listener when component unmounts
      window.removeEventListener("online", reconnectWebSocket);
    };
  }, [getWebSocket]);

  //
  const [alertToasts, $alertToasts] = useState([]);
  const [alertSymbList, $alertSymbList] = useState([]);
  const [binanceAlerts, $binanceAlerts] = useState({});
  const [alertDataList, $alertDataList] = useState([]);
  const [tradingVol24H, $tradingVol24H] = useState({});
  const [alertMode, $alertMode] = useState(TYPE_ALERT_CARDS);
  //
  useEffect(() => {
    if (lastMessage !== null) {
      const json = JSON.parse(lastMessage.data);
      /**
       * const alertData = {
    symbols: alertSymbList,
    alertlist: binanceAlerts,
    marketdata: alertDataList,
  };
       */
      let respAlertList = json.alertData.alertlist;
      // _.reverse(respAlertList);
      $binanceAlerts((prevAlerts) => respAlertList);
      // $alertToasts((prevToasts) => _.takeRight(respAlertList, 5));
      let respSymbList = json.alertData.symbols;
      // _.reverse(respSymbList);
      $alertSymbList((prevList) => respSymbList);
      const marketData = json.alertData.marketdata;
      $alertDataList((prevList) => marketData);
      $tradingVol24H(json.tradingVol24H);
    }
  }, [lastMessage]);
  //
  function alertToastClose(index) {
    $alertToasts((prevAlerts) => {
      const newAlerts = prevAlerts.splice(index, 1);
      console.log(newAlerts, newAlerts);
      return newAlerts;
    });
  }

  return (
    <>
      <CButtonGroup role="group" className="mb-2">
        <CFormCheck
          type="radio"
          button={{ color: "primary", variant: "outline" }}
          name="vbtnradio"
          id="vbtnradio2"
          autoComplete="off"
          label="Alerts"
          defaultChecked={alertMode === TYPE_ALERT_CARDS}
          onClick={() => $alertMode(TYPE_ALERT_CARDS)}
        />
        <CFormCheck
          type="radio"
          button={{ color: "primary", variant: "outline" }}
          name="vbtnradio"
          id="vbtnradio1"
          autoComplete="off"
          label="Symbols"
          defaultChecked={alertMode === TYPE_ALERT_TABLE}
          onClick={() => $alertMode(TYPE_ALERT_TABLE)}
        />
      </CButtonGroup>
      {_.isEmpty(alertSymbList) && (
        <div>
          <CSpinner color="info" />
          <div>Waiting for alerts...</div>
        </div>
      )}
      {!_.isEmpty(alertSymbList) && alertMode === "realtime-data" && (
        <div id="alert-symbol-table">
          <CTable
            striped
            hover
            responsive
            color="light"
            className="smaller-text"
          >
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Symbol</CTableHeaderCell>
                <CTableHeaderCell>Price / Volume</CTableHeaderCell>
                {/* <CTableHeaderCell>Volume</CTableHeaderCell> */}
                <CTableHeaderCell>Open Interest / RSI</CTableHeaderCell>
                {/* <CTableHeaderCell>RSI</CTableHeaderCell> */}
                <CTableHeaderCell>Funding Rate</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {alertSymbList.map((symbol, index) => {
                const alert = _.find(
                  binanceAlerts,
                  (alert) => alert.symbol === symbol
                );
                const symbolData = _.find(
                  alertDataList,
                  (obj) => obj.symbol === symbol
                );
                return (
                  <AlertRow
                    key={index}
                    symbol={symbol}
                    alert={alert}
                    symbolData={symbolData.data}
                    tradingVol24H={tradingVol24H}
                  />
                );
              })}
            </CTableBody>
          </CTable>
        </div>
      )}

      {!_.isEmpty(alertSymbList) && alertMode === "realtime-data" && (
        <div
          id="alert-symbol-cards"
          className="d-flex flex-wrap justify-contend-around"
        >
          {alertSymbList.map((symbol, index) => {
            const alert = _.find(
              binanceAlerts,
              (alert) => alert.symbol === symbol
            );
            const symbolData = _.find(
              alertDataList,
              (obj) => obj.symbol === symbol
            );
            return (
              <AlertCard
                key={index}
                symbol={symbol}
                alert={alert}
                symbolData={symbolData.data}
                tradingVol24H={tradingVol24H}
              />
            );
          })}
        </div>
      )}

      <div className="d-flex flex-row flex-wrap justify-content-around align-content-around">
        {!_.isEmpty(binanceAlerts) &&
          alertMode === "cards" &&
          binanceAlerts.map((alert) => {
            return (
              <CCol xs={12} md={6} lg={4}>
                <BotAlert alert={alert} />
              </CCol>
            );
          })}
      </div>
      {/* <StackingAlertToast
        alertList={alertToasts}
        onCloseHandler={alertToastClose}
      /> */}
    </>
  );
};

export default BinanceAlerts;
