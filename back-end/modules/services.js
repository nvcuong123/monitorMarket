import BinanceFutures from "../exchanges/binance/binance-futures.js";
import GateIOFutures from "../exchanges/gateio/gateio-futures.js";
import utils from "./utils.js";
import _ from "lodash";

let db;
let tradeInstances = new Map();
export const EXCHANGE_BINANCE = "BINANCE";
export const EXCHANGE_GATEIO = "GATEIO";
export const EXCHANGE_BYBIT = "BYBIT";

export default {
  boot: async function () {
    // load database
    this.getDatabase();
    // start binance instances
    const users = utils.getUsers();
    // console.log("users", JSON.stringify(users, null, 2));
    users.forEach((user) => {
      const { usr, pwd, apiList } = user;
      apiList.forEach((api) => {
        const { apiName, apiKey, apiSecret, isTestnet } = api;
        if (apiName && apiKey && apiSecret) {
          this.startTradeInstance(apiName, apiKey, apiSecret, isTestnet);
        }
      });
    });
    console.log("tradeInstances.size:", tradeInstances.size);
  },
  getDatabase: () => {
    if (db) {
      return db;
    }
    // TODO: load database here
    let myDb = {};

    return (db = myDb);
  },
  startTradeInstance: function (apiName, apiKey, apiSecret, isTestnet) {
    // console.log(apiKey, apiSecret);
    let blExist = false;
    for (const [key, value] of tradeInstances.entries()) {
      if (key.apiKey === apiKey && key.apiSecret === apiSecret) {
        blExist = true;
        break;
      }
    }
    // if not created instance yet
    if (!blExist) {
      const inpParam = { apiName, apiKey, apiSecret };
      let instance = {};
      if (apiName.includes(EXCHANGE_BINANCE)) {
        instance = new BinanceFutures(isTestnet, apiName, apiKey, apiSecret);
      } else if (apiName.includes(EXCHANGE_GATEIO)) {
        instance = new GateIOFutures(isTestnet, apiName, apiKey, apiSecret);
      }
      // else if (apiName.include("BYBIT")) {
      //   instance = new ByBitFutures(isTestnet, apiName, apiKey, apiSecret);
      // }

      // console.log("start instance", instance);
      if (!_.isEmpty(instance)) {
        instance.start();
        // console.log("started instance already", inpParam);
        tradeInstances.set(inpParam, instance);
      }
    }
  },
  getUserExchangeTradeInstance: (apiList, exchange = undefined) => {
    // console.log("exchange", exchange);
    if (exchange !== undefined) {
      for (let index = 0; index < apiList.length; index++) {
        const api = apiList[index];
        const { apiName, apiKey, apiSecret, isTestnet } = api;
        // console.log("api", api);
        if (apiName.includes(exchange)) {
          for (const [key, value] of tradeInstances.entries()) {
            if (key.apiKey === apiKey && key.apiSecret === apiSecret) {
              // console.log("instance", value);
              return value;
            }
          }
        }
      }
    }
    return null;
  },
  //
  getSomeInfo: () => {
    for (const [key, instance] of tradeInstances.entries()) {
      (async function getInfo() {
        console.log("user api", key.apiName);
      })();
    }
  },
};
