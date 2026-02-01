/** New Order */
// Limit + TP/SL
[
  {
    strategySubId: 1,
    firstDrivenId: 0,
    secondDrivenId: 0,
    side: "SELL",
    positionSide: "BOTH",
    symbol: "XRPUSDT",
    type: "LIMIT",
    timeInForce: "GTC",
    quantity: 20,
    price: "0.5",
    securityType: "USDT_FUTURES",
    reduceOnly: false,
  },
  {
    side: "BUY",
    positionSide: "BOTH",
    symbol: "XRPUSDT",
    securityType: "USDT_FUTURES",
    firstTrigger: "PLACE_ORDER",
    firstDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    timeInForce: "GTE_GTC",
    reduceOnly: true,
    quantity: 20,
    strategySubId: 2,
    firstDrivenId: 1,
    secondDrivenId: 3,
    secondDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    secondTrigger: "CANCEL_ORDER",
    stopPrice: "0.4500",
    workingType: "MARK_PRICE",
    type: "TAKE_PROFIT_MARKET",
    priceProtect: true,
  },
  {
    side: "BUY",
    positionSide: "BOTH",
    symbol: "XRPUSDT",
    securityType: "USDT_FUTURES",
    firstTrigger: "PLACE_ORDER",
    firstDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    timeInForce: "GTE_GTC",
    reduceOnly: true,
    quantity: 20,
    strategySubId: 3,
    firstDrivenId: 1,
    secondDrivenId: 2,
    secondDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    secondTrigger: "CANCEL_ORDER",
    stopPrice: "0.5250",
    workingType: "MARK_PRICE",
    type: "STOP_MARKET",
    priceProtect: true,
  },
][
  // market + TP/SL
  ({
    strategySubId: 1,
    firstDrivenId: 0,
    secondDrivenId: 0,
    side: "SELL",
    positionSide: "BOTH",
    symbol: "LTCUSDT",
    type: "MARKET",
    quantity: 0.115,
    securityType: "USDT_FUTURES",
    reduceOnly: false,
  },
  {
    side: "BUY",
    positionSide: "BOTH",
    symbol: "LTCUSDT",
    securityType: "USDT_FUTURES",
    firstTrigger: "PLACE_ORDER",
    firstDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    timeInForce: "GTE_GTC",
    reduceOnly: true,
    quantity: 0.115,
    strategySubId: 2,
    firstDrivenId: 1,
    secondDrivenId: 3,
    secondDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    secondTrigger: "CANCEL_ORDER",
    stopPrice: "77.93",
    workingType: "MARK_PRICE",
    type: "TAKE_PROFIT_MARKET",
    priceProtect: true,
  },
  {
    side: "BUY",
    positionSide: "BOTH",
    symbol: "LTCUSDT",
    securityType: "USDT_FUTURES",
    firstTrigger: "PLACE_ORDER",
    firstDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    timeInForce: "GTE_GTC",
    reduceOnly: true,
    quantity: 0.115,
    strategySubId: 3,
    firstDrivenId: 1,
    secondDrivenId: 2,
    secondDrivenOn: "PARTIALLY_FILLED_OR_FILLED",
    secondTrigger: "CANCEL_ORDER",
    stopPrice: "90.92",
    workingType: "MARK_PRICE",
    type: "STOP_MARKET",
    priceProtect: true,
  })
];

// WEB Socket
// Limit order
const limitOrder = `order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1682405721832,"transaction":1682405721831,"order":{"symbol":"BTCUSDT","clientOrderId":"web_YlXg2IV6aFCtKqpycczJ","side":"SELL","orderType":"LIMIT","timeInForce":"GTC","originalQuantity":"0.003","originalPrice":"27564","averagePrice":"0","stopPrice":"0","executionType":"NEW","orderStatus":"NEW","orderId":3330377731,"orderLastFilledQuantity":"0","orderFilledAccumulatedQuantity":"0","lastFilledPrice":"0","commissionAsset":"USDT","commission":"0","orderTradeTime":1682405721831,"tradeId":0,"bidsNotional":"0","askNotional":"82.69200","isMakerSide":false,"isReduceOnly":false,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"LIMIT","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}`;

