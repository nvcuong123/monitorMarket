import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from "@coreui/react";
import Symbol from "../../components/Data/Symbol";
import dayjs from "dayjs";
import _ from "lodash";

const PriceTriggerOrderCard = (props) => {
  const { orderHeader, orderValue } = props;
  const numberFields = _.size(orderHeader);
  const symbol = orderValue[0];
  const time = orderValue[1];
  // const [time, symbol, type, side, price, amount, reduceOnly, tpSl] = orderValue;

  return (
    <CCol xs={12} md={6} xl={4}>
      <CCard className="mx-1 mb-2" color="secondary" textColor="white">
        <CCardHeader>
          <div className="d-flex d-flex-row justify-content-between align-items-center">
            <Symbol symbol={symbol} />
            <div className="mx-2" style={{ fontSize: "smaller" }}>
              {time}
            </div>
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
              {orderHeader.slice(2, numberFields).map((item, index) => {
                return (
                  <CTableRow key={index}>
                    <CTableHeaderCell>{item}</CTableHeaderCell>
                    <CTableDataCell>{orderValue[index + 2]}</CTableDataCell>
                  </CTableRow>
                );
              })}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

const Orders = ({ openOrders }) => {
  const ordersHeader = [
    "Contract",
    "Created At",
    "Side",
    "Trigger Price",
    "Order Price",
    "Qty (USDT)",
    "Remarks",
    // "TP/SL",
  ];
  const curOrders = [];
  // console.log("openOrders[0]", openOrders[0]);
  // console.log("openOrders[1]", openOrders[1]);
  openOrders.forEach((order) => {
    const { initial, trigger, orderType, createTime } = order;
    // console.log("openOrders.forEach", order);
    const tempOrder = [];
    const time = dayjs(createTime * 1000).format("DD/MM HH:mm:ss");
    const tpSlSide = `${orderType} / ${
      (trigger.rule === 1 &&
        (orderType === "close-short-order" ||
          orderType === "close-short-position")) ||
      (trigger.rule === 2 &&
        (orderType === "close-long-order" ||
          orderType === "close-long-position"))
        ? "Stop Loss"
        : "Take Profit"
    }`;
    const triggerPrice =
      trigger.priceType === 0
        ? trigger.rule === 1
          ? `Last Price >= ${trigger.price}`
          : `Last Price <= ${trigger.price}`
        : `???`;
    const orderPrice = Number(initial.price) === 0 ? `Market` : `???`;
    const orderQtyUSDT =
      initial.size === 0
        ? `Cross`
        : `${Math.abs(
            initial.size * Number(order.quantoMultiplier) * trigger.price
          ).toFixed(4)}`;
    const remarks = initial.isReduceOnly === true ? `Reduce-Only` : `???`;
    //
    tempOrder.push(initial.contract);
    tempOrder.push(time);
    tempOrder.push(tpSlSide);
    tempOrder.push(triggerPrice);
    tempOrder.push(orderPrice);
    tempOrder.push(orderQtyUSDT);
    tempOrder.push(remarks);
    // tempOrder.push("--");

    curOrders.push(tempOrder);
  });
  return (
    <>
      <CRow>
        <CCol xl={12}>
          <CCard className="mb-4">
            <CCardHeader>Trigger Orders ({openOrders.length})</CCardHeader>
            <CCardBody>
              {openOrders.length > 0 && (
                <>
                  <div id="orders-card" className="d-flex flex-wrap">
                    {curOrders.map((order, index) => {
                      return (
                        <PriceTriggerOrderCard
                          orderHeader={ordersHeader}
                          orderValue={order}
                        />
                      );
                    })}
                  </div>
                  <CTable id="orders-table">
                    <CTableHead>
                      <tr>
                        {ordersHeader.map((header, index) => {
                          return <th key={index}>{header}</th>;
                        })}
                      </tr>
                    </CTableHead>
                    <CTableBody>
                      {curOrders.map((order, index) => {
                        return (
                          <tr index={index}>
                            {order.map((value, idx) => {
                              return (
                                <td>
                                  <span className="h6">{value}</span>
                                </td>
                              );
                            })}
                          </tr>
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
    </>
  );
};

export default Orders;
