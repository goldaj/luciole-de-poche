package com.jasongolda.lumieresdepoche;

/** Safe default used until the authenticated purchase backend exists. */
final class DisabledPremiumWalletGateway implements PremiumWalletGateway {
    private static final String MESSAGE =
        "La validation sécurisée des achats n'est pas encore configurée.";

    @Override
    public void fetchBalance(BalanceCallback callback) {
        callback.onUnavailable(MESSAGE);
    }

    @Override
    public void verifyAndGrant(
        String purchaseToken,
        String productId,
        GrantCallback callback
    ) {
        callback.onRejected(MESSAGE);
    }

    @Override
    public void spend(
        int amount,
        String idempotencyKey,
        SpendCallback callback
    ) {
        callback.onRejected(MESSAGE);
    }
}