// Limit order filled
const account_update = {
  "eventType": "ACCOUNT_UPDATE",
  "eventTime": 1682405730543,
  "transaction": 1682405730539,
  "updateData": {
    "eventReasonType": "ORDER",
    "balances": [
      {
        "asset": "USDT",
        "walletBalance": "2570.57761630",
        "crossWalletBalance": "2416.37820218",
        "balanceChange": "0"
      }
    ],
    "positions": [
      {
        "symbol": "BTCUSDT",
        "positionAmount": "-0.015",
        "entryPrice": "27547.74000",
        "accumulatedRealized": "32.38800000",
        "unrealizedPnL": "2.43008571",
        "marginType": "isolated",
        "isolatedWallet": "82.49447196",
        "positionSide": "BOTH"
      }
    ]
  }
}
const order_update = {
  "eventType": "ORDER_TRADE_UPDATE",
  "eventTime": 1682405730543,
  "transaction": 1682405730538,
  "order": {
    "symbol": "BTCUSDT",
    "clientOrderId": "web_YlXg2IV6aFCtKqpycczJ",
    "side": "SELL",
    "orderType": "LIMIT",
    "timeInForce": "GTC",
    "originalQuantity": "0.003",
    "originalPrice": "27564",
    "averagePrice": "27564",
    "stopPrice": "0",
    "executionType": "TRADE",
    "orderStatus": "FILLED",
    "orderId": 3330377731,
    "orderLastFilledQuantity": "0.003",
    "orderFilledAccumulatedQuantity": "0.003",
    "lastFilledPrice": "27564",
    "commissionAsset": "USDT",
    "commission": "0.01653840",
    "orderTradeTime": 1682405730538,
    "tradeId": 258113440,
    "bidsNotional": "0",
    "askNotional": "0",
    "isMakerSide": true,
    "isReduceOnly": false,
    "stopPriceWorkingType": "CONTRACT_PRICE",
    "originalOrderType": "LIMIT",
    "positionSide": "BOTH",
    "closeAll": false,
    "realizedProfit": "0"
  }
};

