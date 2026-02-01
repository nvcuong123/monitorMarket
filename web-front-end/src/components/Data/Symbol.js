import { CButton, CBadge } from "@coreui/react";

const Symbol = (props) => {
  const binanceUrl = `https://www.binance.com/en/futures/${props.symbol}`;
  //
  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };
  //
  return (
    <>
      <CBadge
        style={{ display: "flex", alignItems: "center" }}
        className="custom-link"
        color="warning"
        onClick={() => openInNewTab(binanceUrl)}
      >
        {props.symbol}
      </CBadge>
    </>
  );
};

export default Symbol;
