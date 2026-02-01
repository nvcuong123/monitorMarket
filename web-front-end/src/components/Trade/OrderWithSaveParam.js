import React, { useRef } from "react";
import { useState, useEffect } from "react";
import tr7TradingBot, {
  EXCHANGE_BINANCE,
  EXCHANGE_BYBIT,
  EXCHANGE_GATEIO,
} from "../../Model/tr7-trading-bot.js";
import {
  CRow,
  CCol,
  CButton,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CBadge,
  CSpinner,
  CToaster,
  CCallout,
} from "@coreui/react";
import Toast from "../Toast.js";
import {
  useFuturesOrderInfo,
  CUR_SYMBOL,
  MODE,
  LEVERAGE,
  DIRECTION,
  TYPE,
  PRICE,
  AMOUNT,
  TAKE_PROFIT,
  STOP_LOSS,
} from "../../Provider/FuturesOrderInfo.js";
import { FRONT_INTERVAL_FETCH } from "../../pages/Utils.js";

const MODE_ISOLATED = "Isolated";
const MODE_CROSSED = "Crossed";
const DEFAULT_MODE = MODE_ISOLATED;
const DIRECTION_BOTH = "Both";
const DIRECTION_LONG = "Long";
const DIRECTION_SHORT = "Short";
const DEFAULT_DIRECTION = DIRECTION_BOTH;
const TYPE_MARKET = "Market";
const TYPE_LIMIT = "Limit";
const DEFAULT_TYPE = TYPE_MARKET;
const TP_THRESHOLD = 1;
const SL_THRESHOLD = 1;
const TYPE_PRICE = "$";
const TYPE_PERCENT = "%";
const TYPE_PERCENT_PRICE = 0;
const TYPE_PERCENT_BALANCE = 1;