// FUNDING FEE
const fundingFee_01 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409619525,"transaction":1682409617793,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.61454303","crossWalletBalance":"2414.39037419","balanceChange":"0.04090238"}],"positions":[{"symbol":"BTCUSDT","positionAmount":"-0.015","entryPrice":"27547.74000","accumulatedRealized":"32.38800000","unrealizedPnL":"4.27620357","marginType":"isolated","isolatedWallet":"82.53537434","positionSide":"BOTH"}]}}`;
// GET /api/admin/positions 200 507.228 ms - 3140
const fundingFee_02 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621477,"transaction":1682409619968,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.62801713","crossWalletBalance":"2414.39037419","balanceChange":"0.01347410"}],"positions":[{"symbol":"DASHUSDT","positionAmount":"-2.727","entryPrice":"55.00000","accumulatedRealized":"0","unrealizedPnL":"15.24665700","marginType":"isolated","isolatedWallet":"50.62866753","positionSide":"BOTH"}]}}`;
const fundingFee_03 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621549,"transaction":1682409620100,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.62897029","crossWalletBalance":"2414.39037419","balanceChange":"0.00095316"}],"positions":[{"symbol":"BANDUSDT","positionAmount":"-5.9","entryPrice":"1.68000","accumulatedRealized":"0","unrealizedPnL":"0.38019635","marginType":"isolated","isolatedWallet":"1.02340248","positionSide":"BOTH"}]}}`;
// GET /api/admin/positions 200 492.838 ms - 3140
const fundingFee_04 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621663,"transaction":1682409620282,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.62986998","crossWalletBalance":"2414.39037419","balanceChange":"0.00089969"}],"positions":[{"symbol":"COTIUSDT","positionAmount":"-118","entryPrice":"0.08423","accumulatedRealized":"0","unrealizedPnL":"0.95184346","marginType":"isolated","isolatedWallet":"1.98475203","positionSide":"BOTH"}]}}`;
const fundingFee_05 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621665,"transaction":1682409620285,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.63072027","crossWalletBalance":"2414.39037419","balanceChange":"0.00085029"}],"positions":[{"symbol":"CHRUSDT","positionAmount":"-55","entryPrice":"0.1562","accumulatedRealized":"0","unrealizedPnL":"0.08790320","marginType":"isolated","isolatedWallet":"1.71797892","positionSide":"BOTH"}]}}`;
const fundingFee_06 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621698,"transaction":1682409620344,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.64082448","crossWalletBalance":"2414.39037419","balanceChange":"0.01010421"}],"positions":[{"symbol":"C98USDT","positionAmount":"-446","entryPrice":"0.2304","accumulatedRealized":"0","unrealizedPnL":"1.74931012","marginType":"isolated","isolatedWallet":"14.66936675","positionSide":"BOTH"}]}}`;
const fundingFee_07 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621715,"transaction":1682409620383,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.64178949","crossWalletBalance":"2414.39037419","balanceChange":"0.00096501"}],"positions":[{"symbol":"CELOUSDT","positionAmount":"-16.4","entryPrice":"0.6077","accumulatedRealized":"0","unrealizedPnL":"0.31612148","marginType":"isolated","isolatedWallet":"1.42277994","positionSide":"BOTH"}]}}`;
const fundingFee_08 = `account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1682409621765,"transaction":1682409620487,"updateData":{"eventReasonType":"FUNDING_FEE","balances":[{"asset":"USDT","walletBalance":"2570.64364003","crossWalletBalance":"2414.39037419","balanceChange":"0.00185054"}],"positions":[{"symbol":"1000LUNCUSDT","positionAmount":"-170","entryPrice":"0.1173000","accumulatedRealized":"-4.97190000","unrealizedPnL":"1.43006720","marginType":"isolated","isolatedWallet":"2.27094385","positionSide":"BOTH"}]}}`;
// CLOSE ALL
const closeAll_01 = `order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1682411801598,"transaction":1682411801596,"order":{"symbol":"DASHUSDT","clientOrderId":"web_qyku4cTDFTmyAheIqXcG","side":"BUY","orderType":"MARKET","timeInForce":"GTC","originalQuantity":"2.727","originalPrice":"0","averagePrice":"0","stopPrice":"0","executionType":"NEW","orderStatus":"NEW","orderId":547747495,"orderLastFilledQuantity":"0","orderFilledAccumulatedQuantity":"0","lastFilledPrice":"0","commissionAsset":"USDT","commission":"0","orderTradeTime":1682411801596,"tradeId":0,"bidsNotional":"0","askNotional":"0","isMakerSide":false,"isReduceOnly":true,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"MARKET","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}`;
const closeAll_02 = `order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1682411801598,"transaction":1682411801596,"order":{"symbol":"DASHUSDT","clientOrderId":"web_qyku4cTDFTmyAheIqXcG","side":"BUY","orderType":"MARKET","timeInForce":"GTC","originalQuantity":"2.727","originalPrice":"0","averagePrice":"0","stopPrice":"0","executionType":"EXPIRED","orderStatus":"EXPIRED","orderId":547747495,"orderLastFilledQuantity":"0","orderFilledAccumulatedQuantity":"0","lastFilledPrice":"0","commissionAsset":"USDT","commission":"0","orderTradeTime":1682411801596,"tradeId":0,"bidsNotional":"0","askNotional":"0","isMakerSide":false,"isReduceOnly":true,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"MARKET","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}`;

// error
const result = {
  success: false,
  message:
    "Due to the order could not be executed as maker, the Post Only order will be rejected. The order will not be recorded in the order history",
};

