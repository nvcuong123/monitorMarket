import React from "react";
import { useNavigate } from "react-router-dom";
import tr7TradingBot from "../Model/tr7-trading-bot.js";
// import bcrypt from "bcrypt";

const AuthContext = React.createContext(null);
export const useAuth = () => {
  return React.useContext(AuthContext);
};
const AuthProvider = ({ children }) => {
  const [loggedIn, $loggedIn] = React.useState(null);
  const [userRole, $userRole] = React.useState("Guest");
  const [username, $username] = React.useState("Guest");
  const [isAdmin, $isAdmin] = React.useState(false);

  const navigate = useNavigate();
  const handleLogin = async (usrname, password) => {
    try {
      // const saltRounds = 10;
      // const hashPassword = bcrypt
      //   .genSalt(saltRounds)
      //   .then((salt) => {
      //     console.log("Salt: ", salt);
      //     return bcrypt.hash(password, salt);
      //   })
      //   .then((hash) => {
      //     console.log("Hash: ", hash);
      //   })
      //   .catch((err) => console.error(err.message));
      // console.log("hashPassword", hashPassword);

      // const successLogin = await tr7TradingBot.adminAuthenticate(
      //   apiKey,
      //   hashPassword
      // );
      const hashPassword = password;
      const loginResp = await tr7TradingBot.adminAuthenticate(
        usrname,
        hashPassword
      );
      const { token, role } = loginResp;
      // console.log(token);
      console.log(role);
      $loggedIn(token ? true : false);
      $userRole(role);
      $username(usrname);
      if (role === "admin" || role === "admin-dev") {
        $isAdmin(true);
      }
      if (token) {
        navigate("/", { replace: true });
      } else {
        return loginResp;
      }
    } catch (err) {
      return err;
    }
  };

  const handleLogout = async () => {
    await tr7TradingBot.logOut();
    $loggedIn(false);
    navigate("/", { replace: true });
  };

  const value = {
    loggedIn,
    userRole,
    username,
    isAdmin,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
