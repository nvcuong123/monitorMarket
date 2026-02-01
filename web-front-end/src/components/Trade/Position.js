import React, { useEffect } from "react";
import { useState } from "react";
import tr7TradingBot from "../../Model/tr7-trading-bot.js";
import classNames from "classnames";
import {
  CBadge,
  CButton,
  CTableRow,
  CTableDataCell,
  CInputGroup,
  CFormInput,
  CCol,
} from "@coreui/react";

const Position = ({
  position,
  index,
  isClose,
  closeHandler,
  closeLimitHandler,
  supCloseLimit,
}) => {
  const [limitPrice, $limitPrice] = useState("");
  // useEffect(() => {
  //   console.log(position.markPrice);
  // }, [position.markPrice]);
  function closePositionHandler(e) {
    closeHandler(position);
  }
  function closePositionAsLimitHandler(e) {
    closeLimitHandler(position, limitPrice);
    $limitPrice("");
  }
  // console.log("position", position);
  let color = position.positionAmt > 0 ? "info" : "danger";
  let closeColor = position.pnl > 0 ? "success" : "danger";
  return (
    <>
      <CTableRow key={index} className="">
        <CTableDataCell className="align-middle">
          <CBadge color={color}>{position.symbol}</CBadge>
          <span>
            <CButton variant="ghost" color="warning" size="sm">
              {position.leverage}x
            </CButton>
          </span>
        </CTableDataCell>
        <CTableDataCell
          // color={color}
          className={classNames({
            "text-info": position.size > 0,
            "text-danger": position.size < 0,
            "align-middle": true,
          })}
        >
          {position.size}
        </CTableDataCell>
        <CTableDataCell className="align-middle">
          {position.entryPrice}
        </CTableDataCell>
        <CTableDataCell className="align-middle">
          {position.markPrice}
        </CTableDataCell>
        <CTableDataCell className="align-middle text-warning">
          {position.liquidationPrice}
        </CTableDataCell>
        <CTableDataCell className="align-middle text-info">
          {position.lastPrice}
        </CTableDataCell>
        <CTableDataCell className="align-middle">
          {position.marginSize}
        </CTableDataCell>
        <CTableDataCell
          className={classNames({
            "text-success": position.pnl > 0,
            "text-danger": position.pnl < 0,
            "align-middle": true,
          })}
        >
          {position.pnl} ({position.roe}%)
        </CTableDataCell>
        {isClose && (
          <CTableDataCell className="align-middle">
            <div className="d-inline-flex justify-content-start align-items-center align-self-center flex-fill">
              <CButton
                color={closeColor}
                variant="ghost"
                value={position}
                onClick={closePositionHandler}
                size="sm"
              >
                Market
              </CButton>
              {supCloseLimit && (
                <>
                  <div className="vr align-middle" />
                  <CButton
                    color={closeColor}
                    variant="ghost"
                    value={position}
                    onClick={closePositionAsLimitHandler}
                    size="sm"
                  >
                    Limit
                  </CButton>
                  <div className="col-4">
                    <CFormInput
                      type="number"
                      size="sm"
                      placeholder="price"
                      value={limitPrice}
                      id="limit-price"
                      onChange={(e) => $limitPrice(e.target.value)}
                      // className="col-5"
                    />
                  </div>
                </>
              )}
            </div>
          </CTableDataCell>
        )}
      </CTableRow>
    </>
  );
};

export default Position;
