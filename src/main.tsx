import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Spasial from "./Pages/spasial";
import Alokasi from "./Pages/Alokasi";
import Kebijakan from "./Pages/Kebijakan";
import Prediksi from "./Pages/Prediksi";
import Lingkungan from "./Pages/Lingkungan";
import Laporan from "./Pages/Laporan";
import Kebijakan3 from "./Pages/Kebijakan3";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/spasial",
    element: <Spasial />,
  },
  {
    path: "/alokasi",
    element: <Alokasi />,
  },
  {
    path: "Kebijakan",
    element: <Kebijakan />,
  },
  {
    path: "Kebijakan3",
    element: <Kebijakan3 />,
  },
  {
    path: "/prediksi",
    element: <Prediksi />,
  },
  {
    path: "/lingkungan",
    element: <Lingkungan />,
  },
  {
    path: "/laporan",
    element: <Laporan />,
  },
]);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
