import React from "react";
import { useState, useEffect } from "react";
import tr7TradingBot from "../Model/tr7-trading-bot.js";
import {
  CSpinner,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
} from "@coreui/react";
import Positions from "./Manual/Positions.js";

const TR7BotTrade = (props) => {
  const [message, $message] = useState(null);
  const exchange = props.exchange;

  async function fetchSomeBotData(exchange) {
    const response = await tr7TradingBot.fetchTradeInfo(exchange);
    return response;
  }
  useEffect(() => {
    fetchSomeBotData(exchange).then((response) => $message(response));
    const id = setInterval(() => {
      fetchSomeBotData(exchange).then((response) => $message(response));
    }, 3000);

    return () => clearInterval(id);
  }, [exchange]);

  if (!message) {
    return <CSpinner color="info" />;
  } else {
    const openOrders = message.openOrders;
    const positions = message.positions;

    return (
      <>
        <h1>Current Orders and Positions</h1>
        {openOrders.length > 0 && (
          <CRow>
            <CCol xl={12}>
              <CCard className="mb-4">
                <CCardHeader>Orders</CCardHeader>
                <CCardBody>
                  <table className="table">
                    <thead>
                      <tr>
                        {Object.keys(openOrders[0]).map((key, index) => {
                          return <th key={index}>{key}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {openOrders.map((order, index) => {
                        return (
                          <tr index={index}>
                            {Object.values(order).map((value, idx) => {
                              return (
                                <td>
                                  <span className="h6" key={idx}>
                                    {value}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}
        {positions.length > 0 && (
          <CRow>
            <CCol xl={12}>
              {Array.isArray(message.positions) && (
                <Positions
                  positions={message.positions}
                  isClose={false}
                  exchange={exchange}
                />
              )}
            </CCol>
          </CRow>
        )}
        {openOrders.length === 0 && positions.length === 0 && (
          <CRow>There is not any open order or position</CRow>
        )}
      </>
    );
  }
};

export default TR7BotTrade;
