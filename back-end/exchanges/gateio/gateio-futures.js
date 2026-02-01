// REST api
import GateApi, {
  FuturesInitialOrder,
  FuturesPriceTrigger,
  FuturesPriceTriggeredOrder,
} from "gate-api";
import _ from "lodash";
import GateWebSocketApp from "./gateio-futures-ws.js";
import crypto from "crypto";

const opts = {
  contract: "BTC_USDT", // string | Futures contract, return related data only if specified
};
/**
 * Contract {
  name: 'BTC_USDT',
  type: 'direct',
  quantoMultiplier: '0.0001',
  leverageMin: '1',
  leverageMax: '125',
  maintenanceRate: '0.004',
  markType: 'index',
  markPrice: '67572.54',
  indexPrice: '67571.26',
  lastPrice: '67913.4',
  makerFeeRate: '-0.000152',
  takerFeeRate: '0.00075',
  orderPriceRound: '0.1',
  markPriceRound: '0.01',
  fundingRate: '0.0001',
  fundingInterval: 28800,
  fundingNextApply: 1709654400,
  riskLimitBase: '1000000',
  riskLimitStep: '1000000',
  riskLimitMax: '30000000',
  orderSizeMin: 1,
  orderSizeMax: 10000000,
  orderPriceDeviate: '0.2',
  refDiscountRate: '0',
  refRebateRate: '0.2',
  orderbookId: 456138353,
  tradeId: 19375744,
  tradeSize: 16861230381,
  positionSize: 72094953,
  configChangeTime: 1705031210,
  inDelisting: false,
  ordersLimit: 200,
  enableBonus: true,
  enableCredit: true,
  createTime: 0,
  fundingCapRatio: '0.75'
}
 * Contract {
      name: 'SHIB_USDT',
      type: 'direct',
      quantoMultiplier: '10000', // minimum order amount (size=1 - orderSizeMin)
      leverageMin: '1',
      leverageMax: '20',
      maintenanceRate: '0.025',
      markType: 'index',
      markPrice: '0.00004093',
      indexPrice: '0.000040928',
      lastPrice: '0.00004114',
      makerFeeRate: '-0.000152',
      takerFeeRate: '0.00075',
      orderPriceRound: '0.000000001',
      markPriceRound: '0.000000001',
      fundingRate: '0.0001',
      fundingInterval: 28800,
      fundingNextApply: 1709654400,
      riskLimitBase: '500000',
      riskLimitStep: '500000',
      riskLimitMax: '5000000',
      orderSizeMin: 1,
      orderSizeMax: 10000000,
      orderPriceDeviate: '0.5',
      refDiscountRate: '0',
      refRebateRate: '0.2',
      orderbookId: 253116989,
      tradeId: 2806352,
      tradeSize: 2245264194,
      positionSize: 3478526,
      configChangeTime: 1705031210,
      inDelisting: false,
      ordersLimit: 200,
      enableBonus: true,
      enableCredit: true,
      createTime: 0,
      fundingCapRatio: '0.75'
    },
 */
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
const DIRECTION_BOTH = "BOTH";
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
const POSITIONS_CACHED_TIME = 3500;
const ORDERS_CACHED_TIME = 3500;

