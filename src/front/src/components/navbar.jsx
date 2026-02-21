import { Link, useLocation } from "react-router";

import {
  Home,
  AlarmClock,
  Clapperboard,
  Tv,
  Cog,
  BookOpen,
} from "lucide-react";

import "../styles/navbar.css";

export default function Navbar() {
  const routes = {
    "/": {
      name: "Home",
      icon: <Home />,
    },
    "/alarms": {
      name: "Alarms",
      icon: <AlarmClock />,
    },
    "/content": {
      name: "Content",
      icon: <Clapperboard />,
    },
    "/tv": {
      name: "TVs",
      icon: <Tv />,
    },
    "/settings": {
      name: "Settings",
      icon: <Cog />,
    },
    "/guide": {
      name: "Guide",
      icon: <BookOpen />,
    },
  };

  const location = useLocation();

  return (
    <nav id="navbar">
      <ul id="navbar-list">
        {Object.entries(routes).map(([route, { name, icon }]) => (
          <li
            key={route}
            className={location.pathname === route ? "active" : ""}
          >
            <Link to={route}>
              {icon}
              <span className="navbar-item-name">{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
