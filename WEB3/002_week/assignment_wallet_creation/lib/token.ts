import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { connection } from "./connetion";

export async function getTokenBalances(owner: PublicKey) {
  const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  return accounts.value.map((acc) => {
    const info = acc.account.data.parsed.info;
    return {
      mint: info.mint,
      amount: info.tokenAmount.uiAmount,
    };
  });
}
