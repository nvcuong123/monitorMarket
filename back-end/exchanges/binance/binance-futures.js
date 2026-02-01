import Binance from "node-binance-api";
import { v4 as uuidv4, v1 as uuidv1 } from "uuid";
import crypto from "crypto";
import binanceMarketData from "./binance-market-data.js";
import _ from "lodash";
import dayjs from "dayjs";

//
const SIZE_UNIT_USD = "USD";
const SIZE_UNIT_COIN = "COIN";
const TYPE_PERCENT = "%";
const TYPE_PRICE = "$";
const TYPE_PERCENT_PRICE = 0;
const TYPE_PERCENT_BALANCE = 1;
// STATUS
const GRID_STATUS_NEW = "NEW";
const GRID_STATUS_EXECUTING = "EXCETUING";
const GRDID_STATUS_CANCELED = "CANCELED";
const GRID_STATUS_DONE = "DONE";
const MARKET_STATUS_NEW = "NEW";
const MARKET_STATUS_EXECUTING = "EXCETUING";
const MARKET_STATUS_DONE = "DONE";
// TYPE
const TYPE_LIMIT = "LIMIT";
const TYPE_MARKET = "MARKET";
const TYPE_TAKE_PROFIT_MARKET = "TAKE_PROFIT_MARKET";
const TYPE_TAKE_PROFIT_LIMIT = "TAKE_PROFIT_LIMIT";
const TYPE_STOP_MARKET = "STOP_MARKET";
const TYPE_STOP_LIMIT = "STOP_LIMIT";
// SIDE
const DIRECTION_LONG = "LONG";
const DIRECTION_SHORT = "SHORT";
const SIDE_SELL = "SELL";
const SIDE_BUY = "BUY";
// MODE
const MODE_CROSSED = "CROSSED";
const MODE_ISOLATED = "ISOLATED";
// ORDER STATUS
const ORDER_STATUS_NEW = "NEW";
const ORDER_STATUS_EXECUTING = "EXECUTING";
const ORDER_STATUS_DONE = "DONE";
const EXECUTE_TIME_RETRY = 3;
// RSI
const RSI_CMD_START = "RSI_START";
const RSI_CMD_STOP = "RSI_STOP";
const RSI_STATE_RUNNING = "RSI_RUNNING";
const RSI_STATE_STOPPED = "RSI_STOPPED";
const Default_RSI = {
  rsi: [20, 80],
  timeframe: ["1m", "1h", "4h", "1d"],
  // timeframe: [
  //   "1m",
  //   "3m",
  //   "5m",
  //   "15m",
  //   "30m",
  //   "1h",
  //   "2h",
  //   "4h",
  //   "6h",
  //   "8h",
  //   "12h",
  //   "1d",
  //   "3d",
  //   "1w",
  // ],
};
const POSITIONS_CACHED_TIME = 3500;
const ORDERS_CACHED_TIME = 3500;

export default class BinanceFutures {
  constructor(isTestnet, apiName, apiKey, secret) {
    this.binance = new Binance().options({
      test: isTestnet,
      APIKEY: apiKey,
      APISECRET: secret,
      family: 4,
      // reconnect: true,
    });
    this.binaneApiName = apiName;
    console.log(
      "this.binaneApiName",
      this.binaneApiName,
      "isTestnet:",
      isTestnet
    );

    this.futureAccount = {};
    /**
     *
     */
    this.gridOrders = [];
    this.marketTpSlOrders = [];
    this.strategyRsi = {
      state: RSI_STATE_STOPPED,
      active: ["ETHUSDT"],
      endpoints: {},
      rsiConfig: {},
      ticker: {},
    };
    //
    this.lastFetchTime = 0;
    this.cachedPositions = [];
    this.lastFetchTimeOpenOrders = 0;
    this.cachedOpenOrders = [];
  }

  rsiSetDefault(symbolList) {
    symbolList.forEach((symbol) => {
      this.strategyRsi.rsiConfig[symbol] = { symbol, ...Default_RSI };
    });
    this.strategyRsi.rsiConfig["DEFAULT"] = {
      symbol: "DEFAULT",
      ...Default_RSI,
    };
    // console.log("rsi ETHUSDT", rsiConfig["ETHUSDT"]);
  }

  //
  margin_call_update = (data) => {
    // console.log(`margin_call_update:data: ${JSON.stringify(data)}`);
  };
  /**const order_update = {
    "eventType": "ORDER_TRADE_UPDATE",
    "eventTime": 1682405730543,
    "transaction": 1682405730538,
    "order": {
      "symbol": "BTCUSDT",
      "clientOrderId": "web_YlXg2IV6aFCtKqpycczJ",
      "side": "SELL",
      "orderType": "LIMIT",
      "timeInForce": "GTC",
      "originalQuantity": "0.003",
      "originalPrice": "27564",
      "averagePrice": "27564",
      "stopPrice": "0",
      "executionType": "TRADE",
      "orderStatus": "FILLED",
      "orderId": 3330377731,
      "orderLastFilledQuantity": "0.003",
      "orderFilledAccumulatedQuantity": "0.003",
      "lastFilledPrice": "27564",
      "commissionAsset": "USDT",
      "commission": "0.01653840",
      "orderTradeTime": 1682405730538,
      "tradeId": 258113440,
      "bidsNotional": "0",
      "askNotional": "0",
      "isMakerSide": true,
      "isReduceOnly": false,
      "stopPriceWorkingType": "CONTRACT_PRICE",
      "originalOrderType": "LIMIT",
      "positionSide": "BOTH",
      "closeAll": false,
      "realizedProfit": "0"
    }
  };
 */
  order_update = (data) => {
    // console.log(
    //   `order_update: ${this.binaneApiName}:${JSON.stringify(data, null, 2)}`
    // );
    // update status for order
    // if status is filled, and its close order
    if (data.order.orderStatus === "FILLED" && data.order.isReduceOnly) {
      this.gridOrders.forEach((gridOrder) => {
        if (gridOrder.symbol === data.order.symbol) {
          this.processGridTradeComplete(gridOrder, data);
        }
      });
      this.marketTpSlOrders.forEach((order) => {
        if (
          order.symbol === position.symbol &&
          order.status === MARKET_STATUS_EXECUTING
        ) {
          order.status = MARKET_STATUS_DONE;
        }
      });
    }
  };
  subscribed_update = (data) => {
    // console.log(`subscribed_update:data: ${JSON.stringify(data)}`);
  };
  //
  account_update = (data) => {
    // console.log(dayjs().format("DD/MM HH:mm:ss"));
    // console.log(`account_update:data: ${JSON.stringify(data, null, 2)}`);
    const updatePositions = data.updateData.positions;
    console.log(
      `account_update: ${this.binaneApiName}:positions:${JSON.stringify(
        updatePositions,
        null,
        2
      )}`
    );
    updatePositions.forEach(async (position) => {
      // if this is not a close position
      if (Number(position.positionAmount) !== 0) {
        // console.log(
        //   "it come here:account_update:cancelCurrentTPSLOrders",
        //   position
        // );
        // cancel current TP/SL orders if avail.
        await this.cancelCurrentTPSLOrders(
          position.symbol,
          position.positionSide ? position.positionSide : "BOTH"
        );
      }
      // search if symbol of this position is in any grid order running
      // console.log("before this.gridOrders.find");
      const updateGridOrder = this.gridOrders.find(
        (gridOrder) =>
          gridOrder.symbol === position.symbol &&
          gridOrder.status === GRID_STATUS_EXECUTING
      );
      // console.log("come here!!!");
      // then cal. TP/SL if available to place order
      if (updateGridOrder) {
        // console.log("come here!!!updateGridOrder");
        updateGridOrder.position = position;
        //
        if (Number(updateGridOrder.position.positionAmount) === 0) {
          // change to process this in order update as close orders filled
        } else {
          setTimeout(
            this.processGridTPSLOrders,
            1250,
            position.positionAmount,
            updateGridOrder
          );
        }
      }
      // for market order with tp/sl
      // console.log("account_update:marketTpSlOrders", this.marketTpSlOrders);
      const marketTpSlOrder = this.marketTpSlOrders.find(
        (order) =>
          order.orgOrder.symbol === position.symbol &&
          order.status === MARKET_STATUS_EXECUTING
      );
      if (marketTpSlOrder) {
        // console.log("marketTpSlOrder", marketTpSlOrder);
        marketTpSlOrder.tryUpdate = "try-update";
        marketTpSlOrder.position = position;
        setTimeout(
          this.processMarketTPSLOrders,
          500,
          position.positionAmount,
          marketTpSlOrder
        );
        // this.processMarketTPSLOrders(marketTpSlOrder);
      }
    });
    // console.log("gridOrders", JSON.stringify(gridOrders, null, 2));
  };