// Future Exchange info for symbol
`[Object: null prototype] {
  symbol: 'BTCUSDT',
  status: 'TRADING',
  baseAsset: 'BTC',
  baseAssetPrecision: 8,
  quoteAsset: 'USDT',
  quotePrecision: 8,
  quoteAssetPrecision: 8,
  baseCommissionPrecision: 8,
  quoteCommissionPrecision: 8,
  orderTypes: [
    'LIMIT',
    'LIMIT_MAKER',
    'MARKET',
    'STOP_LOSS_LIMIT',
    'TAKE_PROFIT_LIMIT'
  ],
  icebergAllowed: true,
  ocoAllowed: true,
  quoteOrderQtyMarketAllowed: true,
  allowTrailingStop: true,
  cancelReplaceAllowed: true,
  isSpotTradingAllowed: true,
  isMarginTradingAllowed: true,
  filters: [
    [Object: null prototype] {
      filterType: 'PRICE_FILTER',
      minPrice: '0.01000000',
      maxPrice: '1000000.00000000',
      tickSize: '0.01000000'
    },
    [Object: null prototype] {
      filterType: 'LOT_SIZE',
      minQty: '0.00001000',
      maxQty: '9000.00000000',
      stepSize: '0.00001000'
    },
    [Object: null prototype] { filterType: 'ICEBERG_PARTS', limit: 10 },
    [Object: null prototype] {
      filterType: 'MARKET_LOT_SIZE',
      minQty: '0.00000000',
      maxQty: '158.78323484',
      stepSize: '0.00000000'
    },
    [Object: null prototype] {
      filterType: 'TRAILING_DELTA',
      minTrailingAboveDelta: 10,
      maxTrailingAboveDelta: 2000,
      minTrailingBelowDelta: 10,
      maxTrailingBelowDelta: 2000
    },
    [Object: null prototype] {
      filterType: 'PERCENT_PRICE_BY_SIDE',
      bidMultiplierUp: '5',
      bidMultiplierDown: '0.2',
      askMultiplierUp: '5',
      askMultiplierDown: '0.2',
      avgPriceMins: 5
    },
    [Object: null prototype] {
      filterType: 'NOTIONAL',
      minNotional: '10.00000000',
      applyMinToMarket: true,
      maxNotional: '9000000.00000000',
      applyMaxToMarket: false,
      avgPriceMins: 5
    },
    [Object: null prototype] {
      filterType: 'MAX_NUM_ORDERS',
      maxNumOrders: 200
    },
    [Object: null prototype] {
      filterType: 'MAX_NUM_ALGO_ORDERS',
      maxNumAlgoOrders: 5
    }
  ],
  permissions: [ 'SPOT', 'MARGIN', 'TRD_GRP_004', 'TRD_GRP_005', 'TRD_GRP_006' ],
  defaultSelfTradePreventionMode: 'NONE',
  allowedSelfTradePreventionModes: [ 'NONE', 'EXPIRE_TAKER', 'EXPIRE_MAKER', 'EXPIRE_BOTH' ]
}`;

