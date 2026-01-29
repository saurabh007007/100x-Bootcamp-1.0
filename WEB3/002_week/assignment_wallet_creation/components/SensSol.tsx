"use client";

import { useState } from "react";
import { sendSol } from "@/lib/send";
import { Keypair } from "@solana/web3.js";

export default function SendSol({ wallet }: { wallet: Keypair }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="mt-4 border p-4 rounded">
      <h3 className="font-semibold">Send SOL</h3>

      <input
        className="border p-1 w-full mt-2"
        placeholder="Recipient address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        className="border p-1 w-full mt-2"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        className="mt-2 bg-black text-white px-4 py-1"
        onClick={() => sendSol(wallet, to, Number(amount))}
      >
        Send
      </button>
    </div>
  );
}
