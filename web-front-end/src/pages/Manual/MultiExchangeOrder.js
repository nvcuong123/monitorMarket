import React, { useRef } from "react";
import { useState, useEffect } from "react";
import tr7TradingBot from "../../Model/tr7-trading-bot.js";
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
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
  CCardFooter,
} from "@coreui/react";
import Toast from "../../components/Toast.js";
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
import { FRONT_INTERVAL_FETCH } from "../Utils.js";

const MODE_ISOLATED = "Isolated";
const MODE_CROSSED = "Crossed";
const DEFAULT_MODE = MODE_ISOLATED;
const DIRECTION_LONG = "Long";
const DIRECTION_SHORT = "Short";
const DEFAULT_DIRECTION = DIRECTION_SHORT;
const TYPE_MARKET = "Market";
const TYPE_LIMIT = "Limit";
const DEFAULT_TYPE = TYPE_MARKET;
const TP_THRESHOLD = 1;
const SL_THRESHOLD = 1;
const TYPE_PRICE = "$";
const TYPE_PERCENT = "%";
const TYPE_PERCENT_PRICE = 0;
const TYPE_PERCENT_BALANCE = 1;

const MultiExchangeOrder = () => {
  const { loading, symbolList, curSymbol, userOrderParam, setOrderInfo } =
    useFuturesOrderInfo();
  // console.log(curSymbol, userOrderParam, setOrderInfo);
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
  const [toast, setToast] = useState(0);
  const toasterRef = useRef();
  // const refForm = useRef(null);
  const [availBalance, $availBalance] = useState();
  const [curSymbolMarkPrice, $curSymbolMarkPrice] = useState("---");
  const [curSymbolLastPrice, $curSymbolLastPrice] = useState("---");
  const [curSymbolPricePrecision, $curSymbolPricePrecision] = useState(0);
  const [symbolInfo, $symbolInfo] = useState();

  useEffect(() => {
    // account info
    (async function fetchAccountInfo() {
      return await tr7TradingBot.fetchAccountInfo();
    })().then((res) => {
      const account = res.accounts[0];
      $availBalance(Number(account.availableBalance).toFixed(2));
    });
  }, []);

  useEffect(() => {
    function fetchSymbolInfoInvoke() {
      (async function fetchSymbolMarketInfo() {
        return await tr7TradingBot.getSymbolMarketInfo(curSymbol);
      })().then((res) => {
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

    fetchSymbolInfoInvoke();
    if (!!curSymbol) {
      const id = setInterval(fetchSymbolInfoInvoke, FRONT_INTERVAL_FETCH);
      return () => clearInterval(id);
    }
  }, [curSymbol]);

  function newOrderSubmitHandler(event) {
    event.preventDefault();
    // validate form data
    if (type === TYPE_LIMIT && !price) {
      setToast(Toast("Type: Limit", "Price should be set (larger than zero)"));
      return;
    }
    // submit form data to server to place orders
    // setToast(Toast("PLACE ORDER", `submitting order...`));
    (async function submitOrder() {
      let order = {
        isMultiExchange: true,
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
          isMultiExchange: true,
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
        // console.log("gridOrder", gridOrder);
        return await tr7TradingBot.placeGridOrder(gridOrder, true);
      } else {
        return await tr7TradingBot.placeNewOrder(order, true);
      }
    })().then((res) => {
      setToast(Toast("Multi-Exchanges Order", JSON.stringify(res)));
    });
  }

  function symbolChangeHandler(e) {
    setToast(0);
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
        <CCard>
          <CCardHeader>
            <div className="d-flex d-flex-row justify-content-between align-items-center">
              <CCardTitle>Multi-Exchange Order</CCardTitle>
              <div>Binance, GateIO, ByBit</div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="d-flex d-flex-row justify-content-around">
              <CCol xs={10} md={4}>
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
                    {symbolList.map((symbol, index) => {
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
                      // console.log(e.target.value);
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
                  <div>
                    {`Binance `}
                    <span className="text-primary">{`${availBalance} USDT`}</span>
                  </div>
                  <div>
                    {`GateIO `}
                    <span className="text-primary">{`NA USDT`}</span>
                  </div>
                  <div>
                    {`Bybit `}
                    <span className="text-primary">{`NA USDT`}</span>
                  </div>
                </CCallout>
              </CCol>
              <CCol xs={10} md={6}>
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
                        <option>{TYPE_LIMIT}</option>
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
          </CCardBody>
          <CCardFooter className="d-flex flex-row justify-content-end align-items-end">
            <CButton
              color="primary"
              type="submit"
              onClick={newOrderSubmitHandler}
            >
              Submit
            </CButton>
          </CCardFooter>
        </CCard>
      </>
    );
  }
};

export default MultiExchangeOrder;
