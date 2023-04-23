import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Authorize, { Authorized } from "./authorize";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LibraryProvider } from "./library/library-context";
import { ThemeProvider } from "./theme-context";
import { ServerProvider } from "./server-context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ServerProvider>
    <LibraryProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/authorized" element={<Authorized />}></Route>
            <Route exact path={"/"} element={<Authorize />}></Route>
            <Route exact path={"/login"} element={<Authorize />}></Route>
            <Route path={"/playlist/*"} element={<App />} />
            <Route path={"/custom-playlist/*"} element={<App />} />
            <Route path={"/radio/*"} element={<App />} />
            <Route path={"/currently-playing/*"} element={<App />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </LibraryProvider>
  </ServerProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
