import { useCallback } from "react";
import { useRdt } from "./useRdt.js";
import { useGatewayApi } from "./useGatewayApi.js";

/**
 * Custom hook to send transactions and fetch transaction details.
 *
 * @returns {Function} A function to send transactions and retrieve transaction details.
 */
export const useSendTransaction = () => {
  const rdt = useRdt();
  const gatewayApi = useGatewayApi();

  const sendTransaction = useCallback(
    // Send manifest to extension for signing
    async (transactionManifest, message) => {
        const transactionResult = await rdt.walletApi.sendTransaction({
            transactionManifest,
            version: 1,
            message,
        });

        if (transactionResult.isErr()) throw transactionResult.error;
        console.log("transaction result:", transactionResult.value.status);

        // Get the details of the transaction committed to the ledger
        const CommitedDetails = await gatewayApi.transaction.getCommittedDetails(
            transactionResult.value.transactionIntentHash, {receiptEvents: true}
        );

        const events = CommitedDetails.transaction.receipt.events;
        console.log("events:", events);

        return {transactionResult: transactionResult.value, events};
    },
    [gatewayApi, rdt]
  );

  return sendTransaction;
};