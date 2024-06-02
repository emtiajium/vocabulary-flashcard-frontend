package com.emtiajium.firecracker.collaborative.vocab.practice;

import android.content.res.Configuration;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        this.toggleTheme(configuration);
    }

    private void toggleTheme(Configuration configuration) {
        try {
            WebView mainWebView = findViewById(com.getcapacitor.android.R.id.webview);
            mainWebView.setWebViewClient(new WebViewClient());
            WebSettings webSettings = mainWebView.getSettings();
            webSettings.setJavaScriptEnabled(true);

            String themeHandler = "";

            if (configuration.uiMode == 33) {
                themeHandler = "setDarkMode();";
            } else if (configuration.uiMode == 17) {
                themeHandler = "setLightMode();";
            }

            mainWebView.evaluateJavascript(themeHandler, null);
        } catch (Exception exception) {
            // do nothing
        }
    }
}
