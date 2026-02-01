import express from "express";
import services, { EXCHANGE_BINANCE } from "../modules/services.js";

const marketInfo = async (req, res) => {
  try {
    const exchange = req.query.exchange;
    // console.log("positions", req.apiList);
    const exchangeInstanse = services.getUserExchangeTradeInstance(
      req.apiList,
      exchange
    );
    // console.log("marketInfo:is binance undefined", binance === undefined);
    const symbolMarketInfo = await exchangeInstanse.futuresFetchMarketinfo(
      req.query.symbol
    );
    // console.log("symbolMarketInfo", symbolMarketInfo);
    return res.status(200).json({
      success: true,
      message: "symbol market info",
      symbolMarketInfo,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export default marketInfo;
