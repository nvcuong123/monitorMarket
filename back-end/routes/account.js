import express from "express";
import services, {
  EXCHANGE_BINANCE,
  EXCHANGE_GATEIO,
} from "../modules/services.js";
import _ from "lodash";

const account = async (req, res) => {
  try {
    const exchange = req.query.exchange;
    let balance = [];
    let accounts = [];
    const exchangeInstanse = services.getUserExchangeTradeInstance(
      req.apiList,
      exchange
    );
    if (_.isEmpty(exchangeInstanse)) {
      throw "Current User have not had API key for this exchange";
    } else {
      if (exchange === EXCHANGE_BINANCE) {
        balance = await exchangeInstanse.fetchFuturesBalance();
        accounts = await exchangeInstanse.fetchFuturesAccount();
      } else if (exchange === EXCHANGE_GATEIO) {
        accounts = await exchangeInstanse.fetchFuturesAccount();
      }
    }
    return res.status(200).json({
      success: true,
      message: "account balance",
      randomNumber: Math.random(),
      balance,
      accounts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export default account;
