/****************************************************************************
// android platform static function api to javascript
****************************************************************************/
package org.cocos2dx.javascript;

import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.location.LocationManager;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

//import com.appsflyer.AppsFlyerLib;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

//import com.kochava.base.Tracker;

//import com.appsflyer.AFInAppEventParameterName;
//import com.appsflyer.AFInAppEventType;
//import com.appsflyer.AppsFlyerLib;


public class PlatformAndroidApi {
	public static AppActivity context = (AppActivity) AppActivity.getContext();
	public static String openAppUrlDataString = "";
	public static String firebaseMsgToken = ""; //firebase推送的唯一令牌
	public static String channelstr = "";	//渠道信息
//	public static AMapLocationMgr locMgr = null;
	public static boolean googleService=true;
	
	public static String getAppVersion() {
		String appVersion = "1.0.0";
		try {
	    	PackageManager pm = context.getPackageManager();  
	        PackageInfo pi = pm.getPackageInfo(context.getPackageName(), 0);  
	        appVersion = pi.versionName; 
		} catch (Exception e) {
			e.printStackTrace();
		}
		return appVersion;
	}

	@SuppressLint("NewApi") 
	public static String getTxtFromClipboard() {
		String clipboardTxt = "";
		ClipboardManager cm = (ClipboardManager)context.getSystemService(Context.CLIPBOARD_SERVICE);
		ClipData cd = cm.getPrimaryClip();
		if(cd !=null && cd.getItemAt(0) != null){
			clipboardTxt = cd.getItemAt(0).getText().toString();
		}

		return clipboardTxt;
	}

	public static String getOpenAppUrlDataString() {
		String tempStr =  PlatformAndroidApi.openAppUrlDataString;
		PlatformAndroidApi.openAppUrlDataString = "";
		return  tempStr;
	}

	public static void clearOpenAppUrlDataString(){
		PlatformAndroidApi.openAppUrlDataString = "";
	}

	//获取firebase 的推送消息唯一令牌
	public static String getFMCToken(){
		Log.d("API","fmctoken："+firebaseMsgToken);
		return	firebaseMsgToken;
	}

	//re get
	public static void reGetFMCToken(){
		FirebaseMessaging.getInstance().getToken()
				.addOnCompleteListener(new OnCompleteListener<String>() {
					@Override
					public void onComplete(@NonNull Task<String> task) {
						if (!task.isSuccessful()) {
//							Log.w(TAG, "Fetching FCM registration token failed", task.getException());
							return;
						}

						// Get new FCM registration token
						String token = task.getResult();

						firebaseMsgToken = token;
					}
				});
	}

	//获取渠道信息
	public static String getChannelstr(){
		return	channelstr;
	}
	
	@SuppressLint("NewApi")
	public static void setTxtToClipboard(final String txt) {
		/*ClipboardManager clipboardManager = (ClipboardManager)context.getSystemService(Context.CLIPBOARD_SERVICE);
	    ClipData clipData = ClipData.newPlainText("label", txt);
	    clipboardManager.setPrimaryClip(clipData);*/
		 Runnable runnable = new Runnable() {
	            public void run() {
	            	ClipboardManager cm = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
	                cm.setText(txt);
	            }
	        };
	        context.runOnUiThread(runnable);
	}
	
	public static void openGPSSetting() {
		Intent intent = new Intent( android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS);
		context.startActivityForResult(intent, 0); 
	}
	
	public static boolean isOpenGPS() {
		LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
		boolean isOpen = false;
		if (locationManager.isProviderEnabled(android.location.LocationManager.GPS_PROVIDER)) {
			isOpen = true;
		}
		return isOpen;
	}

//	public static void startLocation() {
//		 if (locMgr == null) {
//		 	 locMgr = new AMapLocationMgr();
//			 locMgr.initLocation();
//		 }
//		locMgr.startLocation();
//	}
//
//	public static void stopLocation() {
//		if (locMgr != null) {
//			locMgr.stopLocation();
//		}
//	}

