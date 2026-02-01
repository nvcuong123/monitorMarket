import { useAuth } from "../Provider/Auth";
import Login from "./Login";

const Dashboard = () => {
  const { loggedIn, userRole, username } = useAuth();

  return (
    <>
      <h1>Home Page</h1>
      {loggedIn && <h3>Welcome back {username}</h3>}
      {!loggedIn && <Login />}
    </>
  );
};

export default Dashboard;
