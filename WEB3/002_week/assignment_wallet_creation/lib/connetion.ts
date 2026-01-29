import { Connection } from "@solana/web3.js";

export const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed",
);
