package com.jasongolda.lumieresdepoche;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Read-through cache of the server-authoritative premium balance.
 *
 * No debit or credit operation is exposed here on purpose. Monetary mutations must go
 * through PremiumWalletGateway and are reflected into this cache only after server
 * confirmation.
 */
final class PremiumGemWallet {
    private static final String PREFS = "luciole_premium_wallet_v1";
    private static final String KEY_BALANCE = "balance";

    private final SharedPreferences preferences;

    PremiumGemWallet(Context context) {
        preferences = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    synchronized int getBalance() {
        return Math.max(0, preferences.getInt(KEY_BALANCE, 0));
    }

    synchronized boolean syncBalance(int balance) {
        return preferences.edit()
            .putInt(KEY_BALANCE, Math.max(0, balance))
            .commit();
    }
}
