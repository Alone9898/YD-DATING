/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

//import static androidx.activity.result.ActivityResultCallerKt.registerForActivityResult;

//import com.appsflyer.AppsFlyerLib;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.meituan.android.walle.WalleChannelReader;
import com.mensa.game.card.R;
import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.app.Dialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.provider.ContactsContract;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;

import android.os.Bundle;

import android.content.Intent;
import android.content.res.Configuration;

//import androidx.activity.result.ActivityResultLauncher;
//
//import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.Locale;

//import kotlin.text.MatchNamedGroupCollection;


public class AppActivity extends Cocos2dxActivity {


//    private static final String[] PERMISSIONS_NOTFIY = {
//            Manifest.permission.POST_NOTIFICATIONS,
//    };
    private static final int REQUEST_NOTIFY_CODE = 1;

    private static Cocos2dxActivity sCocos2dxActivity;
    private static ImageView sSplashBgImageView = null;

//    // Declare the launcher at the top of your Activity/Fragment:
//    private final ActivityResultLauncher<String> requestPermissionLauncher =
//            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
//                if (isGranted) {
//                    // FCM SDK (and your app) can post notifications.
//                } else {
//                    // TODO: Inform user that that your app will not show notifications.
//                }
//            });


    Handler handler = new Handler();
    Runnable runnable = new Runnable() {
        @Override
        public void run() {
            System.exit(0);
        }
    };

    private static void showSplash() {
        sSplashBgImageView = new ImageView(sCocos2dxActivity);
        sSplashBgImageView.setBackgroundColor(
                sCocos2dxActivity.getResources().getColor(R.color.splash_slogan_bg)
        );
        sSplashBgImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        sCocos2dxActivity.addContentView(sSplashBgImageView,
                new WindowManager.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                )
        );
    }

    /**
     * 这是给 CC JS 调用的隐藏原生开屏背景的方法
     */
    public static void hideSplash() {
        sCocos2dxActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (sSplashBgImageView != null) {
                    sSplashBgImageView.setVisibility(View.GONE);
                }
            }
        });
    }

    /**
     * 获取通讯录
     */
    public static void getConstract(){
        if (ContextCompat.checkSelfPermission(sCocos2dxActivity, Manifest.permission.READ_CONTACTS) ==
                PackageManager.PERMISSION_GRANTED) {
            readContacts();
        }
        else{
            ActivityCompat.requestPermissions(sCocos2dxActivity,new String[]{Manifest.permission.READ_CONTACTS},1);
        }

    }

    public static void readContacts(){
        Cursor cursor=null;
        try{
            cursor=sCocos2dxActivity.getContentResolver().query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI,null,null
                    ,null,null);
            if(cursor!=null){
                while (cursor.moveToNext()){
                    @SuppressLint("Range") String name=cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME));
                    @SuppressLint("Range") String number=cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));
                    PlatformAndroidApi.constracts = PlatformAndroidApi.constracts + (name+":"+number) +";";
//                    contastList.add(name+"\n"+number);
                };

            }
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            if(cursor!=null){
                cursor.close();
            }
        }
    }

    /**
     * check play service
     * @return
     */

   private boolean onCheckGooglePlayService(){
        int code = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(this);
        if(code == ConnectionResult.SUCCESS){
            // support
            return true;
        }
        else{
            GoogleApiAvailability.getInstance().makeGooglePlayServicesAvailable(this);
            if(GoogleApiAvailability.getInstance().isUserResolvableError(code)){
                Dialog dia = GoogleApiAvailability.getInstance().getErrorDialog(this,code,200);
                dia.setCancelable(false);
                dia.setCanceledOnTouchOutside(false);
                dia.show();
            }
        }

       handler.postDelayed(runnable,6000);
       return false;


   }

//    //权限检查
//    private boolean checkSelfPermission(String permission, int requestCode) {
////        Log.i(TAG, "checkSelfPermission " + permission + " " + requestCode);
//        if (ContextCompat.checkSelfPermission(this,
//                permission)
//                != PackageManager.PERMISSION_GRANTED) {
//
//            ActivityCompat.requestPermissions(this,
//                    PERMISSIONS_NOTFIY,
//                    requestCode);
//            return false;
//        }
//        return true;
//    }
//
 @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String permissions[], @NonNull int[] grantResults) {
//        Log.i(TAG, "onRequestPermissionsResult " + grantResults[0] + " " + requestCode);

        switch (requestCode) {
            case 1: {
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    readContacts();
                } else {

                }
                break;
            }
        }
    }

