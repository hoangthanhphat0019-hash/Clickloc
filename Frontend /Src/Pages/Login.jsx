import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Sai thông tin đăng nhập");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl mb-4">Đăng nhập ClickLộc</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-2"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={submit} className="bg-green-500 text-white px-4 py-2">
        Đăng nhập
      </button>
    </div>
  );
}
