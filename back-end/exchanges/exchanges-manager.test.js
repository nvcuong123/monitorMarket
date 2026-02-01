// import binanceMarketData from "./binance/binance-market-data.js";
import { fetchOpenInterest, startExchangesOI } from "./exchanges-manager.js";

await startExchangesOI(["DASHUSDT"]);
async function test() {
  // const symbolList = await binanceMarketData.fetchFuturesSymbol();
  // const intervals = ["5m"];
  // for (let symbol of symbolList) {
  //   for (let interval of intervals) {
  //     console.log(symbol, interval, await fetchOpenInterest(symbol, interval));
  //   }
  // }

  // console.log("XMRUSDT", "5m", await fetchOpenInterest("XMRUSDT", "5m"));
  // console.log("XMRUSDT", "15m", await fetchOpenInterest("XMRUSDT", "15m"));
  // console.log(await fetchOpenInterest("XMRUSDT", "30m"));
  // console.log(await fetchOpenInterest("XMRUSDT", "1h"));
  console.log("DASHUSDT", "5m", await fetchOpenInterest("DASHUSDT", "5m"));
  // console.log("DASHUSDT", "15m", await fetchOpenInterest("DASHUSDT", "15m"));
}
setInterval(test, 60000);
// test();
