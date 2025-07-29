import { useState } from "react";
import axios from "axios";

export default function PortfolioPage() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleAdd = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/portfolio", // или твой backend URL
        {
          symbol,
          amount: parseFloat(amount),
          purchase_price: parseFloat(price),
        },
        {
          headers: {
            Authorization: `Bearer ${eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDMwMDE0Zi05NmNhLTQ3ZDUtOGUxYS01MmJlOWUzZTU1ZjgiLCJleHAiOjE3NTM2OTYxNjR9.V-pPXqRuwE5Nwj-Xh0EDqlbavJCEhukyIYEQqjeGGWs}`,
          },
        }
      );
      setMessage("Добавлено успешно!");
    } catch (err: any) {
      setMessage("Ошибка: " + err.response?.data?.detail || "Неизвестно");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Добавить крипто-актив</h2>

      <input
        type="text"
        placeholder="JWT Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />

      <input
        type="text"
        placeholder="Symbol (например BTC)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={handleAdd}>Добавить</button>
      <p>{message}</p>
    </div>
  );
}
