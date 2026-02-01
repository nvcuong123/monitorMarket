import { CBadge } from "@coreui/react";

const Pill = (props) => {
  //
  return (
    <>
      <CBadge
        style={{ display: "flex", alignItems: "center" }}
        className="custom-link"
        color="info"
      >
        {props.info}
      </CBadge>
    </>
  );
};

export default Pill;