const OrderWithParam = ({ onCloseHandler, onSubmitHandler, exchange }) => {
  const {
    loading,
    symbolList,
    symbolListGateIO,
    symbolListByBit,
    curSymbol,
    userOrderParam,
    setOrderInfo,
  } = useFuturesOrderInfo();
  // console.log("curSymbol", curSymbol, userOrderParam);
  const {
    modeRef,
    directionRef,
    leverageRef,
    type,
    price,
    amount,
    takeProfitRef,
    stoplossRef,
  } = userOrderParam[curSymbol];
  // console.log(loading);
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  const refForm = useRef(null);
  const [availBalance, $availBalance] = useState();
  const [curSymbolMarkPrice, $curSymbolMarkPrice] = useState("---");
  const [curSymbolLastPrice, $curSymbolLastPrice] = useState("---");
  const [curSymbolPricePrecision, $curSymbolPricePrecision] = useState(0);
  const [symbolInfo, $symbolInfo] = useState();
  const symbolListCurExchange =
    exchange === EXCHANGE_GATEIO
      ? symbolListGateIO
      : exchange === EXCHANGE_BYBIT
      ? symbolListByBit
      : symbolList;

  useEffect(() => {
    // account info
    (async function fetchAccountInfo(exchange) {
      // console.log("fetchAccountInfo", exchange);
      return await tr7TradingBot.fetchAccountInfo(exchange);
    })(exchange).then((res) => {
      if (exchange === EXCHANGE_BINANCE) {
        const account = res.accounts[0];
        $availBalance(Number(account.availableBalance).toFixed(2));
      } else if (exchange === EXCHANGE_GATEIO) {
        // console.log(res);
        $availBalance(Number(res.accounts.available).toFixed(2));
      }
    });
  }, [exchange]);

  useEffect(() => {
    function fetchSymbolInfoInvoke(exchange) {
      // console.log("fetchAccountInfo", exchange);
      (async function fetchSymbolMarketInfo(exchange) {
        return await tr7TradingBot.getSymbolMarketInfo(curSymbol, exchange);
      })(exchange).then((res) => {
        const symbolInfo = res.symbolMarketInfo;
        $curSymbolMarkPrice(symbolInfo.markPrice);
        $curSymbolLastPrice(symbolInfo.lastPrice);
        $curSymbolPricePrecision(
          symbolInfo.pricePrecision < 100 ? symbolInfo.pricePrecision : 0
        );
        $symbolInfo(symbolInfo);
        // console.log(symbolInfo);
      });
    }

    fetchSymbolInfoInvoke(exchange);
    if (!!curSymbol) {
      const id = setInterval(
        () => fetchSymbolInfoInvoke(exchange),
        FRONT_INTERVAL_FETCH
      );
      return () => clearInterval(id);
    }
  }, [curSymbol, exchange]);

  function newOrderSubmitHandler(event) {
    event.preventDefault();
    // validate form data
    if (type === TYPE_LIMIT && !price) {
      addToast(Toast("Type: Limit", "Price should be set (larger than zero)"));
      return;
    }
    // submit form data to server to place orders
    // addToast(Toast("PLACE ORDER", `submitting order...`));
    (async function submitOrder() {
      let order = {
        symbol: curSymbol,
        mode: modeRef,
        side: directionRef,
        leverage: leverageRef,
        type: type,
        amount: amount,
        price: price,
        tp: takeProfitRef,
        sl: stoplossRef,
        tpslPercentType: TYPE_PERCENT_PRICE,
      };
      if (type === TYPE_LIMIT && (order.tp || order.sl)) {
        const levels = [];
        levels.push([price, amount]);
        const gridOrder = {
          symbol: curSymbol,
          mode: modeRef,
          direction: directionRef,
          leverage: leverageRef,
          repeatTime: 1,
          sizeUnit: "USD",
          levels: [...levels],
          takeProfit: {
            trigger: "mark",
            type: "market",
            tpType: TYPE_PERCENT,
            value: takeProfitRef,
            percentType: TYPE_PERCENT_PRICE,
          },
          stopLoss: {
            trigger: "last",
            type: "limit",
            slType: TYPE_PERCENT,
            value: stoplossRef,
            percentType: TYPE_PERCENT_PRICE,
          },
        };
        console.log("gridOrder", gridOrder);
        return await tr7TradingBot.placeGridOrder(gridOrder, exchange);
      } else {
        return await tr7TradingBot.placeNewOrder(order, exchange);
      }
    })().then((res) => {
      // console.log("JSON.stringify(res)", JSON.stringify(res));
      // if (res.success === false) {
      //   addToast(Toast("PLACE ORDER", res.message));
      // } else {
      //   addToast(Toast("PLACE ORDER", JSON.stringify(res)));
      // }
      onCloseHandler(res);
    });
  }

  function symbolChangeHandler(e) {
    // console.log(symbolChangeHandler);
    setOrderInfo(CUR_SYMBOL, e.target.value);
  }

  function levelPriceChangeHandler(e) {
    setOrderInfo(PRICE, e.target.value);
  }
  function levelAmountChangeHandler(e) {
    setOrderInfo(AMOUNT, e.target.value);
  }
  function typeChangeHandler(e) {
    setOrderInfo(TYPE, e.target.value);
  }
  // console.log(userOrderParam[curSymbol]);
  if (loading || userOrderParam[curSymbol] === null) {
    return <CSpinner color="info" />;
  } else {
    return (
      <>
        <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
        <CForm ref={refForm} onSubmit={newOrderSubmitHandler}>
          <CModalHeader>
            <CModalTitle>
              <h2>{exchange}</h2> Order w. Param
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="d-flex d-flex-row justify-content-around">
              <CCol xs={10} lg={4}>
                <CInputGroup className="mb-2">
                  <CInputGroupText
                    component="label"
                    htmlFor="inputSymbol"
                    className=""
                  >
                    Symbol
                  </CInputGroupText>
                  <CFormSelect
                    id="inputSymbol"
                    onChange={symbolChangeHandler}
                    value={curSymbol}
                  >
                    {symbolListCurExchange.map((symbol, index) => {
                      return <option key={index}>{symbol}</option>;
                    })}
                  </CFormSelect>
                </CInputGroup>
                <CInputGroup className="mb-2">
                  <CInputGroupText component="label" htmlFor="inputMode">
                    Mode
                  </CInputGroupText>
                  <CFormSelect
                    id="inputMode"
                    value={modeRef}
                    onChange={(e) => {
                      console.log(e.target.value);
                      setOrderInfo(MODE, e.target.value);
                    }}
                  >
                    <option>{MODE_ISOLATED}</option>
                    <option>{MODE_CROSSED}</option>
                  </CFormSelect>
                </CInputGroup>

                <CInputGroup className="mb-2">
                  <CInputGroupText component="label" htmlFor="inputLeverage">
                    Leverage
                  </CInputGroupText>
                  <CFormInput
                    type="number"
                    aria-label="leverage"
                    className="col-4"
                    id="inputLeverage"
                    min={1}
                    max={50}
                    value={leverageRef}
                    onChange={(e) => setOrderInfo(LEVERAGE, e.target.value)}
                  />
                  <CInputGroupText component="label">x</CInputGroupText>
                </CInputGroup>
                <CCallout color="primary">
                  <div>{`Available Balance`}</div>
                  <div className="text-primary">{`${availBalance} USDT`}</div>
                </CCallout>
              </CCol>
              <CCol xs={10} lg={7}>
                <CRow>
                  <CCol>
                    <CBadge color="info">
                      Mark Price:{" "}
                      {Number(curSymbolMarkPrice).toFixed(
                        curSymbolPricePrecision
                      )}
                    </CBadge>
                  </CCol>
                  <CCol>
                    <CBadge color="warning">
                      Last Price:{" "}
                      {Number(curSymbolLastPrice).toFixed(
                        curSymbolPricePrecision
                      )}
                    </CBadge>
                  </CCol>
                </CRow>
                <CRow className="my-2">
                  <CCol xs={12} lg={6}>
                    <CInputGroup className="mb-2">
                      <CInputGroupText component="label" htmlFor="inputSide">
                        Direction
                      </CInputGroupText>
                      <CFormSelect
                        id="inputSide"
                        value={directionRef}
                        onChange={(e) => {
                          setOrderInfo(DIRECTION, e.target.value);
                        }}
                      >
                        {exchange === EXCHANGE_GATEIO && (
                          <option>{DIRECTION_BOTH}</option>
                        )}
                        <option>{DIRECTION_LONG}</option>
                        <option>{DIRECTION_SHORT}</option>
                      </CFormSelect>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} lg={6}>
                    <CInputGroup className="mb-2">
                      <CInputGroupText component="label" htmlFor="inputSide">
                        Type
                      </CInputGroupText>
                      <CFormSelect
                        id="inputType"
                        value={type}
                        onChange={typeChangeHandler}
                      >
                        {exchange === EXCHANGE_BINANCE && (
                          <option>{TYPE_LIMIT}</option>
                        )}
                        <option>{TYPE_MARKET}</option>
                      </CFormSelect>
                    </CInputGroup>
                  </CCol>
                </CRow>
                <CInputGroup className="mt-1 mb-2 md-col-4">
                  <CInputGroup className="mb-0">
                    <CInputGroupText component="label" htmlFor={"price"}>
                      Price
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      step="any"
                      placeholder=""
                      aria-label="price"
                      value={price}
                      id={"price"}
                      onChange={levelPriceChangeHandler}
                      disabled={type === TYPE_MARKET}
                    />

                    <CInputGroupText component="label" htmlFor={"amout"}>
                      Amount
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      step="any"
                      placeholder=""
                      aria-label="amount"
                      value={amount}
                      id={"amount"}
                      onChange={levelAmountChangeHandler}
                    />
                  </CInputGroup>
                </CInputGroup>
                <CRow className="my-2">
                  <CCol xs={12} lg={6}>
                    <CInputGroup className="mb-1">
                      <CInputGroupText component="label" htmlFor="inputTP">
                        TP
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder=""
                        aria-label="Take Profit"
                        value={takeProfitRef}
                        onChange={(e) =>
                          setOrderInfo(TAKE_PROFIT, e.target.value)
                        }
                        id="inputTP"
                        // disabled={type === TYPE_LIMIT}
                      />
                      <CInputGroupText component="label">
                        % price
                      </CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} lg={6}>
                    <CInputGroup className="mb-1">
                      <CInputGroupText
                        className=""
                        component="label"
                        htmlFor="inputSL"
                      >
                        SL
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder=""
                        aria-label="stoploss percent"
                        value={stoplossRef}
                        onChange={(e) =>
                          setOrderInfo(STOP_LOSS, e.target.value)
                        }
                        id="inputSL"
                        // disabled={type === TYPE_LIMIT}
                      />
                      <CInputGroupText component="label">
                        % price
                      </CInputGroupText>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => onCloseHandler()}>
              Close
            </CButton>
            <CButton color="primary" type="submit">
              Submit
            </CButton>
          </CModalFooter>
        </CForm>
      </>
    );
  }
};

export default OrderWithParam;
