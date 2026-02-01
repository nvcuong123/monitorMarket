import dayjs from "dayjs";
import { CCard, CCardHeader, CCardBody, CButton } from "@coreui/react";
import { CurrencyFormatter, PercentChangeFormatter } from "../Utils";

const BotAlert = (props) => {
  const alert = props.alert;
  const isClose = props.isClose;
  // console.log(isClose);
  const binanceUrl = `https://www.binance.com/en/futures/${alert.symbol}`;
  return (
    <CCard
      className={`mx-2 ${isClose ? "mb-2" : "mb-3"}`}
      color={`${isClose ? "secondary" : "warning"}`}
      textColor="white"
      style={{ maxWidth: "24rem" }}
    >
      <CCardHeader>
        <div className="d-flex d-flex-row justify-content-between align-items-center">
          <a
            href={binanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="custom-link"
          >
            {/* <div className="d-flex d-flex-row justify-content-between"> */}
            {/* <h5> */}
            <strong>{alert.symbol}</strong>
            {/* </h5> */}
            {/* </div> */}
          </a>
          <div className="mx-2">
            {dayjs(alert.time).format("DD/MM HH:mm:ss")}
          </div>
          {isClose && (
            <div>
              <CButton
                color="dark"
                variant="ghost"
                size="sm"
                onClick={props.closeHandler}
              >
                X
              </CButton>
            </div>
          )}
        </div>
      </CCardHeader>
      <CCardBody>
        {alert.alertType === "PRICE_CHANGE" && (
          <>
            <div className="d-flex d-flex-row justify-content-between">
              <div>{alert.alertType}</div>
              <div>{PercentChangeFormatter(alert.priceChange)}</div>
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Timeframe</div>
              <div>{alert.timeframe}</div>
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Price</div>
              <div>{CurrencyFormatter.format(alert.price)}</div>
            </div>
          </>
        )}
        {alert.alertType === "PATTERN" && (
          <>
            <div className="d-flex d-flex-row justify-content-between">
              <div>{alert.patternType}</div>
              {/* <div>{PercentChangeFormatter(alert.priceChange)}</div> */}
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Timeframe</div>
              <div>{alert.timeframe}</div>
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Price</div>
              <div>{CurrencyFormatter.format(alert.price)}</div>
            </div>
          </>
        )}
        {alert.alertType === "RSI" && (
          <>
            <div className="d-flex d-flex-row justify-content-between">
              <div>{alert.rsiType}</div>
              <div>{alert.rsi}</div>
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Timeframe</div>
              <div>{alert.timeframe}</div>
            </div>
          </>
        )}
        {alert.alertType === "OI_CHANGE" && (
          <>
            <div className="d-flex d-flex-row justify-content-between">
              <div>{alert.alertType}</div>
              <div>{PercentChangeFormatter(alert.realTimeChange)}</div>
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Timeframe</div>
              <div>{alert.timeframe}</div>
            </div>
            <div className="d-flex d-flex-row justify-content-between">
              <div>Open Interest</div>
              <div>{CurrencyFormatter.format(alert.sumOpenInterestValue)}</div>
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  );
};

export default BotAlert;