export default class GateIOFutures {
  constructor(isTestnet, apiName, apiKey, secret) {
    console.log("GateIOFutures", "isTestnet", isTestnet, "apiName", apiName);
    this.client = new GateApi.ApiClient();
    if (isTestnet) {
      this.client.basePath = "https://fx-api-testnet.gateio.ws/api/v4";
    }
    this.client.setApiKeySecret(apiKey, secret);
    this.futuresApi = new GateApi.FuturesApi(this.client);
    this.settle = "usdt"; // 'btc' | 'usdt' | 'usd' | Settle currency
    // this.futuresApi
    //   .listFuturesContracts(this.settle)
    //   .then((resp) => console.log(resp));
    this.futuresWs = new GateWebSocketApp(
      isTestnet,
      apiKey,
      secret,
      this.websocket_update
    );
    this.futuresApiName = apiName;
    this.futureAccount = {};
    this.futuresContracts = [];
    this.futuresSymbolList = [];
    /**
     *
     */
    this.gridOrders = [];
    this.marketTpSlOrders = [];
    // this.strategyRsi = {
    //   state: RSI_STATE_STOPPED,
    //   active: ["ETHUSDT"],
    //   endpoints: {},
    //   rsiConfig: {},
    //   ticker: {},
    // };
    //
    this.lastFetchTime = 0;
    this.cachedPositions = [];
    this.lastFetchTimeOpenOrders = 0;
    this.cachedOpenOrders = [];
    this.lastFetchTimePriceTriggerOrders = 0;
    this.cachedPriceTriggerOrders = [];
  }
  async start() {
    console.log("gateio:start");
    await this.fetchFuturesSymbol();
    setInterval(this.updateContractsFromServer, 5 * 60 * 1000); //update contracts info every 5min
    this.futureAccount = await this.fetchFuturesAccount();
  }
  isThisPosForOrder = (position, order) => {
    const { marketOrder, orgOrder } = order;
    const orgOrderSide = orgOrder.side.toUpperCase();
    const side =
      orgOrderSide === DIRECTION_BOTH
        ? marketOrder.size > 0
          ? DIRECTION_LONG
          : DIRECTION_SHORT
        : orgOrderSide;

    if (
      marketOrder.size === position.size &&
      (side === DIRECTION_LONG) === this.isPositionSideLong(position)
    ) {
      return true;
    }
    return false;
  };

  isSideLong = (side) => {
    return side === DIRECTION_LONG;
  };
  isPositionSideLong = (position) => {
    return (
      position.mode === "dual_long" ||
      (position.mode === "single" && position.size > 0)
    );
  };
  //
  websocket_update = (data) => {
    console.log("gateio:ws:update", this.futuresApiName);
    // orders update
    if (data.channel === "futures.orders") {
      const orders = data.result;
      _.forEach(orders, (upOrder) => {
        // tp/sl order
        if (upOrder.status === "finished" && upOrder.is_reduce_only) {
          this.marketTpSlOrders.forEach((order) => {
            if (
              order.symbol === upOrder.contract &&
              order.status === MARKET_STATUS_EXECUTING
            ) {
              order.status = MARKET_STATUS_DONE;
            }
          });
        }
      });
    }
    // positions update
    if (data.channel === "futures.positions") {
      const positions = data.result;
      _.forEach(positions, (position) => {
        if (position.size !== 0) {
          console.log("position", position);
          // if this is not a close position, close current tp/sl orders if avail.
          //
          // console.log("this.marketTpSlOrders", this.marketTpSlOrders);
          const marketTpSlOrder = this.marketTpSlOrders.find(
            (order) =>
              order.orgOrder.symbol === position.contract &&
              order.status === MARKET_STATUS_EXECUTING &&
              this.isThisPosForOrder(position, order)
          );
          if (marketTpSlOrder) {
            console.log(
              "process market tpsl order - size",
              marketTpSlOrder.marketOrder.size
            );
            marketTpSlOrder.tryUpdate = "try-update";
            marketTpSlOrder.position = position;
            //
            setTimeout(
              this.processMarketTPSLOrders,
              0,
              position.size,
              marketTpSlOrder
            );
          }
        }
      });
    }
  };

