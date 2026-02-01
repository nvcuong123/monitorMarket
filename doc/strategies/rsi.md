# RSI Strategy

## Strategy Analysing

There are 4 triggers:

1. RSI cross over-bought threshold
2. RSI cross down over-bought threshold
3. RSI cross down over-sold threshold
4. RSI cross up over-sold threshold

Based on those, we run a strategies as:

1. When RSI cross down over-bought threshold, consider to enter a SHORT (plus with price is in resistance area)
   1. Calculate Entry to place order/ enter market order
   2. Calculate Stop Loss to place SL
   3. Observe market RSI -> take profit when RSI cross down over-sold threshold
2. When RSI cross up over-sold threshold, consider to enter a LONG (plus with price is in support area)
   1. Calculate Entry to place order/ enter market order
   2. Calculate Stop Loss to place SL
   3. Observe market RSI -> take profit when RSI cross up over-bought threshold
3. TIMEFRAME ??
   1. Timeframe 15m to run strategy
   2. Timeframe 5m to find entry

## TASKs

For Each Contract - Run 1 contract at a time, to verify the efficiency

1. Find over-bought and over-sold threshold
   1. Load history data (500 candles), and maybe many more if available
   2. Calculate high/low point of price and RSI value -> detemine the RSI thresholds
2. Back testing
   1. Run the strategy with historical data (above) to verify the efficiency
3. Mock trading
   1. Run the strategy on Binance Mock trading? not real eval., just to see the strategy runs properly, because historical data to find threshold above is from real market, not mock trading market
4. Paper trading
   1. Run the strategy on Binance real market, but just save log, not place real orders
5. Real trading
   1. Run the strategy on Binance real market, place real orders
   2. Also save log to review and evaluate the efficiency