// Failed to place INJUSDT
/**
 futuresPlaceGridOrder {
  symbol: 'INJUSDT',
  mode: 'Crossed',
  direction: 'Short',
  leverage: '4',
  maxBalance: '1000',
  levels: [
    [ 8.9, 20 ],
    [ 8.88888888, 20 ],
    [ 8.77777777, 20 ],
    [ 8.66666666, 20 ]
  ],
  takeProfit: { trigger: 'mark', type: 'market', percent: '' },
  stopLoss: { trigger: 'last', type: 'limit', percent: '' }
}
GET /api/admin/positions 200 143.684 ms - 1993
positionAmt before cal 2.2471910112359548
inpAmount, minQty, minNotional, price, stepSize 2.2471910112359548 0.10000000 10.00000000 8.9 0.10000000
positionAmt after cal 2.2
positionAmt before cal 2.25000000225
inpAmount, minQty, minNotional, price, stepSize 2.25000000225 0.10000000 10.00000000 8.88888888 0.10000000
positionAmt after cal 2.2
positionAmt before cal 2.278481014677135
inpAmount, minQty, minNotional, price, stepSize 2.278481014677135 0.10000000 10.00000000 8.77777777 0.10000000
positionAmt after cal 2.2
positionAmt before cal 2.3076923094674555
inpAmount, minQty, minNotional, price, stepSize 2.3076923094674555 0.10000000 10.00000000 8.66666666 0.10000000
positionAmt after cal 2.3
submit level order 8.9
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.9,
  option: undefined
}
submit level order 8.88888888
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.88888888,
  option: undefined
}
submit level order 8.77777777
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.77777777,
  option: undefined
}
level order result {
  success: false,
  message: 'Precision is over the maximum defined for this asset.'
}
level order result { success: false, message: 'Price not increased by tick size.' }
level order result {
  success: true,
  data: [Object: null prototype] {
    orderId: 7634841,
    symbol: 'INJUSDT',
    status: 'NEW',
    clientOrderId: 'q3onCpEpwXVASOXjHFZneY',
    price: '8.9000000',
    avgPrice: '0.00',
    origQty: '2.2',
    executedQty: '0.0',
    cumQty: '0.0',
    cumQuote: '0.00000000',
    timeInForce: 'GTX',
    type: 'LIMIT',
    reduceOnly: false,
    closePosition: false,
    side: 'SELL',
    positionSide: 'BOTH',
    stopPrice: '0.0000000',
    workingType: 'CONTRACT_PRICE',
    priceProtect: false,
    origType: 'LIMIT',
    updateTime: 1682571102549
  }
}
INJUSDT websocket endpoint injusdt@markPrice@1s
POST /api/admin/trade/grid 200 554.174 ms - 42
order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1682571102552,"transaction":1682571102549,"order":{"symbol":"INJUSDT","clientOrderId":"q3onCpEpwXVASOXjHFZneY","side":"SELL","orderType":"LIMIT","timeInForce":"GTX","originalQuantity":"2.2","originalPrice":"8.9000000","averagePrice":"0","stopPrice":"0","executionType":"NEW","orderStatus":"NEW","orderId":7634841,"orderLastFilledQuantity":"0","orderFilledAccumulatedQuantity":"0","lastFilledPrice":"0","commissionAsset":"USDT","commission":"0","orderTradeTime":1682571102549,"tradeId":0,"bidsNotional":"0","askNotional":"19.57999999","isMakerSide":false,"isReduceOnly":false,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"LIMIT","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}
INJUSDT : 8.88200000
INJUSDT last price: 8.6700000
submit level order 8.88888888
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.88888888,
  option: undefined
}
submit level order 8.77777777
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.77777777,
  option: undefined
}
level order result { success: false, message: 'Price not increased by tick size.' }
level order result { success: false, message: 'Price not increased by tick size.' }
GET /api/admin/positions 200 166.086 ms - 1993
INJUSDT : 8.88200000
INJUSDT last price: 8.6700000
submit level order 8.88888888
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.88888888,
  option: undefined
}
submit level order 8.77777777
submitBuySell {
  symbol: 'INJUSDT',
  side: 'SELL',
  type: 'LIMIT',
  positionAmt: 2.2,
  price: 8.77777777,
  option: undefined
}
level order result { success: false, message: 'Price not increased by tick size.' }
level order result { success: false, message: 'Price not increased by tick size.' }
INJUSDT : 8.88300000
INJUSDT last price: 8.6700000
GET /api/admin/positions 200 135.500 ms - 1993
INJUSDT : 8.88100000
INJUSDT last price: 8.6700000
INJUSDT : 8.87900000
INJUSDT last price: 8.6700000
 */

// Account update event
account_update:data: {
  "eventType":"ACCOUNT_UPDATE",
  "eventTime":1682742129162,
  "transaction":1682742129159,
  "updateData": {
    "eventReasonType":"ORDER",
    "balances": [
      {
        "asset":"USDT",
        "walletBalance":"2532.79469225",
        "crossWalletBalance":"2412.43068772",
        "balanceChange":"0"
      }
    ],
    "positions": [
      {
        "symbol":"DARUSDT",
        "positionAmount":"-33.3",
        "entryPrice":"0.18000",
        "accumulatedRealized":"0",
        "unrealizedPnL":"0.28355016",
        "marginType":"isolated",
        "isolatedWallet":"1.19760120",
        "positionSide":"BOTH"
      }
    ]
  }
}

order_update:data: {
  "eventType":"ORDER_TRADE_UPDATE",
  "eventTime":1682742129162,
  "transaction":1682742129159,
  "order":{
    "symbol":"DARUSDT",
    "clientOrderId":"XexgvpWwWTCPbOZak70kjz",
    "side":"SELL",
    "orderType":"LIMIT",
    "timeInForce":"GTX",
    "originalQuantity":"33.3",
    "originalPrice":"0.1800",
    "averagePrice":"0.18000",
    "stopPrice":"0",
    "executionType":"TRADE",
    "orderStatus":"FILLED",
    "orderId":5037781,
    "orderLastFilledQuantity":"33.3",
    "orderFilledAccumulatedQuantity":"33.3",
    "lastFilledPrice":"0.1800",
    "commissionAsset":"USDT",
    "commission":"0.00119880",
    "orderTradeTime":1682742129159,
    "tradeId":352377,
    "bidsNotional":"0",
    "askNotional":"0",
    "isMakerSide":true,
    "isReduceOnly":false,
    "stopPriceWorkingType":"CONTRACT_PRICE",
    "originalOrderType":"LIMIT",
    "positionSide":"BOTH",
    "closeAll":false,
    "realizedProfit":"0"
  }
}

