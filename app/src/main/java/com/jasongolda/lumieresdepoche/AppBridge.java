package com.jasongolda.lumieresdepoche;

import android.webkit.JavascriptInterface;

import org.json.JSONObject;

import java.util.UUID;

/** JavaScript bridge restricted to the bundled local WebView content. */
final class AppBridge implements PlayBillingManager.Listener {
    private final MainActivity activity;
    private final PremiumGemWallet premiumWallet;
    private final PremiumWalletGateway premiumWalletGateway;
    private PlayBillingManager billingManager;

    AppBridge(MainActivity activity, PremiumWalletGateway premiumWalletGateway) {
        this.activity = activity;
        this.premiumWalletGateway = premiumWalletGateway;
        this.premiumWallet = new PremiumGemWallet(activity);
    }

    void attachBilling(PlayBillingManager billingManager) {
        this.billingManager = billingManager;
    }

    @JavascriptInterface
    public int getPremiumGemBalance() {
        return premiumWallet.getBalance();
    }

    /**
     * Starts an authoritative premium-wallet debit and returns its idempotency key.
     * The actual result is delivered asynchronously through LucioleBilling.onPremiumSpend.
     */
    @JavascriptInterface
    public String requestPremiumGemSpend(int amount) {
        if ((!BuildConfig.BILLING_ENABLED && !BuildConfig.LOCAL_TEST_MODE) || amount <= 0) {
            return "";
        }

        String requestId = UUID.randomUUID().toString();
        activity.runOnUiThread(() -> premiumWalletGateway.spend(
            amount,
            requestId,
            new PremiumWalletGateway.SpendCallback() {
                @Override
                public void onSpent(String transactionId, int premiumBalance) {
                    premiumWallet.syncBalance(premiumBalance);
                    activity.evaluateJavascript(
                        "window.LucioleBilling&&window.LucioleBilling.onPremiumSpend(" +
                            JSONObject.quote(requestId) + ",true," + premiumBalance + "," +
                            JSONObject.quote(transactionId == null ? requestId : transactionId) + ",\"\");"
                    );
                }

                @Override
                public void onRejected(String message) {
                    activity.evaluateJavascript(
                        "window.LucioleBilling&&window.LucioleBilling.onPremiumSpend(" +
                            JSONObject.quote(requestId) + ",false," + premiumWallet.getBalance() + ",\"\"," +
                            JSONObject.quote(message == null ? "Dépense refusée." : message) + ");"
                    );
                }
            }
        ));
        return requestId;
    }

    @JavascriptInterface
    public boolean backupSave(int slot, String json) {
        return activity.storeNativeSaveBackup(slot, json);
    }

    @JavascriptInterface
    public String readSaveBackup(int slot) {
        String backup = activity.readNativeSaveBackup(slot);
        return backup == null ? "" : backup;
    }

    @JavascriptInterface
    public void requestGemCatalog() {
        activity.runOnUiThread(() -> {
            if (BuildConfig.LOCAL_TEST_MODE) {
                onCatalog(GemPackCatalog.localTestCatalogJson());
                return;
            }
            if (billingManager != null) {
                billingManager.queryCatalog();
            }
        });
    }

    @JavascriptInterface
    public void purchaseGemPack(String productId) {
        activity.runOnUiThread(() -> {
            if (BuildConfig.LOCAL_TEST_MODE) {
                GemPackCatalog.Pack pack = GemPackCatalog.find(productId);
                if (pack == null) {
                    onBillingMessage("Ce pack de Gemmes de test n'existe pas.", true);
                    return;
                }
                premiumWalletGateway.verifyAndGrant(
                    "dev-local-" + UUID.randomUUID(),
                    productId,
                    new PremiumWalletGateway.GrantCallback() {
                        @Override
                        public void onGranted(int premiumBalance) {
                            onPurchaseGranted(productId, pack.gems, premiumBalance);
                        }

                        @Override
                        public void onRejected(String message) {
                            onBillingMessage(message, true);
                        }
                    }
                );
                return;
            }
            if (!BuildConfig.BILLING_ENABLED) {
                onBillingMessage(
                    "Les achats sont préparés mais restent désactivés dans cette version " +
                        "tant que la validation serveur n'est pas configurée.",
                    false
                );
                return;
            }
            if (billingManager != null) {
                billingManager.launchPurchase(productId);
            }
        });
    }

    @JavascriptInterface
    public boolean isBillingEnabled() {
        return BuildConfig.BILLING_ENABLED || BuildConfig.LOCAL_TEST_MODE;
    }

    @JavascriptInterface
    public boolean isLocalTestMode() {
        return BuildConfig.LOCAL_TEST_MODE;
    }

    @JavascriptInterface
    public String appVersion() {
        return BuildConfig.VERSION_NAME;
    }

    @JavascriptInterface
    public void exportSaves(String payload) {
        activity.runOnUiThread(() -> activity.requestSaveExport(payload));
    }

    @JavascriptInterface
    public void importSaves() {
        activity.runOnUiThread(activity::requestSaveImport);
    }

    void refreshPremiumBalance() {
        if (!BuildConfig.BILLING_ENABLED && !BuildConfig.LOCAL_TEST_MODE) {
            return;
        }
        premiumWalletGateway.fetchBalance(new PremiumWalletGateway.BalanceCallback() {
            @Override
            public void onLoaded(int premiumBalance) {
                premiumWallet.syncBalance(premiumBalance);
                activity.evaluateJavascript(
                    "window.LucioleBilling&&window.LucioleBilling.onBalanceChanged(" + premiumBalance + ");"
                );
            }

            @Override
            public void onUnavailable(String message) {
                // Keep the last confirmed cache. A transient network failure must not erase it.
            }
        });
    }

    @Override
    public void onCatalog(String json) {
        activity.evaluateJavascript(
            "window.LucioleBilling&&window.LucioleBilling.onCatalog(" + safeJson(json) + ");"
        );
    }

    @Override
    public void onPurchaseGranted(String productId, int gems, int premiumBalance) {
        premiumWallet.syncBalance(premiumBalance);
        activity.evaluateJavascript(
            "window.LucioleBilling&&window.LucioleBilling.onPurchaseGranted(" +
                JSONObject.quote(productId) + "," + gems + "," + premiumBalance + ");"
        );
    }

    @Override
    public void onBillingMessage(String message, boolean error) {
        activity.evaluateJavascript(
            "window.LucioleBilling&&window.LucioleBilling.onMessage(" +
                JSONObject.quote(message) + "," + error + ");"
        );
    }

    void onImportPayload(String payload) {
        activity.evaluateJavascript(
            "window.LuciolePlatform&&window.LuciolePlatform.receiveImportedSaves(" +
                safeJson(payload) + ");"
        );
    }

    void onExportResult(boolean success, String message) {
        activity.evaluateJavascript(
            "window.LuciolePlatform&&window.LuciolePlatform.onExportResult(" + success + "," +
                JSONObject.quote(message) + ");"
        );
    }

    private static String safeJson(String rawJson) {
        if (rawJson == null || rawJson.trim().isEmpty()) {
            return "null";
        }
        try {
            return new JSONObject(rawJson).toString();
        } catch (Exception ignored) {
            try {
                return new org.json.JSONArray(rawJson).toString();
            } catch (Exception ignoredArray) {
                return JSONObject.quote(rawJson);
            }
        }
    }
}
