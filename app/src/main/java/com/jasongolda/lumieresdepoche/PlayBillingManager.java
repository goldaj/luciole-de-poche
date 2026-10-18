package com.jasongolda.lumieresdepoche;

import android.app.Activity;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class PlayBillingManager implements PurchasesUpdatedListener {
    interface Listener {
        void onCatalog(String json);
        void onPurchaseGranted(String productId, int gems, int premiumBalance);
        void onBillingMessage(String message, boolean error);
    }

    private static final int RESPONSE_OK = BillingClient.BillingResponseCode.OK;

    private final Activity activity;
    private final Listener listener;
    private final PremiumWalletGateway premiumWalletGateway;
    private final BillingClient billingClient;
    private final Map<String, ProductDetails> productDetails = new HashMap<>();
    private boolean ready;
    private boolean connecting;

    PlayBillingManager(Activity activity, Listener listener, PremiumWalletGateway premiumWalletGateway) {
        this.activity = activity;
        this.listener = listener;
        this.premiumWalletGateway = premiumWalletGateway;
        this.billingClient = BillingClient.newBuilder(activity)
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .build()
            )
            .enableAutoServiceReconnection()
            .build();
    }

    void start() {
        if (!BuildConfig.BILLING_ENABLED) {
            listener.onCatalog(emptyCatalogJson());
            return;
        }
        if (ready || billingClient.isReady()) {
            ready = true;
            refreshPurchases();
            queryCatalog();
            return;
        }
        if (connecting) {
            return;
        }

        connecting = true;
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                connecting = false;
                ready = billingResult.getResponseCode() == RESPONSE_OK;
                if (ready) {
                    refreshPurchases();
                    queryCatalog();
                } else {
                    listener.onBillingMessage("La boutique Google Play n'est pas disponible pour le moment.", true);
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                connecting = false;
                ready = false;
            }
        });
    }

    void stop() {
        if (billingClient.isReady()) {
            billingClient.endConnection();
        }
        connecting = false;
        ready = false;
    }

    boolean isReady() {
        return ready && billingClient.isReady();
    }

    void queryCatalog() {
        if (!isReady()) {
            start();
            listener.onCatalog(emptyCatalogJson());
            return;
        }

        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (GemPackCatalog.Pack pack : GemPackCatalog.PACKS) {
            products.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(pack.productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build());
        }

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(products)
            .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, result) -> {
            if (billingResult.getResponseCode() != RESPONSE_OK) {
                listener.onCatalog(emptyCatalogJson());
                return;
            }

            productDetails.clear();
            for (ProductDetails details : result.getProductDetailsList()) {
                productDetails.put(details.getProductId(), details);
            }
            listener.onCatalog(catalogJson());
        });
    }

    void launchPurchase(String productId) {
        GemPackCatalog.Pack pack = GemPackCatalog.find(productId);
        ProductDetails details = productDetails.get(productId);
        if (pack == null) {
            listener.onBillingMessage("Ce pack de Gemmes n'existe pas.", true);
            return;
        }
        if (!isReady() || details == null) {
            listener.onBillingMessage("La boutique n'est pas encore prête. Réessaie dans un instant.", true);
            queryCatalog();
            return;
        }

        ProductDetails.OneTimePurchaseOfferDetails offer = preferredOffer(details);
        BillingFlowParams.ProductDetailsParams.Builder productParams =
            BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details);
        if (offer != null && offer.getOfferToken() != null && !offer.getOfferToken().isEmpty()) {
            productParams.setOfferToken(offer.getOfferToken());
        }

        BillingFlowParams flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(java.util.Collections.singletonList(productParams.build()))
            .build();

        BillingResult result = billingClient.launchBillingFlow(activity, flowParams);
        if (result.getResponseCode() != RESPONSE_OK) {
            listener.onBillingMessage("Google Play n'a pas pu ouvrir le paiement.", true);
        }
    }

    void refreshPurchases() {
        if (!isReady()) {
            return;
        }
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
            if (billingResult.getResponseCode() != RESPONSE_OK) {
                return;
            }
            for (Purchase purchase : purchases) {
                handlePurchase(purchase);
            }
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == RESPONSE_OK && purchases != null) {
            for (Purchase purchase : purchases) {
                handlePurchase(purchase);
            }
            return;
        }
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            listener.onBillingMessage("Achat annulé.", false);
            return;
        }
        listener.onBillingMessage("Le paiement n'a pas pu être finalisé.", true);
    }

    private void handlePurchase(Purchase purchase) {
        if (!BuildConfig.BILLING_ENABLED) {
            return;
        }
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            listener.onBillingMessage("Paiement en attente de confirmation par Google Play.", false);
            return;
        }
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            return;
        }

        GemPackCatalog.Pack pack = firstKnownPack(purchase.getProducts());
        if (pack == null) {
            return;
        }

        premiumWalletGateway.verifyAndGrant(
            purchase.getPurchaseToken(),
            pack.productId,
            new PremiumWalletGateway.GrantCallback() {
                @Override
                public void onGranted(int premiumBalance) {
                    // The secure backend verifies, grants and consumes the purchase before
                    // confirming this callback. The client never grants paid currency itself.
                    listener.onPurchaseGranted(pack.productId, pack.gems, premiumBalance);
                }

                @Override
                public void onRejected(String message) {
                    listener.onBillingMessage(message, true);
                }
            }
        );
    }

    private static GemPackCatalog.Pack firstKnownPack(List<String> productIds) {
        for (String productId : productIds) {
            GemPackCatalog.Pack pack = GemPackCatalog.find(productId);
            if (pack != null) {
                return pack;
            }
        }
        return null;
    }

    private static ProductDetails.OneTimePurchaseOfferDetails preferredOffer(ProductDetails details) {
        ProductDetails.OneTimePurchaseOfferDetails simple = details.getOneTimePurchaseOfferDetails();
        if (simple != null) {
            return simple;
        }
        List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
        return offers == null || offers.isEmpty() ? null : offers.get(0);
    }

    private String catalogJson() {
        JSONArray products = new JSONArray();
        for (GemPackCatalog.Pack pack : GemPackCatalog.PACKS) {
            ProductDetails details = productDetails.get(pack.productId);
            ProductDetails.OneTimePurchaseOfferDetails offer = details == null ? null : preferredOffer(details);
            JSONObject item = new JSONObject();
            try {
                item.put("productId", pack.productId);
                item.put("gems", pack.gems);
                item.put("label", pack.label);
                item.put("available", details != null && offer != null);
                item.put("price", offer == null ? "" : offer.getFormattedPrice());
                item.put("title", details == null ? pack.label : details.getName());
            } catch (JSONException ignored) {
            }
            products.put(item);
        }
        return products.toString();
    }

    private static String emptyCatalogJson() {
        JSONArray products = new JSONArray();
        for (GemPackCatalog.Pack pack : GemPackCatalog.PACKS) {
            JSONObject item = new JSONObject();
            try {
                item.put("productId", pack.productId);
                item.put("gems", pack.gems);
                item.put("label", pack.label);
                item.put("available", false);
                item.put("price", "");
            } catch (JSONException ignored) {
            }
            products.put(item);
        }
        return products.toString();
    }
}
