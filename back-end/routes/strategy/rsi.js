import services, { EXCHANGE_BINANCE } from "../modules/services.js";

const rsi = async (req, res) => {
  try {
    const binance = services.getUserExchangeTradeInstance(
      req.apiList,
      EXCHANGE_BINANCE
    );

    let resp;
    console.log(req.method);
    if (req.method === "POST") {
      const rsiCommand = { ...req.body };
      switch (rsiCommand.cmd) {
        case "rsi-config":
          const rsiConfig = rsiCommand.rsiConfig;
          resp = await binance.futuresRsiConfig("SET", rsiConfig);
          if (resp.success) {
            resp = await binance.futuresRsiConfig("GET");
          }

          break;

        case "rsi-run":
          console.log(rsiCommand);
          const state = rsiCommand.state;
          resp = await binance.futuresRsiState("SET", state);
          break;
      }
    } else {
      console.log(req.query);
      switch (req.query.type) {
        case "config":
          resp = await binance.futuresRsiConfig("GET");
          break;
        case "state":
          resp = await binance.futuresRsiState("GET");
          break;
      }
    }

    if (resp.success) {
      return res.status(200).json({
        success: true,
        message: resp.message,
        data: resp.data,
      });
    } else {
      return res.status(401).json({ success: false, message: resp.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};
export default rsi;
