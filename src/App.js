import "./App.css";
import axios from "axios";
import { useState } from "react";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = { username, password };
    const response = await axios.post("/login", body);

    if (response.status) {
      Swal.fire({
        title: "Success!",
        text: "Login Successful",
        icon: "success",
      });

      setUser(response.data);
    } else {
      Swal.fire({
        title: "Error!",
        text: response.message,
        icon: "error",
        confirmButtonText: "Close",
      });
    }

    setUsername("");
    setPassword("");
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "Admin" : "User"}</b> Dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete Demo1
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Demo2
          </button>
          {error && (
            <span className="error">
              You are not allowed to Delete this User!
            </span>
          )}
          {success && (
            <span className="success">
              User has been Deleted Successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <div className="form">
            <span className="formTitle">Jwt Login</span>
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button className="submitButton" onClick={handleSubmit}>
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
