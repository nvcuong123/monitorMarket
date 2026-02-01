import React from "react";
import { useState } from "react";
import classNames from "classnames";
import {
  CBadge,
  CButton,
  CTableRow,
  CTableDataCell,
  CFormInput,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableBody,
  CTableHeaderCell,
} from "@coreui/react";
import Symbol from "../Data/Symbol";

const PositionCard = ({
  position,
  index,
  isClose,
  closeHandler,
  closeLimitHandler,
  supCloseLimit,
}) => {
  const [limitPrice, $limitPrice] = useState("");
  function closePositionHandler(e) {
    closeHandler(position);
  }
  function closePositionAsLimitHandler(e) {
    closeLimitHandler(position, limitPrice);
    $limitPrice("");
  }
  let color = position.positionAmt > 0 ? "info" : "danger";
  let closeColor = position.pnl > 0 ? "success" : "danger";
  return (
    <CCol xs={12} md={6} xl={4}>
      <CCard className="mx-1 mb-2">
        <CCardHeader>
          <div className="d-flex d-flex-row justify-content-between align-items-center">
            <Symbol symbol={position.symbol} />

            <CButton variant="ghost" color="warning" size="sm">
              {position.leverage}x
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CTable
            striped
            hover
            responsive
            color="light"
            className="smaller-text mt-2"
            style={{ width: "100%" }}
          >
            <CTableBody style={{ overflowY: "auto" }}>
              <CTableRow>
                <CTableHeaderCell>Size</CTableHeaderCell>
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
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Entry Price</CTableHeaderCell>
                <CTableDataCell className="align-middle">
                  {position.entryPrice}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Mark Price</CTableHeaderCell>
                <CTableDataCell className="align-middle">
                  {position.markPrice}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Liquid Price</CTableHeaderCell>
                <CTableDataCell className="align-middle text-warning">
                  {position.liquidationPrice}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Last Price</CTableHeaderCell>
                <CTableDataCell className="align-middle text-info">
                  {position.lastPrice}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>Margin Size</CTableHeaderCell>
                <CTableDataCell className="align-middle">
                  {position.marginSize}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableHeaderCell>PNL (%)</CTableHeaderCell>
                <CTableDataCell
                  className={classNames({
                    "text-success": position.pnl > 0,
                    "text-danger": position.pnl < 0,
                    "align-middle": true,
                  })}
                >
                  {position.pnl} ({position.roe}%)
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
          {isClose && (
            <div className="d-flex align-items-center">
              <div>Close</div>
              <div className="align-middle">
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
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default PositionCard;
