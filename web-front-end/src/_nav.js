import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilBarChart,
  cilBell,
  cilCalculator,
  cilCart,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilHeart,
  cilHome,
  cilLayers,
  cilList,
  cilListRich,
  cilMemory,
  cilMenu,
  cilMoney,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
} from "@coreui/icons";
import { CNavGroup, CNavItem, CNavTitle } from "@coreui/react";

const _nav = [
  // {
  //   component: CNavItem,
  //   name: "Home",
  //   to: "/home",
  //   icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  //   // badge: {
  //   //   color: "info",
  //   //   text: "NEW",
  //   // },
  // },
  // {
  //   component: CNavTitle,
  //   name: "ACCOUNT",
  // },

  // {
  //   component: CNavItem,
  //   name: "Position",
  //   to: "/tradeinfo",
  //   icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
  // },
  {
    component: CNavTitle,
    name: "Market Analysis",
  },
  {
    component: CNavItem,
    name: "Binance Heatmap",
    to: "/analysis/BinanceHeatmap",
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Binance Alerts",
    to: "/analysis/binance-alerts",
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Binance Signals",
    to: "/analysis/binance-signals",
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   name: "Coinglass",
  //   to: "/analysis/coinglass",
  //   icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  // },

  // {
  //   component: CNavItem,
  //   name: "On-Chain",
  //   to: "/analysis/onchain",
  //   icon: <CIcon icon={cilMemory} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: "Off-Chain",
  //   to: "/analysis/offchain",
  //   icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
  // },

  {
    component: CNavTitle,
    name: "Account",
  },
  {
    component: CNavItem,
    name: "Accounts",
    to: "/balance",
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Trades",
    to: "/manual/positions",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   name: "Multi-Exchange Order",
  //   to: "/manual/multiexchange-order",
  //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavGroup,
  //   name: "Manual",
  //   to: "/manual",
  //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Positions",
  //       to: "/manual/positions",
  //     },
  //     // {
  //     //   component: CNavItem,
  //     //   name: "DCA",
  //     //   to: "/manual/dca",
  //     // },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: "Auto",
  //   to: "/auto",
  //   icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Grid",
  //       to: "/auto/grid",
  //     },
  //     // {
  //     //   component: CNavItem,
  //     //   name: "DCA",
  //     //   to: "/auto/dca",
  //     // },
  //     {
  //       component: CNavItem,
  //       name: "RSI",
  //       to: "/auto/rsi",
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Bollinger Band",
  //       to: "/auto/bollinger",
  //     },
  //   ],
  // },

  {
    component: CNavTitle,
    name: "Settings",
  },
  // {
  //   component: CNavGroup,
  //   name: "Trading",
  //   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Error 404",
  //       to: "/404",
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Error 500",
  //       to: "/500",
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: "Docs",
  //   href: "https://tr7-blockchain.atlassian.net/jira/software/projects/TTB/boards/2/backlog",
  //   target: "_blank",
  //   icon: <CIcon icon={cilExternalLink} customClassName="nav-icon" />,
  // },
  {
    component: CNavItem,
    name: "Docs",
    to: "/docs",
    icon: <CIcon icon={cilMenu} customClassName="nav-icon" />,
  },
];

export default _nav;
