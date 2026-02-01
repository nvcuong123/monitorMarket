import ccxt from "ccxt";

const binance = new ccxt.binance({
  apiKey: "",
  secret: "",
  options: { defaultType: "future", warnOnFetchOpenOrdersWithoutSymbol: false },
});
setTimeout(async () => {
  const marketData = await binance.fetchMarkets();
  console.log("marketData", marketData);
}, 1000);

async function example() {
  const binance = new ccxt.binance({});
  const subscriptions = [
    ["BTC/USDT", "5m"],
    ["ETH/USDT", "5m"],
    ["BTC/USDT", "1h"],
  ];
  while (true) {
    const ohlcv = await binance.watchOHLCVForSymbols(subscriptions);
    console.log(ohlcv);
  }
}
await example();
