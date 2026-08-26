import { useState, useContext } from "react";
import { loginUser } from "./api";
import { AuthContext } from "./auth/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    console.log("LOGIN BUTTON CLICKED");

    try {
      const data = await loginUser(email, password);

      console.log("LOGIN API RESPONSE:", data);

      if (data && data.access_token) {
        console.log("TOKEN RECEIVED:", data.access_token);

        login(data);

        console.log(
          "TOKEN AFTER LOGIN:",
          localStorage.getItem("token")
        );

        console.log(
          "USER AFTER LOGIN:",
          localStorage.getItem("user")
        );

        alert("Login Successful");
      } else {
        console.error("TOKEN NOT FOUND:", data);
        alert("Login Failed: Token nahi mila");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error.response) {
        console.error(
          "SERVER RESPONSE:",
          error.response.data
        );
      }

      alert("Login Failed");
    }
  };

  return (
    <div>
      <h1>Hospital Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;