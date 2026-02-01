import binancePublicData from "./binance-public-api.js";

async function test() {
  // const binanceOI = await binancePublicData.openInterestHist("BTCUSDT", "5m");
  // const binanceOI = await binancePublicData.getOpenInterest("BTCUSDT");
  const binanceOI = await binancePublicData.getOpenInterest("XMRUSDT");
  console.log(binanceOI);
}
test();
