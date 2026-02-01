import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBell, cilEnvelopeOpen, cilList, cilMenu } from "@coreui/icons";

import { AppBreadcrumb } from "./index";
import { AppHeaderDropdown } from "./header/index";
import logo from "../assets/brand/logo.png";
import { useAuth } from "../Provider/Auth";
import navigation from "../_nav";
import { AppHeaderNav } from "./AppHeaderNav.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

const NotificationIcon = (props) => {
  if (props.blOn) return <FontAwesomeIcon icon={faVolumeHigh} />;
  return <FontAwesomeIcon icon={faVolumeMute} />;
};

const vars = {
  // "--cui-header-bg": "black",
  "--cui-header-min-height": "3rem",
  "--cui-header-padding-y": "0.375rem",
};

const AppHeader = () => {
  const { onLogout } = useAuth();
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const notifOnOff = useSelector((state) => state.notifOnOff);

  function logoutHandler() {
    onLogout();
  }
  //
  return (
    <CHeader position="sticky" className="mb-2" style={vars}>
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1 d-md-none"
          onClick={() => dispatch({ type: "set", sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand className="d-none d-md-flex" to="/">
          <img src={logo} alt="CDS Logo" height={28} />
          <div>CDS Bot</div>
        </CHeaderBrand>
        <CHeaderNav className="d-none d-md-flex me-auto">
          <AppHeaderNav items={navigation} />
        </CHeaderNav>
        {/* <CHeaderNav>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav> */}
        {/* <CHeaderNav className="ms-3">
          <AppHeaderDropdown />
        </CHeaderNav> */}
        <div className="d-flex align-items-center">
          <div
            className="mx-3"
            onClick={() => dispatch({ type: "set", notifOnOff: !notifOnOff })}
          >
            <NotificationIcon blOn={notifOnOff} />
          </div>
          <CButton color="dark" onClick={logoutHandler}>
            Log Out
          </CButton>
        </div>
      </CContainer>
      {/* <CHeaderDivider /> */}
      {/* <CContainer fluid>
        <AppBreadcrumb />
      </CContainer> */}
    </CHeader>
  );
};

export default AppHeader;
