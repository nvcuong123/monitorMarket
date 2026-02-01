import okexMarketData from "./okex-market-data.js";

async function test() {
  // console.log(await okexMarketData.fetchOpenInterestHistory("XRMUSDT", "1h"));
  // console.log(await okexMarketData.fetchOpenInterestHistory("BTCUSDT", "1h"));
  // console.log(await okexMarketData.fetchLongShortRatioHistory("BTC", "5m", 2));
  console.log(await okexMarketData.getOpenInterest("BTCUSDT"));
  console.log(await okexMarketData.getOpenInterest("XMRUSDT"));
}

test();
