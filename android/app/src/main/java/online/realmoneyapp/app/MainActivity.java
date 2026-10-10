package online.realmoneyapp.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "RealMoneyApp";
    private static final String APP_URL = "https://realmoneyapp.online/?source=apk";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ValueCallback<Uri[]> filePathCallback;
    private GoogleSignInClient googleSignInClient;
    private long backPressedTime = 0;
    private String sanitizedUA;

    // File Chooser Launcher (Screenshot / Document Upload)
    private final ActivityResultLauncher<Intent> fileChooserLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (filePathCallback != null) {
                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        if (result.getData().getClipData() != null) {
                            int count = result.getData().getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = result.getData().getClipData().getItemAt(i).getUri();
                            }
                        } else if (result.getData().getData() != null) {
                            results = new Uri[]{result.getData().getData()};
                        }
                    }
                    filePathCallback.onReceiveValue(results);
                    filePathCallback = null;
                }
            }
    );

    // Native Google Account Chooser Launcher ("Choose Wala")
    private final ActivityResultLauncher<Intent> googleSignInLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                    try {
                        GoogleSignInAccount account = task.getResult(ApiException.class);
                        if (account != null) {
                            String uid = account.getId() != null ? account.getId() : ("g_" + System.currentTimeMillis());
                            String name = account.getDisplayName() != null ? account.getDisplayName() : "Google User";
                            String email = account.getEmail() != null ? account.getEmail() : "";
                            String photo = account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "";

                            JSONObject json = new JSONObject();
                            json.put("uid", uid);
                            json.put("name", name);
                            json.put("email", email);
                            json.put("photoURL", photo);

                            final String jsCallback = "if (window.onNativeGoogleLoginSuccess) { window.onNativeGoogleLoginSuccess(" + json.toString() + "); }";
                            webView.post(() -> webView.evaluateJavascript(jsCallback, null));
                            return;
                        }
                    } catch (ApiException e) {
                        Log.e(TAG, "Google Sign-In failed: " + e.getStatusCode(), e);
                        String errMsg = (e.getStatusCode() == 12501)
                                ? "Google login cancelled"
                                : "Google login failed: " + e.getStatusCode();
                        final String jsErr = "if (window.onNativeGoogleLoginError) { window.onNativeGoogleLoginError('" + errMsg + "'); }";
                        webView.post(() -> webView.evaluateJavascript(jsErr, null));
                        return;
                    } catch (Exception e) {
                        Log.e(TAG, "Google Sign-In parsing error", e);
                    }
                }
                final String jsCancel = "if (window.onNativeGoogleLoginError) { window.onNativeGoogleLoginError('Login cancelled'); }";
                webView.post(() -> webView.evaluateJavascript(jsCancel, null));
            }
    );

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        swipeRefresh = findViewById(R.id.swipeRefresh);
        webView = findViewById(R.id.webView);

        swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent);
        swipeRefresh.setOnRefreshListener(() -> {
            webView.clearCache(true);
            webView.reload();
        });

        initGoogleSignIn();
        setupWebView();

        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void initGoogleSignIn() {
        try {
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestEmail()
                    .requestProfile()
                    .build();
            googleSignInClient = GoogleSignIn.getClient(this, gso);
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize GoogleSignInClient", e);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setSupportZoom(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        String defaultUserAgent = webSettings.getUserAgentString();
        sanitizedUA = defaultUserAgent
                .replace("; wv", "")
                .replaceAll("Version/\\d+\\.\\d+\\s*", "")
                + " RealMoneyApp/1.0.0 (Android APK; Standalone)";
        webSettings.setUserAgentString(sanitizedUA);

        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);

        android.webkit.CookieManager cookieManager = android.webkit.CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Bridge for Native Android Google Sign-In & Toast
        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }

            private boolean handleUrl(String url) {
                if (url == null) return false;

                // Native app protocols: UPI, WhatsApp, dialer, mail, Play Store
                if (url.startsWith("upi://") || url.startsWith("whatsapp://") ||
                    url.startsWith("intent://") || url.startsWith("tel:") ||
                    url.startsWith("mailto:") || url.startsWith("market://")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                        return true;
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(MainActivity.this, "App not found", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                // App domains stay strictly inside WebView
                if (url.contains("realmoneyapp.online") ||
                    url.contains("kmaonow") ||
                    url.contains("asia-east1.run.app") ||
                    url.contains("localhost") ||
                    url.contains("127.0.0.1") ||
                    url.contains("apis.google.com") ||
                    url.contains("google.com/recaptcha")) {
                    return false;
                }

                // External URLs (ad partners, external surveys) open in default browser
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                } catch (Exception ignored) {
                    return false;
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress == 100) swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                WebView newWebView = new WebView(MainActivity.this);
                WebSettings newSettings = newWebView.getSettings();
                newSettings.setJavaScriptEnabled(true);
                newSettings.setDomStorageEnabled(true);
                newSettings.setUserAgentString(sanitizedUA);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(newWebView, true);
                }

                final android.app.Dialog authDialog = new android.app.Dialog(
                        MainActivity.this,
                        android.R.style.Theme_DeviceDefault_Light_NoActionBar_Fullscreen);
                authDialog.setContentView(newWebView);
                authDialog.show();

                newWebView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView window) {
                        authDialog.dismiss();
                        window.destroy();
                    }
                });

                newWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                        String u = req.getUrl().toString();
                        if (u.contains("realmoneyapp.online") ||
                            u.contains("kmaonow") ||
                            u.contains("asia-east1.run.app") ||
                            u.contains("localhost")) {
                            authDialog.dismiss();
                            webView.loadUrl(u);
                            return true;
                        }
                        return false;
                    }
                });

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(newWebView);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                              FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;
                try {
                    fileChooserLauncher.launch(fileChooserParams.createIntent());
                } catch (ActivityNotFoundException e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    // JavaScript Interface to Bridge Native Android Features to Web App
    public class WebAppInterface {
        @JavascriptInterface
        public void loginWithGoogle() {
            runOnUiThread(() -> {
                try {
                    if (googleSignInClient != null) {
                        // Sign out previously chosen account so the user is ALWAYS prompted
                        // with the account selection bottom-sheet ("choose wala")
                        googleSignInClient.signOut().addOnCompleteListener(task -> {
                            Intent signInIntent = googleSignInClient.getSignInIntent();
                            googleSignInLauncher.launch(signInIntent);
                        });
                    } else {
                        initGoogleSignIn();
                        if (googleSignInClient != null) {
                            Intent signInIntent = googleSignInClient.getSignInIntent();
                            googleSignInLauncher.launch(signInIntent);
                        } else {
                            final String jsErr = "if (window.onNativeGoogleLoginError) { window.onNativeGoogleLoginError('Google Sign-In unavailable'); }";
                            webView.evaluateJavascript(jsErr, null);
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error launching Google Sign-In", e);
                    final String jsErr = "if (window.onNativeGoogleLoginError) { window.onNativeGoogleLoginError('Error launching Google Sign-In'); }";
                    webView.evaluateJavascript(jsErr, null);
                }
            });
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            } else {
                if (backPressedTime + 2000 > System.currentTimeMillis()) {
                    finish();
                } else {
                    Toast.makeText(this, "Press back again to exit", Toast.LENGTH_SHORT).show();
                    backPressedTime = System.currentTimeMillis();
                }
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }
}
