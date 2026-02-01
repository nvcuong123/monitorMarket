import React, { useEffect } from "react";
import { useState, useRef } from "react";
import { useAuth } from "../Provider/Auth";

import tr7TradingBot, {
  EXCHANGE_BINANCE,
  EXCHANGE_BYBIT,
  EXCHANGE_GATEIO,
} from "../Model/tr7-trading-bot.js";

const FuturesOrderInfoContext = React.createContext({});
export const useFuturesOrderInfo = () => {
  return React.useContext(FuturesOrderInfoContext);
};
export const DEFAULT_SYMBOL_GATEIO = "BTC_USDT";
export const DEFAULT_SYMBOL_BYBIT = "BTCUSDT";
export const DEFAULT_SYMBOL_BINANCE = "BTCUSDT";
export const DEFAULT_EXCHANGE = EXCHANGE_BINANCE;
export const DEFAULT_SYMBOL = DEFAULT_SYMBOL_GATEIO;

const DEFAULT_LEVERAGE = "5";
const MODE_ISOLATED = "Isolated";
const MODE_CROSSED = "Crossed";
const DEFAULT_MODE = MODE_ISOLATED;
const DIRECTION_BOTH = "Both";
const DIRECTION_LONG = "Long";
const DIRECTION_SHORT = "Short";
const DEFAULT_DIRECTION = DIRECTION_LONG;
const DEFAULT_DIRECTION_GATEIO = DIRECTION_BOTH;
const TYPE_MARKET = "Market";
const TYPE_LIMIT = "Limit";
const DEFAULT_TYPE = TYPE_MARKET;
const TP_THRESHOLD = 1;
const SL_THRESHOLD = 1;

export const CUR_EXCHANGE = Symbol("CUR_SYMBOL");
export const CUR_SYMBOL = Symbol("CUR_SYMBOL");
// console.log("CUR_SYMBOL", CUR_SYMBOL);
export const EXCHANGE = Symbol("EXCHANGE");
export const MODE = Symbol("MODE");
export const LEVERAGE = Symbol("LEVERAGE");
export const DIRECTION = Symbol("DIRECTION");
export const TYPE = Symbol("TYPE");
export const PRICE = Symbol("PRICE");
export const AMOUNT = Symbol("AMOUNT");
export const TAKE_PROFIT = Symbol("TAKE_PROFIT");
export const STOP_LOSS = Symbol("STOP_LOSS");

