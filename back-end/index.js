"use strict";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import connectDB from "./db/mongoose.js";
connectDB();
// import mongoDB from "./db/mongodb.js";
// mongoDB().catch(console.dir);

import http from "http";
import express from "express";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import helmet from "helmet";
import { WebSocketServer } from "ws";
// const uuidv4 = require("uuid").v4;
import { v4 as uuidv4 } from "uuid";
import BinanceMarketData from "./exchanges/binance/binance-market-data.js";
import _ from "lodash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// mongo connection
// import "../config/mongo.js";
// socket configuration
// import WebSockets from "./utils/WebSockets.js";
// routes
import indexRouter from "./routes/index.js";
console.log("after route index");
import services from "./modules/services.js";

services.boot();
setTimeout(services.getSomeInfo, 3000);

const app = express();
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
/** Get port from environment and store in Express. */
const port = process.env.PORT || "3000";
app.set("port", port);

const corsOptions = {
  origin: "http://localhost:3001",
  preflightContinue: true,
  credentials: true,
};
app.use(cors());
app.use(cookieParser());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", indexRouter);
const staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));
// console.log("staticPath", staticPath);
// redirect /login to root of static path
app.get("/*", function (req, res) {
  res.sendFile(path.join(staticPath, "index.html"));
});
// const redirectUrls = [
//   "/login",
//   "/home",
//   "/balance",
//   "/tradeinfo",
//   "/manual/positions",
//   "/analysis/offchain",
//   "/analysis/coinglass",
// ];
// app.use(function (req, res, next) {
//   if (req.url.slice(-1) === "/") {
//     req.url = req.url.slice(0, -1);
//   }
//   if (redirectUrls.includes(req.url)) {
//     res.redirect(301, "/");
//   } else {
//     next();
//   }
// });

/** catch 404 and forward to error handler */
app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesn't exist",
  });
});

/** Create HTTP server. */
const server = http.createServer(app);
/** Create socket connection */
const wsServer = new WebSocketServer({ server });
/** Listen on provided port, on all network interfaces. */
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${port}/`);
  // //
  // setInterval(() => {
  //   axios
  //     .get("https://csd-trading-bot.onrender.com")
  //     .then((response) => {
  //       console.log("interval ping render");
  //     })
  //     .catch((error) => {
  //       console.error("ping Error");
  //     });
  // }, 60000);
});

const notifiedClients = {};
const alertClients = {};
const heatmapClients = {};
const signalClients = {};
// A new client connection request received
wsServer.on("connection", function (connection, req) {
  console.log(`Recieved a new connection.`, "request url", req.url);
  // Generate a unique code for every user
  const userId = uuidv4();
  // Store the new connection and handle messages
  console.log(`${userId} connected.`);
  const clients = {};
  if (req.url === "/alerts") {
    alertClients[userId] = connection;
    //send data to client
    clients[userId] = connection;
    broadcastAlertsToClients(clients);
  } else if (req.url === "/heatmap") {
    heatmapClients[userId] = connection;
    //send data to client
    clients[userId] = connection;
    broadcastHeatmapToClients(clients);
  } else if (req.url === "/signals") {
    signalClients[userId] = connection;
    //send data to client
    clients[userId] = connection;
    broadcastSignalToClients(clients);
  } else if (req.url === "/notify") {
    notifiedClients[userId] = connection;
    //send data to client
    // clients[userId] = connection;
    // broadcastNotificationToClients({ msg: "OK" }, clients);
  }

  // connection.send("test message");
  connection.on("message", (message) => handleMessage(message, userId));
  // User disconnected
  connection.on("close", () => handleDisconnect(userId));
});
function handleMessage(message, userId) {
  console.log("userId:", userId, "message:", JSON.parse(message));
}
function handleDisconnect(userId) {
  console.log(`${userId} disconnected.`);
  delete alertClients[userId];
  delete heatmapClients[userId];
  delete signalClients[userId];
  delete notifiedClients[userId];
}

export async function broadcastNotification(notification) {
  broadcastNotificationToClients(notification, notifiedClients);
}
function broadcastNotificationToClients(notification, clients) {
  if (_.isEmpty(clients)) return;
  // console.log("broadcastNotificationToClients", notification);

  const json = notification;
  const data = JSON.stringify(json);
  for (let userId in clients) {
    let client = clients[userId];
    console.log("notif>", userId.split("-")[0]);
    client.send(data);
  }
}

function broadcastHeatmapToClients(clients) {
  if (_.isEmpty(clients)) return;
  // console.log("broadcast message");
  // We are sending the current data to all connected active clients
  const json = BinanceMarketData.getHeatmapData();
  const data = JSON.stringify(json);
  // console.log("data", data);
  for (let userId in clients) {
    let client = clients[userId];
    console.log("heatmap>", userId.split("-")[0]);
    client.send(data);
  }
}
function broadcastAlertsToClients(clients) {
  if (_.isEmpty(clients)) return;
  // console.log("broadcast message");
  // We are sending the current data to all connected active clients
  const json = BinanceMarketData.getAlertsData();
  // console.log("json", json.change24Hs.slice(0, 10));
  const data = JSON.stringify(json);
  // console.log("data", data);
  for (let userId in clients) {
    let client = clients[userId];
    console.log("alerts>", userId.split("-")[0]);
    client.send(data);
  }
}
function broadcastSignalToClients(clients) {
  if (_.isEmpty(clients)) return;
  const json = BinanceMarketData.getSignalsData();
  const data = JSON.stringify(json);
  for (let userId in clients) {
    let client = clients[userId];
    console.log("signals>", userId.split("-")[0]);
    client.send(data);
  }
}

function broadcastMessage() {
  broadcastAlertsToClients(alertClients);
  broadcastHeatmapToClients(heatmapClients);
  broadcastSignalToClients(signalClients);
}

// broadcast data each 5s (for smaller bandwidth on web server)
setInterval(broadcastMessage, 5000);
// setInterval(() => {
//   // test
//   const notif = {
//     alertType: "PRICE_CHANGE",
//     price: "0.61750",
//     priceChange: 6.926406926406933,
//     symbol: "ADAUSDT",
//     time: Date.now(),
//     timeframe: "1h",
//     timestamp: 1702475962762,
//   };
//   broadcastNotification(notif);
// }, 15000);

process.on("uncaughtException", (error) => {
  if (error instanceof TypeError) {
    console.error("Uncaught Exception - ", error);
  }
});
