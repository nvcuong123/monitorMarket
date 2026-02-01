import React, { useState, useEffect, useRef } from "react";
import useSound from "use-sound";
import notificationSound from "../assets/sound/mixkit-clear-announce-tones-2861.wav";
import useWebSocket from "react-use-websocket";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import BotAlert from "./BotAlert";
import { Toast, ToastContainer, Button } from "react-bootstrap";
import { DateFormatter } from "../Utils";
import dayjs from "dayjs";

const productionUrl = window.location.origin.replace("https", "wss");
const socketUrl =
  (process.env.NODE_ENV === "production"
    ? productionUrl
    : "ws://127.0.0.1:3000") + "/notify";

// const StackingAlertToast = (props) => {
//   const { alertToasts, onCloseHandler } = props;
//   //
//   const closeAlert = (index) => {
//     console.log("closeAlert", index);
//     onCloseHandler(index);
//     // $alertToats((prevToats) => _.pull(prevToats, prevToats[index]));
//   };
//   //
//   return (
//     <ToastContainer className="position-static" position="bottom-end">
//       {!_.isEmpty(alertToasts) &&
//         alertToasts.map((index) => {
//           return (
//             <Toast
//               className="my-2 mx-2"
//               bg="warning"
//               key={index}
//               onClose={() => closeAlert(index)}
//             >
//               <Toast.Header>
//                 <img
//                   src="holder.js/20x20?text=%20"
//                   className="rounded me-2"
//                   alt=""
//                 />
//                 <strong className="me-auto">
//                   {`${index} symbol timeframe`}{" "}
//                 </strong>
//                 <small className="text-muted">{DateNow()}</small>
//               </Toast.Header>
//               <Toast.Body className="text-black">
//                 <div>Price/OI/RSI:</div>
//                 <div>Change:%</div>
//                 <div>Just like this</div>
//               </Toast.Body>
//             </Toast>
//           );
//         })}
//     </ToastContainer>
//   );
// };

/**alertType: "PRICE_CHANGE"
    price: "0.61750"
    priceChange: 6.926406926406933
    symbol: "ADAUSDT"
    time: 1702475962762
    timeframe: "1h"
    timestamp: 1702472400000 
  */
const NotifCard = (props) => {
  const alert = props.alert;
  //
  return (
    <Toast
      className="my-2 mx-2"
      bg="warning"
      onClose={() => props.closeHandler()}
    >
      <Toast.Header>
        <div>{DateFormatter(alert.time)}</div>
        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
      </Toast.Header>
      <Toast.Body className="text-black">
        <div>{alert.alertType}</div>
        <div>{alert.symbol}</div>
        <div>{alert.timeframe}</div>
      </Toast.Body>
    </Toast>
  );
};

const Notification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notifList, $notifList] = useState([]);
  const dispatch = useDispatch();
  const notifOnOff = useSelector((state) => state.notifOnOff);
  const [play] = useSound(notificationSound);
  const lastMessageTimestampRef = useRef(dayjs());

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,
    retryOnError: true,
    reconnectAttempts: 1000,
    reconnectInterval: 3000,
    shouldReconnect: () => true,
    onOpen: (event) => console.log("opened ws", event),
    onClose: (closeEvent) => console.log("ws closed", closeEvent),
    onError: (errEvent) => console.log("error", errEvent),
    onReconnectStop: (numAttemp) => console.log("reconnect stopped", numAttemp),
  });

  useEffect(() => {
    if (lastMessage !== null) {
      if (notifOnOff) {
        const NUM_DISP_NOTIF = 7;
        const json = JSON.parse(lastMessage.data);
        $notifList((prevList) => {
          let newList = [...prevList];
          newList.unshift(json);
          newList = _.slice(newList, 0, NUM_DISP_NOTIF);
          return newList;
        });
        //
        // console.log(
        //   "prev:",
        //   lastMessageTimestampRef.current?.format("HH:mm:ss"),
        //   "cur:",
        //   dayjs().format("HH:mm:ss")
        // );
        if (
          dayjs().subtract(2, "second").isAfter(lastMessageTimestampRef.current)
        ) {
          play();
          lastMessageTimestampRef.current = dayjs();
        }
      }
    }
  }, [lastMessage, play]);
  useEffect(() => {
    setShowNotification(!!notifOnOff);
    if (!notifOnOff) {
      $notifList([]);
    }
  }, [notifOnOff]);
  //
  function closeHandler(idx) {
    // console.log("closeHandler", idx);
    $notifList((prevList) => {
      const newList = [...prevList];
      _.remove(newList, (value, index) => index === idx);
      return newList;
    });
  }
  // console.log("notifList.length", notifList.length);
  return (
    showNotification &&
    notifList.length > 0 && (
      <div id="notificationPanel" className="notification-panel">
        <Button variant="dark" onClick={() => $notifList([])} className="my-1">
          X
        </Button>
        <div>
          {_.map(notifList, (notif, index) => {
            return (
              <BotAlert
                key={index}
                alert={notif}
                isClose={true}
                closeHandler={() => closeHandler(index)}
              />
            );
          })}
        </div>
      </div>
    )
  );
};

export default Notification;
