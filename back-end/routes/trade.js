import express from "express";
import services, { EXCHANGE_BINANCE } from "../modules/services.js";
import exchanges from "../exchanges/index.js";

const routerTrade = express.Router();

const trade = async (req, res) => {
  try {
    const exchange = req.query.exchange;
    const exchangeInstanse = services.getUserExchangeTradeInstance(
      req.apiList,
      exchange
    );

    const request = { ...req.body };
    // console.log(request);
    const isMultiExchange = request.isMultiExchange;
    let resp = null;
    const tradeType = request.placeType;
    if (tradeType === "close-position") {
      resp = await exchangeInstanse.futuresClosePosition(
        request.order.position,
        request.order.type,
        request.order.price
      );
    } else if (tradeType === "clear-positions") {
      resp = await binance.futuresClearPositions();
    } else {
      if (isMultiExchange === true) {
        resp = await exchanges.futuresPlaceNewOrder(req);
      } else {
        resp = await exchangeInstanse.futuresPlaceNewOrder(request);
      }
    }

    if (resp.success) {
      return res.status(200).json({
        success: true,
        message: "Order placed successfully!",
        data: resp.data,
      });
    } else {
      // console.log(resp);
      return res.status(401).json({
        success: false,
        message: "Order placed failed!",
        data: { ...resp.message },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};
/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const grid = async (req, res) => {
  try {
    const exchange = req.query.exchange;
    const exchangeInstanse = services.getUserExchangeTradeInstance(
      req.apiList,
      exchange
    );
    const order = { ...req.body };
    // console.log(order);
    const resp = await exchangeInstanse.futuresPlaceMultiLevelOrder(order);
    if (resp.success) {
      return res.status(200).json({
        success: true,
        message: "grid order OK",
      });
    } else {
      return res.status(401).json({ success: false, message: resp.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

routerTrade.all("/grid", grid);
routerTrade.all("/", trade);

export default routerTrade;
