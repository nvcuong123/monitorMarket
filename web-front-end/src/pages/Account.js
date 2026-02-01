import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import tr7TradingBot, {
  EXCHANGE_BINANCE,
  EXCHANGE_GATEIO,
  EXCHANGE_BYBIT,
} from "../Model/tr7-trading-bot.js";
import {
  CSpinner,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButtonGroup,
  CFormCheck,
} from "@coreui/react";
import _ from "lodash";
import {
  useFuturesOrderInfo,
  CUR_EXCHANGE,
  CUR_SYMBOL,
  MODE,
  LEVERAGE,
  DIRECTION,
  TYPE,
  PRICE,
  AMOUNT,
  TAKE_PROFIT,
  STOP_LOSS,
  DEFAULT_SYMBOL,
  DEFAULT_SYMBOL_GATEIO,
  DEFAULT_SYMBOL_BYBIT,
} from "../Provider/FuturesOrderInfo.js";

/**
 * {   
    "feeTier": 0,       // account commission tier 
    "canTrade": true,   // if can trade
    "canDeposit": true,     // if can transfer in asset
    "canWithdraw": true,    // if can transfer out asset
    "updateTime": 0,        // reserved property, please ignore 
    "multiAssetsMargin": true,
    "tradeGroupId": -1,
    "totalInitialMargin": "0.00000000",    // the sum of USD value of all cross positions/open order initial margin
    "totalMaintMargin": "0.00000000",     // the sum of USD value of all cross positions maintenance margin
    "totalWalletBalance": "126.72469206",     // total wallet balance in USD
    "totalUnrealizedProfit": "0.00000000",   // total unrealized profit in USD
    "totalMarginBalance": "126.72469206",     // total margin balance in USD
    "totalPositionInitialMargin": "0.00000000",    // the sum of USD value of all cross positions initial margin
    "totalOpenOrderInitialMargin": "0.00000000",   // initial margin required for open orders with current mark price in USD
    "totalCrossWalletBalance": "126.72469206",      // crossed wallet balance in USD
    "totalCrossUnPnl": "0.00000000",      // unrealized profit of crossed positions in USD
    "availableBalance": "126.72469206",       // available balance in USD
    "maxWithdrawAmount": "126.72469206"     // maximum virtual amount for transfer out in USD
    "assets": [
        {
            "asset": "USDT",            // asset name
            "walletBalance": "23.72469206",      // wallet balance
            "unrealizedProfit": "0.00000000",    // unrealized profit
            "marginBalance": "23.72469206",      // margin balance
            "maintMargin": "0.00000000",        // maintenance margin required
            "initialMargin": "0.00000000",    // total initial margin required with current mark price 
            "positionInitialMargin": "0.00000000",    //initial margin required for positions with current mark price
            "openOrderInitialMargin": "0.00000000",   // initial margin required for open orders with current mark price
            "crossWalletBalance": "23.72469206",      // crossed wallet balance
            "crossUnPnl": "0.00000000"       // unrealized profit of crossed positions
            "availableBalance": "126.72469206",       // available balance
            "maxWithdrawAmount": "23.72469206",     // maximum amount for transfer out
            "marginAvailable": true,    // whether the asset can be used as margin in Multi-Assets mode
            "updateTime": 1625474304765 // last update time 
        },
        {
            "asset": "BUSD",            // asset name
            "walletBalance": "103.12345678",      // wallet balance
            "unrealizedProfit": "0.00000000",    // unrealized profit
            "marginBalance": "103.12345678",      // margin balance
            "maintMargin": "0.00000000",        // maintenance margin required
            "initialMargin": "0.00000000",    // total initial margin required with current mark price 
            "positionInitialMargin": "0.00000000",    //initial margin required for positions with current mark price
            "openOrderInitialMargin": "0.00000000",   // initial margin required for open orders with current mark price
            "crossWalletBalance": "103.12345678",      // crossed wallet balance
            "crossUnPnl": "0.00000000"       // unrealized profit of crossed positions
            "availableBalance": "126.72469206",       // available balance
            "maxWithdrawAmount": "103.12345678",     // maximum amount for transfer out
            "marginAvailable": true,    // whether the asset can be used as margin in Multi-Assets mode
            "updateTime": 1625474304765 // last update time
        }
    ],
    "positions": [  // positions of all symbols in the market are returned
        // only "BOTH" positions will be returned with One-way mode
        // only "LONG" and "SHORT" positions will be returned with Hedge mode
        {
            "symbol": "BTCUSDT",    // symbol name
            "initialMargin": "0",   // initial margin required with current mark price 
            "maintMargin": "0",     // maintenance margin required
            "unrealizedProfit": "0.00000000",  // unrealized profit
            "positionInitialMargin": "0",      // initial margin required for positions with current mark price
            "openOrderInitialMargin": "0",     // initial margin required for open orders with current mark price
            "leverage": "100",      // current initial leverage
            "isolated": true,       // if the position is isolated
            "entryPrice": "0.00000",    // average entry price
            "breakEvenPrice": "0.0",    // average entry price
            "maxNotional": "250000",    // maximum available notional with current leverage
            "bidNotional": "0",  // bids notional, ignore
            "askNotional": "0",  // ask notional, ignore
            "positionSide": "BOTH",     // position side
            "positionAmt": "0",         // position amount
            "updateTime": 0           // last update time
        }
    ]
}
 */