// Error on production
`(node:76) UnhandledPromiseRejectionWarning: Error: ESOCKETTIMEDOUT
Apr 29 10:04:28 AM      at ClientRequest.<anonymous> (/opt/render/project/src/back-end/node_modules/request/request.js:816:19)
Apr 29 10:04:28 AM      at Object.onceWrapper (events.js:482:28)
Apr 29 10:04:28 AM      at ClientRequest.emit (events.js:376:20)
Apr 29 10:04:28 AM      at TLSSocket.emitRequestTimeout (_http_client.js:790:9)
Apr 29 10:04:28 AM      at Object.onceWrapper (events.js:482:28)
Apr 29 10:04:28 AM      at TLSSocket.emit (events.js:388:22)
Apr 29 10:04:28 AM      at TLSSocket.Socket._onTimeout (net.js:483:8)
Apr 29 10:04:28 AM      at listOnTimeout (internal/timers.js:555:17)
Apr 29 10:04:28 AM      at processTimers (internal/timers.js:498:7)
Apr 29 10:04:28 AM  (node:76) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 2)`

futuresPlaceGridOrder {
  symbol: 'CHRUSDT',
  mode: 'Isolated',
  direction: 'Short',
  leverage: '5',
  levels: [ [ 0.17, 17 ], [ 0.165, 16.5 ], [ 0.159, 15.9 ] ],
  takeProfit: { trigger: 'mark', type: 'market', percent: '20' },
  stopLoss: { trigger: 'last', type: 'limit', percent: '10' }
}
positionAmt before cal 99.99999999999999
positionAmt after cal 99
positionAmt before cal 100
positionAmt after cal 100
positionAmt before cal 100
positionAmt after cal 100


// TRY Update order status
`account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1683019538201,"transaction":1683019538198,"updateData":{"eventReasonType":"ORDER","balances":[{"asset":"USDT","walletBalance":"2555.44607694","crossWalletBalance":"2380.07020316","balanceChange":"0"}],"positions":[{"symbol":"ETHUSDT","positionAmount":"-0.053","entryPrice":"1861.00000","accumulatedRealized":"-287.00482999","unrealizedPnL":"1.73474435","marginType":"isolated","isolatedWallet":"19.70687340","positionSide":"BOTH"}]}}
order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1683019538201,"transaction":1683019538198,"order":{"symbol":"ETHUSDT","clientOrderId":"uqgRCG6eqjj8g1ZoSeEByQ","side":"SELL","orderType":"LIMIT","timeInForce":"GTX","originalQuantity":"0.053","originalPrice":"1861","averagePrice":"1861","stopPrice":"0","executionType":"TRADE","orderStatus":"FILLED","orderId":1044446862,"orderLastFilledQuantity":"0.053","orderFilledAccumulatedQuantity":"0.053","lastFilledPrice":"1861","commissionAsset":"USDT","commission":"0.01972660","orderTradeTime":1683019538198,"tradeId":116525426,"bidsNotional":"0","askNotional":"98.68600","isMakerSide":true,"isReduceOnly":false,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"LIMIT","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}
level order {
  side: 'SELL',
  type: 'LIMIT',
  mode: 'ISOLATED',
  symbol: 'ETHUSDT',
  positionAmt: 0.053,
  price: '1862.00',
  status: 'DONE',
  executedTime: 0,
  result: {
    success: true,
    data: [Object: null prototype] {
      orderId: 1044446778,
      symbol: 'ETHUSDT',
      status: 'NEW',
      clientOrderId: '5OtYfegwzBNgeNPuUy2IVE',
      price: '1862',
      avgPrice: '0.00000',
      origQty: '0.053',
      executedQty: '0',
      cumQty: '0',
      cumQuote: '0',
      timeInForce: 'GTX',
      type: 'LIMIT',
      reduceOnly: false,
      closePosition: false,
      side: 'SELL',
      positionSide: 'BOTH',
      stopPrice: '0',
      workingType: 'CONTRACT_PRICE',
      priceProtect: false,
      origType: 'LIMIT',
      updateTime: 1683019445966
    }
  }
}
[ orderStatus: 'FILLED' ]
level order {
  side: 'SELL',
  type: 'LIMIT',
  mode: 'ISOLATED',
  symbol: 'ETHUSDT',
  positionAmt: 0.053,
  price: '1861.00',
  status: 'DONE',
  executedTime: 0,
  result: {
    success: true,
    data: [Object: null prototype] {
      orderId: 1044446862,
      symbol: 'ETHUSDT',
      status: 'NEW',
      clientOrderId: 'uqgRCG6eqjj8g1ZoSeEByQ',
      price: '1861',
      avgPrice: '0.00000',
      origQty: '0.053',
      executedQty: '0',
      cumQty: '0',
      cumQuote: '0',
      timeInForce: 'GTX',
      type: 'LIMIT',
      reduceOnly: false,
      closePosition: false,
      side: 'SELL',
      positionSide: 'BOTH',
      stopPrice: '0',
      workingType: 'CONTRACT_PRICE',
      priceProtect: false,
      origType: 'LIMIT',
      updateTime: 1683019492252
    }
  }
}
[ orderStatus: 'FILLED' ]`

