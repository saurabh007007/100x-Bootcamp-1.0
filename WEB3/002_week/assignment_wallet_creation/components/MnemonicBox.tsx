"use client";

export default function MnemonicBox({ mnemonic }: { mnemonic: string }) {
    return (
        <div className="bg-yellow-100 p-4 rounded mt-4">
            <p className="font-semibold text-red-600">
                ⚠ Save this seed phrase securely
            </p>
            <p className="mt-2">{mnemonic}</p>
        </div>
    );
}
