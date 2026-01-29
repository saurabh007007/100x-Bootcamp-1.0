import { Keypair } from "@solana/web3.js";
import { generateMnemonic } from "./meneonic.js";
import { derivePath } from "ed25519-hd-key";
import bip39 from "bip39";

export async function deriveSolanaWallet(mnemonic: string, index: number) {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const path = `m/44'/501'/${index}'/0'`;

  const derivedSeed = derivePath(path, seed.toString("hex")).key;

  return Keypair.fromSeed(derivedSeed);
}
