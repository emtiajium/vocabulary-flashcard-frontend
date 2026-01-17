package com.emtiajium.firecracker.collaborative.vocab.practice;

import android.content.res.Configuration;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import ee.forgr.capacitor.social.login.GoogleProvider;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.Plugin;
import android.content.Intent;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {

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

    // details are in https://capgo.app/docs/plugins/social-login/google/android/
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
            PluginHandle pluginHandle = getBridge().getPlugin("SocialLogin");
            if (pluginHandle == null) {
                Log.i("Google Activity Result", "SocialLogin login handle is null");
                return;
            }
            Plugin plugin = pluginHandle.getInstance();
            if (!(plugin instanceof SocialLoginPlugin)) {
                Log.i("Google Activity Result", "SocialLogin plugin instance is not SocialLoginPlugin");
                return;
            }
            ((SocialLoginPlugin) plugin).handleGoogleLoginIntent(requestCode, data);
        }
    }


    // This function will never be called, leave it empty
    @Override
    public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
}
