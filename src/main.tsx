import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./Pages/NotFound.tsx";
import Cbi from "./Pages/cbi.tsx";
import Perilaku from "./Pages/Perilaku.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/map",
    element: <Perilaku />,
  },

  {
    path: "/cbi",
    element: <Cbi />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
