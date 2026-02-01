// Open Interest
const oi = {
  retCode: 0,
  retMsg: "OK",
  result: {
    symbol: "ETHUSDT",
    category: "linear",
    list: [
      { openInterest: "490774.16000000", timestamp: "1702893600000" },
      { openInterest: "491590.81000000", timestamp: "1702892700000" },
      { openInterest: "491549.18000000", timestamp: "1702891800000" },
      { openInterest: "497088.39000000", timestamp: "1702890900000" },
      { openInterest: "496779.84000000", timestamp: "1702890000000" },
    ],
    nextPageCursor: "lastid%3D82654340%26lasttime%3D1702890000",
  },
  retExtInfo: {},
  time: 1702894202375,
};
// Long/Short Ratio
// bybitMarketData.fetchLongShortRatio("ETHUSDT", "15min", 5);
const ETHLongShort = {
  retCode: 0,
  retMsg: "OK",
  result: {
    list: [
      {
        symbol: "ETHUSDT",
        buyRatio: "0.5119",
        sellRatio: "0.4881",
        timestamp: "1702892700000",
      },
      {
        symbol: "ETHUSDT",
        buyRatio: "0.5114",
        sellRatio: "0.4886",
        timestamp: "1702891800000",
      },
      {
        symbol: "ETHUSDT",
        buyRatio: "0.511",
        sellRatio: "0.489",
        timestamp: "1702890900000",
      },
      {
        symbol: "ETHUSDT",
        buyRatio: "0.5113",
        sellRatio: "0.4887",
        timestamp: "1702890000000",
      },
      {
        symbol: "ETHUSDT",
        buyRatio: "0.5113",
        sellRatio: "0.4887",
        timestamp: "1702889100000",
      },
    ],
  },
  retExtInfo: {},
  time: 1702892867526,
};
// bybitMarketData.fetchLongShortRatio("BNBUSDT");
const BNBLongShort = {
  retCode: 0,
  retMsg: "OK",
  result: {
    list: [
      {
        symbol: "BNBUSDT",
        buyRatio: "0.5323",
        sellRatio: "0.4677",
        timestamp: "1702890000000",
      },
      {
        symbol: "BNBUSDT",
        buyRatio: "0.5338",
        sellRatio: "0.4662",
        timestamp: "1702886400000",
      },
      {
        symbol: "BNBUSDT",
        buyRatio: "0.5323",
        sellRatio: "0.4677",
        timestamp: "1702882800000",
      },
      {
        symbol: "BNBUSDT",
        buyRatio: "0.5307",
        sellRatio: "0.4693",
        timestamp: "1702879200000",
      },
    ],
  },
  retExtInfo: {},
  time: 1702892867946,
};
