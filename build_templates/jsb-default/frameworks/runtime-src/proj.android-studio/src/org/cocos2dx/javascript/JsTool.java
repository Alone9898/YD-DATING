package org.cocos2dx.javascript;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

/**
 * Created by Administrator on 2018/6/22.
 * call js(javascript) function
 */

public class JsTool {

    public static AppActivity context = (AppActivity) AppActivity.getContext();

    public static final String objPath = "cc.vv.PlatformApiMgr";
    public static  final String fName = "trigerCallback";

    //调用js中的函数
    public static void callJsFunc(final String fName, final String objPath, final JSONObject paramsObj) {
        context.runOnGLThread(new Runnable() {

            @Override
            public void run() {
                Log.d("RummySlots",fName + "   " + objPath + "   " + paramsObj.toString() );
                Cocos2dxJavascriptJavaBridge.evalString(objPath + "." + fName + "("+  paramsObj.toString() +")");
            }
        });
    }

    //发送的PlatformApi的回调
    public static void sendToPlatformApiCbFunc(String cbName, JSONObject paramsObj) {
        try {
            paramsObj.put("cbName", cbName);
            JsTool.callJsFunc(fName,objPath, paramsObj);
        }catch (JSONException e) {
        }
    }
}
