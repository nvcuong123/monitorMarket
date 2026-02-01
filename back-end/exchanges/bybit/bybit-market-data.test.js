import bybitMarketData from "./bybit-market-data.js";

async function test() {
  // console.log(
  //   JSON.stringify(
  //     await bybitMarketData.fetchOpenInterestHistory("ETHUSDT", "15min", 5),
  //     null,
  //     2
  //   )
  // );
  // console.log(await bybitMarketData.fetchOpenInterestHistory("ETHUSDT", "1h"));
  // console.log(await bybitMarketData.fetchOpenInterestHistory("SOLUSDT", "1h"));
  // console.log(await bybitMarketData.getOpenInterest("BTCUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("XMRUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("ETHFIUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("OCEANUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("AEVOUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("TUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("SUIUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("RVNUSDT"));

  // console.log(await bybitMarketData.getOpenInterest("AGIXUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("BADGERUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("ACHUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("WAXPUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("KASUSDT"));
  console.log(await bybitMarketData.getOpenInterest("1000RATSUSDT"));
  console.log(await bybitMarketData.getOpenInterest("DODOXUSDT"));
  // console.log(await bybitMarketData.getOpenInterest("LUNA2USDT"));
}

test();