  //
  symbolMapping = (symbol) => {
    return _.replace(symbol, "USDT", "_USDT");
  };
  //
  roundStep = (qty, stepSize) => {
    // Integers do not require rounding
    if (Number.isInteger(qty)) return qty;
    const qtyString = parseFloat(qty).toFixed(16);
    const desiredDecimals = Math.max(stepSize.indexOf("1") - 1, 0);
    const decimalIndex = qtyString.indexOf(".");
    return parseFloat(qtyString.slice(0, decimalIndex + desiredDecimals + 1));
  };
  calculateSize = (price, inpAmount, contractInfo) => {
    const { quantoMultiplier, orderSizeMin } = contractInfo;
    // 1 contract = quantoMultiplier coin
    const minQuantity = orderSizeMin;
    const orderCoin = inpAmount / price;
    let orderSize = Math.floor(orderCoin / quantoMultiplier);
    // console.log("orderCoin", orderCoin, "orderSize", orderSize);
    if (orderSize < orderSizeMin) {
      orderSize = orderSizeMin;
    }
    // console.log("orderSize", orderSize, "quantoMultiplier", quantoMultiplier);
    return orderSize;
  };
  //
  fetchFuturesContracts = async () => {
    try {
      const resp = await this.futuresApi.listFuturesContracts(this.settle);
      return resp.body;
    } catch (error) {
      console.log("error in fetchFuturesContracts", error);
      return [];
    }
  };
  getContractInfo = (contractName) => {
    return this.futuresContracts.find(
      (contract) => contract.name === contractName
    );
  };
  updateContractsFromServer = async () => {
    console.log("updateContractsFromServer");
    const contracts = (await this.fetchFuturesContracts()).filter(
      (contract) => contract.inDelisting === false
    );
    const symbolList = _.map(contracts, (contract) => contract.name);
    this.futuresContracts = contracts;
    this.futuresSymbolList = symbolList;
  };
  fetchFuturesSymbol = async () => {
    console.log("gateio:fetchFuturesSymbol");
    if (_.isEmpty(this.futuresSymbolList)) {
      await this.updateContractsFromServer();
    }
    // console.log("this.futuresContracts", this.futuresContracts);
    return this.futuresSymbolList;
  };
  fetchFuturesAccountSymbolInfo = async (symbol) => {
    console.log("gateio:fetchFuturesAccountSymbolInfo");
    try {
      // console.log("getContractInfo", symbol);
      const contract = await this.getContractInfo(symbol);
      // console.log("getPositionInfo");
      const respPosition = await this.getPositionInfo(symbol);
      console.log("respPosition", respPosition);
      const position = _.isEmpty(respPosition)
        ? { leverage: 0, crossLeverageLimit: contract.leverageMax }
        : respPosition[0]; //there is always 2 positions as long and short
      const restInfo = {
        minQty: contract.orderSizeMin,
        minNotional: contract.quantoMultiplier,
        stepSize: contract.quantoMultiplier,
        ...position,
        leverage:
          Number(position.leverage) === 0
            ? this.isTestnet
              ? 20
              : 10
            : position.leverage,
        // leverage:
        //   Number(position.leverage) === 0
        //     ? position.crossLeverageLimit
        //     : position.leverage,
        isolated: Number(position.leverage) === 0 ? false : true,
      };
      // console.log(restInfo);

      return restInfo;
    } catch (err) {
      return { success: false, message: err };
    }
  };
  //
  fetchFuturesAccount = async () => {
    try {
      console.log("fetchFuturesAccount");
      const resp = await this.futuresApi.listFuturesAccounts(this.settle);
      console.log("account", this.futuresApiName, resp.body);

      return resp.body;
    } catch (err) {
      console.log("error in fetchFuturesAccount", err);
    }
  };
  //
  fetchFuturesTrades = async (contract) => {
    const resp = this.futuresApi.listFuturesTrades(this.settle, contract);
    return resp.body;
  };
  //
  fetchFuturesOpenOrders = async () => {
    try {
      const currentTime = Date.now();
      if (currentTime - this.lastFetchTimeOpenOrders < ORDERS_CACHED_TIME) {
        return this.cachedOpenOrders;
      }

      const retOrders = [];
      const resp = await this.futuresApi.listFuturesOrders(
        this.settle,
        "open",
        {}
      );
      let openOrders = resp.body;
      // console.log("openOrders", openOrders);
      openOrders.forEach((order) => {
        const contractInfo = this.getContractInfo(order.contract);
        order.quantoMultiplier = contractInfo.quantoMultiplier;
        order.pricePrecision = this.getPricePrecision(order.contract);
        retOrders.push(order);
      });

      this.lastFetchTimeOpenOrders = currentTime;
      this.cachedOpenOrders = retOrders;

      return retOrders;
    } catch (err) {
      return { success: false, message: err };
    }
  };
  fetchFuturesPriceTriggerOrders = async () => {
    try {
      const currentTime = Date.now();
      if (
        currentTime - this.lastFetchTimePriceTriggerOrders <
        ORDERS_CACHED_TIME
      ) {
        return this.cachedPriceTriggerOrders;
      }

      const retOrders = [];
      // console.log("listPriceTriggeredOrders");
      const respPrice = await this.futuresApi.listPriceTriggeredOrders(
        this.settle,
        "open"
      );
      // console.log(respPrice.body);
      const openOrders = respPrice.body;
      openOrders.forEach((order) => {
        const contractInfo = this.getContractInfo(order.initial.contract);
        order.quantoMultiplier = contractInfo.quantoMultiplier;
        order.pricePrecision = this.getPricePrecision(order.initial.contract);

        retOrders.push(order);
      });

      this.lastFetchTimePriceTriggerOrders = currentTime;
      this.cachedPriceTriggerOrders = retOrders;

      return retOrders;
    } catch (err) {
      return [{ success: false, message: err }];
    }
  };
  //
  getPositionInfo = async (contract) => {
    // console.log("getPositionInfo", this.futureAccount.inDualMode, contract);
    try {
      let respPosition;
      if (this.futureAccount.inDualMode) {
        respPosition = await this.futuresApi.getDualModePosition(
          this.settle,
          contract
        );
      } else {
        respPosition = await this.futuresApi.getPosition(this.settle, contract);
      }
      // console.log("getPositionInfo", contract, respPosition);
      return respPosition.body;
    } catch (error) {
      console.log("error in getPositionInfo", error);
      return [];
    }
  };

