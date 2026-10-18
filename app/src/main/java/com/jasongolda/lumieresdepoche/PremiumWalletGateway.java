package com.jasongolda.lumieresdepoche;

/**
 * Boundary between the Android client and the server-authoritative premium wallet.
 *
 * The implementation used by the public client remains disabled until an authenticated
 * backend is deployed. This prevents a local preference from becoming a source of truth
 * for currency that represents real money.
 */
interface PremiumWalletGateway {
    interface BalanceCallback {
        void onLoaded(int premiumBalance);
        void onUnavailable(String message);
    }

    interface GrantCallback {
        void onGranted(int premiumBalance);
        void onRejected(String message);
    }

    interface SpendCallback {
        void onSpent(String transactionId, int premiumBalance);
        void onRejected(String message);
    }

    void fetchBalance(BalanceCallback callback);

    void verifyAndGrant(
        String purchaseToken,
        String productId,
        GrantCallback callback
    );

    void spend(
        int amount,
        String idempotencyKey,
        SpendCallback callback
    );
}
