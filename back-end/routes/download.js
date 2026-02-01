import express from "express";
import BinanceMarketData from "../exchanges/binance/binance-market-data.js";

const signals = async (req, res) => {
  console.log("req:signals");
  try {
    const signals = BinanceMarketData.getAllSignalsData();
    // console.log("symbolMarketInfo", symbolMarketInfo);
    return res.status(200).json({
      success: true,
      message: "all signals",
      data: signals,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

const routerDownload = express.Router();
routerDownload.get("/signals", signals);
// routerAdmin.use("/symbols", symbols);

export default routerDownload;