// Create our number formatter.
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
const BinanceAccountInfo = (props) => {
  const message = props.message;

  return (
    <>
      {Array.isArray(message.accounts) &&
        message.accounts?.map((account, index) => {
          const positions = account.positions;
          const assets = account.assets;
          const fields = {
            totalWalletBalance: "wallet balance",
            totalUnrealizedProfit: "unrealized profit",
            totalMarginBalance: "margin balance",
            totalCrossWalletBalance: "crossed wallet balance",
            totalCrossUnPnl: "unrealized profit of crossed positions",
            availableBalance: "available balance",
            maxWithdrawAmount: "maximum amount for withdraw",
          };
          const keys = Object.keys(fields);
          const fieldValues = Object.values(fields);

          const positionFields = {
            positionAmt: "position amount",
            entryPrice: "average entry price",
            unrealizedProfit: "unrealized profit",
          };

          return (
            <>
              <CCol xl={4}>
                <CCard className="mb-4">
                  <CCardHeader>Information</CCardHeader>
                  <CCardBody>
                    <table className="table">
                      <tbody>
                        {keys.map((key, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                <p>
                                  <code className="highlighter-rouge">
                                    {fieldValues[index]}
                                  </code>
                                </p>
                              </td>
                              <td>
                                <span className="h6">
                                  {formatter.format(account[key])}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol xl={4}>
                <CCard className="mb-4">
                  <CCardHeader>Assets</CCardHeader>
                  <CCardBody>
                    <table className="table">
                      <tbody>
                        {assets.map((asset, idx) => {
                          return (
                            <tr key={idx}>
                              <td>
                                <p>
                                  <code className="highlighter-rouge">
                                    {asset["asset"]}
                                  </code>
                                </p>
                              </td>
                              <td>
                                <span className="h6">
                                  {formatter.format(asset["balance"])}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol xl={4}>
                <CCard className="mb-4">
                  <CCardHeader>Positions</CCardHeader>
                  <CCardBody>
                    <table className="table">
                      {positions.map((position, index) => {
                        return (
                          <>
                            <thead>
                              <tr key={index}>
                                <th>{position["symbol"]}</th>
                                {/* <th>Value</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(positionFields).map((key, index) => {
                                return (
                                  <tr key={index}>
                                    <td>
                                      <p>
                                        <code className="highlighter-rouge">
                                          {Object.values(positionFields)[index]}
                                        </code>
                                      </p>
                                    </td>
                                    <td>
                                      <span className="h6">
                                        {Object.keys(positionFields)[index] ===
                                        "positionAmt"
                                          ? Number(position[key])
                                          : formatter.format(position[key])}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </>
                        );
                      })}
                    </table>
                  </CCardBody>
                </CCard>
              </CCol>
            </>
          );
        })}
    </>
  );
};
const GateIOAccountInfo = (props) => {
  const accounts = props.message.accounts;
  if (_.isEmpty(accounts)) {
    return;
  }

  const assets = [];
  let asset1 = {};
  asset1["asset"] = accounts.currency;
  asset1["balance"] = accounts.total;
  assets.push(asset1);

  return (
    <>
      <CCol xl={4}>
        <CCard className="mb-4">
          <CCardHeader>Assets</CCardHeader>
          <CCardBody>
            <table className="table">
              <tbody>
                {assets.map((asset, idx) => {
                  return (
                    <tr key={idx}>
                      <td>
                        <p>
                          <code className="highlighter-rouge">
                            {asset["asset"]}
                          </code>
                        </p>
                      </td>
                      <td>
                        <span className="h6">
                          {formatter.format(asset["balance"])}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </CCol>
    </>
  );
};
const ByBitAccountInfo = (props) => {
  return <>Not supported yet</>;
};

const TR7BotAccount = (props) => {
  const {
    loading,
    symbolList,
    symbolListGateIO,
    symbolListByBit,
    curExchange,
    curSymbol,
    userOrderParam,
    setOrderInfo,
  } = useFuturesOrderInfo();
  // const [exchange, $exchange] = useState(EXCHANGE_BINANCE);
  const [message, $message] = useState(null);
  async function fetchSomeBotData(exchange) {
    const response = await tr7TradingBot.fetchAccountInfo(exchange);
    return response;
  }
  useEffect(() => {
    $message(null);
    fetchSomeBotData(curExchange).then((response) => $message(response));
    const id = setInterval(() => {
      fetchSomeBotData(curExchange).then((response) => $message(response));
    }, 3500);

    return () => clearInterval(id);
  }, [curExchange]);
  function exchangeChangeHandler(exchange) {
    setOrderInfo(CUR_EXCHANGE, exchange);
  }

  if (_.isEmpty(message)) {
    return <CSpinner color="info" />;
  } else {
    return (
      <>
        <CButtonGroup role="group" className="mt-2 mb-4">
          <CFormCheck
            type="radio"
            button={{ color: "primary", variant: "outline" }}
            name="vbtnradio"
            id="vbtnradio0"
            autoComplete="off"
            label="Binance"
            defaultChecked={curExchange === EXCHANGE_BINANCE}
            onClick={() => {
              // console.log("exchange:", EXCHANGE_BINANCE);
              exchangeChangeHandler(EXCHANGE_BINANCE);
            }}
          />
          <CFormCheck
            type="radio"
            button={{ color: "primary", variant: "outline" }}
            name="vbtnradio"
            id="vbtnradio1"
            autoComplete="off"
            label="GateIO"
            defaultChecked={curExchange === EXCHANGE_GATEIO}
            onClick={() => exchangeChangeHandler(EXCHANGE_GATEIO)}
          />
          <CFormCheck
            type="radio"
            button={{ color: "primary", variant: "outline" }}
            name="vbtnradio"
            id="vbtnradio2"
            autoComplete="off"
            label="ByBit"
            defaultChecked={curExchange === EXCHANGE_BYBIT}
            onClick={() => exchangeChangeHandler(EXCHANGE_BYBIT)}
          />
        </CButtonGroup>
        <CRow>
          {curExchange === EXCHANGE_BINANCE && (
            <BinanceAccountInfo message={message} />
          )}
          {curExchange === EXCHANGE_GATEIO && (
            <GateIOAccountInfo message={message} />
          )}
          {curExchange === EXCHANGE_BYBIT && (
            <ByBitAccountInfo message={message} />
          )}
        </CRow>
      </>
    );
  }
};

export default TR7BotAccount;
