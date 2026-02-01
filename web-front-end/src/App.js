import React, { useState, useEffect } from "react";
import Stack from "react-bootstrap/Stack";
import "./scss/style.scss";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  Outlet,
} from "react-router-dom";
import "./App.css";
import { Provider as ContextProvider } from "react-redux";
import AuthProvider from "./Provider/Auth";
import FutureOrderProvider from "./Provider/FuturesOrderInfo";
import { useAuth } from "./Provider/Auth";
import store from "./store";
import Notification from "./components/Notification";

const ProtectedRoute = () => {
  const { loggedIn } = useAuth();
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Containers
const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));
// Pages
const Login = React.lazy(() => import("./pages/Login"));
const Page404 = React.lazy(() => import("./pages/Page404"));
const Page500 = React.lazy(() => import("./pages/Page500"));

const App = () => {
  //
  return (
    <ContextProvider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <FutureOrderProvider>
            <Routes>
              <Route
                exact
                path="/login"
                name="Login Page"
                element={<Login />}
              />
              <Route path="/404" name="Page 404" element={<Page404 />} />
              <Route path="/500" name="Page 500" element={<Page500 />} />
              <Route element={<ProtectedRoute />}>
                {/* <Route path="*" name="Home" element={<DefaultLayout />} /> */}
                <Route path="*" name="Balance" element={<DefaultLayout />} />
              </Route>
            </Routes>
            <Notification />
          </FutureOrderProvider>
        </AuthProvider>
      </BrowserRouter>
    </ContextProvider>
  );
};

export default App;
