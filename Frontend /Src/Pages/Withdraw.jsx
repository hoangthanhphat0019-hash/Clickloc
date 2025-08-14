import React, { useState, useEffect } from "react";
import API from "../api";

export default function Withdraw() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const getBalance = async () => {
    const { data } = await API.get("/user/me");
    setBalance(data.balance);
  };

  const withdraw = async () => {
    try {
      await API.post("/user/withdraw", { amount });
      alert("Rút tiền thành công");
      getBalance();
    } catch {
      alert("Không đủ số dư");
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl mb-4">Rút tiền (phí 10%)</h2>
      <p>Số dư hiện tại: {balance} VND</p>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Số tiền muốn rút"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={withdraw} className="bg-red-500 text-white px-4 py-2">
        Rút tiền
      </button>
    </div>
  );
}