	//保存图片到相册
	public static int SaveToAlumb(String data){return ProjUtil.saveToAlumb(data);}
	//保存网络图片
	public static int SaveUrlToAlumb(String url){
//		if(Build.VERSION.SDK_INT >= 23){
			String[] PERMISSIONS = {
					"android.permission.READ_EXTERNAL_STORAGE",
					"android.permission.WRITE_EXTERNAL_STORAGE" };
			//检测是否有写的权限
			int permission = ContextCompat.checkSelfPermission(context,
					"android.permission.WRITE_EXTERNAL_STORAGE");
			if (permission != PackageManager.PERMISSION_GRANTED) {
				// 没有写的权限，去申请写的权限，会弹出对话框
				ActivityCompat.requestPermissions(context, PERMISSIONS,1);
				return 0;
			}

//		}

		InputStream istream = ProjUtil.getHtmlStream(url);
		Bitmap bmp = BitmapFactory.decodeStream(istream);
		final String fileName = System.currentTimeMillis() + ".jpg";
		final boolean doRes = ProjUtil.saveImageToGallery(context,bmp,fileName);
		if(doRes){
			return 1;
		}
		return 0;
	}
	public static void openURL(String urlStr) {
		Uri uri = Uri.parse(urlStr.length() > 0 ? urlStr : "https://www.baidu.com");
		Intent intent = new Intent(Intent.ACTION_VIEW, uri);
		context.startActivity(intent);
	}