const FutureOrderProvider = ({ children }) => {
  const { loggedIn } = useAuth();
  const [loading, $loading] = useState(true);
  const [userOrderParam, $userOrderParam] = useState({});
  const [symbolList, $symbolList] = useState([]);
  const [symbolListGateIO, $symbolListGateIO] = useState([]);
  const [symbolListByBit, $symbolListByBit] = useState([]);
  const [pricePrecisions, $pricePrecisions] = useState([]);
  const [curExchange, $curExchange] = useState(DEFAULT_EXCHANGE);
  const [curSymbol, $curSymbol] = useState(DEFAULT_SYMBOL);
  // console.log("FutureOrderProvider:curExchange", curExchange);

  async function pullOrderInfo(symbol, exchange) {
    const res = await tr7TradingBot.getSymbolInfo(symbol, exchange);
    return res.symbolInfo;
  }
  async function firstPullOrderInfo() {
    // get symbol list
    const res = await tr7TradingBot.getSymbolList(EXCHANGE_BINANCE);
    const sortSymbols = res.symbols.sort();
    $symbolList(sortSymbols);
    const resGateIO = await tr7TradingBot.getSymbolList(EXCHANGE_GATEIO);
    // console.log("resGateIO.symbols", resGateIO.symbols);
    $symbolListGateIO(resGateIO.symbols.sort());
    // const resByBit = await tr7TradingBot.getSymbolList(EXCHANGE_BYBIT);
    // $symbolListByBit(resByBit.symbols.sort());
    //
    const respPrice = await tr7TradingBot.getPricePrecisions();
    $pricePrecisions(respPrice.pricePrecisions);
    // console.log("pricePrecisions", respPrice.pricePrecisions);
    // // acc info
    //   const resp = await tr7TradingBot.fetchAccountInfo();
    //   const account = resp.accounts[0];
    //   $availBalance(Number(account.availableBalance).toFixed(2));

    //
    if (loggedIn) {
      loadSymbolParam(DEFAULT_EXCHANGE, DEFAULT_SYMBOL);
    }
  }
  function getExchangeDefaultSymbol(exchange) {
    let symbol = DEFAULT_SYMBOL;
    if (exchange === EXCHANGE_BINANCE) {
      symbol = DEFAULT_SYMBOL;
    } else if (exchange === EXCHANGE_GATEIO) {
      symbol = DEFAULT_SYMBOL_GATEIO;
    } else if (exchange === EXCHANGE_BYBIT) {
      symbol = DEFAULT_SYMBOL_BYBIT;
    }
    return symbol;
  }

  function loadSymbolParam(exchange, symbol) {
    console.log("loadSymbolParam", symbol);
    $loading(true);
    $curSymbol(symbol);
    (async (exchange) => {
      if (userOrderParam[symbol] === undefined) {
        let updatedParam = { ...userOrderParam };
        let symbolDefaultParam = {
          modeRef: DEFAULT_MODE,
          leverageRef: DEFAULT_LEVERAGE,
          directionRef:
            exchange === EXCHANGE_GATEIO
              ? DEFAULT_DIRECTION_GATEIO
              : DEFAULT_DIRECTION,
          type: DEFAULT_TYPE,
          price: "",
          amount: "",
          takeProfitRef: "",
          stoplossRef: "",
        };
        updatedParam[symbol] = symbolDefaultParam;
        $userOrderParam((curParam) => updatedParam);
        try {
          pullOrderInfo(symbol, exchange).then((res) => {
            // console.log("inside pullOrderInfo.then");
            const accSymInfo = res;
            symbolDefaultParam.modeRef =
              accSymInfo.isolated === true ? MODE_ISOLATED : MODE_CROSSED;
            symbolDefaultParam.leverageRef = accSymInfo.leverage;
            $userOrderParam((curParam) => updatedParam);
            $loading(false);
          });
          // console.log("after pullOrderInfo");
        } catch (error) {
          console.log(error);
          $userOrderParam((curParam) => updatedParam);
          $loading(false);
        }
      } else {
        $loading(false);
      }
    })(exchange);
    // console.log("end func loadSymbolParam");
  }

  useEffect(() => {
    if (loggedIn) firstPullOrderInfo();
  }, [loggedIn]);

  function setOrderInfo(type, value) {
    if (CUR_SYMBOL === type) {
      if (value !== curSymbol) {
        if (loggedIn) {
          loadSymbolParam(curExchange, value);
        }
      }
    } else if (CUR_EXCHANGE === type) {
      const exchange = value;
      $curExchange(exchange);
      const defaultSymbol = getExchangeDefaultSymbol(exchange);
      loadSymbolParam(exchange, defaultSymbol);
    } else {
      $userOrderParam((curParam) => {
        let updatedParam = { ...curParam };
        switch (type) {
          case MODE:
            updatedParam[curSymbol].modeRef = value;
            break;
          case LEVERAGE:
            updatedParam[curSymbol].leverageRef = value;
            break;
          case DIRECTION:
            updatedParam[curSymbol].directionRef = value;
            break;
          case TYPE:
            updatedParam[curSymbol].type = value;
            break;
          case PRICE:
            updatedParam[curSymbol].price = value;
            break;
          case AMOUNT:
            updatedParam[curSymbol].amount = value;
            break;
          case TAKE_PROFIT:
            updatedParam[curSymbol].takeProfitRef = value;
            break;
          case STOP_LOSS:
            updatedParam[curSymbol].stoplossRef = value;
            break;

          default:
            break;
        }
        return updatedParam;
      });
    }
  }

  const value = {
    loading,
    symbolList,
    symbolListGateIO,
    symbolListByBit,
    pricePrecisions,
    curExchange,
    curSymbol,
    userOrderParam,
    setOrderInfo: setOrderInfo,
  };

  return (
    <FuturesOrderInfoContext.Provider value={value}>
      {children}
    </FuturesOrderInfoContext.Provider>
  );
};

export default FutureOrderProvider;
