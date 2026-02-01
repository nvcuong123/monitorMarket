import React from "react";

const Home = React.lazy(() => import("./pages/Home"));
const Account = React.lazy(() => import("./pages/Account"));
const TradeInfo = React.lazy(() => import("./pages/TradeInfo"));
const ManualDCA = React.lazy(() => import("./pages/Manual/ManualDCA"));
const ManualGrid = React.lazy(() => import("./pages/Manual/ManualGrid"));
const ManualPositions = React.lazy(() =>
  import("./pages/Manual/ManualPositions")
);
const MultiExchangeOrder = React.lazy(() =>
  import("./pages/Manual/MultiExchangeOrder")
);
const AutoBollingerBand = React.lazy(() =>
  import("./pages/Auto/AutoBollingerBand")
);
const AutoRSI = React.lazy(() => import("./pages/Auto/AutoRSI"));
const AutoDCA = React.lazy(() => import("./pages/Auto/AutoDCA"));
const AutoGrid = React.lazy(() => import("./pages/Auto/AutoGrid"));
const AnalysisOffChain = React.lazy(() => import("./pages/Analysis/OffChain"));
const AnalysisOnChain = React.lazy(() => import("./pages/Analysis/OnChain"));
const CoinGlassView = React.lazy(() =>
  import("./pages/CoinGlass/CoinGlassData")
);
const BinanceHeatmap = React.lazy(() =>
  import("./pages/Analysis/Binance/BinanceHeatmap")
);
const BinanceAlerts = React.lazy(() =>
  import("./pages/Analysis/Binance/BinanceAlerts")
);
const BinanceSignals = React.lazy(() =>
  import("./pages/Analysis/Binance/BinanceSignals")
);

const Docs = React.lazy(() => import("./pages/Docs"));

const routes = [
  // { path: "/", exact: true, name: "Home" },
  {
    path: "/analysis/coinglass",
    name: "AnalysisCoinglass",
    element: CoinGlassView,
  },
  {
    path: "/analysis/BinanceHeatmap",
    name: "BinanceHeatmap",
    element: BinanceHeatmap,
  },
  {
    path: "/analysis/binance-alerts",
    name: "BinanceAlerts",
    element: BinanceAlerts,
  },
  {
    path: "/analysis/binance-signals",
    name: "BinanceSignals",
    element: BinanceSignals,
  },

  // { path: "/home", name: "Home", element: Home },
  { path: "/balance", name: "Account", element: Account },
  { path: "/tradeinfo", name: "TradeInfo", element: TradeInfo },
  {
    path: "/manual/positions",
    name: "ManualPositions",
    element: ManualPositions,
  },
  {
    path: "/manual/multiexchange-order",
    name: "MultiExchangeOrder",
    element: MultiExchangeOrder,
  },
  { path: "/manual/dca", name: "ManualDCA", element: ManualDCA },
  { path: "/auto/grid", name: "AutoGrid", element: AutoGrid },
  // { path: "/auto/dca", name: "AutoDCA", element: AutoDCA },
  { path: "/auto/rsi", name: "AutoRSI", element: AutoRSI },
  {
    path: "/auto/bollinger",
    name: "AutoBollingerBand",
    element: AutoBollingerBand,
  },
  {
    path: "/analysis/onchain",
    name: "AnalysisOnChain",
    element: AnalysisOnChain,
  },
  {
    path: "/analysis/offchain",
    name: "AnalysisOffChain",
    element: AnalysisOffChain,
  },
  {
    path: "/docs",
    name: "Docs",
    element: Docs,
  },
  // {
  //   path: "/analysis/offchain/rsi",
  //   name: "AnalysisOffChainRSI",
  //   element: AnalysisOffChainRSI,
  // },
];

export default routes;