	//旋转屏幕
	public static void setOrientation(final String dir){
		context.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				if(dir.equals("portrait")) {
					context.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
				} else if (dir.equals("landscape")){
					context.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
				}
			}
		});
	}

	//获取android id
	public static String getDeviceId(){ return ProjUtil.getAnroidId(); }

	//关闭启动图
	public static void closeSpalsh(){
		AppActivity.hideSplash();
	}

	//获取手机品牌
	public static String getDeviceBrand(){
		String strBrand = ProjUtil.getDeviceBrand();
		String strModel = ProjUtil.getDeviceModel();
		return strBrand + "_" + strModel;
	}

	//获取手机系统版本
	public static String getDeviceOpSysVision(){
		String strVision = ProjUtil.getSystempVision();
		return strVision;
	}

	//获取bundleid
	public static String getAPPBundleId(){
	    // 获取packagemanager的实例  
	    String packageName = "";
		try {
	    	PackageManager pm = context.getPackageManager();  
	        PackageInfo info = pm.getPackageInfo(context.getPackageName(), 0);  
	        ApplicationInfo appInfo = info.applicationInfo;
	        packageName = appInfo.packageName; 
		} catch (Exception e) {
			e.printStackTrace();
		} 
        return packageName;  
	}

	//手机震动一下
	public static void phoneShock(String nDur){
		ProjUtil.phoneShock(nDur);
	}

	//唤起拨号盘
	public static void callPhone(String num){
		Intent intent_call = new Intent(Intent.ACTION_DIAL);
		intent_call.setData(Uri.parse("tel:"+num));
		context.startActivity(intent_call);
	}

	//评分接口
	public static boolean openRating() {
		Uri uri = Uri.parse("market://details?id=" + getAPPBundleId());
		Intent intentpf = new Intent(Intent.ACTION_VIEW, uri);
		intentpf.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		context.startActivity(intentpf);
		return true;
	}

	//打开gp支付
	public static  void SdkPay (String data){
//		GglPayMgr.getInstance().purchase(data);
	}
	//gp查询并消耗已购买的订单
	public static void gpCheckOwned(){
//		GglPayMgr.getInstance().queryAndConsumePurchase();
	}
	//查询所有商品详情
	public static void queryAllSKU(String data){
//		GglPayMgr.getInstance().queryAllSkuDetais(data);
	}

	//google登录
	public static void googleLogin () {

	}

	//google广告AdMob
	public static void loadAdMobRewardAd () {
//		context.runOnUiThread(new Runnable() {
//			@Override
//			public void run() {
//				AdMobMgr.getInstance().loadAdmobAwardAd();
//			}
//		});
	}

	//记录ko事件打点
	public static void KoTrackEvent(String data) throws JSONException {
//		JSONObject jb = new JSONObject(data);
//		String eventName = jb.getString("EventName");
//		String eventKey = "";
//		if (jb.has("EventKey")) eventKey = jb.getString("EventKey");
//		String eventValue = "";
//		if (jb.has("EventValue")) eventValue = jb.getString("EventValue");
//		String eventType = "";
//		if (jb.has("EventType")) eventType = jb.getString("EventType");
//		if (eventType.length() > 0) {
//			//定义标准事件
//			//暂时没有用到todo
//			Log.w("RummySlots", "Nothing");
//		}
//		else {
//			//KO
////			Tracker.Event event = new Tracker.Event(eventName);
////			if (eventValue.length() > 0) {
////				JSONObject jsonObjValue = new JSONObject(eventValue);
////				if (jsonObjValue.keys().hasNext()) { //说明JSONObject存在
////					event.addCustom(jsonObjValue);
////				}
////			}
////			Tracker.sendEvent(event);
//
////			Log.w("RummySlots", "Event: " + event.toString());
//
//
//			//AFS
//			Map<String,Object> eventValues = new HashMap<>();
//			JSONObject jsonObjValue = new JSONObject(eventValue);
//			Iterator it = jsonObjValue.keys();
//
//			while(it.hasNext()){
//
//				String key = String.valueOf(it.next().toString());
//
//				String value = (String)jsonObjValue.get(key).toString();
//
//				eventValues.put(key, value);
//
//			}
//			AppsFlyerLib.getInstance().logEvent(context,eventName,eventValues);
//		}
	}

	public static String getKoTrackUUID(){
		String struuid="";
//		struuid = Tracker.getDeviceId();
		return	struuid;
	}

	//加载TradPlus视频广告
	public static void loadTradPlusRewardedVideo(String adUnitId) {
//		TradPlusAdMgr.getInstance().loadRewardVideo(adUnitId);
	}

	//显示TradPlus视频广告
	public static void showTradPlusRewardedVideo(String adUnitId) {
//		TradPlusAdMgr.getInstance().showRewardVideo();
	}

	//fb登录
	public static void fbSdkLogin() throws JSONException {
//		FacebookMgr.getInstance().login();

	}
	//fb登出
	public static void fbSdkLoginOut(){
//		FacebookMgr.getInstance().loginOut();
	}
	//fb分享
	public static void fbSdkShare(String shareData) {

//		FacebookMgr.getInstance().shareSdk(shareData);
		JSONObject jb = null;
		try {
			jb = new JSONObject(shareData);

			int nShareWhere = 1; //1 fb 2 messager 3 whatsapp
			if (jb.has("shareWhere")) {
				nShareWhere = jb.getInt("shareWhere");
			}
			if(nShareWhere == 3){
				String packname = "com.whatsapp";//"org.telegram.messenger";//"com.facebook.orca";//"com.whatsapp";
				if(ProjUtil.isAppInstall(context,packname)){
					String msgStr = jb.getString("msgStr");
					Intent sendIntent = new Intent();
					sendIntent.setAction(Intent.ACTION_SEND);
					sendIntent.putExtra(Intent.EXTRA_TEXT,msgStr);
					sendIntent.setType("text/plain");
					sendIntent.setPackage(packname);
					context.startActivity(sendIntent);
				}
			}
		}
		catch (JSONException e) {
			e.printStackTrace();
		}

	}

	//按包名分享字符
	public static void packageAppShare(String shareData){
		JSONObject jb = null;
		try {
			jb = new JSONObject(shareData);
			String packname = jb.getString("packname");
			if(ProjUtil.isAppInstall(context,packname)){
				String msgStr = jb.getString("msgStr");
				Intent sendIntent = new Intent();
				sendIntent.setAction(Intent.ACTION_SEND);
				sendIntent.putExtra(Intent.EXTRA_TEXT,msgStr);
				sendIntent.setType("text/plain");
				sendIntent.setPackage(packname);
				context.startActivity(sendIntent);
			}
			else{
				//not install app
				JSONObject jsonObj = new JSONObject();
				jsonObj.put("packname",packname);
				jsonObj.put("result","-1");
				JsTool.sendToPlatformApiCbFunc("packageAppShareCall", jsonObj);
			}

		}
		catch (JSONException e){
			e.printStackTrace();
		}
	}
	//打开fb
	public static boolean OpenFB(String data){
//		return FacebookMgr.getInstance().openFBApp(data);
		return false;
	}
    //应用内FB好友
    public static void FbFriendsInApp(){
//		FacebookMgr.getInstance().appFriends();
	}

	//是否按照了原生FB
	public static int isInstallFB(){
//		if(FacebookMgr.getInstance().isInstallFBApp()){
//			return	1;
//		}
		return 0;
	}

	//归因
	public static void googleInstallReff() {
//		SDKPlayCore sdk = (SDKPlayCore) SDKWrapper.getInstance().getSDK("SDKPlayCore");
//		sdk.InstallReffconnect();
	}
	//应用内评价
	public static void loadReviewComment(){
//		SDKPlayCore sdk = (SDKPlayCore) SDKWrapper.getInstance().getSDK("SDKPlayCore");
//		sdk.loadReview();
	}

//
//	//微信是否安装
//	public static int installWXApp(){
//		int nResult = 0;
//		if(WxMgr.getInstance().isInstallWXApp()){
//			nResult = 1;
//		}
//		return nResult;
//	}
//
//	//打开微信
//	public static int openWXApp() {
//		int nResult = 0;
//		if(WxMgr.getInstance().openWXApp()){
//			nResult = 1;
//		}
//		return nResult;
//	}
//
//	//微信登录
//	public static void wxLogin(){WxMgr.getInstance().wxLogin();}
//
//	//微信分享
//	public static void wxShare(String data){WxMgr.getInstance().wxShare(data);}
//
//	//获取友盟渠道号
//	public static String getUMChannelIdx(){
//		return UMengMgr.getInstance().getChannelName();
//	}

    //打开相册选取头像
