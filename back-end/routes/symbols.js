import services, {
  EXCHANGE_BINANCE,
  EXCHANGE_BYBIT,
  EXCHANGE_GATEIO,
} from "../modules/services.js";
import binanceMarketData from "../exchanges/binance/binance-market-data.js";

export const symbols = async (req, res) => {
  // console.log("/api/admin/symbols");
  try {
    const exchange = req.query.exchange;
    let symbols = [];
    if (exchange === EXCHANGE_BINANCE) {
      symbols = await binanceMarketData.fetchFuturesSymbol();
    } else if (exchange === EXCHANGE_GATEIO || exchange === EXCHANGE_BYBIT) {
      const exchangeInstanse = services.getUserExchangeTradeInstance(
        req.apiList,
        exchange
      );
      symbols = await exchangeInstanse.fetchFuturesSymbol();
    }

    return res.status(200).json({
      success: true,
      message: "symbols",
      symbols,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export const getSymbolInfo = async (req, res) => {
  try {
    const exchange = req.query.exchange;
    const exchangeInstanse = services.getUserExchangeTradeInstance(
      req.apiList,
      exchange
    );
    const symbolInfo = await exchangeInstanse.fetchFuturesAccountSymbolInfo(
      req.query.symbol
    );
    // console.log(symbolInfo);
    return res.status(200).json({
      success: true,
      message: "symbol info",
      symbolInfo,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export const pricePrecisions = async (req, res) => {
  try {
    const pricePrecisions =
      await binanceMarketData.fetchfuturesPricePrecisions();

    return res.status(200).json({
      success: true,
      message: "price precisions",
      pricePrecisions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

export default {
  symbols,
  getSymbolInfo,
  pricePrecisions,
};
