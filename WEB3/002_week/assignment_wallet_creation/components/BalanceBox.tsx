"use client";

import { useEffect, useState } from "react";
import { getSolBalance } from "@/lib/balance";
import { getTokenBalances } from "@/lib/token";
import { PublicKey } from "@solana/web3.js";

export default function BalanceBox({ publicKey }: { publicKey: PublicKey }) {
    const [sol, setSol] = useState<number | null>(null);
    const [tokens, setTokens] = useState<any[]>([]);

    useEffect(() => {
        getSolBalance(publicKey).then(setSol);
        getTokenBalances(publicKey).then(setTokens);
    }, [publicKey]);

    return (
        <div className="mt-4 bg-gray-100 p-4 rounded">
            <p>SOL Balance: {sol ?? "Loading..."}</p>

            <h3 className="mt-2 font-semibold">Tokens</h3>
            {tokens.map((t, i) => (
                <p key={i}>
                    {t.mint.slice(0, 6)}... : {t.amount}
                </p>
            ))}
        </div>
    );
}