  fetchPositions = async () => {
    const resp = await this.futuresApi.listPositions(this.settle);
    return resp.body;
  };
  fetchFuturesPositions = async () => {
    try {
      const currentTime = Date.now();
      if (currentTime - this.lastFetchTime < POSITIONS_CACHED_TIME) {
        return this.cachedPositions;
      }

      let positions = [];
      const resp = await this.fetchPositions();
      const positionPromises = resp.map(async (position) => {
        if (position.size != 0) {
          // lastPrice
          const contractInfo = (
            await this.futuresApi.getFuturesContract(
              this.settle,
              position.contract
            )
          ).body;
          position.lastPrice = contractInfo.lastPrice;
          position.unRealizedProfit = position.unrealisedPnl;
          position.pricePrecision = this.getPricePrecision(position.contract);

          return position;
        }
        return null;
      });
      const resolvedPositions = await Promise.all(positionPromises);
      positions = resolvedPositions.filter((p) => p !== null);

      this.lastFetchTime = currentTime;
      this.cachedPositions = positions;

      return positions;
    } catch (err) {
      return { success: false, message: err.msg };
    }
  };
  //
  futuresFetchMarketinfo = async (symbol) => {
    try {
      // console.log("futuresFetchMarketinfo", symbol);
      const contractInfo = (
        await this.futuresApi.getFuturesContract(this.settle, symbol)
      ).body;
      const symbolInfo = { ...contractInfo };
      symbolInfo.pricePrecision = this.getPricePrecision(symbol);

      return symbolInfo;
    } catch (error) {
      console.error(
        "Failed to fetch market info for symbol:",
        symbol,
        "Error:",
        error
      );
      return null; // or throw an error or handle it as per your error handling policy
    }
  };
  //
  getPricePrecision = (contract) => {
    const contractInfo = this.getContractInfo(contract);
    return contractInfo.lastPrice.toString().includes(".")
      ? contractInfo.lastPrice.toString().split(".")[1].length
      : 0;
  };
  getOrderPriceStep = (contract) => {
    const contractInfo = this.getContractInfo(contract);
    return contractInfo.orderPriceRound;
  };
  formatOrderPrice = (price, symbol) => {
    const pricePrecision = this.getPricePrecision(symbol);
    const priceStep = this.getOrderPriceStep(symbol);
    const formattedPrice = Math.floor(price / priceStep) * priceStep;
    return formattedPrice.toFixed(pricePrecision);
  };
  //
  processMarketTPSLOrders = async (size, marketTpSlOrder) => {
    try {
      // return;
      console.log("it comes here processMarketTPSLOrders for size", size);
      if (size !== marketTpSlOrder.position.size) {
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
      const sideTpSl = Number(position.size) > 0 ? SIDE_SELL : SIDE_BUY;
      // console.log("processMarketTPSLOrders:orgOrder", orgOrder);
      // console.log("processMarketTPSLOrders:position", position);
      const contractInfo = this.getContractInfo(position.contract);
      // console.log("processMarketTPSLOrders:contractInfo", contractInfo);
      const positionAmount = Math.abs(
        Number(position.size * Number(contractInfo.quantoMultiplier))
      );
      const positionSize = positionAmount * Number(position.entry_price);
      // TP * SL
      const isDualMode = this.futureAccount.inDualMode;

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

        const slOrderInitialParams = {
          contract: position.contract,
          size: isDualMode ? 0 : -position.size,
          price: "0", // use market price
          close: false,
          tif: FuturesInitialOrder.Tif.Ioc,
          text: "api",
          reduceOnly: true,
          ...(isDualMode && {
            autoSize: sideTpSl === SIDE_SELL ? "close_long" : "close_short",
          }),
        };
        const slOrderInitial = new FuturesInitialOrder();
        Object.assign(slOrderInitial, slOrderInitialParams);
        const slOrderTrigger = new FuturesPriceTrigger();
        Object.assign(slOrderTrigger, {
          strategyType: 0, // trigger by price
          priceType: 0, // latest deal price (last price?)
          price: formatPrice,
          rule: sideTpSl === SIDE_SELL ? 2 : 1,
          expiration: 0,
        });
        const slOrderType =
          sideTpSl === SIDE_SELL
            ? "close-long-position"
            : "close-short-position";
        const slOrder = new FuturesPriceTriggeredOrder();
        Object.assign(slOrder, {
          initial: slOrderInitial,
          trigger: slOrderTrigger,
          orderType: slOrderType,
        });
        // console.log("slOrder for", size, slOrder);
        // Retry creating SL order with a 100ms time interval if it fails
        let slOrderResult;
        for (let i = 0; i < EXECUTE_TIME_RETRY; i++) {
          slOrderResult = (
            await this.futuresApi.createPriceTriggeredOrder(
              this.settle,
              slOrder
            )
          ).body;
          // break if success
          if (slOrderResult.id) {
            break;
          }
          console.log("sl order failed, wait 100ms then retry");
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        console.log(
          "slOrder for",
          size,
          slOrder,
          "slOrderResult",
          slOrderResult
        );

        slOrder.result = { ...slOrderResult };
        slOrder.executedCount += 1;
        if (slOrder.success) {
          slOrder.executedStatus = ORDER_STATUS_DONE;
        }
        marketTpSlOrder.tpSlOrders.slOrder = slOrder;
      }
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
        const initialParams = {
          contract: position.contract,
          size: isDualMode ? 0 : -position.size,
          price: "0", // use market price
          close: false,
          tif: FuturesInitialOrder.Tif.Ioc,
          text: "api",
          reduceOnly: true,
          ...(isDualMode && {
            autoSize: sideTpSl === SIDE_SELL ? "close_long" : "close_short",
          }),
        };
        const initial = new FuturesInitialOrder();
        Object.assign(initial, initialParams);
        const trigger = new FuturesPriceTrigger();
        Object.assign(trigger, {
          strategyType: 0, // trigger by price
          priceType: 0, // latest deal price (last price?)
          price: formatPrice,
          rule: sideTpSl === SIDE_SELL ? 1 : 2,
          expiration: 0,
        });
        const orderType =
          sideTpSl === SIDE_SELL
            ? "close-long-position"
            : "close-short-position";
        const tpOrder = new FuturesPriceTriggeredOrder();
        Object.assign(tpOrder, {
          initial: initial,
          trigger: trigger,
          orderType: orderType,
        });
        // console.log("tpOrder for", size, tpOrder);
        let tpOrderResult;
        for (let i = 0; i < 3; i++) {
          tpOrderResult = (
            await this.futuresApi.createPriceTriggeredOrder(
              this.settle,
              tpOrder
            )
          ).body;
          if (tpOrderResult.id) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        console.log(
          "tpOrder for",
          size,
          tpOrder,
          "tpOrderResult",
          tpOrderResult
        );
        tpOrder.result = { ...tpOrderResult };
        tpOrder.executedCount += 1;
        if (tpOrder.success) {
          tpOrder.executedStatus = ORDER_STATUS_DONE;
        }
        marketTpSlOrder.tpSlOrders.tpOrder = tpOrder;
      }
      //
      marketTpSlOrder.status = MARKET_STATUS_DONE;
    } catch (err) {
      console.log("error in processMarketTPSLOrders", err);
      return err;
    }
  };
  //
  //
  futurePlaceOrder = async (
    request,
    contract,
    orderSide,
    orderSize,
    orderType,
    orderPrice,
    settle
  ) => {
    try {
      // Order size. Specify positive number to make a bid, and negative number to ask
      // Order price. 0 for market order with `tif` set as `ioc`
      const futuresOrder = {
        contract: contract,
        size: orderSide === DIRECTION_LONG ? orderSize : -orderSize,
        price: orderType === TYPE_LIMIT ? orderPrice : 0,
        tif: orderType === TYPE_LIMIT ? "gtc" : "ioc",
      };
      console.log("futuresOrder", futuresOrder);
      // put this into list of executing tpsl orders
      const marketTpSlOrder = {};
      marketTpSlOrder.id = crypto.randomBytes(16).toString("hex");
      marketTpSlOrder.symbol = contract;
      // marketTpSlOrder.status = MARKET_STATUS_NEW;
      marketTpSlOrder.orgOrder = request;
      marketTpSlOrder.tpSlOrders = {};
      marketTpSlOrder.status = MARKET_STATUS_EXECUTING;
      marketTpSlOrder.marketOrder = futuresOrder;
      this.marketTpSlOrders.push(marketTpSlOrder);
      console.log("pushed order", futuresOrder.size);
      const resp = await this.futuresApi.createFuturesOrder(
        settle,
        futuresOrder
      );
      const orderRslt = resp.body;
      // console.log("orderRslt", orderRslt);
      marketTpSlOrder.marketOrder.result = { ...orderRslt };

      return orderRslt;
    } catch (error) {
      console.log("error in futurePlaceOrder", error);
      return {};
    }
  };
  futuresPlaceNewOrder = async (request) => {
    // console.log("gateio:futuresPlaceNewOrder", request);
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
    //
    try {
      // const contract = this.symbolMapping(symbol);
      const contract = symbol;
      const orderSide = side.toUpperCase();
      const orderType = type.toUpperCase();
      const orderMode = mode.toUpperCase();
      // get contract info
      const response = await this.futuresApi.getFuturesContract(
        this.settle,
        contract
      );
      const contractInfo = response.body;
      console.log("contractInfo", contractInfo);
      // set mode and leverage if neccessary
      this.futureAccount = await this.fetchFuturesAccount();
      // Position leverage. 0 means cross margin; positive number means isolated margin
      // console.log("futureAccount", this.futureAccount);
      let crossLeverageLimit = 0;
      if (orderMode === MODE_CROSSED) {
        crossLeverageLimit = leverage.toString();
        leverage = 0;
      }
      // if (contractInfo.leverage !== leverage)
      {
        let respLev = undefined;
        if (this.futureAccount.inDualMode) {
          respLev = await this.futuresApi.updateDualModePositionLeverage(
            this.settle,
            contract,
            leverage,
            leverage === 0 ? { crossLeverageLimit: crossLeverageLimit } : {}
          );
        } else {
          respLev = await this.futuresApi.updatePositionLeverage(
            this.settle,
            contract,
            leverage,
            leverage === 0 ? { crossLeverageLimit: crossLeverageLimit } : {}
          );
        }
      }
      //
      let orderPrice = price;
      if (orderType === TYPE_MARKET) {
        orderPrice = contractInfo.lastPrice;
      }
      const orderSize = this.calculateSize(orderPrice, amount, contractInfo);
      console.log(
        "side",
        orderSide,
        "orderPrice",
        orderPrice,
        "orderSize",
        orderSize
      );
      // if BOTH
      const orderRslts = [];
      if (orderSide === DIRECTION_BOTH) {
        if (!this.futureAccount.inDualMode) {
          throw "Account is in Single Mode Position - Should change to Hedge Mode to use direction BOTH";
        }
        let bothOrderSide = DIRECTION_LONG;
        let orderRslt = await this.futurePlaceOrder(
          request,
          contract,
          bothOrderSide,
          orderSize,
          orderType,
          orderPrice,
          this.settle
        );
        orderRslts.push({
          direction: bothOrderSide,
          result: orderRslt,
        });
        bothOrderSide = DIRECTION_SHORT;
        orderRslt = await this.futurePlaceOrder(
          request,
          contract,
          bothOrderSide,
          orderSize,
          orderType,
          orderPrice,
          this.settle
        );
        orderRslts.push({
          direction: bothOrderSide,
          result: orderRslt,
        });
      } else {
        let mkOrderRslt = await this.futurePlaceOrder(
          request,
          contract,
          orderSide,
          orderSize,
          orderType,
          orderPrice,
          this.settle
        );
        this.marketTpSlOrders.push(marketTpSlOrder);
        orderRslts.push({
          direction: orderSide,
          result: mkOrderRslt,
        });
      }
      //
      return { success: true, data: orderRslts };
    } catch (error) {
      // console.log("error in gateio:futuresPlaceNewOrder", error);
      return { success: false, message: error };
    }
  };

  async futuresClosePosition(position, type, price = 0) {
    try {
      // console.log("gateio:futuresClosePosition", position, type, price);
      this.futureAccount = await this.fetchFuturesAccount();
      const isDualMode = this.futureAccount.inDualMode;
      const positionSide = position.positionAmt < 0 ? SIDE_SELL : SIDE_BUY;

      const futuresOrder = {
        contract: position.symbol,
        size: 0,
        reduceOnly: true,
        price: type === TYPE_LIMIT ? price : 0,
        ...(!isDualMode && { close: true }),
        tif: type === TYPE_LIMIT ? "gtc" : "ioc",
        ...(isDualMode && {
          autoSize: positionSide === SIDE_BUY ? "close_long" : "close_short",
        }),
      };
      // console.log("futuresOrder", futuresOrder);

      const placeOrder = (
        await this.futuresApi.createFuturesOrder(this.settle, futuresOrder)
      ).body;
      // console.log("futuresClosePosition:placeOrder", placeOrder);

      if (_.isEmpty(placeOrder)) {
        throw placeOrder;
      } else {
        // cancel related orders
        // console.log("futuresClosePosition:cancelCurrentTPSLOrders", position);
        // if (type === TYPE_MARKET) {
        //   this.cancelTPSLOrdersOfPosition(position);
        // }
      }

      return { success: true, data: placeOrder };
    } catch (err) {
      console.log("error in gateio:futuresClosePosition", err);
      return { success: false, message: err.msg };
    }
  }
}