  async start() {
    // TODO: load rsi from DB
    // console.log("TODO: load rsi from DB");
    // this.strategyRsi = await loadRsiStrategyFromDb();
    // if (Object.keys(this.strategyRsi.rsiConfig).length === 0) {
    //   this.rsiSetDefault(this.futuresSymbolList);
    // }

    this.binance.websockets.userFutureData(
      this.margin_call_update,
      this.account_update,
      this.order_update,
      this.subscribed_update
    );
  }

  timeFormat(time) {
    let date = new Date(time);
    // if (displayDate) {
    date = `${String(date.getDate()).padStart(2, "0")}, ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
      date.getSeconds()
    ).padStart(2, "0")}`;
    // } else {
    //   date = `${String(date.getHours()).padStart(2, "0")}:${String(
    //     date.getMinutes()
    //   ).padStart(2, "0")}`;
    // }
    return date;
  }
  calculateAmount = (inpAmount, minQty, minNotional, price, stepSize) => {
    let amount = inpAmount;
    // Set minimum order amount with minQty
    if (amount < minQty) amount = minQty;
    // Set minimum order amount with minNotional
    if (price * amount < minNotional) {
      amount = minNotional / price;
    }
    // console.log("calculateAmount", amount, stepSize);
    // Round to stepSize
    amount = this.binance.roundStep(amount, stepSize);
    return amount;
  };
  // "tickSize": "0.00100000",
  formatOrderPrice = (price, symbol) => {
    return this.binance.roundTicks(
      price,
      binanceMarketData.minimums[symbol].tickSize
    );
  };

  processGridTradeComplete = async (gridOrder, filledOrderData) => {
    // console.log(`processGridTradeComplete gridOrder`, gridOrder);
    // set not opened orders status to DONE to terminate the websocket
    gridOrder.levelOrders.forEach((levelOrder) => {
      levelOrder.executedStatus == ORDER_STATUS_DONE;
    });
    // cancel all current opened orders
    await this.binance.futuresCancelAll(gridOrder.symbol);
    // set grid status to DONE
    gridOrder.status = GRID_STATUS_DONE;
    // save to report-history
    // gridOrder.report ??= {};
    // gridOrder.report.closePositionOrders ??= [];
    gridOrder.report.closePositionOrders.push(filledOrderData);
    // console.log("processGridTradeComplete gridOrder", gridOrder);
    // process re-run this grid order
    const curNumRun = gridOrder.report.closePositionOrders.length;
    const curPnL = filledOrderData.order.realizedProfit;
    // check if last run is profitable, and also the number of run does not reach the times set
    if (
      curPnL > 0 &&
      gridOrder.orgOrder.repeatTime > 1 &&
      curNumRun < gridOrder.orgOrder.repeatTime
    ) {
      this.repeatGridOrderProcess(gridOrder);
    }
  };

