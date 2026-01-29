import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { connection } from "./connetion";

export async function sendSol(sender: Keypair, to: string, amount: number) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: new PublicKey(to),
      lamports: amount * 1e9,
    }),
  );

  return sendAndConfirmTransaction(connection, tx, [sender]);
}
