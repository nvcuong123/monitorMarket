import bitgetMarketData from "./bitget-market-data.js";

// curl "https://api.bitget.com/api/v2/mix/market/open-interest?symbol=BTCUSDT&productType=usdt-futures"

async function test() {
  console.log(await bitgetMarketData.getOpenInterest("BTCUSDT"));
  console.log(await bitgetMarketData.getOpenInterest("XMRUSDT"));
  // console.log(
  //   await bitgetMarketData.fetchLongShortRatio("ETHUSDT", "15min", 5)
  // );
}
// bybitMarketData.fetchLongShortRatio("BNBUSDT");

test();