//	JSONObject obj = new JSONObject  ();
//		obj.put("height",100);
//		obj.put("width",100);
//		obj.put("size",102400);
//	takePhoto(obj.toString());
    public static void takePhoto(final String param){
	    context.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				Intent intent = new Intent(context, TakePhotoActivity.class);
				intent.putExtra("param", param);
                context.startActivity(intent);
			}
		});
    }

//    // 加入音频室
//	JSONObject obj = new JSONObject  ();
//		obj.put("token","006c91030f6f2bc4ac39748f72ad5fdf1aaIACA411orJNd8H+3vp5h4IYdL6kj1KZhAX+zLHvZHnrwZXhSBlYAAAAAEAAPz4g6IW5vYQEAAQAgbm9h");
//		obj.put("cname",10086);
//		obj.put("uid",1003);
//		obj.put("opt","test");
//
//	joinVoiceChannel(obj.toString());
    public static void joinVoiceChannel(final String param){
//		VoiceMgr.getInstance().joinChannel(param);
	}

	//禁言-自己
	public static void setLocalMute(String val){
//		boolean bmute = TextUtils.equals(val, "1")?true:false;
//		VoiceMgr.getInstance().setLocalMute(bmute);
	}

	//禁言-别人
	public static void setRemoteMute(String data) throws JSONException {
//		JSONObject jb = new JSONObject(data);
//		String uid = jb.getString("uid");
//		String mute = jb.getString("mute");
//		boolean val = TextUtils.equals(mute, "1")?true:false;
//		VoiceMgr.getInstance().setRemoteMute(Integer.parseInt(uid),val);

	}

	//离开聊天室
	public static void levelVoiceChannel(){
//		VoiceMgr.getInstance().leaveChannel();
	}

	//发送邮件
//	JSONObject obj = new JSONObject  ();
//		obj.put("sender","havefun@mensaplay.com");
//		obj.put("title","游戏反馈");
//		obj.put("content","反馈内容");
//	sendMail(obj.toString());

	public static void sendMail(String data){

		try {
			JSONObject jb = new JSONObject(data);
			final String sender = jb.getString("sender");
			final String title = jb.getString("title");
			final String content = jb.getString("content");
			context.runOnUiThread(new Runnable() {
				@Override
				public void run() {
					Intent email = new Intent(android.content.Intent.ACTION_SEND);
					//邮件发送类型：无附件，纯文本
					email.setType("plain/text");
					//邮件接收者（数组，可以是多位接收者）
					String[] emailReciver = new String[]{sender};

					String  emailTitle = title;
					String emailContent = content;
					//设置邮件地址
					email.putExtra(android.content.Intent.EXTRA_EMAIL, emailReciver);
					//设置邮件标题
					email.putExtra(android.content.Intent.EXTRA_SUBJECT, emailTitle);
					//设置发送的内容
					email.putExtra(android.content.Intent.EXTRA_TEXT, emailContent);
					//调用系统的邮件系统
					context.startActivity(Intent.createChooser(email, ""));
				}
			});
		} catch (JSONException e) {
			e.printStackTrace();
		}



	}

	/**
	 * 系统分享
	 */
	public static void systemShare(String data) {
		try {
			JSONObject jb = new JSONObject(data);
			final String imgUrl = jb.getString("imgUrl");
			final String title = jb.getString("title");
			final String content = jb.getString("content");
			context.runOnUiThread(new Runnable() {
				@Override
				public void run() {
					Intent sendIntent = new Intent(Intent.ACTION_SEND);
					sendIntent.setType("text/*");
					sendIntent.putExtra(Intent.EXTRA_TEXT, content);

					// (Optional) Here we're setting the title of the content
					sendIntent.putExtra(Intent.EXTRA_TITLE, title);

//					// (Optional) Here we're passing a content URI to an image to be displayed
//					if (!imgUrl.isEmpty()) {
//						sendIntent.setData(Uri.parse(imgUrl));
//						sendIntent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
//					}


					// Show the Sharesheet
					context.startActivity(Intent.createChooser(sendIntent, null));
				}

			});
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public static int isCloner() {
		int res = 0;
		if(ProjUtil.isCloner(context)){
			res = 1;
		}
		if(!googleService){
			res = 1;
		}
		return res;
	}



}
