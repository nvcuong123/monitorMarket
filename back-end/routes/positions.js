import services, {
  EXCHANGE_BINANCE,
  EXCHANGE_GATEIO,
} from "../modules/services.js";
import _ from "lodash";

const positions = async (req, res) => {
  try {
    const exchange = req.query.exchange;
    // console.log("positions", req.apiList);
    const exchangeInstanse = services.getUserExchangeTradeInstance(
      req.apiList,
      exchange
    );
    if (_.isEmpty(exchangeInstanse)) {
      throw "Current User have not had API key for this exchange";
    } else {
      const openOrders = await exchangeInstanse.fetchFuturesOpenOrders();
      let priceTriggerOrders = [];
      if (exchange === EXCHANGE_GATEIO) {
        priceTriggerOrders =
          await exchangeInstanse.fetchFuturesPriceTriggerOrders();
      }
      const positions = await exchangeInstanse.fetchFuturesPositions();

      return res.status(200).json({
        success: true,
        message: "Positions",
        positions,
        openOrders,
        priceTriggerOrders,
      });
    }
  } catch (error) {
    console.error("Error in positions function:", error);
    return res.status(500).json({ success: false, error: error });
  }
};

export default positions;
