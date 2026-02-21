import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import Layout from "./layout";
import Home from "./routes/home";
import Guide from "./routes/guide";
import Content from "./routes/content";
import Settings from "./routes/settings";
import Alarms from "./routes/alarms";
import Tvs from "./routes/tv";

import "./styles/global.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "guide",
        element: <Guide />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "content",
        element: <Content />,
      },
      {
        path: "alarms",
        element: <Alarms />,
      },
      {
        path: "tv",
        element: <Tvs />,
      },
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
