import React, { useRef } from "react";
import { useState, useEffect } from "react";
import tr7TradingBot, {
  EXCHANGE_BINANCE,
  EXCHANGE_GATEIO,
  EXCHANGE_BYBIT,
} from "../../Model/tr7-trading-bot.js";
import {
  CToaster,
  CRow,
  CCol,
  CSpinner,
  CModal,
  CCard,
  CCardHeader,
  CCardBody,
  CButtonGroup,
  CFormCheck,
} from "@coreui/react";
import Positions from "./Positions.js";
import Orders from "./Orders.js";
import OrderWithParam from "../../components/Trade/OrderWithSaveParam.js";
import NewOrder from "../../components/Trade/NewOrder.js";
import NewMultiOrder from "../../components/Trade/NewMultiLevelOrder.js";
import _ from "lodash";
import Toast from "../../components/Toast";

import { FRONT_INTERVAL_FETCH } from "../Utils.js";
import {
  useFuturesOrderInfo,
  CUR_EXCHANGE,
  CUR_SYMBOL,
  MODE,
  LEVERAGE,
  DIRECTION,
  TYPE,
  PRICE,
  AMOUNT,
  TAKE_PROFIT,
  STOP_LOSS,
  DEFAULT_SYMBOL,
  DEFAULT_SYMBOL_GATEIO,
  DEFAULT_SYMBOL_BYBIT,
} from "../../Provider/FuturesOrderInfo.js";
import GateIOPriceTriggerOrders from "./GateIOPriceTriggerOrders.js";

