import React, { useRef } from "react";
import { useState, useEffect } from "react";
import tr7TradingBot from "../../Model/tr7-trading-bot.js";
import {
  CRow,
  CCol,
  CButton,
  CSpinner,
  CModal,
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
} from "@coreui/react";
import Positions from "./Positions.js";
import { FRONT_INTERVAL_FETCH } from "../Utils.js";

const DEFAULT_SYMBOL = "BTCUSDT";
const DEFAULT_DIRECTION = "Short";
const DEFAULT_PROFIT_TARGET = "30";
const DEFAULT_LEVERAGE = "5";
const DEFAULT_MODE = "Isolated";
const DEFAULT_MAX_BALANCE = "1000";
const DEFAULT_NO_LEVEL = 5;
const NewTradeModal = ({ onCloseHandler, onSubmitHandler }) => {
  const refForm = useRef(null);
  const [symbolList, $symbolList] = useState([]);
  const directionRef = useRef(DEFAULT_DIRECTION);
  const profitTargetRef = useRef(DEFAULT_PROFIT_TARGET);
  const leverageRef = useRef(DEFAULT_LEVERAGE);
  const modeRef = useRef(DEFAULT_MODE);
  const maxBalanceRef = useRef(DEFAULT_MAX_BALANCE);
  const [curSymbol, $curSymbol] = useState(DEFAULT_SYMBOL);
  const [numberLevels, $numberLevels] = useState(DEFAULT_NO_LEVEL);
  const [prices, $prices] = useState(Array(DEFAULT_NO_LEVEL));
  const [amounts, $amounts] = useState(Array(DEFAULT_NO_LEVEL));
  const [totalAmount, $totalAmount] = useState(null);
  const [averagePrice, $averagePrice] = useState(null);
  const [curSymbolMarkPrice, $curSymbolMarkPrice] = useState("---");
  const [curSymbolLastPrice, $curSymbolLastPrice] = useState("---");
  const takeProfitRef = useRef(null);
  const stoplossRef = useRef(null);

  function resetDefaultFormData() {
    $numberLevels(DEFAULT_NO_LEVEL);
    $prices(new Array(DEFAULT_NO_LEVEL));
    $amounts(new Array(DEFAULT_NO_LEVEL));
  }
  // get futures symbol list
  useEffect(() => {
    (async function fetchSymbolList() {
      return await tr7TradingBot.getSymbolList();
    })().then((res) => {
      const sortSymbols = res.symbols.sort();
      $symbolList(sortSymbols);
    });
  }, []);

  useEffect(() => {
    function fetchSymbolInfoInvoke() {
      (async function fetchSymbolInfo() {
        return await tr7TradingBot.getSymbolMarketInfo(curSymbol);
      })().then((res) => {
        const symbolInfo = res.symbolMarketInfo;
        $curSymbolMarkPrice(symbolInfo.markPrice);
        $curSymbolLastPrice(symbolInfo.lastPrice);
      });
    }
    fetchSymbolInfoInvoke();
    if (!!curSymbol) {
      const id = setInterval(fetchSymbolInfoInvoke, FRONT_INTERVAL_FETCH);
      return () => clearInterval(id);
    }
  }, [curSymbol]);

  // calculate again average price, if both level price and amount are present
  useEffect(() => {
    let avgPrice = 0;
    let totalAmount = 0;
    let totalBalanceSize = 0;
    const list = prices.slice(0, numberLevels);
    list.forEach((price, index) => {
      const amount = amounts[index];
      if (price !== undefined && amount !== undefined) {
        totalAmount += amount;
        totalBalanceSize += price * amount;
      }
    });
    avgPrice = (totalBalanceSize / totalAmount).toFixed(2);
    $averagePrice(avgPrice);
    $totalAmount(totalAmount);
  }, [prices, amounts, numberLevels]);

  function submitNewTradeHandler(event) {
    event.preventDefault();
    // validate form data
    console.log(curSymbol);
    console.log(directionRef.current.value, profitTargetRef.current.value);
    console.log(modeRef.current.value, leverageRef.current.value);
    console.log(maxBalanceRef.current.value, numberLevels);
    console.log(prices, amounts);
    console.log(takeProfitRef.current.value, stoplossRef.current.value);
    // submit form data to server to place orders
    (async function submitGridOrder() {
      const levels = prices.map((price, index) => {
        const amount = amounts[index];
        return [price, amount];
      });
      const gridOrder = {
        symbol: curSymbol,
        mode: modeRef.current.value.toLowerCase(),
        direction: directionRef.current.value.toLowerCase(),
        leverage: Number(leverageRef.current.value),
        maxBalance: Number(maxBalanceRef.current.value),
        levels: [...levels],
        takeProfit: {
          trigger: "mark",
          type: "market",
          percent: Number(takeProfitRef.current.value),
        },
        stopLoss: {
          trigger: "last",
          type: "limit",
          percent: Number(stoplossRef.current.value),
        },
      };

      return await tr7TradingBot.placeGridOrder(gridOrder);
    })().then((res) => {
      console.log(res);
    });
  }

  function symbolChangeHandler(e) {
    $curSymbol(e.target.value);
    resetDefaultFormData();
  }
  function inputLevelsChangeHandler(e) {
    $numberLevels(e.target.value);
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
    $amounts((curAmounts) => {
      const tempAmounts = [...curAmounts];
      tempAmounts[index] = Number(e.target.value);
      return tempAmounts;
    });
  }

  return (
    <CForm ref={refForm} onSubmit={submitNewTradeHandler}>
      <CModalHeader>
        <CModalTitle>New Trade</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="d-flex d-flex-row justify-content-around">
          <CCol xs={10} lg={5}>
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
                <option>Isolated</option>
                <option>Cross</option>
              </CFormSelect>
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
                <option>Long</option>
                <option>Short</option>
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
              <CInputGroupText component="label" htmlFor="inputInitialMargin">
                Max Balance
              </CInputGroupText>
              <CFormInput
                ref={maxBalanceRef}
                type="number"
                placeholder="100"
                aria-label="profit target"
                className="col-4"
                defaultValue={1000}
                id="inputInitialMargin"
              />
              <CInputGroupText component="label">USDT</CInputGroupText>
            </CInputGroup>
          </CCol>
          <CCol xs={10} lg={6}>
            <CRow>
              <CCol>
                <CBadge color="info">
                  Mark Price: {Number(curSymbolMarkPrice).toFixed(2)}
                </CBadge>
              </CCol>
              <CCol>
                <CBadge color="warning">
                  Last Price: {Number(curSymbolLastPrice).toFixed(2)}
                </CBadge>
              </CCol>
            </CRow>
            <CInputGroup className="mt-1 mb-2 md-col-4">
              <CInputGroup className="mb-0">
                <CInputGroupText component="label" htmlFor="inputLevels">
                  Number Levels
                </CInputGroupText>
                <CFormInput
                  type="number"
                  placeholder={numberLevels}
                  aria-label=""
                  // defaultValue={numberLevels}
                  value={numberLevels}
                  id="inputLevels"
                  onChange={inputLevelsChangeHandler}
                />
              </CInputGroup>
              {!!numberLevels &&
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
                        placeholder=""
                        aria-label="price"
                        // defaultValue=""
                        value={prices[index]}
                        id={"price" + index}
                        onChange={levelPriceChangeHandler}
                      />

                      <CInputGroupText
                        component="label"
                        htmlFor={"amout" + index}
                      >
                        Amt {index + 1}
                      </CInputGroupText>
                      <CFormInput
                        type="number"
                        placeholder=""
                        aria-label="amount"
                        defaultValue=""
                        id={"amount" + index}
                        onChange={levelAmountChangeHandler}
                      />
                    </CInputGroup>
                  );
                })}
              <CRow>
                <CCol>
                  <CBadge color="danger">Average Price: {averagePrice}</CBadge>
                </CCol>
                <CCol>
                  <CBadge color="warning">Total Amount: {totalAmount}</CBadge>
                </CCol>
              </CRow>
            </CInputGroup>
            <CInputGroup className="my-2">
              <CInputGroup className="mb-1">
                <CInputGroupText component="label" htmlFor="inputTP">
                  Take Profit (option)
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
                <CInputGroupText component="label">%</CInputGroupText>
              </CInputGroup>
              <CInputGroup className="mb-1">
                <CInputGroupText
                  className=""
                  component="label"
                  htmlFor="inputSL"
                >
                  Stop Loss (option)
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
                <CInputGroupText component="label">%</CInputGroupText>
              </CInputGroup>
            </CInputGroup>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => onCloseHandler}>
          Close
        </CButton>
        <CButton color="primary" type="submit">
          Submit
        </CButton>
      </CModalFooter>
    </CForm>
  );
};

