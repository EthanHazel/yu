import { Link } from "react-router";

export default function Home() {
  return (
    <main>
      <h1>You up?</h1>
      <Link to="/guide">Guide</Link>
      <Link to="/settings">Settings</Link>
    </main>
  );
}
