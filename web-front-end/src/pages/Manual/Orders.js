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
import { EXCHANGE_GATEIO } from "../../Model/tr7-trading-bot.js";
// const months = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];
function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");
}

const OrderCard = (props) => {
  const orderHeader = props.orderHeader;
  const orderValue = props.orderValue;
  const symbol = orderValue[1];
  const time = orderValue[0];
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
              {orderHeader.slice(2, 8).map((item, index) => {
                return (
                  <CTableRow>
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

const Orders = ({ openOrders, isClose, exchange }) => {
  const ordersHeader = [
    "Time",
    "Symbol",
    "Type",
    "Side",
    "Price",
    "Amount",
    // "Filled",
    "Reduce Only",
    // "Post Only",
    // "Trigger Conditions",
    // "TP/SL",
    // "Cancel All",
  ];
  const curOrders = [];
  // console.log("openOrders[0]", openOrders[0]);
  // console.log("openOrders[1]", openOrders[1]);
  openOrders.forEach((order) => {
    // console.log("openOrders.forEach", order);
    const tempOrder = [];
    const time = dayjs(order.time).format("DD/MM HH:mm:ss");
    tempOrder.push(time);
    tempOrder.push(order.symbol);
    tempOrder.push(order.type);
    tempOrder.push(order.side);
    tempOrder.push(order.price);
    tempOrder.push(`${(order.price * order.origQty).toFixed(2)}`);
    // tempOrder.push(order.status === "FILLED" ? "filled" : "0");
    tempOrder.push(order.reduceOnly ? "Yes" : "No");
    // tempOrder.push("--");
    // tempOrder.push("--");
    // tempOrder.push("--");
    // tempOrder.push("--");

    curOrders.push(tempOrder);
  });
  return (
    <>
      <CRow>
        <CCol xl={12}>
          <CCard className="mb-4">
            <CCardHeader>
              {exchange === EXCHANGE_GATEIO
                ? `Limit/Market Orders`
                : `Open Orders`}{" "}
              ({openOrders.length})
            </CCardHeader>
            <CCardBody>
              {openOrders.length > 0 && (
                <>
                  <div id="orders-card" className="d-flex flex-wrap">
                    {curOrders.map((order, index) => {
                      return (
                        <OrderCard
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
