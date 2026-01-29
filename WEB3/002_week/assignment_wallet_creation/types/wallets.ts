import { Keypair } from "@solana/web3.js";

export interface WalletInfo {
  index: number;
  keypair: Keypair;
}
