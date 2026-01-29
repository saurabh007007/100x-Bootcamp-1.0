import bip39 from "bip39";

export function generateMnemonic(strength: number = 128): string {
  return bip39.generateMnemonic(strength);
}
