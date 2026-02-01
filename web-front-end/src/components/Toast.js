import React from "react";
import { CToast, CToastHeader, CToastBody } from "@coreui/react";

const Toast = (header, body) => {
  return (
    <CToast color="secondary">
      <div>
        <CToastHeader closeButton>
          {/* <svg
            className="rounded me-2"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
            role="img"
          >
            <rect width="100%" height="100%" fill="#007aff"></rect>
          </svg> */}
          <div className="fw-bold me-auto">{header}</div>
        </CToastHeader>
        <CToastBody>{body}</CToastBody>
      </div>
    </CToast>
  );
};

export default Toast;
