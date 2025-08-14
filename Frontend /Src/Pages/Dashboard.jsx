import React, { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);

  const getBalance = async () => {
    const { data } = await API.get("/user/me");
    setBalance(data.balance);
  };

  const watchAd = async () => {
    await API.post("/ads/watch");
    getBalance();
  };

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl mb-4">Xin chào, đây là ClickLộc</h2>
      <p>Số dư hiện tại: {balance} VND</p>
      <button
        onClick={watchAd}
        className="mt-4 bg-blue-500 text-white px-4 py-2"
      >
        Xem quảng cáo (tăng số dư)
      </button>
    </div>
  );
}
