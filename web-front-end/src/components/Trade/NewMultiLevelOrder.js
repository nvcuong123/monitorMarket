import React, { useRef } from "react";
import { useState, useEffect } from "react";
import tr7TradingBot from "../../Model/tr7-trading-bot.js";
import Toast from "../Toast.js";
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
  CFormSwitch,
  CFormLabel,
} from "@coreui/react";
import { FRONT_INTERVAL_FETCH } from "../../pages/Utils.js";

const SIZE_UNIT_USD = "USD";
const SIZE_UNIT_COIN = "COIN";
const TYPE_PRICE = "$";
const TYPE_PERCENT = "%";
const TYPE_PERCENT_PRICE = 0;
const TYPE_PERCENT_BALANCE = 1;

const DEFAULT_MAX_BALANCE = "1000";
const DEFAULT_REPEAT_TIME = 1;
const DEFAULT_NO_LEVEL = 5;
const DEFAULT_SYMBOL = "BTCUSDT";
const DEFAULT_PROFIT_TARGET = "30";
const DEFAULT_LEVERAGE = "5";
const DEFAULT_SIZE_UNIT = SIZE_UNIT_USD;
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

const NewMultiOrder = ({ onCloseHandler, onSubmitHandler, exchange }) => {
  const [loading, $loading] = useState(true);
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  const refForm = useRef(null);
  const [symbolList, $symbolList] = useState([]);
  const directionRef = useRef(DEFAULT_DIRECTION);
  const profitTargetRef = useRef(DEFAULT_PROFIT_TARGET);
  const leverageRef = useRef(DEFAULT_LEVERAGE);
  const modeRef = useRef(DEFAULT_MODE);
  const [availBalance, $availBalance] = useState();
  const [curSymbol, $curSymbol] = useState(DEFAULT_SYMBOL);
  const [curSymbolInfo, $curSymbolInfo] = useState();
  const [repeatTime, $repeatTime] = useState(DEFAULT_REPEAT_TIME);
  const [numberLevels, $numberLevels] = useState(DEFAULT_NO_LEVEL);
  const [sizeUnit, $sizeUnit] = useState(DEFAULT_SIZE_UNIT);
  const [prices, $prices] = useState(Array(DEFAULT_NO_LEVEL));
  const [sizes, $sizes] = useState(Array(DEFAULT_NO_LEVEL));
  const [amounts, $amounts] = useState(Array(DEFAULT_NO_LEVEL));
  const [totalSize, $totalSize] = useState(null);
  const [averagePrice, $averagePrice] = useState(null);
  const [curSymbolMarkPrice, $curSymbolMarkPrice] = useState("---");
  const [curSymbolLastPrice, $curSymbolLastPrice] = useState("---");
  const [curSymbolPricePrecision, $curSymbolPricePrecision] = useState(0);
  const [curSymbolMinUSDSize, $curSymbolMinUSDSize] = useState("--");
  const [curSymbolMinCoinSize, $curSymbolMinCoinSize] = useState("--");
  const [takeprofitType, $takeprofitType] = useState(TYPE_PERCENT);
  const takeProfitRef = useRef(null);
  const [stoplossType, $stoplossType] = useState(TYPE_PERCENT);
  const stoplossRef = useRef(null);
  const [timerId, $timerId] = useState();

  function resetDefaultFormData() {
    $numberLevels(DEFAULT_NO_LEVEL);
    $prices(new Array(DEFAULT_NO_LEVEL));
    $sizes(new Array(DEFAULT_NO_LEVEL));
  }

  // get futures symbol list
  useEffect(() => {
    (async function fetchSymbolList() {
      const res = await tr7TradingBot.getSymbolList();
      const sortSymbols = res.symbols.sort();
      $symbolList(sortSymbols);
    })();
    // account info
    (async function fetchAccountInfo() {
      const res = await tr7TradingBot.fetchAccountInfo();
      const account = res.accounts[0];
      $availBalance(Number(account.availableBalance).toFixed(2));
    })();
  }, []);

  useEffect(() => {
    function fetchSymbolInfo(symbol) {
      (async function getSymbolInfo() {
        const res = await tr7TradingBot.getSymbolInfo(symbol);
        const accSymInfo = res.symbolInfo;
        // console.log("res", res);
        modeRef.current.value =
          accSymInfo.isolated === true ? MODE_ISOLATED : MODE_CROSSED;
        leverageRef.current.value = accSymInfo.leverage;
        $curSymbolInfo(accSymInfo);
      })();
    }
    function fetchSymbolInfoInvoke() {
      (async function () {
        const res = await tr7TradingBot.getSymbolMarketInfo(curSymbol);
        // console.log("getSymbolMarketInfo", res);
        const symbolInfo = res.symbolMarketInfo;
        $curSymbolMarkPrice(symbolInfo.markPrice);
        $curSymbolLastPrice(symbolInfo.lastPrice);
        // console.log(symbolInfo.pricePrecision);
        $curSymbolPricePrecision(
          symbolInfo.pricePrecision < 100 ? symbolInfo.pricePrecision : 0
        );
      })();
    }
    // invoke
    fetchSymbolInfoInvoke();
    fetchSymbolInfo(curSymbol);

    $loading(false);

    if (!!curSymbol) {
      const id = setInterval(fetchSymbolInfoInvoke, FRONT_INTERVAL_FETCH);
      $timerId(id);
      return () => clearInterval(id);
    }
  }, [curSymbol]);
  //
  function roundAmount(qty, stepSize) {
    // Integers do not require rounding
    if (Number.isInteger(qty)) return qty;

    const qtyString = parseFloat(qty).toFixed(16);
    const desiredDecimals = Math.max(stepSize.indexOf("1") - 1, 0);
    const decimalIndex = qtyString.indexOf(".");
    const floatAmount = parseFloat(
      qtyString.slice(0, decimalIndex + desiredDecimals + 1)
    );
    // console.log("floatAmount", floatAmount);
    return floatAmount;
  }
  useEffect(() => {
    if (!curSymbolInfo) return;

    // Set minimum order amount with minQty
    let amount = curSymbolInfo.minQty;
    // Set minimum order amount with minNotional
    if (curSymbolLastPrice * amount < curSymbolInfo.minNotional) {
      amount = curSymbolInfo.minNotional / curSymbolLastPrice;
    }
    // console.log("amount", amount, "curSymbolInfo", curSymbolInfo);
    amount = roundAmount(amount, curSymbolInfo.stepSize);
    if (amount * curSymbolLastPrice < curSymbolInfo.minNotional) {
      amount += parseFloat(curSymbolInfo.stepSize);
    }
    //
    let minUsdSize = amount * curSymbolLastPrice;
    $curSymbolMinUSDSize(minUsdSize);
    $curSymbolMinCoinSize(amount);
  }, [curSymbolLastPrice, curSymbolInfo]);

  function printoutAmounts(price, amount) {
    if (price > 0 && amount > 0 && curSymbolInfo.stepSize) {
      let amt = roundAmount(amount, curSymbolInfo.stepSize);
      const usdSize = (amt * price).toFixed(curSymbolPricePrecision);
      return `~${amt}/${usdSize}$`;
    }
  }

  // calculate again average price, if both level price and amount are present
  useEffect(() => {
    let avgPrice = 0;
    let totalAmount = 0;
    let totalSize = 0;
    let totalBalanceSize = 0;
    const list = prices.slice(0, numberLevels);
    let amounts = [];
    list.forEach((price, index) => {
      const size = sizes[index];
      if (price > 0 && size > 0) {
        //
        let tempAmount = size;
        if (sizeUnit === SIZE_UNIT_USD) {
          let amount = size / price;
          tempAmount = roundAmount(amount, curSymbolInfo.stepSize);
        }
        amounts[index] = tempAmount;
        //
        totalSize += tempAmount * price;
        totalAmount += tempAmount;
        totalBalanceSize += tempAmount * price;
      }
    });
    // const rawAvgPrice = totalBalanceSize / totalAmount;
    totalSize = totalSize.toFixed(curSymbolPricePrecision);
    avgPrice = (totalBalanceSize / totalAmount).toFixed(
      curSymbolPricePrecision
    );
    $amounts((curAmounts) => {
      const tempAmounts = [...amounts];
      return tempAmounts;
    });
    $averagePrice(avgPrice);
    $totalSize(totalSize);
  }, [prices, sizes, numberLevels]);

  function submitNewTradeHandler(event) {
    event.preventDefault();
    //
    clearInterval(timerId);
    // validate form data
    // console.log(curSymbol);
    // console.log(directionRef.current.value, profitTargetRef.current.value);
    // console.log(modeRef.current.value, leverageRef.current.value);
    // console.log(prices, sizes);
    // console.log(takeProfitRef.current.value, stoplossRef.current.value);
    // submit form data to server to place orders
    // addToast(Toast("PLACE ORDER", `submitting order...`));
    (async function submitGridOrder() {
      const levels = [];
      const listPrices = prices.slice(0, numberLevels);
      listPrices.forEach((price, index) => {
        const size = sizes[index];
        const amount = amounts[index];
        if (price > 0 && size > 0) {
          levels.push([price, size, amount]);
        }
      });
      const gridOrder = {
        symbol: curSymbol,
        mode: modeRef.current.value,
        direction: directionRef.current.value,
        leverage: leverageRef.current.value,
        repeatTime: repeatTime,
        sizeUnit: sizeUnit,
        levels: [...levels],
        takeProfit: {
          trigger: "mark",
          type: "market",
          tpType: takeprofitType,
          value: takeProfitRef.current.value,
          percentType: TYPE_PERCENT_BALANCE,
        },
        stopLoss: {
          trigger: "last",
          type: "limit",
          slType: stoplossType,
          value: stoplossRef.current.value,
          percentType: TYPE_PERCENT_BALANCE,
        },
      };
      // console.log(gridOrder);
      return await tr7TradingBot.placeGridOrder(gridOrder, exchange);
    })().then((res) => {
      // console.log(res);
      addToast(Toast("PLACE ORDER", JSON.stringify(res)));
      onCloseHandler();
    });
  }

  function symbolChangeHandler(e) {
    // $loading(true);
    $curSymbol(e.target.value);
    resetDefaultFormData();
  }
  function inputRepeatTimeChangeHandler(e) {
    $repeatTime(e.target.value);
  }
  function inputLevelsChangeHandler(e) {
    $numberLevels(e.target.value);
  }
  function sizeUnitClickHandler(e) {
    // console.log(e.target.value);
    const curUnit = sizeUnit;
    if (e.target.value === "on") {
      e.target.value = "off";
    } else {
      e.target.value = "on";
    }
    $sizeUnit(e.target.value === "on" ? SIZE_UNIT_USD : SIZE_UNIT_COIN);
    let tempSizes = [...sizes];
    sizes.forEach((size, index) => {
      if (prices[index] > 0 && size > 0) {
        // convert to coin
        if (curUnit === SIZE_UNIT_USD) {
          tempSizes[index] = size / prices[index];
        } else {
          tempSizes[index] = size * prices[index];
        }
      }
    });
    $sizes(() => tempSizes);
  }

  function levelPriceChangeHandler(e) {
    const index = Number(e.target.id.replace("price", ""));
    $prices((curPrices) => {
      const tempPrices = [...curPrices];
      tempPrices[index] = Number(e.target.value);
      return tempPrices;
    });
  }
  function levelAmountChangeHandler(e) {
    const index = Number(e.target.id.replace("amount", ""));
    $sizes((curSizes) => {
      const tempSizes = [...curSizes];
      tempSizes[index] = Number(e.target.value);
      return tempSizes;
    });
  }

  if (loading) {
    return <CSpinner color="info" />;
  } else {
    return (
      <>
        <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
        <CForm ref={refForm} onSubmit={submitNewTradeHandler}>
          <CModalHeader>
            <CModalTitle>New Multi-Level Order</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="d-flex d-flex-row justify-content-around">
              <CCol xs={12} lg={4}>
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
                      return (
                        <option
                          key={index}
                          // selected={symbol === DEFAULT_SYMBOL ? true : false}
                        >
                          {symbol}
                        </option>
                      );
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
                    // placeholder="5"
                    aria-label="profit target"
                    className="col-4"
                    defaultValue={DEFAULT_LEVERAGE}
                    id="inputLeverage"
                  />
                  <CInputGroupText component="label">x</CInputGroupText>
                </CInputGroup>
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
                {/* <CInputGroup className="mb-2">
              <CInputGroupText component="label" htmlFor="inputTargetProfit">
                Profit Target
              </CInputGroupText>
              <CFormInput
                ref={profitTargetRef}
                type="number"
                // placeholder="10"
                aria-label="profit target"
                className="col-4"
                defaultValue={DEFAULT_PROFIT_TARGET}
                id="inputTargetProfit"
              />
              <CInputGroupText component="label">%</CInputGroupText>
            </CInputGroup> */}
                <CCallout color="primary">
                  <div>{`Available Balance`}</div>
                  <div className="text-primary">{`${availBalance} USDT`}</div>
                </CCallout>
              </CCol>
              <CCol xs={12} lg={8}>
                <div className="d-flex flex-wrap justify-content-between">
                  <div xs={4}>
                    <CBadge color="info">
                      Mark Price:{" "}
                      {Number(curSymbolMarkPrice).toFixed(
                        curSymbolPricePrecision
                      )}
                    </CBadge>
                  </div>
                  <div xs={4}>
                    <CBadge color="warning">
                      Last Price:{" "}
                      {Number(curSymbolLastPrice).toFixed(
                        curSymbolPricePrecision
                      )}
                    </CBadge>
                  </div>
                  <div xs={4}>
                    <CFormSwitch
                      label={sizeUnit}
                      id="sizeUnit"
                      defaultChecked
                      onClick={sizeUnitClickHandler}
                    />
                    <CFormLabel>{`Min. ${curSymbolMinCoinSize}/${Number(
                      curSymbolMinUSDSize
                    ).toFixed(curSymbolPricePrecision)}$`}</CFormLabel>
                  </div>
                </div>
                <CInputGroup className="mt-1 mb-2 md-col-4">
                  <CRow className="my-2">
                    <CCol>
                      <CInputGroup className="mb-0">
                        <CInputGroupText
                          component="label"
                          htmlFor="inputLevels"
                        >
                          Repeat
                        </CInputGroupText>
                        <CFormInput
                          type="number"
                          placeholder={repeatTime}
                          aria-label=""
                          // defaultValue={numberLevels}
                          value={repeatTime}
                          id="reapeatTime"
                          onChange={inputRepeatTimeChangeHandler}
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol>
                      <CInputGroup className="mb-0">
                        <CInputGroupText
                          component="label"
                          htmlFor="inputLevels"
                        >
                          Levels
                        </CInputGroupText>
                        <CFormInput
                          type="number"
                          // delay={true}
                          placeholder={numberLevels}
                          aria-label=""
                          // defaultValue={numberLevels}
                          value={numberLevels}
                          id="inputLevels"
                          onChange={inputLevelsChangeHandler}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  {!!numberLevels &&
                    sizes &&
                    Array.from({ length: numberLevels }).map((level, index) => {
                      return (
                        <CInputGroup className="mb-0" key={index} size="sm">
                          <CInputGroupText
                            component="label"
                            htmlFor={"price" + index}
                          >
                            Price {index + 1}
                          </CInputGroupText>
                          <CFormInput
                            type="number"
                            step="any"
                            placeholder=""
                            aria-label="price"
                            defaultValue=""
                            // value={prices[index]}
                            id={"price" + index}
                            onChange={levelPriceChangeHandler}
                          />

                          <CInputGroupText
                            component="label"
                            htmlFor={"amout" + index}
                          >
                            Size {index + 1}
                          </CInputGroupText>
                          <CFormInput
                            type="number"
                            step="any"
                            placeholder=""
                            aria-label="amount"
                            // defaultValue=""
                            id={"amount" + index}
                            onChange={levelAmountChangeHandler}
                            value={sizes[index]}
                          />

                          <CInputGroupText
                            className="text-info"
                            component="label"
                            htmlFor={"price" + index}
                          >
                            {printoutAmounts(prices[index], amounts[index])}
                          </CInputGroupText>
                        </CInputGroup>
                      );
                    })}
                </CInputGroup>
                <CRow>
                  <CCol xs={6} md={4}>
                    <CBadge color="danger">Avg Price: {averagePrice}$</CBadge>
                  </CCol>
                  <CCol xs={6} md={4}>
                    <CBadge color="warning">Total Size: {totalSize}$</CBadge>
                  </CCol>
                  <CCol xs={6} md={4}>
                    <CBadge color="warning">
                      Balance:{" "}
                      {(totalSize / leverageRef.current.value).toFixed(2)}$
                    </CBadge>
                  </CCol>
                </CRow>
                <CRow className="my-2">
                  <CCol xs={12} md={6}>
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
                      />
                      <CButton
                        onClick={() =>
                          $takeprofitType(
                            takeprofitType === TYPE_PERCENT
                              ? TYPE_PRICE
                              : TYPE_PERCENT
                          )
                        }
                      >
                        {takeprofitType}
                      </CButton>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} md={6}>
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
                      />
                      <CButton
                        onClick={() =>
                          $stoplossType(
                            stoplossType === TYPE_PERCENT
                              ? TYPE_PRICE
                              : TYPE_PERCENT
                          )
                        }
                      >
                        {stoplossType}
                      </CButton>
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

export default NewMultiOrder;
