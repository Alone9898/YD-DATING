package org.cocos2dx.javascript;

import android.Manifest;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.devio.takephoto.app.TakePhoto;
import org.devio.takephoto.compress.CompressConfig;
import org.devio.takephoto.model.CropOptions;
import org.devio.takephoto.model.TImage;
import org.devio.takephoto.model.TResult;
import org.devio.takephoto.model.TakePhotoOptions;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;

public class TakePhotoActivity extends org.devio.takephoto.app.TakePhotoActivity {
    private static final String TAG = "TAKEPHOTO";

    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS_STORAGE = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
    };
    private static int configHeight = 0;
    private static int configWidth = 0;
    private static int configSize = 0;
    private static int configFrom = 0;

    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        String ParamStr = (String)getIntent().getSerializableExtra("param");
        try {
            JSONObject Paramconfig = null;
            Paramconfig = new JSONObject(ParamStr);
            configHeight =  Integer.parseInt(Paramconfig.getString("height"));
            configWidth =  Integer.parseInt(Paramconfig.getString("width"));
            configSize =  Integer.parseInt(Paramconfig.getString("size"));
            configFrom = Integer.parseInt(Paramconfig.getString("from"));
        }
        catch (JSONException e) {
            e.printStackTrace();
        }
        if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE, REQUEST_EXTERNAL_STORAGE)) {
            showPhoto();
        }
        else {
            Log.d(TAG,"Premission");
        }

    }

    @Override
    public void takeCancel() {
        super.takeCancel();
        sendActionResult(-1,"");
        finish();
    }

    @Override
    public void takeFail(TResult result, String msg) {
        super.takeFail(result, msg);
        sendActionResult(0,"");
        finish();
    }

    @Override
    public void takeSuccess(TResult result) {
        super.takeSuccess(result);
//        showImg(result.getImages());
        TImage tImg= result.getImage();
        String imgData = ProjUtil.imageToBase64(tImg.isCompressed()?tImg.getCompressPath():tImg.getOriginalPath());
        sendActionResult(1,imgData);
        finish();
    }

//   发送结果
    private void sendActionResult(int code,String data) {
        JSONObject obj = new JSONObject  ();
        try{
            obj.put("result",code);
            if(!data.isEmpty()){
                obj.put("data",data);
            }
        }catch (JSONException e){}
//        Log.d(TAG, String.valueOf(code));
//        Log.d(TAG,data);
        ProjUtil.callJS("TakePhotoCallback",obj);
    }

    //权限检查
    private boolean checkSelfPermission(String permission, int requestCode) {
        Log.i(TAG, "checkSelfPermission " + permission + " " + requestCode);
        if (ContextCompat.checkSelfPermission(this,
                permission)
                != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                    PERMISSIONS_STORAGE,
                    requestCode);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String permissions[], @NonNull int[] grantResults) {
        Log.i(TAG, "onRequestPermissionsResult " + grantResults[0] + " " + requestCode);

        switch (requestCode) {
            case REQUEST_EXTERNAL_STORAGE: {
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    showPhoto();
                } else {
                    sendActionResult(-1,"PERMISSION");
                    finish();
                }
                break;
            }
        }
    }


    //照片选择
    public void showPhoto(){
        TakePhoto takePhoto = getTakePhoto();
        File basePath = null;
        if(Build.VERSION.SDK_INT>=29){
            basePath = this.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        }
        else{
            basePath= Environment.getExternalStorageDirectory();
        }
        File file = new File(basePath, "/temp/" + System.currentTimeMillis() + ".jpg");
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        Uri imageUri = Uri.fromFile(file);

        configCompress(takePhoto);
        configTakePhotoOption(takePhoto);

//        //从相册中选择图片，不裁切
//        takePhoto.onPickFromGallery();

        if(configFrom == 1){
            //从相机中拍摄，进行裁切
            takePhoto.onPickFromCaptureWithCrop(imageUri, getCropOptions());
        }
        else{
            //从相册中选择，进行裁切
            takePhoto.onPickFromGalleryWithCrop(imageUri, getCropOptions());
        }



    }

    private void configCompress(TakePhoto takePhoto) {
//        if (rgCompress.getCheckedRadioButtonId() != R.id.rbCompressYes) {
//            takePhoto.onEnableCompress(null, false);
//            return;
//        }
        int maxSize = configSize;//Integer.parseInt(etSize.getText().toString());
        int width = configWidth;//Integer.parseInt(etCropWidth.getText().toString());
        int height = configHeight;//Integer.parseInt(etHeightPx.getText().toString());
        boolean showProgressBar = true;//rgShowProgressBar.getCheckedRadioButtonId() == R.id.rbShowYes ? true : false;
        boolean enableRawFile = true;//rgRawFile.getCheckedRadioButtonId() == R.id.rbRawYes ? true : false;
        CompressConfig config;
//        if (rgCompressTool.getCheckedRadioButtonId() == R.id.rbCompressWithOwn) {
            config = new CompressConfig.Builder().setMaxSize(maxSize)
                    .setMaxPixel(width >= height ? width : height)
                    .enableReserveRaw(enableRawFile)
                    .create();
//        } else {
//            LubanOptions option = new LubanOptions.Builder().setMaxHeight(height).setMaxWidth(width).setMaxSize(maxSize).create();
//            config = CompressConfig.ofLuban(option);
//            config.enableReserveRaw(enableRawFile);
//        }
        takePhoto.onEnableCompress(config, showProgressBar);


    }

    //从哪里选取图片
    private void configTakePhotoOption(TakePhoto takePhoto) {
        TakePhotoOptions.Builder builder = new TakePhotoOptions.Builder();
//        if (rgPickTool.getCheckedRadioButtonId() == R.id.rbPickWithOwn) {
//            builder.setWithOwnGallery(true);
//        }
//        if (rgCorrectTool.getCheckedRadioButtonId() == R.id.rbCorrectYes) {
            builder.setCorrectImage(true);
//        }
        takePhoto.setTakePhotoOptions(builder.create());

    }

    private CropOptions getCropOptions() {
//        if (rgCrop.getCheckedRadioButtonId() != R.id.rbCropYes) {
//            return null;
//        }
        int height = configHeight;//Integer.parseInt(etCropHeight.getText().toString());
        int width = configWidth;//Integer.parseInt(etCropWidth.getText().toString());
        boolean withWonCrop = true;//rgCropTool.getCheckedRadioButtonId() == R.id.rbCropOwn ? true : false;

        CropOptions.Builder builder = new CropOptions.Builder();

//        if (rgCropSize.getCheckedRadioButtonId() == R.id.rbAspect) {
            builder.setAspectX(width).setAspectY(height);
//        } else {
//            builder.setOutputX(width).setOutputY(height);
//        }
        builder.setWithOwnCrop(withWonCrop);
        return builder.create();
    }
}