//    private void askNotificationPermission() {
//        // This is only necessary for API level >= 33 (TIRAMISU)
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
//            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
//                    PackageManager.PERMISSION_GRANTED) {
//                // FCM SDK (and your app) can post notifications.
//            } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
//                // TODO: display an educational UI explaining to the user the features that will be enabled
//                //       by them granting the POST_NOTIFICATION permission. This UI should provide the user
//                //       "OK" and "No thanks" buttons. If the user selects "OK," directly request the permission.
//                //       If the user selects "No thanks," allow the user to continue without notifications.
//            } else {
//                // Directly ask for the permission
//                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
//            }
//        }
//    }

    //open backgroud model
    private void askSettingBackgroundModel(){
       if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.P){
         ActivityManager ap = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
         if(ap != null){
             if(ap.isBackgroundRestricted()){
                 Intent intent=new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,  Uri.fromParts("package", getPackageName(), null));
//                 Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                 startActivity(intent);
             }
         }
       }

//        if(Build.BRAND != null && Build.BRAND.toLowerCase().equals("xiaomi")){
//            showActivity("com.miui.securitycenter","com.miui.permcenter.autostart.AutoStartManagementActivity");
//        }

    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = getString(R.string.channel_name);
            String description = getString(R.string.channel_description);
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(getString(R.string.default_notification_channel_id), name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void  showActivity(String packageName){
       Intent intent = getPackageManager().getLaunchIntentForPackage(packageName);
       startActivity(intent);
    }

    private void showActivity(String packageName, String activityDir){
       Intent intent = new Intent();
       intent.setComponent(new ComponentName(packageName,activityDir));
       intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
       startActivity(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Workaround in
        // https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            // Android launched another instance of the root activity into an existing task
            // so just quietly finish and go away, dropping the user back into the activity
            // at the top of the stack (ie: the last state of this task)
            // Don't need to finish it again since it's finished in super.onCreate .
            return;
        }
        // DO OTHER INITIALIZATION BELOW
        sCocos2dxActivity = this;

//        //AF
////        AppsFlyerLib.getInstance().setDebugLog(true);
//        AppsFlyerLib.getInstance().init(getString(R.string.AF_DEV_KEY),null,this);
//        AppsFlyerLib.getInstance().start(this);

        //保持屏幕不息屏
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        showSplash();
        SDKWrapper.getInstance().init(this);


        String apkcomment = WalleChannelReader.getChannel(getContext());
        PlatformAndroidApi.channelex = WalleChannelReader.get(getContext(),"cx");
        PlatformAndroidApi.channelstr = apkcomment;


        onOpenAppByUrl(getIntent());

        PlatformAndroidApi.googleService = onCheckGooglePlayService();


        askSettingBackgroundModel();
        createNotificationChannel();
        PlatformAndroidApi.reGetFMCToken();
    }

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);
        SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView, this);

        return glSurfaceView;
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.getInstance().onResume();

        PlatformAndroidApi.googleService = onCheckGooglePlayService();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.getInstance().onPause();

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }

        SDKWrapper.getInstance().onDestroy();

    }


    private void onOpenAppByUrl (Intent intent) {

        if(intent == null){
            return;
        }

        Uri deepLink = intent.getData();
        if (deepLink != null) {

            String queryStr = deepLink.getQuery();
            if(queryStr == null){ //没有这个参数，就不往下执行了
                return;
            }
            JSONObject jsonObj = new JSONObject();
            try {
                String[] arrSplit = null;
                arrSplit=queryStr.split("[&]");
                for(String strSplit:arrSplit){
                    String[] arrSplitEqual=null;
                    arrSplitEqual= strSplit.split("[=]");
                    //解析出键值
                    if(arrSplitEqual.length>1){ //正确解析
                        jsonObj.put(arrSplitEqual[0], arrSplitEqual[1]);
                    }else{
                        if(arrSplitEqual[0]!=""){ //只有参数没有值，不加入
                            jsonObj.put(arrSplitEqual[0], "");
                        }
                    }
                }
                //缓存数据(App刚启动的时候，下列回调是调用不了的)
                PlatformAndroidApi.openAppUrlDataString = jsonObj.toString();
                //直接发到js代码中，回调对应函数
                JsTool.sendToPlatformApiCbFunc("OpenAppUrlLink", jsonObj);
            }
            catch (JSONException e) {
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.getInstance().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.getInstance().onNewIntent(intent);

        onOpenAppByUrl(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.getInstance().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.getInstance().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.getInstance().onBackPressed();
        //        super.onBackPressed();
        JSONObject retjsonObj = new JSONObject();
        try {
            retjsonObj.put("result","Back");
            //直接发到js代码中，回调对应函数
            JsTool.sendToPlatformApiCbFunc("BackPressedCallback", retjsonObj);
        }
        catch (JSONException e) {
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.getInstance().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.getInstance().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.getInstance().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.getInstance().onStart();
        super.onStart();
    }
}
