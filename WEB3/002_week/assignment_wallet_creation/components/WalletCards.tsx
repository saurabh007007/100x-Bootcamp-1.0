import { PublicKey } from "@solana/web3.js";

export default function WalletCards({
    index,
    publicKey,
}: {
    index: number;
    publicKey: PublicKey;
}) {
    return (
        <div className="border p-4 rounded mt-2">
            <p className="font-semibold">Wallet #{index + 1}</p>
            <p className="text-sm break-all">{publicKey.toBase58()}</p>
        </div>
    );
}
