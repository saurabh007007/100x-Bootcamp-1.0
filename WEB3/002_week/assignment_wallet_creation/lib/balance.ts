import { PublicKey } from "@solana/web3.js";
import { connection } from "./connetion";

export async function getSolBalance(publicKey: PublicKey) {
  const balance = await connection.getBalance(publicKey);
  return balance / 1e9;
}
