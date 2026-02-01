import { useEffect, useState } from "react";
import React from "react";
import useWebSocket from "react-use-websocket";
import _ from "lodash";
import dayjs from "dayjs";
import {
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CCard,
  CButton,
  CCardHeader,
  CCardBody,
  CCol,
} from "@coreui/react";
import Symbol from "../../../components/Data/Symbol";
import SignalsDownload from "./SignalsDownload";

import {
  CurrencyFormatterWithPrecision,
  PercentFormatter,
  PercentChangeFormatter,
  DateNow,
  DateFormatter,
  TimeFormatter,
  FundingRateFormat,
  NumberFormatter,
} from "../../../Utils";
import { useFuturesOrderInfo } from "../../../Provider/FuturesOrderInfo.js";
import Pill from "../../../components/Data/Pill.js";

export function isProfitSignal(signal, inpProfitPercent) {
  if (!_.isEmpty(signal.result)) {
    const type = _.toLower(signal.type);
    const highPercent =
      ((signal.result.highestPrice - signal.result.entryPrice) * 100) /
      signal.result.entryPrice;
    const lowPercent =
      ((signal.result.lowestPrice - signal.result.entryPrice) * 100) /
      signal.result.entryPrice;
    if (
      type.includes("long") &&
      highPercent > 0 &&
      Math.abs(highPercent) > Math.abs(lowPercent) &&
      Math.abs(highPercent) > Number(inpProfitPercent)
    ) {
      return true;
    }
    if (
      type.includes("short") &&
      lowPercent < 0 &&
      Math.abs(lowPercent) > Math.abs(highPercent) &&
      Math.abs(lowPercent) > Number(inpProfitPercent)
    ) {
      return true;
    }
    return false;
  }
  return NaN;
}
const productionUrl = window.location.origin.replace("https", "wss");
const socketUrl =
  (process.env.NODE_ENV === "production"
    ? productionUrl
    : "ws://127.0.0.1:3000") + "/signals";

const timeframeList = ["all", "5m", "15m", "30m", "1h"];
const signalTypeList = [
  "all",
  "BULLISH_ENGULFING_LONG",
  "BEARISH_ENGULFING_SHORT",
  "Dat-three-white-soldies",
  "THREE_WHITE_SOLDIERS_LONG",
  "Dat-three-black-crows",
  "THREE_BLACK_CROWS_SHORT",
  "MORNING_STAR_LONG",
  "EVENING_STAR_SHORT",
];
const TEXT_ALL = "all";
const TEXT_UP = "Up";
const TEXT_DOWN = "Down";
const cgOiAllList = [TEXT_ALL, TEXT_UP, TEXT_DOWN];