const ManualGrid = () => {
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();
  const {
    loading,
    symbolList,
    symbolListGateIO,
    symbolListByBit,
    curExchange,
    curSymbol,
    userOrderParam,
    setOrderInfo,
  } = useFuturesOrderInfo();
  // console.log("curExchange", curExchange, "curSymbol", curSymbol);
  // const [exchange, $exchange] = useState(EXCHANGE_BINANCE);
  const [response, $response] = useState(null);
  const [positions, $positions] = useState(null);
  const [openOrders, $openOrders] = useState(null);
  const [priceTriggerOrders, $priceTriggerOrders] = useState(null);
  const [newMarketOrderVisible, $newMarketOrderVisible] = useState(false);
  const [newTradeVisible, $newTradeVisible] = useState(false);
  const [newMultiOrderVisible, $newMultiOrderVisible] = useState(false);

  function exchangeChangeHandler(exchange) {
    if (exchange !== curExchange) {
      addToast(null);
      $openOrders(null);
      $positions(null);
      $priceTriggerOrders(null);
      setOrderInfo(CUR_EXCHANGE, exchange);
    }
  }
  // pull all current trades, then laying out as separated as symbol with the button to close position
  async function fetchSomeBotData(exchange) {
    const response = await tr7TradingBot.getPositions(exchange);
    // console.log("tr7TradingBot.getPositions", response);
    $positions(wrapPositions(exchange, response.positions));
    $openOrders(wrapOrders(exchange, response.openOrders));
    $priceTriggerOrders(response.priceTriggerOrders);
    return response;
  }
  useEffect(() => {
    $response(null);
    fetchSomeBotData(curExchange).then((resp) => $response(resp));
    const id = setInterval(() => {
      fetchSomeBotData(curExchange).then((resp) => $response(resp));
    }, FRONT_INTERVAL_FETCH);

    return () => clearInterval(id);
  }, [curExchange]);

  function newTradeHandler(e) {
    $newTradeVisible(true);
  }
  function newMultiLevelOrderHandler(e) {
    $newMultiOrderVisible(true);
  }
  function compare(a, b) {
    if (a.symbol < b.symbol) {
      return -1;
    }
    if (a.symbol > b.symbol) {
      return 1;
    }
    return 0;
  }
  function wrapPositions(exchange, positions) {
    // console.log("wrapPositions", positions);
    let respPositions = positions;
    // NOTE: on binance site, this size is calculated as positionAmt * last price
    if (exchange === EXCHANGE_BINANCE) {
      respPositions.forEach((position) => {
        position.size = position.positionAmt * position.entryPrice;
        position.marginSize = Number(position.isolatedWallet).toFixed(2);
        position.entryPrice = Number(position.entryPrice).toFixed(
          position.pricePrecision
        );
        position.markPrice = Number(position.markPrice).toFixed(
          position.pricePrecision
        );
        position.lastPrice = Number(position.lastPrice).toFixed(
          position.pricePrecision
        );
        position.liquidationPrice = Number(position.liquidationPrice).toFixed(
          position.pricePrecision
        );
      });
    }
    if (exchange === EXCHANGE_GATEIO) {
      respPositions = _.map(respPositions, (position) => {
        let retposition = { ...position };
        retposition.symbol = position.contract;
        retposition.positionAmt = position.size;
        retposition.size = position.size > 0 ? position.value : -position.value;
        retposition.liquidationPrice = position.liqPrice;
        retposition.lastPrice = position.lastPrice;
        retposition.marginSize = position.margin;
        return retposition;
      });
    }
    // TODO: ByBit
    // console.log("respPositions", respPositions);
    return respPositions.sort(compare);
  }
  function wrapOrders(exchange, orders) {
    let retOrders = orders;
    if (exchange === EXCHANGE_BINANCE) {
      retOrders.forEach((order) => {
        order.price = order.price === "0" ? order.stopPrice : order.price;
        order.price = Number(order.price).toFixed(order.pricePrecision);
        order.time = order.updateTime;
      });
    }
    if (exchange === EXCHANGE_GATEIO) {
      retOrders.forEach((order) => {
        // order.time = Number(order.createTime.toString().replace(/\./g, ""));
        order.time = order.createTime * 1000;
        order.symbol = order.contract;
        order.type = Number(order.price) !== 0 ? "LIMIT" : "MARKET";
        order.side = order.size < 0 ? "SHORT" : "LONG";
        // order.price = order.price;
        order.origQty = order.size * order.quantoMultiplier;
        order.reduceOnly = order.isReduceOnly;
      });
    }
    // TODO: ByBit

    return retOrders;
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
        <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
        <CRow>
          <div className="d-flex flex-row justify-content-between align-items-center mb-4">
            <CButtonGroup role="group" className="mt-2 mb-4">
              <CFormCheck
                type="radio"
                button={{ color: "primary", variant: "outline" }}
                name="vbtnradio"
                id="vbtnradio0"
                autoComplete="off"
                label="Binance"
                defaultChecked={curExchange === EXCHANGE_BINANCE}
                onClick={() => exchangeChangeHandler(EXCHANGE_BINANCE)}
              />
              <CFormCheck
                type="radio"
                button={{ color: "primary", variant: "outline" }}
                name="vbtnradio"
                id="vbtnradio1"
                autoComplete="off"
                label="GateIO"
                defaultChecked={curExchange === EXCHANGE_GATEIO}
                onClick={() => exchangeChangeHandler(EXCHANGE_GATEIO)}
              />
              <CFormCheck
                type="radio"
                button={{ color: "primary", variant: "outline" }}
                name="vbtnradio"
                id="vbtnradio2"
                autoComplete="off"
                label="ByBit"
                defaultChecked={curExchange === EXCHANGE_BYBIT}
                onClick={() => exchangeChangeHandler(EXCHANGE_BYBIT)}
              />
            </CButtonGroup>
            {/* <h1>Manual Trade</h1> */}
            <div className="d-inline-flex justify-content-between align-items-center">
              <button
                onClick={() => {
                  $newMarketOrderVisible(true);
                }}
                className="btn btn-warning mx-2"
              >
                Order w. Param
              </button>
              <CModal
                size="lg"
                alignment="center"
                visible={newMarketOrderVisible}
                onClose={() => $newMarketOrderVisible(false)}
              >
                <OrderWithParam
                  exchange={curExchange}
                  onCloseHandler={(orderRst) => {
                    console.log("OrderWithParam", orderRst);
                    $newMarketOrderVisible(false);
                    //
                    addToast(Toast("PLACE ORDER", orderRst.message));
                  }}
                />
              </CModal>
              <button
                onClick={newTradeHandler}
                className="btn btn-warning mx-2"
              >
                New Order
              </button>
              <CModal
                size="lg"
                alignment="center"
                visible={newTradeVisible}
                onClose={() => $newTradeVisible(false)}
              >
                <NewOrder
                  onCloseHandler={() => $newTradeVisible(false)}
                  exchange={curExchange}
                />
              </CModal>
              <button
                onClick={newMultiLevelOrderHandler}
                className="btn btn-warning mx-2"
              >
                New Multi-Level Order
              </button>
              <CModal
                size="lg"
                alignment="center"
                visible={newMultiOrderVisible}
                onClose={() => $newMultiOrderVisible(false)}
              >
                <NewMultiOrder
                  onCloseHandler={() => $newMultiOrderVisible(false)}
                  exchange={curExchange}
                />
              </CModal>
            </div>
          </div>
        </CRow>
        {Array.isArray(positions) && (
          <Positions
            exchange={curExchange}
            positions={positions}
            isClose={true}
          />
        )}
        {Array.isArray(openOrders) && (
          <Orders openOrders={openOrders} exchange={curExchange} />
        )}
        {curExchange === EXCHANGE_GATEIO && !_.isEmpty(priceTriggerOrders) && (
          <GateIOPriceTriggerOrders openOrders={priceTriggerOrders} />
        )}
      </>
    );
  }
};

export default ManualGrid;
