import express from "express";
import jwt from "jsonwebtoken";
import auth from "../middlewares/auth.js";
import account from "./account.js";
import tradeinfo from "./tradeinfo.js";
import marketInfo from "./market.js";
import admin from "./admin.js";
import bcryptjs from "bcryptjs";
import services from "../modules/services.js";
import utils from "../modules/utils.js";
import download from "./download.js";

const numSaltRounds = 8;

const envVarList = process.env;
const router = express.Router();
const tokenInstanceMap = new Map();

const noURI = async (req, res) => {
  try {
    return res.status(404).json({
      success: true,
      message: "backend: not match any path",
      randomNumber: Math.random(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
};

router.get("/keylist", async (req, res) => {
  // console.log(req);
  try {
    const keys = [];
    for (const key in envVarList) {
      if (key.match(/API_KEY_/g)) {
        keys.push(key);
      }
    }
    // console.log(keys);
    if (keys.length > 0) {
      return res.status(200).json({ keys });
    } else {
      return res.status(400).send("Not any api key set yet");
    }
  } catch (err) {
    return res.status(400).send("Invalid Credentials");
  }
});

router.get("/logout", auth, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
});

router.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    console.log("/login:req.body", req.body);
    let blMatch = false;
    let xChangesApiList = {};
    const { username, hashPasswod } = req.body;
    // const users = utils.users();
    // console.log(
    //   "users",
    //   users.map((user) => user.usr)
    // );
    // for (const user of users) {
    //   // console.log(user);
    //   const { usr, pwd, apiList } = user;
    //   if (usr === username && bcryptjs.compareSync(pwd, hashPasswod)) {
    //     // console.log("matched");
    //     xChangesApiList = apiList;//[0]; //TODO: get api selection from front-end
    //     blMatch = true;
    //     break;
    //   }
    // }
    if (utils.isValidUser(username, hashPasswod)) {
      xChangesApiList = utils.getUserApiList(username, hashPasswod);
      const { apiName, apiKey, apiSecret, isTestnet } = xChangesApiList[0];
      let userRole = "admin";
      console.log("create token");
      const token = jwt.sign(
        {
          // id: crypto.randomBytes(16).toString("hex"),
          role: userRole,
          api: apiName,
          expires: "8h",
        },
        process.env.JWT_SECRET_STRING,
        {
          expiresIn: "8h",
        }
      );
      // update mapping json token - xChangesApiList
      tokenInstanceMap.set(token, xChangesApiList);

      return (
        res
          // .cookie("access_token", token, {
          //   httpOnly: true,
          //   secure: process.env.NODE_ENV === "production",
          // })
          .status(200)
          .json({
            message: "Logged in successfully 😊 👌",
            role: userRole,
            token,
          })
      );
    } else {
      return res.status(400).send("Credential Err");
    }
  } catch (err) {
    return res.status(400).send("Invalid Credentials");
  }
});

// set binance instance for all request
router.use((request, response, next) => {
  // const user = auth(request);

  // if (!user || !(user.name === username && user.pass === password)) {
  //   response.set("WWW-Authenticate", 'Basic realm="Please Login"');
  //   return response.status(401).send();
  // }
  const token =
    request.body.token ||
    request.query.token ||
    request.headers["x-access-token"];
  // console.log("token", token);
  if (token) {
    const apiList = tokenInstanceMap.get(token);
    request.apiList = apiList;
  } else {
    request.apiList = {};
  }

  return next();
});

router.all("/market", marketInfo);
router.use("/download", download);
router.all("/account", auth, account);
router.all("/tradeinfo", auth, tradeinfo);
router.use("/admin", auth, admin);
router.all("/", auth, noURI);

export default router;