const ManualGrid = () => {
  const [response, $response] = useState(null);
  const [newTradeVisible, $newTradeVisible] = useState(false);
  // pull all current trades, then laying out as separated as symbol with the button to close position
  async function fetchSomeBotData() {
    const response = await tr7TradingBot.getTrade();
    return response;
  }
  useEffect(() => {
    fetchSomeBotData().then((resp) => $response(resp));
    const id = setInterval(() => {
      fetchSomeBotData().then((resp) => $response(resp));
    }, 1700);

    return () => clearInterval(id);
  }, []);

  function newTradeHandler(e) {
    $newTradeVisible(true);
  }

  if (!response) {
    return <CSpinner color="info" />;
  } else if (response.success === false) {
    return (
      <>
        <h1>Manual Trade</h1>
        <p>{response.message}</p>
      </>
    );
  } else {
    return (
      <>
        <div className="d-flex flex-row justify-content-between align-items-center">
          <h1>Manual Trade</h1>
          <div>
            <button onClick={newTradeHandler} className="btn btn-warning">
              New Trade
            </button>
            <CModal
              size="lg"
              alignment="center"
              visible={newTradeVisible}
              onClose={() => $newTradeVisible(false)}
            >
              <NewTradeModal onCloseHandler={() => $newTradeVisible(false)} />
            </CModal>
          </div>
        </div>
        {Array.isArray(response.positions) && (
          <Positions positions={response.positions} />
        )}
      </>
    );
  }
};

export default ManualGrid;
