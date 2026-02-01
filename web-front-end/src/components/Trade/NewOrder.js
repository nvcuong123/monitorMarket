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
} from "@coreui/react";
import Toast from "../Toast.js";
import { FRONT_INTERVAL_FETCH } from "../../pages/Utils.js";

const DEFAULT_SYMBOL = "BTCUSDT";
const DEFAULT_PROFIT_TARGET = "30";
const DEFAULT_LEVERAGE = "5";
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

const NewOrder = ({ onCloseHandler, onSubmitHandler, exchange }) => {
  const [loading, $loading] = useState(true);
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  const refForm = useRef(null);
  const [symbolList, $symbolList] = useState([]);
  const directionRef = useRef(DEFAULT_DIRECTION);
  const profitTargetRef = useRef(DEFAULT_PROFIT_TARGET);
  const [availBalance, $availBalance] = useState();
  const leverageRef = useRef(DEFAULT_LEVERAGE);
  const modeRef = useRef(DEFAULT_MODE);
  const [curSymbol, $curSymbol] = useState(DEFAULT_SYMBOL);
  const [type, $type] = useState(DEFAULT_TYPE);
  const [price, $price] = useState();
  const [amount, $amount] = useState();
  const [curSymbolMarkPrice, $curSymbolMarkPrice] = useState("---");
  const [curSymbolLastPrice, $curSymbolLastPrice] = useState("---");
  const [curSymbolPricePrecision, $curSymbolPricePrecision] = useState(0);
  const takeProfitRef = useRef(null);
  const stoplossRef = useRef(null);

  function resetDefaultFormData() {
    $price("");
    $amount("");
  }
  function fetchSymbolInfo(symbol) {
    (async function getSymbolInfo() {
      return await tr7TradingBot.getSymbolInfo(symbol);
    })().then((res) => {
      const accSymInfo = res.symbolInfo;
      modeRef.current.value =
        accSymInfo.isolated === true ? MODE_ISOLATED : MODE_CROSSED;
      leverageRef.current.value = accSymInfo.leverage;
    });
  }
  // get futures symbol list
  useEffect(() => {
    (async function fetchSymbolList() {
      return await tr7TradingBot.getSymbolList();
    })().then((res) => {
      const sortSymbols = res.symbols.sort();
      $symbolList(sortSymbols);
    });
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
      });
    }
    fetchSymbolInfoInvoke();
    fetchSymbolInfo(curSymbol);
    $loading(false);

    if (!!curSymbol) {
      const id = setInterval(fetchSymbolInfoInvoke, FRONT_INTERVAL_FETCH);
      return () => clearInterval(id);
    }
  }, [curSymbol]);

  function newOrderSubmitHandler(event) {
    event.preventDefault();

    // validate form data
    if (type === TYPE_LIMIT && !price) {
      addToast(Toast("Type: Limit", "Price should be set (larger than zero)"));
      return;
    }
    // if (takeProfitRef.current.value < TP_THRESHOLD) {
    //   addToast(
    //     Toast(
    //       "TAKE PROFIT",
    //       `Profit percent should be at least ${TP_THRESHOLD}%`
    //     )
    //   );
    // }
    // if (takeProfitRef.current.value < SL_THRESHOLD) {
    //   addToast(
    //     Toast("STOP LOSS", `Profit percent should be at least ${SL_THRESHOLD}%`)
    //   );
    // }

    // submit form data to server to place orders

    // addToast(Toast("PLACE ORDER", `submitting order...`));
    (async function submitOrder() {
      let order = {
        symbol: curSymbol,
        mode: modeRef.current.value,
        side: directionRef.current.value,
        leverage: leverageRef.current.value,
        type: type,
        amount: amount,
        price: price,
        tp: takeProfitRef.current.value,
        sl: stoplossRef.current.value,
        tpslPercentType: TYPE_PERCENT_BALANCE,
      };
      if (type === TYPE_LIMIT && (order.tp || order.sl)) {
        const levels = [];
        levels.push([price, amount]);
        const gridOrder = {
          symbol: curSymbol,
          mode: modeRef.current.value,
          direction: directionRef.current.value,
          leverage: leverageRef.current.value,
          repeatTime: 1,
          sizeUnit: "USD",
          levels: [...levels],
          takeProfit: {
            trigger: "mark",
            type: "market",
            tpType: TYPE_PERCENT,
            value: takeProfitRef.current.value,
            percentType: TYPE_PERCENT_BALANCE,
          },
          stopLoss: {
            trigger: "last",
            type: "limit",
            slType: TYPE_PERCENT,
            value: stoplossRef.current.value,
            percentType: TYPE_PERCENT_BALANCE,
          },
        };
        console.log("gridOrder", gridOrder);
        return await tr7TradingBot.placeGridOrder(gridOrder, exchange);
      } else {
        return await tr7TradingBot.placeNewOrder(order, exchange);
      }
    })().then((res) => {
      addToast(Toast("PLACE ORDER", JSON.stringify(res)));
      onCloseHandler();
    });
  }

  function symbolChangeHandler(e) {
    $curSymbol(e.target.value);
    resetDefaultFormData();
  }

  function levelPriceChangeHandler(e) {
    $price(Number(e.target.value));
  }
  function levelAmountChangeHandler(e) {
    $amount(Number(e.target.value));
  }
  function typeChangeHandler(e) {
    $type(e.target.value);
  }

  if (loading) {
    return <CSpinner color="info" />;
  } else {
    return (
      <>
        <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
        <CForm ref={refForm} onSubmit={newOrderSubmitHandler}>
          <CModalHeader>
            <CModalTitle>New Order</CModalTitle>
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
                    ref={modeRef}
                    id="inputMode"
                    defaultValue={DEFAULT_MODE}
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
                    ref={leverageRef}
                    type="number"
                    aria-label="profit target"
                    className="col-4"
                    defaultValue={DEFAULT_LEVERAGE}
                    id="inputLeverage"
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
                <CInputGroup className="mt-1 mb-2 md-col-4">
                  {/* <CRow> */}
                  <CCol xs={12} lg={6} className="mr-2">
                    <CInputGroup className="mb-2">
                      <CInputGroupText component="label" htmlFor="inputSide">
                        Direction
                      </CInputGroupText>
                      <CFormSelect
                        id="inputSide"
                        ref={directionRef}
                        defaultValue={DEFAULT_DIRECTION}
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
                  {/* </CRow> */}

                  <CInputGroup className="mb-0" size="md">
                    <CInputGroupText component="label" htmlFor={"price"}>
                      Price
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      step="any"
                      placeholder=""
                      aria-label="price"
                      defaultValue=""
                      // value={price}
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
                      defaultValue=""
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
                        ref={takeProfitRef}
                        type="number"
                        placeholder=""
                        aria-label="Take Profit"
                        // className="col-4"
                        defaultValue=""
                        id="inputTP"
                        // disabled={type === TYPE_LIMIT}
                      />
                      <CInputGroupText component="label">
                        % marg.
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
                        ref={stoplossRef}
                        type="number"
                        placeholder=""
                        aria-label="stoploss percent"
                        // className="col-4"
                        defaultValue=""
                        id="inputSL"
                        // disabled={type === TYPE_LIMIT}
                      />
                      <CInputGroupText component="label">
                        % marg.
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

export default NewOrder;