// correct
`order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1683019748515,"transaction":1683019748511,"order":{"symbol":"ETHUSDT","clientOrderId":"S5AZ8qR92XiYaIwakIGuIO","side":"SELL","orderType":"LIMIT","timeInForce":"GTX","originalQuantity":"0.053","originalPrice":"1860.91","averagePrice":"1860.91000","stopPrice":"0","executionType":"TRADE","orderStatus":"FILLED","orderId":1044447313,"orderLastFilledQuantity":"0.053","orderFilledAccumulatedQuantity":"0.053","lastFilledPrice":"1860.91","commissionAsset":"USDT","commission":"0.01972564","orderTradeTime":1683019748511,"tradeId":116525467,"bidsNotional":"0","askNotional":"98.68600","isMakerSide":true,"isReduceOnly":false,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"LIMIT","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}
level order {
  side: 'SELL',
  type: 'LIMIT',
  mode: 'ISOLATED',
  symbol: 'ETHUSDT',
  positionAmt: 0.053,
  price: '1860.91',
  status: 'DONE',
  executedTime: 0,
  result: {
    success: true,
    data: [Object: null prototype] {
      orderId: 1044447313,
      symbol: 'ETHUSDT',
      status: 'NEW',
      clientOrderId: 'S5AZ8qR92XiYaIwakIGuIO',
      price: '1860.91',
      avgPrice: '0.00000',
      origQty: '0.053',
      executedQty: '0',
      cumQty: '0',
      cumQuote: '0',
      timeInForce: 'GTX',
      type: 'LIMIT',
      reduceOnly: false,
      closePosition: false,
      side: 'SELL',
      positionSide: 'BOTH',
      stopPrice: '0',
      workingType: 'CONTRACT_PRICE',
      priceProtect: false,
      origType: 'LIMIT',
      updateTime: 1683019741521
    }
  }
}
[
  {
    side: 'SELL',
    type: 'LIMIT',
    mode: 'ISOLATED',
    symbol: 'ETHUSDT',
    positionAmt: 0.053,
    price: '1860.91',
    status: 'DONE',
    executedTime: 0,
    result: { success: true, data: [Object: null prototype] }
  },
  orderStatus: 'FILLED'
]`

