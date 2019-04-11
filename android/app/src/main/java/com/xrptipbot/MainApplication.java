package com.xrptipbot;

import android.support.annotation.Nullable;

import com.facebook.react.ReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.BV.LinearGradient.LinearGradientPackage;
import org.reactnative.camera.RNCameraPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.wix.interactable.Interactable;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import com.joshblour.RNDiscovery.RNDiscoveryPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication implements ShareApplication   {

    @Override
    public boolean isDebug() {
        return BuildConfig.DEBUG;
    }

    @Override
    public String getJSMainModuleName() {
        return "index";
    }

     @Override
     public String getFileProviderAuthority() {
         return "com.xrptipbot.provider";

     }


    @Nullable
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return Arrays.<ReactPackage>asList(
                new LinearGradientPackage(),
                new RNCameraPackage(),
                new LottiePackage(),
                new RNDeviceInfo(),
                new RNSharePackage(),
                new RNViewShotPackage(),
                new Interactable(),
                new RNFirebasePackage(),
                new RNFirebaseMessagingPackage(),
                new RNFirebaseNotificationsPackage(),
                new RNFirebaseCrashlyticsPackage(),
                new RNDiscoveryPackage()

        );
    }
}
