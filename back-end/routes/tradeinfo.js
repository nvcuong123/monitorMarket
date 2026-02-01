import services, { EXCHANGE_BINANCE } from "../modules/services.js";

const tradeinfo = async (req, res) => {
  try {
    const binance = services.getUserExchangeTradeInstance(
      req.apiList,
      EXCHANGE_BINANCE
    );
    // console.log("tradeinfo:is binance undefined", binance === undefined);
    // console.log("tradeinfo binance", binance.strategyRsi);
    const openOrders = await binance.fetchFuturesOpenOrders();
    // console.log("tradeinfo fetchFuturesOpenOrders");
    const positions = await binance.fetchFuturesPositions();
    // console.log("tradeinfo fetchFuturesPositions");
    // console.log("position", positions);
    return res.status(200).json({
      success: true,
      message: "current Orders and Positions",
      randomNumber: Math.random(),
      openOrders,
      positions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export default tradeinfo;
