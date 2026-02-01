import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../Provider/Auth";
import tr7TradingBot, {
  EXCHANGE_BINANCE,
} from "../../Model/tr7-trading-bot.js";
import classNames from "classnames";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CTableBody,
  CToaster,
  CTooltip,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";
import Position from "../../components/Trade/Position";
import PositionCard from "../../components/Trade/PositionCard.js";
import Toast from "../../components/Toast";

const Positions = ({ positions, isClose, exchange }) => {
  const [toast, addToast] = useState(0);
  const toasterRef = useRef();

  async function submitClosePosition(position, type, price) {
    const resp = await tr7TradingBot.closePosition(
      position,
      type,
      price,
      exchange
    );
    return resp;
  }
  function closePositionHandler(position) {
    // addToast(Toast("Close Position", "submitting order..."));
    submitClosePosition(position, "market", 0).then((resp) => {
      addToast(Toast("Close Position", resp.message));
    });
  }
  function closePositionLimitHandler(position, limitPrice) {
    const minPrice = position.markPrice - (position.markPrice * 50) / 100;
    const maxPrice = position.markPrice * 1.5;
    if (limitPrice >= minPrice && limitPrice <= maxPrice) {
      // addToast(Toast("Close Position", "submitting order..."));
      submitClosePosition(position, "limit", limitPrice).then((resp) => {
        addToast(Toast("Close Position", resp.message));
      });
    } else {
      addToast(
        Toast(
          "Close Position",
          "price should be larger or smaller than mark price maximum of 50%"
        )
      );
    }
  }
  function closeAllPositionsHandler() {
    // addToast(Toast("Close All Positions", "submitting order..."));
    (async function submitClosePositions() {
      const resp = await tr7TradingBot.clearPositions();
      addToast(Toast("Close All Positions", `${resp.msg}`));
      return resp;
    })();
  }
  /** ["Symbol", "Size", "Entry Price", "Mark Price", "Liq.Price", "Margin", "PNL"]
   *
   */
  const curPositions = positions.map((position, index) => {
    const {
      symbol,
      entryPrice,
      unRealizedProfit,
      positionAmt,
      markPrice,
      liquidationPrice,
      lastPrice,
      leverage,
      pricePrecision,
      size,
      marginSize,
    } = position;
    // console.log("position", index, position);
    const roe = (unRealizedProfit * 100) / (Math.abs(size) / leverage);
    return {
      symbol,
      positionAmt,
      size: Number(size).toFixed(2),
      entryPrice,
      markPrice,
      lastPrice,
      liquidationPrice,
      marginSize: Number(marginSize).toFixed(2),
      pnl: Number(unRealizedProfit).toFixed(2),
      roe: Number(roe).toFixed(2),
      leverage,
    };
  });
  let positionsHeader = [
    "Symbol",
    "Size",
    "Entry Price",
    "Mark Price",
    "Liq. Price",
    "Last Price",
    "Margin",
    "PNL (ROI%)",
  ];
  if (isClose) {
    if (exchange === EXCHANGE_BINANCE) {
      positionsHeader.push("Close All Positions");
    } else {
      positionsHeader.push("Close Position");
    }
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardHeader>Positions ({curPositions.length})</CCardHeader>
            <CCardBody>
              {curPositions.length > 0 && (
                <>
                  <div id="positions-card" className="d-flex flex-wrap">
                    {curPositions.map((position, index) => {
                      return (
                        <PositionCard
                          position={position}
                          key={index}
                          isClose={isClose}
                          closeHandler={closePositionHandler}
                          closeLimitHandler={closePositionLimitHandler}
                        />
                      );
                    })}
                  </div>
                  <CTable id="positions-table">
                    <CTableHead className="">
                      <CTableRow>
                        {positionsHeader.map((key, index) => {
                          if (key === "Close All Positions") {
                            return (
                              <CTableHeaderCell key={index}>
                                <div>
                                  <CTooltip
                                    content="close all positions as market price"
                                    placement="top"
                                  >
                                    <CButton
                                      variant="ghost"
                                      color="warning"
                                      onClick={closeAllPositionsHandler}
                                    >
                                      {key}
                                    </CButton>
                                  </CTooltip>
                                </div>
                              </CTableHeaderCell>
                            );
                          }
                          return (
                            <CTableHeaderCell key={index}>
                              {key}
                            </CTableHeaderCell>
                          );
                        })}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {curPositions.map((position, index) => {
                        return (
                          <Position
                            position={position}
                            key={index}
                            isClose={isClose}
                            closeHandler={closePositionHandler}
                            closeLimitHandler={closePositionLimitHandler}
                            supCloseLimit={
                              exchange === EXCHANGE_BINANCE ? true : false
                            }
                          />
                        );
                      })}
                    </CTableBody>
                  </CTable>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CToaster ref={toasterRef} push={toast} placement="top-end"></CToaster>
      {/* <CModal
        alignment="center"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <ClosePositionModal
          position={position}
          response={respClose}
          closeModalHandler={() => setVisible(false)}
        />
      </CModal> */}
    </>
  );
};

export default Positions;