  cancelCurrentTPSLOrders = async (symbol, positionSide) => {
    // console.log("cancelCurrentTPSLOrders");
    // fetch all open order of current symbol
    const symbOpenedOrders = await this.binance.futuresOpenOrders(symbol);
    // console.log("cancelCurrentTPSLOrders");
    if (_.isEmpty(symbOpenedOrders)) return;
    // console.log("cancelCurrentTPSLOrders:symbOpenedOrders", symbOpenedOrders);
    // cancel current TP/SL orders if avail.
    const openTpSlOrders = symbOpenedOrders.filter(
      (order) =>
        (order.type === "TAKE_PROFIT_MARKET" || order.type === "STOP_MARKET") &&
        order.positionSide === positionSide
    );
    console.log("cancelCurrentTPSLOrders", symbol, positionSide);
    // console.log("openTpSlOrders", openTpSlOrders);
    openTpSlOrders.length &&
      (await Promise.all(
        openTpSlOrders.map((order) => {
          console.log("binance.futuresCancel", order);
          return this.binance.futuresCancel(symbol, {
            orderId: order.orderId,
          });
        })
      ));
  };
  processGridTPSLOrders = async (curPositionAmt, gridOrder) => {
    if (curPositionAmt !== gridOrder.position.positionAmount) {
      console.log("processGridTPSLOrders:diff amount - not operate");
      return;
    }
    console.log("processGridTPSLOrders", gridOrder);
    const { orgOrder, position } = gridOrder;
    const { symbol, mode, leverage } = orgOrder;
    // position > 0 is Long (buy) -> TP/SL is reverved
    const sideTpSl = Number(position.positionAmount) > 0 ? SIDE_SELL : SIDE_BUY;
    const positionAmount = Math.abs(Number(position.positionAmount));
    const levelAvgPrice = Number(position.entryPrice);
    const positionSize = positionAmount * levelAvgPrice;
    // TP order
    const takeProfit = orgOrder.takeProfit;
    if (takeProfit.value.length) {
      // cencel current TP order if avail.
      const tpOrdResult = gridOrder.tpSlOrders.tpOrder?.result.data;
      if (gridOrder.tpSlOrders && gridOrder.tpSlOrders.tpOrder && tpOrdResult) {
        // console.log("futuresCancel tpOrderResult.orderId", tpOrdResult.orderId);
        await this.binance.futuresCancel(symbol, {
          orderId: tpOrdResult.orderId,
        });
      }
      // place new TP order
      // console.log("place new TP");
      const tpAmount = positionAmount;
      let tpPrice = takeProfit.value; // assume default type is $
      if (takeProfit.tpType === TYPE_PERCENT) {
        const tpPercent = Number(takeProfit.value);
        let tpProfit = ((positionSize / leverage) * tpPercent) / 100;
        if (takeProfit.percentType === TYPE_PERCENT_PRICE) {
          tpProfit = (positionSize * tpPercent) / 100;
        }
        let tpSize = 0;
        if (sideTpSl === SIDE_BUY) {
          tpSize = positionSize - tpProfit;
        } else {
          tpSize = positionSize + tpProfit;
        }
        tpPrice = tpSize / tpAmount;
      }
      //
      const formatPrice = this.formatOrderPrice(tpPrice, symbol);
      const tpOrder = {
        side: sideTpSl,
        type: TYPE_TAKE_PROFIT_MARKET,
        mode: mode.toUpperCase(),
        symbol: symbol,
        positionAmt: tpAmount,
        price: formatPrice,
        executedStatus: ORDER_STATUS_NEW,
        executedCount: 0,
      };
      const tpOrderResult = await this.submitTpSlOrder(
        tpOrder.side,
        tpOrder.type,
        tpOrder.symbol,
        tpOrder.positionAmt,
        tpOrder.price
      );
      tpOrder.result = { ...tpOrderResult };
      tpOrder.executedCount += 1;
      if (tpOrder.success) {
        tpOrder.executedStatus = ORDER_STATUS_DONE;
      }
      gridOrder.tpSlOrders.tpOrder = tpOrder;
      // console.log("gridOrder.tpSlOrders", gridOrder.tpSlOrders);
    }
    // SL order
    const stopLoss = orgOrder.stopLoss;
    if (stopLoss.value.length) {
      // cencel current TP order if avail.
      const slOrdResult = gridOrder.tpSlOrders.slOrder?.result.data;
      if (gridOrder.tpSlOrders && gridOrder.tpSlOrders.slOrder && slOrdResult) {
        // console.log(
        //   "futuresCancel slOrdResult.orderId",
        //   slOrdResult.orderId
        // );
        await this.binance.futuresCancel(symbol, {
          orderId: slOrdResult.orderId,
        });
      }
      // place new SL order
      const slAmount = positionAmount;
      let slPrice = stopLoss.value; // assume default type is $
      if (stopLoss.slType === TYPE_PERCENT) {
        const slPercent = Number(stopLoss.value);
        let slStopLoss = ((positionSize / leverage) * slPercent) / 100;
        if (stopLoss.percentType === TYPE_PERCENT_PRICE) {
          slStopLoss = (positionSize * slPercent) / 100;
        }
        let slSize = 0;
        if (sideTpSl === SIDE_BUY) {
          slSize = positionSize + slStopLoss;
        } else {
          slSize = positionSize - slStopLoss;
        }
        slPrice = slSize / slAmount;
      }
      //
      const formatPrice = this.formatOrderPrice(slPrice, symbol);
      const slOrder = {
        side: sideTpSl,
        type: TYPE_STOP_MARKET,
        mode: mode.toUpperCase(),
        symbol: symbol,
        positionAmt: slAmount,
        price: formatPrice,
        executedStatus: ORDER_STATUS_NEW,
        executedCount: 0,
      };
      const slOrderResult = await this.submitTpSlOrder(
        slOrder.side,
        slOrder.type,
        slOrder.symbol,
        slOrder.positionAmt,
        slOrder.price
        // "MARK_PRICE"
      );
      slOrder.result = { ...slOrderResult };
      slOrder.executedCount += 1;
      if (slOrder.success) {
        slOrder.executedStatus = ORDER_STATUS_DONE;
      }
      // if (slOrder.executedCount > EXECUTE_TIME_RETRY) {
      //   slOrder.executedStatus = ORDER_STATUS_DONE;
      // }
      gridOrder.tpSlOrders.slOrder = slOrder;
      // console.log("gridOrder.tpSlOrders", gridOrder.tpSlOrders);
    }
  };
  processMarketTPSLOrders = async (curPositionAmt, marketTpSlOrder) => {
    // console.log("it comes here processMarketTPSLOrders");
    if (curPositionAmt !== marketTpSlOrder.position.positionAmount) {
      console.log("processMarketTPSLOrders:diff amount - not operate");
      return;
    }
    const { orgOrder, position } = marketTpSlOrder;
    const {
      mode,
      symbol,
      leverage,
      tp: takeProfit,
      sl: stopLoss,
      tpslPercentType = TYPE_PERCENT_BALANCE,
    } = orgOrder;
    // console.log("processMarketTPSLOrders", marketTpSlOrder);

    // position > 0 is Long (buy) -> TP/SL is reverved
    const sideTpSl = Number(position.positionAmount) > 0 ? SIDE_SELL : SIDE_BUY;
    const positionAmount = Math.abs(Number(position.positionAmount));
    const levelAvgPrice = Number(position.entryPrice);
    const positionSize = positionAmount * levelAvgPrice;
    // TP * SL
    // console.log(tpPercent, slPercent);
    // TP order
    if (takeProfit.length) {
      // place new TP order
      const tpAmount = positionAmount;
      const tpPercent = Number(takeProfit);
      let tpProfit = ((positionSize / leverage) * tpPercent) / 100;
      if (tpslPercentType === TYPE_PERCENT_PRICE) {
        tpProfit = (positionSize * tpPercent) / 100;
      }
      let tpSize = 0;
      if (sideTpSl === SIDE_BUY) {
        tpSize = positionSize - tpProfit;
      } else {
        tpSize = positionSize + tpProfit;
      }
      const tpPrice = tpSize / tpAmount;
      const formatPrice = this.formatOrderPrice(tpPrice, symbol);
      // console.log("tpPrice", tpPrice, "formatPrice", formatPrice);
      const tpOrder = {
        side: sideTpSl,
        type: TYPE_TAKE_PROFIT_MARKET,
        mode: mode.toUpperCase(),
        symbol: symbol,
        positionAmt: tpAmount,
        price: formatPrice,
        executedStatus: ORDER_STATUS_NEW,
        executedCount: 0,
      };
      const tpOrderResult = await this.submitTpSlOrder(
        tpOrder.side,
        tpOrder.type,
        tpOrder.symbol,
        tpOrder.positionAmt,
        tpOrder.price
      );
      // console.log("tpOrderResult", tpOrderResult);
      tpOrder.result = { ...tpOrderResult };
      tpOrder.executedCount += 1;
      if (tpOrder.success) {
        tpOrder.executedStatus = ORDER_STATUS_DONE;
      }
      // if (tpOrder.executedCount > EXECUTE_TIME_RETRY) {
      //   tpOrder.executedStatus = ORDER_STATUS_DONE;
      // }
      marketTpSlOrder.tpSlOrders.tpOrder = tpOrder;
      // console.log("tp", marketTpSlOrder.tpSlOrders);
    }
    // SL order
    if (stopLoss.length) {
      // place new SL order
      const slAmount = positionAmount;
      const slPercent = Number(stopLoss);
      let slStopLoss = ((positionSize / leverage) * slPercent) / 100;
      if (tpslPercentType === TYPE_PERCENT_PRICE) {
        slStopLoss = (positionSize * slPercent) / 100;
      }
      let slSize = 0;
      if (sideTpSl === SIDE_BUY) {
        slSize = positionSize + slStopLoss;
      } else {
        slSize = positionSize - slStopLoss;
      }
      const slPrice = slSize / slAmount;
      const formatPrice = this.formatOrderPrice(slPrice, symbol);
      const slOrder = {
        side: sideTpSl,
        type: TYPE_STOP_MARKET,
        mode: mode.toUpperCase(),
        symbol: symbol,
        positionAmt: slAmount,
        price: formatPrice,
        executedStatus: ORDER_STATUS_NEW,
        executedCount: 0,
      };
      // console.log("slOrder", slOrder);
      // tpSlOrders.slOrder = slOrder;
      const slOrderResult = await this.submitTpSlOrder(
        slOrder.side,
        slOrder.type,
        slOrder.symbol,
        slOrder.positionAmt,
        slOrder.price
        // "MARK_PRICE"
      );
      slOrder.result = { ...slOrderResult };
      slOrder.executedCount += 1;
      if (slOrder.success) {
        slOrder.executedStatus = ORDER_STATUS_DONE;
      }
      // if (slOrder.executedCount > EXECUTE_TIME_RETRY) {
      //   slOrder.executedStatus = ORDER_STATUS_DONE;
      // }
      marketTpSlOrder.tpSlOrders.slOrder = slOrder;
      // console.log("sl", marketTpSlOrder.tpSlOrders);
    }
    //
    marketTpSlOrder.status = MARKET_STATUS_DONE;
  };
  /**workingType	ENUM	NO	stopPrice triggered by: "MARK_PRICE", "CONTRACT_PRICE". Default "CONTRACT_PRICE" */

