import axios from "axios";
import bcrypt from "bcryptjs";

const curUrl = window.location.href;
const apiUrl = window.location.origin + "/api";
// console.log("apiUrl", apiUrl);
// const TR7_BOT_API_ENDPOINT = apiUrl;
const TR7_BOT_API_ENDPOINT =
  process.env.NODE_ENV === "production"
    ? apiUrl
    : process.env.REACT_APP_API_ENDPOINT_LOCAL;
console.log("TR7_BOT_API_ENDPOINT", TR7_BOT_API_ENDPOINT);
// axios.defaults.withCredentials = true;
axios.defaults.headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};
const options = {
  method: "GET",
  mode: "cors",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-access-token": "",
  },
  // credentials: "include",
};
export const EXCHANGE_BINANCE = "BINANCE";
export const EXCHANGE_GATEIO = "GATEIO";
export const EXCHANGE_BYBIT = "BYBIT";

const getApiKeyList = async () => {
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/keylist`;
  const data = window
    .fetch(fetchUrl, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};

const algorithm = "aes-256-ctr";
const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3"; //process.env.JWT_SECRET_STRING;
const encrypt = (text) => {
  const iv = Crypto.randomBytes(16);

  const cipher = Crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};
const decrypt = (hash) => {
  const decipher = Crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
};
const adminAuthenticate = async (username, password) => {
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/login`;
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  // password -> encode -> encrypt -> base64 encode
  // console.log(window.crypto);
  // let nonce = new Int32Array(1); //96 bits
  // window.crypto.getRandomValues(nonce);
  // console.log(nonce);
  const numSaltRounds = 8;
  const hashPasswod = await bcrypt.hash(password, numSaltRounds);
  console.log("client hash", hashPasswod);

  tradeOption.body = JSON.stringify({ username: username.trim(), hashPasswod });
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(json);
  const { token } = json;
  // console.log(token);
  if (token) {
    options.headers["x-access-token"] = token;
  }
  // console.log("auth", options);
  return json;
};
const logOut = async () => {
  options.headers["x-access-token"] = "";
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/logout`;
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(data);

  return json;
};
//
const fetchAllSignals = async () => {
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/download/signals`;
  const fetchOption = { ...options };
  // console.log("account", options);
  // fetchOption.credentials = "include";
  const data = window
    .fetch(fetchUrl, fetchOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
//
const fetchSomeData = async () => {
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/account`;
  const data = window
    .fetch(fetchUrl, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
const fetchAccountInfo = async (exchange = EXCHANGE_BINANCE) => {
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/account?exchange=${exchange}`;
  console.log("fetchAccountInfo:url", fetchUrl);
  // const data = axios
  //   .get(fetchUrl, { withCredentials: true })
  //   .then((response) => {
  //     return response;
  //   });
  // return await data;

  const fetchOption = { ...options };
  // console.log("account", options);
  // fetchOption.credentials = "include";
  const data = window
    .fetch(fetchUrl, fetchOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
const fetchTradeInfo = async (exchange = EXCHANGE_BINANCE) => {
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/tradeinfo?exchange=${exchange}`;
  // console.log(options);
  const data = window
    .fetch(fetchUrl, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
const getPositions = async (exchange = EXCHANGE_BINANCE) => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/positions?exchange=${exchange}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
const closePosition = async (
  position,
  type,
  price = 0,
  exchange = EXCHANGE_BINANCE
) => {
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  // amout > 0 -> position is long -> close as short
  const placeType = "close-position";
  tradeOption.body = JSON.stringify({
    placeType,
    order: {
      position,
      type,
      price,
    },
  });
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/trade?exchange=${exchange}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
const clearPositions = async () => {
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  // amout > 0 -> position is long -> close as short
  const placeType = "clear-positions";
  tradeOption.body = JSON.stringify({
    placeType,
  });
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/trade`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};

const placeNewOrder = async (inputOrder, exchange = EXCHANGE_BINANCE) => {
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  const order = { ...inputOrder };
  order.placeType = "new order";
  console.log("placeNewOrder", order);
  tradeOption.body = JSON.stringify(order);
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/trade?exchange=${exchange}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};

const getPricePrecisions = async () => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/price-precisions`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(json);
  return json;
};
const getSymbolList = async (exchange = EXCHANGE_BINANCE) => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/symbols?exchange=${exchange}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(json);
  return json;
};
const getSymbolMarketInfo = async (symbol, exchange = EXCHANGE_BINANCE) => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/market?exchange=${exchange}&symbol=${symbol}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(json);
  return json;
};
const getSymbolInfo = async (symbol, exchange = EXCHANGE_BINANCE) => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/symbol-info?symbol=${symbol}&exchange=${exchange}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(json);
  return json;
};

//
const placeGridOrder = async (gridOrder, exchange = EXCHANGE_BINANCE) => {
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  console.log("placeGridOrder", gridOrder);
  tradeOption.body = JSON.stringify(gridOrder);
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/trade/grid?exchange=${exchange}`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;

  return json;
};
/**
 *
 * @returns rsi config data [
 *   {
 *     symbol, rsi:[lower, upper], timeframe:[m1, m5, m15, h1, h4, h6...]
 *   }, ...
 * ]
 */
const getRSIConfig = async () => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/strategy/rsi?type=config`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  console.log(json);
  return json;
};
const setRSIConfig = async (rsiConfig) => {
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  tradeOption.body = JSON.stringify({ cmd: "rsi-config", rsiConfig });
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/strategy/rsi`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  return json;
};

const rsiGetState = async () => {
  const tradeOption = { ...options };
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/strategy/rsi?type=state`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));
  const json = await data;
  // console.log(json);
  return json;
};
const rsiAnalysicSubmit = async (startStopState) => {
  const tradeOption = { ...options };
  tradeOption.method = "POST";
  tradeOption.body = JSON.stringify({
    cmd: "rsi-run",
    state: startStopState ? "RSI_START" : "RSI_STOP",
  });
  var fetchUrl = `${TR7_BOT_API_ENDPOINT}/admin/strategy/rsi`;
  const data = window
    .fetch(fetchUrl, tradeOption)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.error(err));

  const json = await data;
  // console.log("rsiAnalysicSubmit", json);
  return json;
};

const tr7TradingBot = {
  getApiKeyList,
  adminAuthenticate,
  logOut,
  fetchSomeData,
  fetchAccountInfo,
  fetchTradeInfo,
  getPositions,
  closePosition,
  clearPositions,
  getPricePrecisions,
  getSymbolList,
  getSymbolMarketInfo,
  getSymbolInfo,
  placeNewOrder,
  placeGridOrder,
  getRSIConfig,
  setRSIConfig,
  rsiGetState,
  rsiAnalysicSubmit,
  fetchAllSignals,
};
export default tr7TradingBot;
