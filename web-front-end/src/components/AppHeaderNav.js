import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import _ from "lodash";
import { Dropdown } from "react-bootstrap";

import {
  CBadge,
  CNavLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CNavTitle,
  CNavItem,
} from "@coreui/react";

export const AppHeaderNav = ({ items }) => {
  const location = useLocation();
  const navLink = (name, icon, badge) => {
    return (
      <>
        {/* {icon && icon} */}
        {name && name}
        {badge && (
          <CNavLink color={badge.color} className="ms-auto">
            {badge.text}
          </CNavLink>
        )}
      </>
    );
  };

  const navItem = (item, index) => {
    const { component, name, badge, icon, ...rest } = item;

    return (
      <CNavItem
        {...(rest.to &&
          !rest.items && {
            component: NavLink,
          })}
        key={index}
        {...rest}
      >
        {navLink(name, icon, badge)}
      </CNavItem>
    );
  };

  const NavGroup = (props) => {
    const [open, setOpen] = useState(false);

    const { group, items } = props.item;
    // console.log("group", group, "items", items);
    const { component, name, icon, to, ...rest } = group;

    return (
      // <CDropdown
      //   variant="nav-item"
      //   hover
      //   // idx={String(index)}
      //   key={index}
      //   // toggler={navLink(name, icon)}
      //   // visible={location.pathname.startsWith(to)}
      //   {...rest}
      // >
      //   <CDropdownToggle color="secondary">{name}</CDropdownToggle>
      //   <CDropdownMenu>
      //     {items?.map((item, index) => {
      //       const { component, name, badge, icon, ...rest } = item;
      //       return <CDropdownItem>{navItem(item, index)}</CDropdownItem>;
      //     })}
      //   </CDropdownMenu>
      // </CDropdown>
      // To rewrite the selected code using react-bootstrap for a hover event menu dropdown:
      <div className="mx-1">
        <Dropdown
          // data-bs-theme="dark"
          // as="nav-item"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          key={props.index}
          {...rest}
        >
          <Dropdown.Toggle variant="dark" id="dropdown-basic">
            {name}
          </Dropdown.Toggle>
          <Dropdown.Menu show={open}>
            {items?.map((item, index) => (
              <Dropdown.Item key={index}>{navItem(item, index)}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };
  //
  // console.log("items", items);
  const appHeaderNavItems = [];
  let curGroup = {};
  for (let index = 0; index < items.length; index++) {
    if (items[index].component === CNavTitle) {
      if (!_.isEmpty(curGroup.items)) {
        appHeaderNavItems.push(curGroup);
        curGroup = {};
      }
      curGroup.group = items[index];
      curGroup.items = [];
    } else if (items[index].component === CNavItem) {
      curGroup.items.push(items[index]);
    }
  }
  if (!_.isEmpty(curGroup)) {
    appHeaderNavItems.push(curGroup);
  }
  // console.log("appHeaderNavItems:", appHeaderNavItems);

  return (
    <React.Fragment>
      {appHeaderNavItems &&
        appHeaderNavItems.map((item, index) => (
          <NavGroup item={item} index={index} />
        ))}
    </React.Fragment>
  );
};

AppHeaderNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