const SignalCard = (props) => {
  const { pricePrecisions } = useFuturesOrderInfo();
  const signal = props.signal;
  // console.log("SignalCard:signal", signal);
  let aggregatedOI = "";
  if (signal.exchanges && !_.isEmpty(signal.exchanges.openInterest)) {
    const percentChange = signal.exchanges.openInterest.all.percentChange;
    if (percentChange !== "NA") {
      aggregatedOI = PercentChangeFormatter(percentChange);
    } else {
      aggregatedOI = percentChange;
    }
  }

  // console.log(isClose);
  return (
    <CCol xs={12} md={6} xl={4}>
      <CCard
        className="mx-1 mb-2"
        color="secondary"
        textColor="white"
        // style={{ maxWidth: "24rem" }}
      >
        <CCardHeader>
          <div className="d-flex d-flex-row justify-content-between align-items-center">
            <Symbol symbol={signal.symbol} />
            <Pill info={`Tframe ${signal.timeframe}`} />
            <div className="mx-2" style={{ fontSize: "smaller" }}>
              {dayjs(signal.time).format("DD/MM HH:mm:ss")}
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-around">
            <Pill info={_.toLower(signal.type)} />
            <Pill
              info={`last candle ${dayjs(signal.timestamp).format("HH:mm:ss")}`}
            />
          </div>
          <CTable
            striped
            hover
            responsive
            color="light"
            className="smaller-text mt-2"
            style={{ width: "100%" }}
          >
            <CTableBody style={{ overflowY: "auto" }}>
              <CTableRow>
                <CTableHeaderCell>RSI</CTableHeaderCell>
                <CTableDataCell>{signal.rsi}</CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Price</CTableHeaderCell>
                <CTableDataCell>
                  {PercentChangeFormatter(signal.priceChange)}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Agg. OI</CTableHeaderCell>
                <CTableDataCell>{aggregatedOI}</CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Agg. L/S Ratio</CTableHeaderCell>
                <CTableDataCell>
                  {signal.exchanges &&
                    signal.exchanges.globalLongShortAccountRatio &&
                    `${NumberFormatter(
                      signal.exchanges.globalLongShortAccountRatio.all
                        .longShortRatio
                    )} (${PercentFormatter(
                      signal.exchanges.globalLongShortAccountRatio.all
                        .longAccount * 100
                    )} /
                            ${PercentFormatter(
                              signal.exchanges.globalLongShortAccountRatio.all
                                .shortAccount * 100
                            )})`}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Candles result</CTableHeaderCell>
                <CTableDataCell>
                  {signal.result && (
                    <>
                      <div>
                        {CurrencyFormatterWithPrecision(
                          signal.result.entryPrice,
                          pricePrecisions[signal.symbol]
                        )}
                      </div>
                      <div>{`[${CurrencyFormatterWithPrecision(
                        signal.result.lowestPrice,
                        pricePrecisions[signal.symbol]
                      )}(${PercentChangeFormatter(
                        ((signal.result.lowestPrice -
                          signal.result.entryPrice) *
                          100) /
                          signal.result.entryPrice,
                        3
                      )}) - ${CurrencyFormatterWithPrecision(
                        signal.result.highestPrice,
                        pricePrecisions[signal.symbol]
                      )}(${PercentChangeFormatter(
                        ((signal.result.highestPrice -
                          signal.result.entryPrice) *
                          100) /
                          signal.result.entryPrice,
                        3
                      )})]`}</div>
                    </>
                  )}
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

const BinanceSignals = () => {
  const { pricePrecisions } = useFuturesOrderInfo();
  const [curSymbol, $curSymbol] = useState("");
  const [curTimeframe, $curTimeframe] = useState("all");
  const [curType, $curType] = useState("");
  const [curCgOi, $curCgOi] = useState("all");
  const [rsiGreater, $rsiGreater] = useState("");
  const [rsiLessthan, $rsiLessthan] = useState("");
  const [longshortGreater, $longshortGreater] = useState("");
  const [longshortLessthan, $longshortLessthan] = useState("");
  const [filterSymbols, $filterSymbols] = useState([]);
  const [inpProfitPercent, $inpProfitPercent] = useState("");
  const [profitSignalCnt, $profitSignalCnt] = useState(0);
  const [totalSignals, $totalSignals] = useState(0);

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
  const [binanceSignals, $binanceSignals] = useState({});
  //
  useEffect(() => {
    if (lastMessage !== null) {
      const signals = JSON.parse(lastMessage.data);
      const revertedSignals = _.reverse(signals);
      $binanceSignals(revertedSignals);
    }
  }, [lastMessage]);

  useEffect(() => {
    function rsiInSelectedRange(signal) {
      const signalRsi = signal.rsi;
      if (Number(rsiGreater) !== 0 && signalRsi <= rsiGreater) {
        return false;
      }
      if (Number(rsiLessthan) !== 0 && signalRsi >= rsiLessthan) {
        return false;
      }
      return true;
    }
    function oiSelectedRange(signal) {
      if (curCgOi === TEXT_ALL) {
        return true;
        // } else if (signal.cgOi !== undefined) {
        // const signalOiAllPercent = signal.cgOi.allExchange.h1OIChangePercent;
      } else if (
        signal.exchanges &&
        signal.exchanges.openInterest !== undefined
      ) {
        const signalOiAllPercent = Number(
          signal.exchanges.openInterest.all.percentChange
        );
        if (
          (curCgOi === TEXT_UP && signalOiAllPercent > 0) ||
          (curCgOi === TEXT_DOWN && signalOiAllPercent < 0)
        ) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    }
    function longshortSelectedRange(signal) {
      //
      if (
        signal.exchanges &&
        signal.exchanges.globalLongShortAccountRatio !== undefined
      ) {
        const longShortRatio =
          signal.exchanges.globalLongShortAccountRatio.all.longShortRatio;
        if (
          Number(longshortGreater) !== 0 &&
          longShortRatio <= longshortGreater
        ) {
          return false;
        }
        if (
          Number(longshortLessthan) !== 0 &&
          longShortRatio >= longshortLessthan
        ) {
          return false;
        }
        return true;
      }
      return true;
      //
      // if (signal.cgLongShort !== undefined) {
      //   const signalLongShort = signal.cgLongShort.allExchange;
      //   const longShortRatio =
      //     signalLongShort.longRate / signalLongShort.shortRate;
      //   if (
      //     Number(longshortGreater) !== 0 &&
      //     longShortRatio <= longshortGreater
      //   ) {
      //     return false;
      //   }
      //   if (
      //     Number(longshortLessthan) !== 0 &&
      //     longShortRatio >= longshortLessthan
      //   ) {
      //     return false;
      //   }
      //   return true;
      // }
      // return true;
    }
    //
    // filtering
    if (!_.isEmpty(binanceSignals)) {
      // console.log(curSymbol, curTimeframe, curType);
      const filterList = [];
      _.forEach(binanceSignals, (signal) => {
        if (
          signal.symbol.includes(curSymbol) &&
          (curTimeframe === "all" || signal.timeframe === curTimeframe) &&
          (curType === "all" || _.toLower(signal.type).includes(curType)) &&
          rsiInSelectedRange(signal) &&
          oiSelectedRange(signal) &&
          longshortSelectedRange(signal)
        ) {
          filterList.push(signal);
        }
      });
      //
      if (inpProfitPercent.length) {
        const hadResultSignals = _.filter(
          filterList,
          (signal) => !_.isEmpty(signal.result)
        );
        $totalSignals(hadResultSignals.length);
        // console.log("!empty input");
        const profitList = _.filter(hadResultSignals, (signal) =>
          isProfitSignal(signal, inpProfitPercent)
        );
        $profitSignalCnt(profitList.length);
        $filterSymbols(profitList);
      } else {
        $profitSignalCnt(NaN);
        $totalSignals(NaN);
        $filterSymbols(filterList);
      }
    }
  }, [
    binanceSignals,
    curSymbol,
    curTimeframe,
    curType,
    rsiGreater,
    rsiLessthan,
    longshortGreater,
    curCgOi,
    longshortLessthan,
    inpProfitPercent,
  ]);

  return (
    <div>
      {_.isEmpty(binanceSignals) && (
        <div>
          <CSpinner color="info" />
          <div>Waiting for signals detected...</div>
        </div>
      )}
      {!_.isEmpty(binanceSignals) && (
        <div style={{ height: "80vh" }}>
          <div className="signals-filter mb-2">
            <div className="row g-1">
              <div className="col-lg-2 col-md-3">
                <CInputGroup
                  className="smaller-text shrink-to-fit"
                  // style={{ width: "12%" }}
                >
                  <CInputGroupText
                    component="label"
                    htmlFor="inputSymbol"
                    className="smaller-text"
                  >
                    Symb
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    aria-label="symbol"
                    className="smaller-text"
                    id="input-symbol"
                    value={curSymbol}
                    onChange={(e) => {
                      $curSymbol(e.target.value.toUpperCase());
                    }}
                  />
                </CInputGroup>
              </div>
              <div className="col-lg-2 col-md-3">
                <CInputGroup
                  className="shrink-to-fit"
                  // style={{ width: "13%" }}
                >
                  <CInputGroupText
                    component="label"
                    htmlFor="inputSymbol"
                    className="smaller-text"
                  >
                    Tframe
                  </CInputGroupText>
                  <CFormSelect
                    id="inputTimeframe"
                    className="smaller-text"
                    onChange={(e) => {
                      $curTimeframe(e.target.value);
                    }}
                    value={curTimeframe}
                  >
                    {timeframeList.map((symbol, index) => {
                      return <option key={index}>{symbol}</option>;
                    })}
                  </CFormSelect>
                </CInputGroup>
              </div>
              <div className="col-lg-4 col-md-6">
                <CInputGroup
                  className="shrink-to-fit"
                  // style={{ width: "20%" }}
                >
                  <CInputGroupText
                    component="label"
                    htmlFor="inputSymbol"
                    className="smaller-text"
                  >
                    Type
                  </CInputGroupText>
                  <CFormSelect
                    id="inputSignalType"
                    className="smaller-text"
                    onChange={(e) => {
                      $curType(e.target.value);
                    }}
                    value={curType}
                  >
                    {signalTypeList.map((type, index) => {
                      return <option key={index}>{_.toLower(type)}</option>;
                    })}
                  </CFormSelect>
                </CInputGroup>
              </div>
              <div className="col-lg-4 col-md-6">
                <CInputGroup
                  className="shrink-to-fit"
                  // style={{ width: "21%" }}
                >
                  <CInputGroupText
                    component="label"
                    htmlFor="inputSymbol"
                    className="smaller-text"
                  >
                    RSI
                  </CInputGroupText>
                  <CInputGroupText className="smaller-text">
                    &gt;
                  </CInputGroupText>
                  <CFormInput
                    className="smaller-text"
                    type="number"
                    min={0}
                    max={100}
                    aria-label="rsi-greater"
                    // className="col-4"
                    id="input-rsi-greater"
                    value={rsiGreater}
                    onChange={(e) => {
                      // console.log("rsi-greater", Number(e.target.value));
                      $rsiGreater(e.target.value);
                    }}
                  />
                  <CInputGroupText className="smaller-text">
                    &lt;
                  </CInputGroupText>
                  <CFormInput
                    className="smaller-text"
                    type="number"
                    min={0}
                    max={100}
                    aria-label="rsi-lessthan"
                    // className="col-4"
                    id="input-rsi-lessthan"
                    value={rsiLessthan}
                    onChange={(e) => {
                      $rsiLessthan(e.target.value);
                    }}
                  />
                </CInputGroup>
              </div>
              <div className="col-lg-2 col-md-6">
                <CInputGroup>
                  <CInputGroupText
                    component="label"
                    htmlFor="inputSymbol"
                    className="smaller-text"
                  >
                    OI
                  </CInputGroupText>
                  <CFormSelect
                    id="inputSignalType"
                    className="smaller-text"
                    onChange={(e) => {
                      $curCgOi(e.target.value);
                    }}
                    value={curCgOi}
                  >
                    {cgOiAllList.map((type, index) => {
                      return <option key={index}>{type}</option>;
                    })}
                  </CFormSelect>
                </CInputGroup>
              </div>
              <div className="col-lg-5 col-md-6">
                <CInputGroup>
                  <CInputGroupText
                    component="label"
                    htmlFor="longShortRatio"
                    className="smaller-text"
                  >
                    L/S
                  </CInputGroupText>
                  <CInputGroupText className="smaller-text">
                    &gt;
                  </CInputGroupText>
                  <CFormInput
                    className="smaller-text"
                    type="number"
                    min={0}
                    aria-label="longshort-greater"
                    // className="col-4"
                    id="input-longshort-greater"
                    value={longshortGreater}
                    onChange={(e) => {
                      // console.log("longshort-greater", Number(e.target.value));
                      $longshortGreater(e.target.value);
                    }}
                  />
                  <CInputGroupText className="smaller-text">
                    &lt;
                  </CInputGroupText>
                  <CFormInput
                    className="smaller-text"
                    type="number"
                    min={0}
                    // max={100}
                    aria-label="longshort-lessthan"
                    // className="col-4"
                    id="input-longshort-lessthan"
                    value={longshortLessthan}
                    onChange={(e) => {
                      $longshortLessthan(e.target.value);
                    }}
                  />
                </CInputGroup>
              </div>
              <div className="col-lg-5 col-md-6">
                <CInputGroup>
                  <CInputGroupText
                    component="label"
                    htmlFor="3candleprofit"
                    className="smaller-text"
                  >
                    3 Candles Profit % &gt;
                  </CInputGroupText>
                  <CFormInput
                    className="smaller-text"
                    type="number"
                    min={0}
                    aria-label="3CandlesProfit"
                    // className="col-4"
                    id="3-candles-profit"
                    value={inpProfitPercent}
                    onChange={(e) => {
                      // console.log("input profit", e.target.value);
                      $inpProfitPercent(e.target.value);
                    }}
                  />
                  <CInputGroupText className="smaller-text">{`${profitSignalCnt}/${totalSignals} (${PercentFormatter(
                    (profitSignalCnt * 100) / totalSignals
                  )})`}</CInputGroupText>
                </CInputGroup>
              </div>
            </div>
            <div className="col-md-12 d-flex justify-content-end my-2">
              <SignalsDownload />
            </div>
          </div>

          <div
            id="signals-cards"
            className="d-flex flex-wrap justify-contend-around"
          >
            {filterSymbols.map((signal, index) => {
              return <SignalCard signal={signal} key={index}></SignalCard>;
            })}
          </div>
          <div
            id="signals-table"
            className="signals-table"
            style={{ height: "74vh", overflow: "auto" }}
          >
            <CTable
              striped
              hover
              responsive
              color="light"
              className="smaller-text"
              style={{ width: "100%" }}
            >
              <CTableHead color="dark" style={{ position: "sticky", top: 0 }}>
                <CTableRow>
                  <CTableHeaderCell>Time</CTableHeaderCell>
                  <CTableHeaderCell>Symbol</CTableHeaderCell>
                  <CTableHeaderCell>Tframe</CTableHeaderCell>
                  <CTableHeaderCell>Last Candle</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>RSI</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  {/* <CTableHeaderCell>OI</CTableHeaderCell> */}
                  {/* <CTableHeaderCell>CG OI All/Binance</CTableHeaderCell> */}
                  {/* <CTableHeaderCell>CG OI All</CTableHeaderCell>
                  <CTableHeaderCell>CG Long/Short All</CTableHeaderCell> */}
                  <CTableHeaderCell>Aggregated OI</CTableHeaderCell>
                  <CTableHeaderCell>Aggregated L/S (accounts)</CTableHeaderCell>
                  <CTableHeaderCell>Candles result</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody style={{ overflowY: "auto" }}>
                {filterSymbols.map((signal, index) => {
                  let aggregatedOI = "";
                  if (
                    signal.exchanges &&
                    !_.isEmpty(signal.exchanges.openInterest)
                  ) {
                    const percentChange =
                      signal.exchanges.openInterest.all.percentChange;
                    if (percentChange !== "NA") {
                      aggregatedOI = PercentChangeFormatter(percentChange);
                    } else {
                      aggregatedOI = percentChange;
                    }
                  }
                  //
                  return (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        {dayjs(signal.time).format("DD/MM HH:mm:ss")}
                      </CTableDataCell>
                      <CTableDataCell>
                        <Symbol symbol={signal.symbol} />
                      </CTableDataCell>
                      <CTableDataCell>{signal.timeframe}</CTableDataCell>
                      <CTableDataCell>
                        {dayjs(signal.timestamp).format("DD/MM HH:mm:ss")}
                      </CTableDataCell>
                      <CTableDataCell>{_.toLower(signal.type)}</CTableDataCell>
                      <CTableDataCell>{signal.rsi}</CTableDataCell>
                      <CTableDataCell>
                        {PercentChangeFormatter(signal.priceChange)}
                      </CTableDataCell>
                      {/* <CTableDataCell>
                        {PercentChangeFormatter(signal.oiChange)}
                      </CTableDataCell> */}
                      {/* <CTableDataCell>
                        {signal.cgOi &&
                          `${PercentChangeFormatter(
                            signal.cgOi.allExchange.h1OIChangePercent
                          )} /
                          ${PercentChangeFormatter(
                            signal.cgOi.binance.h1OIChangePercent
                          )}`}
                      </CTableDataCell> */}
                      {/* <CTableDataCell>
                        {signal.cgOi &&
                          `${PercentChangeFormatter(
                            signal.cgOi.allExchange.h1OIChangePercent
                          )}`}
                      </CTableDataCell> */}
                      {/* <CTableDataCell>
                        {signal.cgLongShort &&
                          `${NumberFormatter(
                            signal.cgLongShort.allExchange.longRate /
                              signal.cgLongShort.allExchange.shortRate
                          )} (${PercentFormatter(
                            signal.cgLongShort.allExchange.longRate
                          )} /
                            ${PercentFormatter(
                              signal.cgLongShort.allExchange.shortRate
                            )})`}
                      </CTableDataCell> */}
                      <CTableDataCell>{aggregatedOI}</CTableDataCell>
                      <CTableDataCell>
                        {signal.exchanges &&
                          signal.exchanges.globalLongShortAccountRatio &&
                          `${NumberFormatter(
                            signal.exchanges.globalLongShortAccountRatio.all
                              .longShortRatio
                          )} (${PercentFormatter(
                            signal.exchanges.globalLongShortAccountRatio.all
                              .longAccount * 100
                          )} /
                            ${PercentFormatter(
                              signal.exchanges.globalLongShortAccountRatio.all
                                .shortAccount * 100
                            )})`}
                      </CTableDataCell>
                      <CTableDataCell>
                        {signal.result && (
                          <>
                            <div>
                              {CurrencyFormatterWithPrecision(
                                signal.result.entryPrice,
                                pricePrecisions[signal.symbol]
                              )}
                            </div>
                            <div>{`[${CurrencyFormatterWithPrecision(
                              signal.result.lowestPrice,
                              pricePrecisions[signal.symbol]
                            )}(${PercentChangeFormatter(
                              ((signal.result.lowestPrice -
                                signal.result.entryPrice) *
                                100) /
                                signal.result.entryPrice,
                              3
                            )}) - ${CurrencyFormatterWithPrecision(
                              signal.result.highestPrice,
                              pricePrecisions[signal.symbol]
                            )}(${PercentChangeFormatter(
                              ((signal.result.highestPrice -
                                signal.result.entryPrice) *
                                100) /
                                signal.result.entryPrice,
                              3
                            )})]`}</div>
                          </>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinanceSignals;
