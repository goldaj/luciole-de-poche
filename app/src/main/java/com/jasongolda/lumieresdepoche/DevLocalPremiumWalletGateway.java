package com.jasongolda.lumieresdepoche;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.UUID;

/**
 * Local-only premium wallet used by the devLocal flavor.
 *
 * It deliberately never talks to Google Play or a backend. Its only purpose is to let
 * gameplay tests exercise the paid-currency paths without moving real money.
 */
final class DevLocalPremiumWalletGateway implements PremiumWalletGateway {
    private static final String PREFS = "luciole_dev_premium_wallet_v1";
    private static final String KEY_BALANCE = "balance";

    private final SharedPreferences preferences;

    DevLocalPremiumWalletGateway(Context context) {
        preferences = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    @Override
    public synchronized void fetchBalance(BalanceCallback callback) {
        callback.onLoaded(balance());
    }

    @Override
    public synchronized void verifyAndGrant(
        String purchaseToken,
        String productId,
        GrantCallback callback
    ) {
        GemPackCatalog.Pack pack = GemPackCatalog.find(productId);
        if (pack == null) {
            callback.onRejected("Pack de test inconnu.");
            return;
        }

        int newBalance = balance() + pack.gems;
        if (!store(newBalance)) {
            callback.onRejected("Le portefeuille de test n'a pas pu être enregistré.");
            return;
        }
        callback.onGranted(newBalance);
    }

    @Override
    public synchronized void spend(
        int amount,
        String idempotencyKey,
        SpendCallback callback
    ) {
        int safeAmount = Math.max(0, amount);
        int current = balance();
        if (safeAmount <= 0 || current < safeAmount) {
            callback.onRejected("Solde de Gemmes de test insuffisant.");
            return;
        }

        int newBalance = current - safeAmount;
        if (!store(newBalance)) {
            callback.onRejected("Le portefeuille de test n'a pas pu être enregistré.");
            return;
        }
        callback.onSpent("dev-" + UUID.randomUUID(), newBalance);
    }

    private int balance() {
        return Math.max(0, preferences.getInt(KEY_BALANCE, 0));
    }

    private boolean store(int balance) {
        return preferences.edit().putInt(KEY_BALANCE, Math.max(0, balance)).commit();
    }
}
