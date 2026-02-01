const envVarList = process.env;
import bcryptjs from "bcryptjs";

const users = [];
// console.log("process.env", process.env);
for (const key in envVarList) {
  if (key.match(/^USER_[a-zA-Z0-9]+_PWD/gi)) {
    const usr = key.slice(5, -4);
    const pwd = envVarList[key];
    const apiList = [];
    // api for this usr
    const userApiKeyStr = `USER_${usr}_API_KEY_`;
    const userApiKeyPattern = new RegExp(userApiKeyStr, "gi");
    console.log("userApiKeyPattern", userApiKeyPattern);
    for (const k in envVarList) {
      if (userApiKeyPattern.test(k) && k.match(/^USER_/gi)) {
        const isTestnet = k.match(/[a-zA-Z0-9]+_TESTNET/gi) ? true : false;
        const apiKey = envVarList[k];
        let apiSecret = "";
        const exchangeInfo = k.substring(userApiKeyStr.length);
        //
        const userApiSecretKeyStr = `USER_${usr}_API_SCRET_KEY_${exchangeInfo}`;
        const userApiSecretKeyPattern = new RegExp(userApiSecretKeyStr, "gi");
        for (const l in envVarList) {
          if (userApiSecretKeyPattern.test(l) && l.match(/^USER_/gi)) {
            apiSecret = envVarList[l];
          }
        }
        apiList.push({ apiName: k, apiKey, apiSecret, isTestnet });
      }
    }
    users.push({ usr, pwd, apiList });
  }
}
//
export default {
  getUsers: () => {
    return users;
  },
  isValidUser: (username, hashPasswod) => {
    for (const user of users) {
      const { usr, pwd } = user;
      if (usr === username && bcryptjs.compareSync(pwd, hashPasswod)) {
        return true;
      }
    }
    return false;
  },
  getUserApiList: (username, hashPasswod) => {
    for (const user of users) {
      const { usr, pwd, apiList } = user;
      if (usr === username && bcryptjs.compareSync(pwd, hashPasswod)) {
        // console.log(username, apiList);
        return apiList;
      }
    }
    return [];
  },
};
