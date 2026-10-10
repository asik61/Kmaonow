package online.realmoneyapp.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
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

    private static final String APP_URL = "https://realmoneyapp.online/?source=apk";
    private static final String OAUTH_CLIENT_ID = "599315886709-1ktv1koo6iop8ga7np95f2l911504hqb.apps.googleusercontent.com";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ValueCallback<Uri[]> filePathCallback;
    private long backPressedTime = 0;

    // File Chooser for task screenshot proofs
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

    // Native Google Sign-In with Account Chooser ("choose wala")
    private final ActivityResultLauncher<Intent> googleSignInLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getData() != null) {
                    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                    handleGoogleSignInResult(task);
                } else {
                    notifyGoogleSignInError("Login cancelled by user");
                }
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

        setupWebView();

        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
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

        // Sanitize User-Agent to allow Google OAuth without "disallowed_useragent" (Error 403)
        String defaultUserAgent = webSettings.getUserAgentString();
        String sanitizedUA = defaultUserAgent
                .replace("; wv", "")
                .replaceAll("Version/\\d+\\.\\d+\\s*", "")
                + " RealMoneyApp/1.0.0 (Android APK; Standalone)";
        webSettings.setUserAgentString(sanitizedUA);

        // Enable popup / multi-window support
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);

        // Accept Cookies and Third-Party Cookies for sessions
        android.webkit.CookieManager cookieManager = android.webkit.CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Add JavaScript Bridge for 1-Tap Native Google Account Chooser
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                return handleUrl(url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }

            private boolean handleUrl(String url) {
                if (url == null) return false;

                // Handle external apps, UPI payments, WhatsApp, Telegram, Phone calls
                if (url.startsWith("upi://") || url.startsWith("whatsapp://") || 
                    url.startsWith("intent://") || url.startsWith("tel:") || 
                    url.startsWith("mailto:") || url.startsWith("market://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (ActivityNotFoundException e) {
                        Toast.makeText(MainActivity.this, "Requested application not found", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                // If link belongs to realmoneyapp or OAuth, keep inside WebView
                if (url.contains("realmoneyapp.online") || 
                    url.contains("asia-east1.run.app") || 
                    url.contains("localhost") ||
                    url.contains("accounts.google.com") ||
                    url.contains("firebaseapp.com") ||
                    url.contains("apis.google.com") ||
                    url.contains("google.com/recaptcha")) {
                    return false;
                }

                // External task/sponsor links open in default mobile browser
                try {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(browserIntent);
                    return true;
                } catch (Exception ignored) {
                    return false;
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
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
                if (newProgress == 100) {
                    swipeRefresh.setRefreshing(false);
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            // File Chooser for task screenshot proof uploads
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                              FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    fileChooserLauncher.launch(intent);
                } catch (ActivityNotFoundException e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    // =========================================================================
    // Native Google Account Chooser Implementation ("choose wala")
    // =========================================================================
    public class AndroidBridge {
        @JavascriptInterface
        public void loginWithGoogle() {
            runOnUiThread(() -> startGoogleSignIn());
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }
    }

    private void startGoogleSignIn() {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .build();

        GoogleSignInClient client = GoogleSignIn.getClient(this, gso);
        // Explicitly signOut first so that the Account Chooser dialog ALWAYS shows
        // with all the user's Gmail accounts on the device ("choose wala")
        client.signOut().addOnCompleteListener(this, task -> {
            Intent intent = client.getSignInIntent();
            googleSignInLauncher.launch(intent);
        });
    }

    private void handleGoogleSignInResult(Task<GoogleSignInAccount> task) {
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            if (account != null) {
                String uid = account.getId() != null ? account.getId() : ("g-" + System.currentTimeMillis());
                String name = account.getDisplayName() != null ? account.getDisplayName() : "Google User";
                String email = account.getEmail() != null ? account.getEmail() : "";
                String photo = account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "";

                JSONObject json = new JSONObject();
                json.put("uid", uid);
                json.put("name", name);
                json.put("email", email);
                json.put("photoURL", photo);

                String script = "if (window.onNativeGoogleLoginSuccess) { window.onNativeGoogleLoginSuccess(" + json.toString() + "); }";
                runOnUiThread(() -> webView.evaluateJavascript(script, null));
            }
        } catch (ApiException e) {
            int statusCode = e.getStatusCode();
            if (statusCode == 12501) {
                notifyGoogleSignInError("Account selection cancelled");
            } else {
                notifyGoogleSignInError("Google sign-in error (" + statusCode + ")");
            }
        } catch (Exception e) {
            notifyGoogleSignInError(e.getMessage());
        }
    }

    private void notifyGoogleSignInError(String errorMsg) {
        String safeMsg = (errorMsg != null ? errorMsg.replace("'", "\\'") : "Error");
        String script = "if (window.onNativeGoogleLoginError) { window.onNativeGoogleLoginError('" + safeMsg + "'); }";
        runOnUiThread(() -> webView.evaluateJavascript(script, null));
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
