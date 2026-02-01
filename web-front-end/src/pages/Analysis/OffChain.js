import { CNav, CNavItem, CNavLink } from "@coreui/react";
import RSIAnalysic from "./RSIAanalysic";
/**
 *
 * @returns
 */
const AnalysisOffChain = () => {
  return (
    <>
      <CNav variant="tabs">
        <CNavItem href="#rsi" active>
          RSI
        </CNavItem>
        <CNavItem href="#bollingerband">Bollinger Band</CNavItem>
      </CNav>
      <RSIAnalysic />
    </>
  );
};

export default AnalysisOffChain;