  submitTpSlOrder = async (
    tpSlSide,
    tpSlType,
    symbol,
    positionAmt,
    tpSlPrice,
    workingType = "CONTRACT_PRICE"
  ) => {
    // tp order
    try {
      // console.log("submitting submitTpSlOrder");
      let positionSide = "BOTH";
      const posMode = await this.binance.futuresPositionSideDual();
      if (posMode && posMode.dualSidePosition === true) {
        positionSide = tpSlSide === SIDE_BUY ? "SHORT" : "LONG";
      }
      // console.log("submitTpSlOrder:positionSide", positionSide);

      const placeOrder = await this.binance.futuresOrder(
        tpSlSide,
        symbol,
        positionAmt,
        false,
        {
          positionSide,
          type: tpSlType,
          workingType: workingType, //"CONTRACT_PRICE",
          stopPrice: tpSlPrice,
          closePosition: true,
        }
      );
      // console.log("submitTpSlOrder:placeOrder", placeOrder);
      if (placeOrder.code) {
        throw placeOrder;
      }
      return { success: true, data: placeOrder };
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  fetchFuturesAssetsAndPositions = async (symbol) => {
    const account = await this.binance.futuresAccount();
    // console.log("position 0", account.positions[0]);
    const retSymbolInfo = account.positions.filter((symbolInfo) => {
      return symbolInfo.symbol === symbol;
    });
    // console.log(retSymbolInfo);

    return retSymbolInfo[0];
  };

  fetchFuturesAccount = async () => {
    try {
      const account = await this.binance.futuresAccount();
      const retAccount = [];
      const assets = [];
      account.assets.forEach((item) => {
        if (item.walletBalance > 0) {
          assets.push({
            asset: item.asset,
            balance: item.walletBalance,
            availableBalance: item.availableBalance,
          });
        }
      });
      account.assets = assets;
      account.positions = account.positions.filter(
        (position) => Number(position.positionAmt) != 0
      );
      // delete account.positons;

      retAccount.push(account);

      return retAccount;
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  fetchFuturesPositions = async () => {
    try {
      const currentTime = Date.now();
      if (currentTime - this.lastFetchTime < POSITIONS_CACHED_TIME) {
        return this.cachedPositions;
      }

      const positions = [];
      const resp = await this.binance.futuresPositionRisk();
      const prices = binanceMarketData.getLastPrices();

      resp.forEach((contract) => {
        if (contract.positionAmt != 0) {
          const symbolPrice = Object.entries(prices).filter(
            (entry) => entry[0] === contract.symbol
          );
          contract.lastPrice = symbolPrice[0][1];
          let tolerance =
            contract.positionAmt * (contract.lastPrice - contract.entryPrice);
          contract.unRealizedProfit = tolerance;
          contract.pricePrecision =
            binanceMarketData.minimums[contract.symbol].tickSize.indexOf("1") -
              1 || 0;
          positions.push(contract);
        }
      });

      this.lastFetchTime = currentTime;
      this.cachedPositions = positions;

      return positions;
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  fetchFuturesBalance = async () => {
    try {
      const retBalance = [];
      const balances = await this.binance.futuresBalance();
      // console.log(balances);
      balances &&
        balances.forEach((symbol) => {
          if (symbol.balance > 0) {
            retBalance.push({
              asset: symbol.asset,
              balance: symbol.balance,
              availableBalance: symbol.availableBalance,
            });
          }
        });
      return retBalance;
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  /**{
    "avgPrice": "0.00000",              
    "clientOrderId": "abc",             
    "cumQuote": "0",                        
    "executedQty": "0",                 
    "orderId": 1917641,                 
    "origQty": "0.40",                      
    "origType": "TRAILING_STOP_MARKET",
    "price": "0",
    "reduceOnly": false,
    "side": "BUY",
    "positionSide": "SHORT",
    "status": "NEW",
    "stopPrice": "9300",                // please ignore when order type is TRAILING_STOP_MARKET
    "closePosition": false,             // if Close-All
    "symbol": "BTCUSDT",
    "time": 1579276756075,              // order time
    "timeInForce": "GTC",
    "type": "TRAILING_STOP_MARKET",
    "activatePrice": "9020",            // activation price, only return with TRAILING_STOP_MARKET order
    "priceRate": "0.3",                 // callback rate, only return with TRAILING_STOP_MARKET order                       
    "updateTime": 1579276756075,        
    "workingType": "CONTRACT_PRICE",
    "priceProtect": false,            // if conditional order trigger is protected
    "priceMatch": "NONE",              //price match mode
    "selfTradePreventionMode": "NONE", //self trading preventation mode
    "goodTillDate": 0      //order pre-set auot cancel time for TIF GTD order           
} */
  fetchFuturesOpenOrders = async () => {
    try {
      const currentTime = Date.now();
      if (currentTime - this.lastFetchTimeOpenOrders < ORDERS_CACHED_TIME) {
        return this.cachedOpenOrders;
      }

      const retOrders = [];
      const openOrders = await this.binance.futuresOpenOrders();
      openOrders.forEach((order) => {
        order.pricePrecision =
          binanceMarketData.minimums[order.symbol].tickSize.indexOf("1") - 1 ||
          0;
        retOrders.push(order);
      });

      this.lastFetchTimeOpenOrders = currentTime;
      this.cachedOpenOrders = retOrders;

      return retOrders;
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  fetchFuturesAccountSymbolInfo = async (symbol) => {
    try {
      // console.log("fetchFuturesAccountSymbolInfo");
      const account = await this.binance.futuresAccount();
      // console.log("position 0", account.positions[0]);
      const retSymbolInfo = account.positions.filter((symbolInfo) => {
        return symbolInfo.symbol === symbol;
      });
      const { minQty, minNotional, stepSize } =
        binanceMarketData.minimums[symbol];
      const restInfo = { minQty, minNotional, stepSize, ...retSymbolInfo[0] };
      // console.log(restInfo);

      return restInfo;
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  futuresFetchMarketinfo = async (symbol) => {
    // const markPrice = await this.binance.futuresMarkPrice(symbol);
    const markPrice = binanceMarketData.getMarkPrice(symbol);
    const symbolInfo = { ...markPrice };
    // const prices = await this.binance.futuresPrices();
    // const symbolPrice = Object.entries(prices).filter(
    //   (entry) => entry[0] === symbol
    // );
    // symbolInfo.lastPrice = symbolPrice[0][1];
    symbolInfo.lastPrice = binanceMarketData.getLastPrice(symbol);
    symbolInfo.pricePrecision =
      binanceMarketData.minimums[symbol].tickSize.indexOf("1") - 1 || 0;
    return symbolInfo;
  };
  /* TODO: hedge mode - ref https://github.com/jaggedsoft/node-binance-api/issues/842
to open long
await binance.futuresMarketBuy("BTCUSDT", 0.100, {workingType: "MARK_PRICE"});
to close long
await binance.futuresMarketSell("BTCUSDT", 0.100, {positionSide: "LONG", workingType: "MARK_PRICE"});

to open short
await binance.futuresMarketSell("BTCUSDT", 0.100, {workingType: "MARK_PRICE"});
to close short
await binance.futuresMarketBuy("BTCUSDT", -0.100, {positionSide: "SHORT", workingType: "MARK_PRICE"});
*/
  futuresPlaceOrderWithTPSL = async (order) => {
    const {
      side,
      type,
      mode,
      symbol,
      positionAmt,
      leverage,
      tp,
      sl,
      symbolInfo,
    } = order;
    let price = order.price;
    const marketTpSlOrder = {};
    marketTpSlOrder.id = crypto.randomBytes(16).toString("hex");
    marketTpSlOrder.symbol = symbol;
    marketTpSlOrder.status = MARKET_STATUS_NEW;
    marketTpSlOrder.orgOrder = order;
    marketTpSlOrder.tpSlOrders = {};
    this.marketTpSlOrders.push(marketTpSlOrder);

    try {
      marketTpSlOrder.status = MARKET_STATUS_EXECUTING;
      marketTpSlOrder.marketOrder = { side, symbol, positionAmt };
      //
      let positionSide = "BOTH";
      const posMode = await this.binance.futuresPositionSideDual();
      if (posMode && posMode.dualSidePosition === true) {
        positionSide = side === SIDE_BUY ? "LONG" : "SHORT";
      }

      const placeOrder = await this.binance.futuresOrder(
        side,
        symbol,
        positionAmt,
        false,
        {
          positionSide,
        }
      );
      // console.log("futuresPlaceOrderWithTPSL:placeOrder", placeOrder);
      marketTpSlOrder.marketOrder.result = { ...placeOrder };
      if (placeOrder.code) {
        throw placeOrder;
      }
      return { success: true, data: placeOrder };
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  async submitBuySell({ symbol, side, type, positionAmt, price, option = {} }) {
    let placeOrder = "";
    // console.log("submitBuySell", {
    //   symbol,
    //   side,
    //   type,
    //   positionAmt,
    //   price,
    //   option,
    // });
    //
    let positionSide = "BOTH";
    const posMode = await this.binance.futuresPositionSideDual();
    if (posMode && posMode.dualSidePosition === true) {
      positionSide = side === SIDE_BUY ? "LONG" : "SHORT";
      option.positionSide = positionSide;
    }

    if (side === SIDE_BUY) {
      if (type === TYPE_MARKET) {
        placeOrder = await this.binance.futuresMarketBuy(
          symbol,
          positionAmt,
          option
        );
      } else {
        placeOrder = await this.binance.futuresBuy(
          symbol,
          positionAmt,
          price,
          option
        );
      }
    } else if (side === SIDE_SELL) {
      if (type === TYPE_MARKET) {
        placeOrder = await this.binance.futuresMarketSell(
          symbol,
          positionAmt,
          option
        );
      } else {
        placeOrder = await this.binance.futuresSell(
          symbol,
          positionAmt,
          price,
          option
        );
      }
    }
    console.log("submitBuySell", placeOrder);
    return placeOrder;
  }

  futuresPlaceOrder = async (order) => {
    const {
      side,
      type,
      mode,
      symbol,
      positionAmt,
      leverage,
      tp,
      sl,
      symbolInfo,
    } = order;
    let price = order.price;
    try {
      // console.log("futuresPlaceOrder", order);
      if (type === TYPE_LIMIT && price === 0) {
        throw { msg: "price should be different to 0" };
      }
      // change mode if
      if (
        (mode === MODE_ISOLATED && !symbolInfo.isolated) ||
        (mode === MODE_CROSSED && symbolInfo.isolated)
      ) {
        await this.binance.futuresMarginType(symbol, mode);
      }
      // change leverage if
      if (symbolInfo.leverage !== leverage) {
        await this.binance.futuresLeverage(symbol, leverage);
      }
      if (type === TYPE_MARKET && (order.tp.length || order.sl.length)) {
        return await this.futuresPlaceOrderWithTPSL(order);
      } else {
        // console.log("futuresPlaceOrder", {
        //   symbol,
        //   side,
        //   type,
        //   positionAmt,
        //   price,
        // });
        const placeOrder = await this.submitBuySell({
          symbol,
          side,
          type,
          positionAmt,
          price,
        });
        if (placeOrder.code) {
          throw placeOrder;
        }

        return { success: true, data: placeOrder };
      }
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };

  futuresPlaceNewOrder = async (request) => {
    const {
      symbol,
      mode,
      side,
      leverage,
      type,
      amount,
      price,
      tp,
      sl,
      tpslPercentType = TYPE_PERCENT_BALANCE,
    } = request;
    // console.log("futuresPlaceNewOrder", request);
    let order = {
      side: side.toUpperCase() === "SHORT" ? SIDE_SELL : SIDE_BUY,
      type: type.toUpperCase(),
      mode: mode.toUpperCase(),
      symbol: symbol,
      leverage: leverage,
      tp: tp,
      sl: sl,
      tpslPercentType,
    };
    const symbolInfo = await this.fetchFuturesAccountSymbolInfo(symbol);
    let orderPrice = price;
    if (order.type === TYPE_MARKET) {
      const inSymbolinfo = await this.futuresFetchMarketinfo(symbol);
      orderPrice = Number(inSymbolinfo.lastPrice);
    }
    let pstAmt = amount / orderPrice;
    const { minQty, minNotional, stepSize } = symbolInfo;
    let positionAmt = this.calculateAmount(
      pstAmt,
      minQty,
      minNotional,
      orderPrice,
      stepSize
    );
    order.price = orderPrice;
    order.positionAmt = positionAmt;
    order.symbolInfo = symbolInfo;

    return await this.futuresPlaceOrder(order);
  };

  async futuresClosePosition(position, type, price = 0) {
    let placeOrder = "";
    try {
      // console.log("futuresClosePosition", position, type, price);
      const symbol = position.symbol;
      // cancle all current grids of this symbol
      this.gridOrders.forEach((gridOrder) => {
        if (gridOrder.symbol === position.symbol) {
          if (gridOrder?.endpoint) {
            this.binance.futuresTerminate(gridOrder.endpoint);
          }
          gridOrder.status = GRID_STATUS_DONE;
        }
      });
      //
      const closeType = type.toUpperCase();
      if (closeType === TYPE_LIMIT && price === 0) {
        throw "price should be different to 0";
      }
      let positionAmt = Number(position.positionAmt);
      const limitClosePrice = this.formatOrderPrice(price, symbol);
      // hedge mode
      let positionSide = "BOTH";
      const posMode = await this.binance.futuresPositionSideDual();
      if (posMode && posMode.dualSidePosition === true) {
        if (positionAmt < 0) {
          positionSide = "SHORT";
        } else {
          positionSide = "LONG";
        }
        console.log(
          "closePosition:hedgemode",
          "positionAmt",
          positionAmt,
          "closeType",
          closeType
        );
        if (closeType === TYPE_MARKET) {
          if (positionAmt < 0) {
            placeOrder = await this.binance.futuresMarketBuy(
              symbol,
              Math.abs(positionAmt),
              {
                positionSide,
              }
            );
          } else {
            placeOrder = await this.binance.futuresMarketSell(
              symbol,
              Math.abs(positionAmt),
              {
                positionSide,
              }
            );
          }
        } else {
          if (positionAmt < 0) {
            placeOrder = await this.binance.futuresBuy(
              symbol,
              Math.abs(positionAmt),
              limitClosePrice,
              {
                positionSide,
              }
            );
          } else {
            placeOrder = await this.binance.futuresSell(
              symbol,
              Math.abs(positionAmt),
              limitClosePrice,
              {
                positionSide,
              }
            );
          }
        }
      } else {
        const side = positionAmt < 0 ? SIDE_BUY : SIDE_SELL;
        positionAmt = Math.abs(positionAmt);
        const limitCloseOption = {
          placeType: "position",
          reduceOnly: true,
          timeInForce: "GTC",
        };
        if (side === SIDE_BUY) {
          if (closeType === TYPE_MARKET) {
            placeOrder = await this.binance.futuresMarketBuy(
              symbol,
              positionAmt,
              {
                placeType: "position",
                reduceOnly: true,
              }
            );
          } else {
            placeOrder = await this.binance.futuresBuy(
              symbol,
              positionAmt,
              limitClosePrice,
              limitCloseOption
            );
          }
        } else if (side === SIDE_SELL) {
          if (closeType === TYPE_MARKET) {
            placeOrder = await this.binance.futuresMarketSell(
              symbol,
              positionAmt,
              {
                placeType: "position",
                reduceOnly: true,
              }
            );
          } else {
            placeOrder = await this.binance.futuresSell(
              symbol,
              positionAmt,
              limitClosePrice,
              limitCloseOption
            );
          }
        }
      }
      // console.log("closePosition:placeOrder", placeOrder);
      if (placeOrder.code) {
        throw placeOrder;
      } else {
        // cancel related orders
        console.log("closePos:cancelCurrentTPSLOrders", position, positionSide);
        if (closeType === TYPE_MARKET) {
          if (posMode && posMode.dualSidePosition === true) {
            await this.cancelCurrentTPSLOrders(position.symbol, positionSide);
          } else {
            await this.binance.futuresCancelAll(symbol);
          }
        }
      }

      return { success: true, data: placeOrder };
    } catch (err) {
      return { success: false, message: err.msg };
    }
  }

  async futuresClearPositions() {
    let placeOrders = [];
    try {
      const positions = await this.fetchFuturesPositions();
      positions.map(async (position) => {
        const placeOrder = await this.futuresClosePosition(
          position,
          TYPE_MARKET
        );
        placeOrders.push(placeOrder);
      });

      return { success: true, data: placeOrders };
    } catch (err) {
      return { success: false, message: err.msg };
    }
  }

  // async futuresFetchMarketinfo(symbol) {
  //   // const markPrice = await this.binance.futuresMarkPrice(symbol);
  //   const markPrice = binanceMarketData.getMarkPrice(symbol);
  //   const symbolInfo = { ...markPrice };
  //   // const prices = await this.binance.futuresPrices();
  //   // const symbolPrice = Object.entries(prices).filter(
  //   //   (entry) => entry[0] === symbol
  //   // );
  //   // symbolInfo.lastPrice = symbolPrice[0][1];
  //   symbolInfo.lastPrice = binanceMarketData.getLastPrice(symbol);
  //   symbolInfo.pricePrecision =
  //     binanceMarketData.minimums[symbol].tickSize.indexOf("1") - 1 || 0;
  //   // console.log("futuresFetchMarketinfo", symbol, symbolInfo);
  //   return symbolInfo;
  // }

  // Processing functions
  shouldPlaceLimitOrder = (side, price, curPrice) => {
    if (
      (side === SIDE_BUY && price <= curPrice) ||
      (side === SIDE_SELL && price >= curPrice)
    ) {
      return true;
    }
    return false;
  };
  anyRemainLevelsOrders = (gridOrder) => {
    if (
      gridOrder.levelOrders.filter(
        (order) => order.executedStatus !== ORDER_STATUS_DONE
      ).length === 0
    ) {
      return false;
    }
    return true;
  };
  processLevelOrder = async (levelOrder, price, leverage, symbolInfo) => {
    if (
      (levelOrder.executedStatus === ORDER_STATUS_NEW ||
        levelOrder.executedStatus === ORDER_STATUS_EXECUTING) &&
      this.shouldPlaceLimitOrder(levelOrder.side, levelOrder.price, price)
    ) {
      console.log("submit level order", levelOrder.price);
      const order = { ...levelOrder };
      order.leverage = leverage;
      order.symbolInfo = symbolInfo;
      // console.log("level limit order", order);
      // console.log(await this.binance.futuresPrices(symbolInfo.symbol));
      const levelOrderResult = await this.futuresPlaceOrder(order);
      console.log("submit level order result", levelOrderResult);
      levelOrder.result = { ...levelOrderResult };
      levelOrder.executedCount += 1;
      levelOrder.executedStatus = ORDER_STATUS_EXECUTING;
      if (levelOrderResult.success) {
        levelOrder.executedStatus = ORDER_STATUS_DONE;
      }
      if (levelOrder.executedCount > EXECUTE_TIME_RETRY) {
        levelOrder.executedStatus = ORDER_STATUS_DONE;
      }
      // console.log("executed order", levelOrder);
    }

    return levelOrder;
  };

  // Levels
  processGridLevelOrders = async (levelOrders, price, leverage, symbolInfo) => {
    return await Promise.all(
      levelOrders.map((levelOrder) =>
        this.processLevelOrder(levelOrder, price, leverage, symbolInfo)
      )
    ).then((orders) => orders);
  };

  /* markPriceInfo {
    eventType: 'markPriceUpdate',
    eventTime: 1684855216000,
    symbol: 'ETHUSDT',
    markPrice: '1855.23147471',
    indexPrice: '1855.21611765',
    fundingRate: '0.00375000',
    fundingTime: 1684857600000
  }*/
  processLevelOrderWebSocket = async (markPriceInfo) => {
    console.log(
      "processLevelOrderWebSocket markPrice",
      markPriceInfo.markPrice
    );
    const symbol = markPriceInfo.symbol;
    // console.log(this.gridOrders);
    // search if symbol of this websocket is in any grid order running
    const updateGridOrder = this.gridOrders.find(
      (gridOrder) =>
        gridOrder.symbol === symbol &&
        gridOrder.status === GRID_STATUS_EXECUTING
    );
    // then cal. to place order
    if (updateGridOrder) {
      const gridOrder = updateGridOrder;
      // console.log(symbol, ":", markPriceInfo.markPrice);
      const leverage = gridOrder.orgOrder.leverage;
      const symbolInfo = await this.fetchFuturesAccountSymbolInfo(symbol);
      const lastPrice = await this.binance.futuresPrices(symbol);
      // console.log(lastPrice);
      // console.log(symbol, "last price:", lastPrice[symbol]);
      gridOrder.levelOrders = await this.processGridLevelOrders(
        gridOrder.levelOrders,
        lastPrice[symbol], //markPriceInfo.markPrice
        leverage,
        symbolInfo
      );
      // console.log("this.gridOrders", this.gridOrders);
      // close stream if not need to process the grid any more
      if (!this.anyRemainLevelsOrders(gridOrder)) {
        console.log("terminate endpoint", gridOrder.endpoint);
        const endpoint = gridOrder.endpoint;
        this.binance.futuresTerminate(endpoint);
      }
    }
  };

  repeatGridOrderProcess = async (gridOrder) => {
    console.log(
      "repeatGridOrderProcess",
      gridOrder.symbol,
      "count",
      gridOrder.report.closePositionOrders.length + 1
    );
    const {
      symbol,
      mode,
      leverage,
      direction,
      maxBalance,
      levels,
      takeProfit,
      stopLoss,
    } = gridOrder.orgOrder;
    const symbolInfo = await this.fetchFuturesAccountSymbolInfo(symbol);
    //  * 2. check and place first orders -> update the grid order structure data
    const symbinfo = await this.futuresFetchMarketinfo(symbol);
    // const markPrice = Number(symbinfo.markPrice);
    const lastPrice = Number(symbinfo.lastPrice);
    gridOrder.status = GRID_STATUS_EXECUTING;
    // restart level orders
    gridOrder.levelOrders.forEach((levelOrder) => {
      levelOrder.executedStatus = ORDER_STATUS_NEW;
      levelOrder.executedCount = 0;
    });
    gridOrder.levelOrders = await this.processGridLevelOrders(
      gridOrder.levelOrders,
      lastPrice,
      leverage,
      symbolInfo
    );
    // reset tpSlOrders
    gridOrder.tpSlOrders = {};
    // console.log("manual order", "gridOrder.levelOrders", gridOrder.levelOrders);
    //  * 3. save the grid order to database
    // this.gridOrders.push(gridOrder);
    // console.log("gridOrders", this.gridOrders);
    // TODO: save gridOrders to database
    //  * 4. observe price (mark price) and execute more orders for the grid order in websocket update events
    if (this.anyRemainLevelsOrders(gridOrder)) {
      const endpoint = this.binance.futuresMarkPriceStream(
        symbol,
        this.processLevelOrderWebSocket
      );
      gridOrder.endpoint = endpoint;
      // console.log(symbol, "gridOrder.endpoint", gridOrder.endpoint);
      // console.log("gridOrders", this.gridOrders);
    }
  };

  async futuresPlaceMultiLevelOrder(order) {
    try {
      const {
        symbol,
        mode,
        leverage,
        direction,
        maxBalance,
        sizeUnit,
        levels,
        takeProfit,
        stopLoss,
        repeatTime = 1,
      } = order;
      console.log("futuresPlaceMultiLevelOrder: order", order);
      // cancel current grid of the symbol
      this.gridOrders.forEach((gridOrder) => {
        if (
          gridOrder.symbol === symbol &&
          gridOrder.status === GRID_STATUS_EXECUTING
        ) {
          gridOrder.status = GRDID_STATUS_CANCELED;
        }
      });
      const side =
        direction.toUpperCase() === DIRECTION_LONG ? SIDE_BUY : SIDE_SELL;
      // mode and leverage
      const symbolInfo = await this.fetchFuturesAccountSymbolInfo(symbol);
      //  * 1. create a grid order structure data: id, status, orgOrder, orders
      const gridOrder = {};
      gridOrder.id = crypto.randomBytes(16).toString("hex");
      gridOrder.symbol = symbol;
      gridOrder.status = GRID_STATUS_NEW;
      gridOrder.orgOrder = { ...order };
      gridOrder.report = {};
      gridOrder.report.closePositionOrders = [];

      // levels' order
      let levelOrders = [];
      // let totalSize = 0;
      levels.map((level) => {
        const price = level[0];
        const { minQty, minNotional, stepSize } = symbolInfo;
        let positionAmt = 0;
        if (sizeUnit === SIZE_UNIT_USD) {
          positionAmt = level[1] / price;
        } else {
          positionAmt = level[2];
        }
        // console.log("positionAmt before cal", positionAmt);
        positionAmt = this.calculateAmount(
          positionAmt,
          minQty,
          minNotional,
          price,
          stepSize
        );
        // console.log("positionAmt after cal", positionAmt);
        // const size = positionAmt * price;
        // totalSize += positionAmt * price;
        const formatPrice = this.formatOrderPrice(price, symbol);
        const order = {
          side: side,
          type: TYPE_LIMIT,
          mode: mode.toUpperCase(),
          symbol: symbol,
          positionAmt: positionAmt,
          price: formatPrice,
          executedStatus: ORDER_STATUS_NEW,
          executedCount: 0,
        };
        levelOrders.push(order);
      });
      //  * 2. check and place first orders -> update the grid order structure data
      const symbinfo = await this.futuresFetchMarketinfo(symbol);
      const markPrice = Number(symbinfo.markPrice);
      const lastPrice = Number(symbinfo.lastPrice);
      gridOrder.status = GRID_STATUS_EXECUTING;
      gridOrder.levelOrders = levelOrders;
      gridOrder.levelOrders = await this.processGridLevelOrders(
        gridOrder.levelOrders,
        lastPrice,
        leverage,
        symbolInfo
      );
      gridOrder.tpSlOrders = {};
      // console.log("manual order", "gridOrder.levelOrders", gridOrder.levelOrders);
      //  * 3. save the grid order to database
      this.gridOrders.push(gridOrder);
      // console.log("gridOrders", this.gridOrders);
      // TODO: save gridOrders to database
      //  * 4. observe price (mark price) and execute more orders for the grid order in websocket update events
      if (this.anyRemainLevelsOrders(gridOrder)) {
        const endpoint = this.binance.futuresMarkPriceStream(
          symbol,
          this.processLevelOrderWebSocket
        );
        gridOrder.endpoint = endpoint;
        // console.log(symbol, "gridOrder.endpoint", gridOrder.endpoint);
        // console.log("gridOrders", this.gridOrders);
      }

      return { success: true, message: "OK", data: "OK" };
    } catch (err) {
      // console.log(err);
      return { success: false, message: err.msg };
    }
  }

  /**
   * start analysing: RSI, BB,...
   * Steps:
   *  1. Load 500 data via binance.websockets.chart?
   *  2. Observe data via websocket binance.websockets.candlesticks?
   *  3. Notify users whenever it reaches trigger conditions
   */
  async futuresRsiConfig(direction, config = null) {
    try {
      // console.log("futuresRsiConfig(direction, config)", direction, config);
      const rsiConfig = this.strategyRsi.rsiConfig;
      if (direction === "SET") {
        Object.keys(config).forEach((key) => {
          rsiConfig[key] = config[key];
        });
      }
      // console.log("rsiConfig BTCUSDT", rsiConfig["BTCUSDT"]);

      return { success: true, message: "OK", data: rsiConfig };
    } catch (err) {
      // console.log(err);
      return { success: false, message: err.msg };
    }
  }

  /**<pair>_<contractType>@continuousKline_<interval>
 * Contract type:
perpetual
current_quarter
next_quarter
{
  "e":"continuous_kline",   // Event type
  "E":1607443058651,        // Event time
  "ps":"BTCUSDT",           // Pair
  "ct":"PERPETUAL"          // Contract type
  "k":{
    "t":1607443020000,      // Kline start time
    "T":1607443079999,      // Kline close time
    "i":"1m",               // Interval
    "f":116467658886,       // First trade ID
    "L":116468012423,       // Last trade ID
    "o":"18787.00",         // Open price
    "c":"18804.04",         // Close price
    "h":"18804.04",         // High price
    "l":"18786.54",         // Low price
    "v":"197.664",          // volume
    "n": 543,               // Number of trades
    "x":false,              // Is this kline closed?
    "q":"3715253.19494",    // Quote asset volume
    "V":"184.769",          // Taker buy volume
    "Q":"3472925.84746",    //Taker buy quote asset volume
    "B":"0"                 // Ignore
  }
}
 */
  /**
 * [Object: null prototype] {
  e: 'continuous_kline',
  E: 1683780156555,
  ps: 'ETHUSDT',
  ct: 'PERPETUAL',
  k: [Object: null prototype] {
    t: 1683777600000,
    T: 1683781199999,
    i: '1h',
    f: 31676374588,
    L: 31677132873,
    o: '1860.71',
    c: '1860.71',
    h: '1862.05',
    l: '1860.71',
    v: '793.673',
    n: 515,
    x: false,
    q: '1476971.24679',
    V: '399.182',
    Q: '742886.99612',
    B: '0'
  }
}
 */

  futuresRsiStart = () => {
    // Subscribe to trades endpoint for active markets
    this.strategyRsi.active.forEach((symbol) => {
      // console.log(symbol);
      const timeframes = this.strategyRsi.rsiConfig[symbol].timeframe;
      // console.log(this.strategyRsi.rsiConfig[symbol]);
      this.strategyRsi.endpoints[symbol] = [];
      timeframes.forEach((timeframe) => {
        const ep = `${symbol.toLowerCase()}_perpetual@continuousKline_${timeframe}`;
        this.strategyRsi.endpoints[symbol].push(ep);
        this.binance.futuresSubscribe(ep, (data) => {
          // console.log(symbol, data.k.i, "at", this.timeFormat(data.E));
        });
      });
    });
    // console.log(this.strategyRsi.endpoints);
  };

  async futuresRsiState(direction, state) {
    try {
      if (direction === "SET") {
        if (state === RSI_CMD_START) {
          this.futuresRsiStart();
          this.strategyRsi.state = RSI_STATE_RUNNING;
        } else if (state === RSI_CMD_STOP) {
          // close web socket
          Object.values(this.strategyRsi.endpoints).forEach((epArr) => {
            // console.log("close endpoint", epArr);
            epArr.forEach((endpoint) =>
              this.binance.futuresTerminate(endpoint)
            );
          });
          this.strategyRsi.state = RSI_STATE_STOPPED;
        }
      }

      return {
        success: true,
        message: `RSI State: ${this.strategyRsi.state}`,
        data: this.strategyRsi.state,
      };
    } catch (err) {
      // console.log(err);
      return { success: false, message: err.msg };
    }
  }
}
