"use client";

import { useState } from "react";
import { generateMnemonic } from "@/lib/meneonic";
import { deriveSolanaWallet } from "@/lib/wallets";
import MnemonicBox from "@/components/MnemonicBox";
import WalletList from "@/components/WalletLists";
import BalanceBox from "@/components/BalanceBox";
import SendSol from "@/components/SensSol";
import { WalletInfo } from "@/types/wallets";

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  async function addWallet() {
    const index = wallets.length;
    const keypair = await deriveSolanaWallet(mnemonic, index);
    setWallets([...wallets, { index, keypair }]);
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Solana Wallet</h1>

      <button
        className="mt-4 bg-black text-white px-4 py-2"
        onClick={() => setMnemonic(generateMnemonic())}
      >
        Generate Seed
      </button>

      {mnemonic && <MnemonicBox mnemonic={mnemonic} />}

      {mnemonic && (
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2"
          onClick={addWallet}
        >
          Add Wallet
        </button>
      )}

      <WalletList wallets={wallets} />

      {wallets.map((w) => (
        <div key={w.index}>
          <BalanceBox publicKey={w.keypair.publicKey} />
          <SendSol wallet={w.keypair} />
        </div>
      ))}
    </main>
  );
}
