import express from "express";
import positions from "./positions.js";
import routerTrade from "./trade.js";
import strategy from "./strategy/index.js";

import { symbols, getSymbolInfo, pricePrecisions } from "./symbols.js";

const routerAdmin = express.Router();

routerAdmin.get("/positions", positions);
routerAdmin.use("/symbols", symbols);
routerAdmin.use("/price-precisions", pricePrecisions);
routerAdmin.get("/symbol-info", getSymbolInfo);
routerAdmin.use("/trade", routerTrade);
routerAdmin.use("/strategy", strategy);

export default routerAdmin;
