#!/bin/bash
#删除安装包
echo "-------------------start build"

sh ./hotupdate.sh $1 1 
if [ -z $1 ] 
then
   exit
fi

rm -rf ../build/jsb-link/publish/android/*.*
rm -rf ../build/jsb-link/publish/ios/*.*


cd ../shell


#修改安卓版本号
#sed -i "" "s/versionName.*/versionName \'1.0.1\'/g" ../build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle
#sed -i "" "s/versionCode.*/versionCode 2/g" ../build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle

IOSDIR="../build/jsb-link/publish/ios"
if [ ! -e $IOSDIR ]
then
    mkdir -pv $IOSDIR
fi

ANDROIDDIR="../build/jsb-link/publish/android"
if [ ! -e $ANDROIDDIR ]
then
    mkdir -pv $ANDROIDDIR
fi

BUILDTIME="$(date +%Y_%m_%d)_$(date +%H_%M)"


#添加热更新需要的main.js代码
#添加编译时间
if  [[ $CFG_VALUE = "web" ]] #poly web
then
    rm -rf ~/Documents/web/lamislot/LamiSlot_web_*.zip
    zip -r ~/Documents/web/lamislot/"LamiSlot_web_${BUILDTIME}".zip "../build/web-mobile/"
    echo "~/Documents/web/lamislot/LamiSlot_web_${BUILDTIME}.zip" > /tmp/lamislot_web.txt
    exit 0
elif [[ $CFG_VALUE = "hotupdate" ]] 
then
    echo "################build hotupdate success"
    exit 0
fi

function build_android
{
     #rm -rf ~/Documents/web/publish/Poly99*.apk
	 
    /Applications/CocosCreator/Creator/2.3.3/CocosCreator.app/Contents/MacOS/CocosCreator ../ --compile "debug=false;platform=android;androidStudio=true;"

    if test $? -eq 0
    then
        echo "########################build Success android  package success #########################"
    else
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!build android  package Faild !!!!!!!!!!!!!!!"
        exit 1
    fi
    if [ -z $2 ]
    then 
        mv "../build/jsb-link/publish/android/LamiSlot-release-signed.apk" ~/Documents/web/LamiSlot/"$1_${BUILDTIME}_release".apk
    else
        mv "../build/jsb-link/publish/android/LamiSlot-release-signed.apk" ~/Documents/web/LamiSlot/"$2_${BUILDTIME}_release".apk
    fi    
}



 
 if [[ $CFG_VALUE = "app" ]] || [[ $CFG_VALUE = "116app" ]]
 then
	 #已经不需要拷贝了
     
     #sed -i "" "s/applicationId \"*.*\"/applicationId \"com.game.poly99\"/g" ../build/jsb-link/frameworks/runtime-src/proj.android-studio/app/build.gradle
     build_android  LamiSlot
fi
     #statements


function build_ios
{
	#rm -rf ~/Documents/web/publish/Poly99*.ipa
 
    xcodebuild -sdk "$SDK" -target "$1-mobile"  OBJROOT=$BUILDDIR SYMROOT=$BUILDDIR 

    #编译IOS
    if [ -z $2 ] 
    then
        xcrun -log -sdk "$SDK" PackageApplication -v "$OUTPUTDIR/$1-mobile.app" -o "$DISTRDIR/$1_${BUILDTIME}.ipa"
    else
        xcrun -log -sdk "$SDK" PackageApplication -v "$OUTPUTDIR/$1-mobile.app" -o "$DISTRDIR/$2_${BUILDTIME}.ipa"
    fi    
    if test $? -eq 0
    then
        echo "########################export ipa success#########################"
    else
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!export ipa Faild !!!!!!!!!!!!!!!"
        exit 1
    fi
}

security unlock-keychain -p "123456" ~/Library/Keychains/login.keychain

PROJECT_ROOT="$(pwd)/../build/jsb-link/frameworks/runtime-src/proj.ios_mac"

CONFIG="Release"
SDK="iphoneos"
BUILDDIR="$PROJECT_ROOT/build"
OUTPUTDIR="$BUILDDIR/Release-$SDK"
DISTRDIR=~/Documents/web/publish
APPNAME="BigBang"
TARGET="BigBang-mobile"

#编译ios
cd $PROJECT_ROOT/
echo "********************"
echo "*     Cleaning     *"
echo "********************"
xcodebuild -alltargets clean
echo "********************"
echo "*     Building     *"
echo "********************"
if [[ $CFG_VALUE = "\"app\"" ]] || [[ $CFG_VALUE = "\"116app\"" ]]
then
    #build_ios Poly99
fi
