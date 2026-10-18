package com.jasongolda.lumieresdepoche;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final int REQUEST_EXPORT_SAVES = 4101;
    private static final int REQUEST_IMPORT_SAVES = 4102;
    private static final String BACKUP_PREFS = "luciole_save_backups_v1";
    private static final int MAX_IMPORT_BYTES = 2 * 1024 * 1024;

    private WebView webView;
    private AppBridge appBridge;
    private PlayBillingManager billingManager;
    private String pendingExportPayload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        configureWebView(webView);
        applySystemBarInsets(webView);

        PremiumWalletGateway premiumWalletGateway = BuildConfig.LOCAL_TEST_MODE
            ? new DevLocalPremiumWalletGateway(this)
            : new DisabledPremiumWalletGateway();
        appBridge = new AppBridge(this, premiumWalletGateway);
        billingManager = new PlayBillingManager(this, appBridge, premiumWalletGateway);
        appBridge.attachBilling(billingManager);
        webView.addJavascriptInterface(appBridge, "LucioleAndroid");
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                this::dispatchBackToWebApp
            );
        }
    }

    private static void applySystemBarInsets(WebView webView) {
        webView.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            int left;
            int top;
            int right;
            int bottom;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Insets insets = windowInsets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
                );
                left = insets.left;
                top = insets.top;
                right = insets.right;
                bottom = insets.bottom;
            }
            else {
                left = windowInsets.getSystemWindowInsetLeft();
                top = windowInsets.getSystemWindowInsetTop();
                right = windowInsets.getSystemWindowInsetRight();
                bottom = windowInsets.getSystemWindowInsetBottom();
            }

            view.setPadding(left, top, right, bottom);
            return windowInsets;
        });
        webView.requestApplyInsets();
    }

    private static void configureWebView(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setBlockNetworkLoads(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                return uri == null || !"file".equalsIgnoreCase(uri.getScheme());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return url == null || !url.startsWith("file:///android_asset/");
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (BuildConfig.BILLING_ENABLED && billingManager != null) {
            billingManager.start();
        }
        if ((BuildConfig.BILLING_ENABLED || BuildConfig.LOCAL_TEST_MODE) && appBridge != null) {
            appBridge.refreshPremiumBalance();
        }
    }

    @Override
    protected void onDestroy() {
        if (billingManager != null) {
            billingManager.stop();
        }
        if (webView != null) {
            webView.removeJavascriptInterface("LucioleAndroid");
            webView.destroy();
        }
        super.onDestroy();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            dispatchBackToWebApp();
        } else {
            super.onBackPressed();
        }
    }

    private void dispatchBackToWebApp() {
        if (webView == null) {
            finish();
            return;
        }
        webView.evaluateJavascript(
            "Boolean(window.LuciolePlatform&&window.LuciolePlatform.handleSystemBack())",
            handled -> {
                if (!"true".equals(handled)) {
                    finish();
                }
            }
        );
    }

    void evaluateJavascript(String script) {
        runOnUiThread(() -> {
            if (webView != null) {
                webView.evaluateJavascript(script, null);
            }
        });
    }

    boolean storeNativeSaveBackup(int slot, String json) {
        if (slot < 1 || slot > 2 || json == null || !fitsUtf8Limit(json, MAX_IMPORT_BYTES)) {
            return false;
        }
        return getSharedPreferences(BACKUP_PREFS, MODE_PRIVATE)
            .edit()
            .putString("slot_" + slot, json)
            .commit();
    }

    String readNativeSaveBackup(int slot) {
        if (slot < 1 || slot > 2) {
            return null;
        }
        SharedPreferences prefs = getSharedPreferences(BACKUP_PREFS, MODE_PRIVATE);
        return prefs.getString("slot_" + slot, null);
    }

    void requestSaveExport(String payload) {
        if (payload == null || !fitsUtf8Limit(payload, MAX_IMPORT_BYTES)) {
            if (appBridge != null) {
                appBridge.onExportResult(false, "La sauvegarde est trop volumineuse pour être exportée.");
            }
            return;
        }
        pendingExportPayload = payload;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
            .addCategory(Intent.CATEGORY_OPENABLE)
            .setType("application/json")
            .putExtra(Intent.EXTRA_TITLE, "luciole-de-poche-sauvegardes.json");
        startActivityForResult(intent, REQUEST_EXPORT_SAVES);
    }

    void requestSaveImport() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT)
            .addCategory(Intent.CATEGORY_OPENABLE)
            .setType("application/json");
        startActivityForResult(intent, REQUEST_IMPORT_SAVES);
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            if (requestCode == REQUEST_EXPORT_SAVES && appBridge != null) {
                appBridge.onExportResult(false, "Export annulé.");
            }
            return;
        }
        Uri uri = data.getData();
        if (requestCode == REQUEST_EXPORT_SAVES) {
            writeExport(uri);
        } else if (requestCode == REQUEST_IMPORT_SAVES) {
            readImport(uri);
        }
    }

    private void writeExport(Uri uri) {
        String payload = pendingExportPayload;
        pendingExportPayload = null;
        if (payload == null) {
            return;
        }
        try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
            if (output == null) {
                throw new IOException("Impossible d'ouvrir le fichier de destination.");
            }
            output.write(payload.getBytes(StandardCharsets.UTF_8));
            output.flush();
            if (appBridge != null) {
                appBridge.onExportResult(true, "Sauvegardes exportées.");
            }
        } catch (IOException exception) {
            if (appBridge != null) {
                appBridge.onExportResult(false, "L'export n'a pas pu être terminé.");
            }
        }
    }

    private void readImport(Uri uri) {
        try (InputStream input = getContentResolver().openInputStream(uri)) {
            if (input == null) {
                throw new IOException("Impossible d'ouvrir le fichier.");
            }
            String payload = readUtf8Limited(input, MAX_IMPORT_BYTES);
            if (appBridge != null) {
                appBridge.onImportPayload(payload);
            }
        } catch (IOException exception) {
            if (appBridge != null) {
                appBridge.onImportPayload("{\"error\":\"Le fichier de sauvegarde n'a pas pu être lu.\"}");
            }
        }
    }

    private static String readUtf8Limited(InputStream input, int maxBytes) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int total = 0;
        int read;
        while ((read = input.read(buffer)) != -1) {
            total += read;
            if (total > maxBytes) {
                throw new IOException("Fichier trop volumineux.");
            }
            output.write(buffer, 0, read);
        }
        return new String(output.toByteArray(), StandardCharsets.UTF_8);
    }

    private static boolean fitsUtf8Limit(String value, int maxBytes) {
        return value.getBytes(StandardCharsets.UTF_8).length <= maxBytes;
    }
}
