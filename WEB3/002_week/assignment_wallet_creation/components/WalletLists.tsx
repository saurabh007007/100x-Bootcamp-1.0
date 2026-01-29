import WalletCards from "./WalletCards";

import { WalletInfo } from "@/types/wallets";

export default function WalletList({
    wallets,
}: {
    wallets: WalletInfo[];
}) {
    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold">Wallets</h2>
            {wallets.map((w) => (
                <WalletCards
                    key={w.index}
                    index={w.index}
                    publicKey={w.keypair.publicKey}
                />
            ))}
        </div>
    );
}
