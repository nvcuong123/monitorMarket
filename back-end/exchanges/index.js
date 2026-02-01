import services, {
  EXCHANGE_BINANCE,
  EXCHANGE_GATEIO,
  EXCHANGE_BYBIT,
} from "../modules/services.js";
/*
futuresPlaceNewOrder {
  symbol: 'BTCUSDT',
  mode: 'Isolated',
  side: 'Short',
  leverage: '5',
  type: 'Market',
  amount: '100',
  price: '',
  tp: '10',
  sl: '10',
  tpslPercentType: 0,
  placeType: 'new order'
}
futuresPlaceNewOrder {
  symbol: 'BTCUSDT',
  mode: 'Isolated',
  side: 'Short',
  leverage: '5',
  type: 'Market',
  amount: '200',
  price: '',
  tp: '5',
  sl: '5',
  tpslPercentType: 0,
  placeType: 'new order'
}*/
export default {
  futuresPlaceNewOrder: async (req) => {
    const binance = services.getUserExchangeTradeInstance(
      req.apiList,
      EXCHANGE_BINANCE
    );
    // const gateio = req.tradeInstances[1];
    // const bybit = req.tradeInstances[2];
    //
    const order = { ...req.body };
    const numExchanges = 3;
    order.amount = order.amount / numExchanges;
    const respBinance = await binance.futuresPlaceNewOrder(order);
    const respGateIO = false; //await gateio.futuresPlaceNewOrder(request);
    const respBybit = false; //await bybit.futuresPlaceNewOrder(request);
    // status
    if (respBinance.success || respGateIO.success || respBybit.success) {
      return {
        success: true,
        data: { binance: respBinance, gateio: respBinance, bybit: respBybit },
      };
    } else {
      return {
        success: false,
        message: "place order all failed!",
      };
    }
  },
};
