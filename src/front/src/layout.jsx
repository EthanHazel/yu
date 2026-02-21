import { Outlet } from "react-router";

import Navbar from "./components/navbar";

export default function Layout() {
  return (
    <div id="layout">
      <Navbar />
      <Outlet />
    </div>
  );
}
