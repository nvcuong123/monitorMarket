import WebSocket from "ws";
import crypto from "crypto";
import _ from "lodash";
import { log } from "console";
const logger = console;

/**
 * USDT Contract
Base URLs:

Real Trading: wss://fx-ws.gateio.ws/v4/ws/usdt
TestNet: wss://fx-ws-testnet.gateio.ws/v4/ws/usdt
 */

export default class GateWebSocketApp {
  constructor(isTestnet, apiKey, apiSecret, callback) {
    this.url = "wss://fx-ws.gateio.ws/v4/ws/usdt";
    if (isTestnet) {
      this.url = "wss://fx-ws-testnet.gateio.ws/v4/ws/usdt";
    }
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.callback = callback;
    this.connectToGateio();
  }
  connectToGateio() {
    const reconnectInterval = 5000; //5000ms before reconnecting
    this.ws = new WebSocket(this.url);
    this.ws.on("open", () => {
      logger.info("websocket connected");
      this.subscribe("futures.positions", ["!all"], true);
      this.subscribe("futures.orders", ["!all"], true);
    });

    this.ws.on("message", (message) => {
      // Assuming message is a Buffer or a string, directly convert it to a string.
      const dataString = message.toString();
      try {
        const jsonObject = JSON.parse(dataString);
        this.callback(jsonObject);
      } catch (error) {
        console.error("Error parsing message to JSON:", error);
        // Handle the error (e.g., log it, ignore it, or handle it according to your needs)
      }
    });
    this.ws.on("ping", () => {
      console.log("gateio-ws: ping from server");
      this.ws.pong();
    });
    this.ws.on("pong", () => {
      console.log("gateio-ws:pong");
    });
    this.ws.on("error", (message) => console.error("gateio-ws:error", message));
    this.ws.on("close", (code, reason) => {
      console.log(`gateio-ws: Connection closed: ${code} ${reason}`);
      setTimeout(this.connectToGateio, reconnectInterval);
    });
    // this.ws.on("close", this.handleSocketClose.bind(ws, true));

    this.runForever(5000);
  }
  //
  // handleSocketClose = function (reconnect, code, reason) {
  //   delete Binance.subscriptions[this.endpoint];
  //   if (
  //     Binance.subscriptions &&
  //     Object.keys(Binance.subscriptions).length === 0
  //   ) {
  //     clearInterval(Binance.socketHeartbeatInterval);
  //   }
  //   Binance.options.log(
  //     "WebSocket closed: " +
  //       this.endpoint +
  //       (code ? " (" + code + ")" : "") +
  //       (reason ? " " + reason : "")
  //   );
  //   if (Binance.options.reconnect && this.reconnect && reconnect) {
  //     if (this.endpoint && parseInt(this.endpoint.length, 10) === 60)
  //       Binance.options.log("Account data WebSocket reconnecting...");
  //     else
  //       Binance.options.log("WebSocket reconnecting: " + this.endpoint + "...");
  //     try {
  //       reconnect();
  //     } catch (error) {
  //       Binance.options.log("WebSocket reconnect error: " + error.message);
  //     }
  //   }
  // };

  runForever(pingInterval) {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log("gateio-ws: ping from client");
        this.ws.ping();
        // No need to manually send a ping message like in the Python example, as the ping method does this.
      }
    }, pingInterval);
  }

  _request(channel, event = null, payload = null, authRequired = true) {
    const currentTime = Math.floor(Date.now() / 1000);
    let data = {
      time: currentTime,
      channel: channel,
      event: event,
      payload: payload,
    };

    if (authRequired) {
      const message = `channel=${channel}&event=${event}&time=${currentTime}`;
      data.auth = {
        method: "api_key",
        KEY: this.apiKey,
        SIGN: this.getSign(message),
      };
    }

    const dataString = JSON.stringify(data);
    logger.info(`request: ${dataString}`);
    this.ws.send(dataString);
  }

  getSign(message) {
    const hmac = crypto.createHmac("sha512", this.apiSecret);
    hmac.update(message);
    return hmac.digest("hex");
  }

  subscribe(channel, payload = null, authRequired = true) {
    this._request(channel, "subscribe", payload, authRequired);
  }

  unsubscribe(channel, payload = null, authRequired = true) {
    this._request(channel, "unsubscribe", payload, authRequired);
  }
}