order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1683039078760,"transaction":1683039078758,"order":{"symbol":"ETHUSDT","clientOrderId":"0SSi5DHtLoSny6MsOAlXOi","side":"SELL","orderType":"LIMIT","timeInForce":"GTX","originalQuantity":"0.010","originalPrice":"1861","averagePrice":"0","stopPrice":"0","executionType":"NEW","orderStatus":"NEW","orderId":1044572872,"orderLastFilledQuantity":"0","orderFilledAccumulatedQuantity":"0","lastFilledPrice":"0","commissionAsset":"USDT","commission":"0","orderTradeTime":1683039078758,"tradeId":0,"bidsNotional":"0","askNotional":"18.61000","isMakerSide":false,"isReduceOnly":false,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"LIMIT","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}

account_update:data: {"eventType":"ACCOUNT_UPDATE","eventTime":1683039161845,"transaction":1683039161842,"updateData":{"eventReasonType":"ORDER","balances":[{"asset":"USDT","walletBalance":"2555.40289210","crossWalletBalance":"2336.88535717","balanceChange":"0"}],"positions":[{"symbol":"ETHUSDT","positionAmount":"-0.169","entryPrice":"1861.28538","accumulatedRealized":"-287.00482999","unrealizedPnL":"1.20176255","marginType":"isolated","isolatedWallet":"62.84853455","positionSide":"BOTH"}]}}
order_update:data: {"eventType":"ORDER_TRADE_UPDATE","eventTime":1683039161846,"transaction":1683039161841,"order":{"symbol":"ETHUSDT","clientOrderId":"0SSi5DHtLoSny6MsOAlXOi","side":"SELL","orderType":"LIMIT","timeInForce":"GTX","originalQuantity":"0.010","originalPrice":"1861","averagePrice":"1861","stopPrice":"0","executionType":"TRADE","orderStatus":"FILLED","orderId":1044572872,"orderLastFilledQuantity":"0.010","orderFilledAccumulatedQuantity":"0.010","lastFilledPrice":"1861","commissionAsset":"USDT","commission":"0.00372200","orderTradeTime":1683039161841,"tradeId":116536945,"bidsNotional":"0","askNotional":"0","isMakerSide":true,"isReduceOnly":false,"stopPriceWorkingType":"CONTRACT_PRICE","originalOrderType":"LIMIT","positionSide":"BOTH","closeAll":false,"realizedProfit":"0"}}
[
  "Parse error: Cannot read properties of undefined (reading 'orderId')"
]



//
place new TP
tpOrder {
  side: 'BUY',
  type: 'TAKE_PROFIT_MARKET',
  mode: 'ISOLATED',
  symbol: 'CHZUSDT',
  positionAmt: 6411,
  price: '0.13524',
  executedStatus: 'NEW',
  executedCount: 0
}
TP order result of CHZUSDT 6411 0.13524 {
  success: true,
  data: [Object: null prototype] {
    orderId: 20600234,
    symbol: 'CHZUSDT',
    status: 'NEW',
    clientOrderId: 'rBkQk3WLoI9A1fRjypWOO6',
    price: '0.00000',
    avgPrice: '0.00',
    origQty: '6411',
    executedQty: '0',
    cumQty: '0',
    cumQuote: '0.00000',
    timeInForce: 'GTC',
    type: 'STOP_MARKET',
    reduceOnly: true,
    closePosition: true,
    side: 'BUY',
    positionSide: 'BOTH',
    stopPrice: '0.13524',
    workingType: 'CONTRACT_PRICE',
    priceProtect: false,
    origType: 'TAKE_PROFIT_MARKET',
    updateTime: 1683103140596
  }
}
slOrder {
  side: 'BUY',
  type: 'STOP_MARKET',
  mode: 'ISOLATED',
  symbol: 'CHZUSDT',
  positionAmt: 6411,
  price: '0.14076',
  executedStatus: 'NEW',
  executedCount: 0
}
SL order result of CHZUSDT 6411 0.14076 {
  success: true,
  data: [Object: null prototype] {
    orderId: 20600235,
    symbol: 'CHZUSDT',
    status: 'NEW',
    clientOrderId: 'h0FOQJWRxvHqqDFihr6UgW',
    price: '0.00000',
    avgPrice: '0.00',
    origQty: '6411',
    executedQty: '0',
    cumQty: '0',
    cumQuote: '0.00000',
    timeInForce: 'GTC',
    type: 'STOP_MARKET',
    reduceOnly: true,
    closePosition: true,
    side: 'BUY',
    positionSide: 'BOTH',
    stopPrice: '0.14076',
    workingType: 'CONTRACT_PRICE',
    priceProtect: false,
    origType: 'STOP_MARKET',
    updateTime: 1683103140726
  }
}

// K-Line stream candles
  {
    time: 1712115840000,
    closeTime: 1712115899999,
    open: '0.08597',
    high: '0.08601',
    low: '0.08590',
    close: '0.08591',
    volume: '142494',
    quoteVolume: '12246.77273',
    takerBuyBaseVolume: '38159',
    takerBuyQuoteVolume: '3279.29740',
    trades: 155
  },

