#!/bin/bash
if [ -z $1 ] 
then
    echo "!!!!!!!!!!!!!! 请输入版本号"
    exit
fi

cd ..


BUILDTIME="$(date +%Y_%m_%d)_$(date +%H_%M)"



 rm -rf ./*.zip

 Ver=${1}
 if [[ $CFG_VALUE = "\"app\"" ]]  || [[ $CFG_VALUE = "\"116app\"" ]]
 then
    Ver=1.0.0
fi
#拉取最新代码
git fetch
git checkout develop

git reset --hard HEAD
git pull
git submodule init
git submodule update


git submodule foreach git checkout develop
git submodule foreach git reset --hard
git submodule foreach git pull origin develop


#打tag
if [[ $CFG_VALUE = "\"app\"" ]] || [[ $CFG_VALUE = "\"hotupdate\"" ]] || [[ $CFG_VALUE = "\"116hotupdate\"" ]] || [[ $CFG_VALUE = "\"116app\"" ]]
then
    rm -rf ./hotupdate
    mkdir ./hotupdate

    git tag -d v${Ver}
    git push origin --delete tag v${Ver}
    git tag v${Ver}
    git push origin v${Ver}
fi
#开启热更新 116app 116hotupdate 只是热更地址跟poly不一样 
# if [[ $CFG_VALUE = "\"app\"" ]] || [[ $CFG_VALUE = "\"hotupdate\"" ]] || [[ $CFG_VALUE = "\"116hotupdate\"" ]] || [[ $CFG_VALUE = "\"116app\"" ]]
# then
#  sed -i "" "s/openUpdate.*:.*/openUpdate:true,/g" ./assets/game/GlobalVar.js
# else
#  sed -i "" "s/openUpdate.*:.*/openUpdate:false,/g" ./assets/game/GlobalVar.js
# fi

rm -rf ./temp
rm -rf ./library
rm -rf ./local

UPDATE_URL="http://47.99.169.162/lamislot/hotupdate/"
echo "====CFGVALUE:$CFG_VALUE"
#平台
PLATFORM="android"
if [[ $CFG_VALUE = "web" ]]  || [[ $CFG_VALUE = "\"116test\"" ]] || [[ $CFG_VALUE = "\"liyi\"" ]] 
then
 sed -i "" "s/localVersion.*:.*/localVersion:true,/g" ./assets/game/GlobalVar.js
 sed -i "" "s/publishMode.*:.*/publishMode:true,/g" ./assets/game/GlobalVar.js
 sed -i "" "s/resVersion.*:.*/resVersion:\"v${Ver}\",/g" ./assets/game/GlobalVar.js
 PLATFORM="web-mobile"
 
else
 sed -i "" "s/localVersion.*:.*/localVersion:false,/g" ./assets/game/GlobalVar.js
fi


#配置服务器地址
ServerAddr="login.poly99online.com" 

echo "---------------------server:$ServerAddr"
echo "---------------------PLATFORM:$PLATFORM"
#sed -i "" "s/loginServerAddress.*:.*/loginServerAddress:\"$ServerAddr\",/g" ./assets/poly/script/GlobalVar.js

sed -i "" "s/\"encryptJs\":.*/\"encryptJs\":true,/g" ./settings/builder.json
sed -i "" "s/\"xxteaKey\":.*/\"xxteaKey\": \"b32a2160-0c63-41\",/g" ./settings/builder.json

/Applications/CocosCreator/Creator/2.3.3/CocosCreator.app/Contents/MacOS/CocosCreator ./  --build "platform=$PLATFORM;debug=false;autoCompile=false;buildPath=build;useDebugKeystore=false;\
keystorePath=${PWD}/tool/keystore/bigbang.keystore;keystorePassword=9youklqp2017;keystoreAlias=bigbang.keystore;keystoreAliasPassword=9youklqp2017;inlineSpriteFrames=false;\
appABIs=['armeabi-v7a','x86'];"

if test $? -eq 0
then
 echo "########################构建成功#########################"
else
 echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!构建失败 !!!!!!!!!!!!!!!"
 exit
fi

echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@$3"
if [[ $CFG_VALUE = "\"app\"" ]] || [[ $CFG_VALUE = "\"116app\"" ]]  #打app包需要删除游戏
then
    rm -rf ./build/jsb-link/res/raw-assets/resources/games
    echo "########### delete games"
else
    echo "########### don't delete games"
fi

#不需要合并
#合并import目录的json文件
#if [ $CFG_VALUE = "\"hotupdate\"" ] || [[ $CFG_VALUE = "\"app\"" ]] || [[ $CFG_VALUE = "\"116app\"" ]] || [[ $CFG_VALUE = "\"116hotupdate\"" ]]
#then
    #python ./shell/merge_import_json.py
#fi


#获取子游戏目录
function cpSubGame
{
    for element in `ls $1`
    do  
        dir_or_file=$element
        if [ -d $dir_or_file ]
        then 
            update_module $dir_or_file
        fi  
    done
}

function compressSubGame
{
    for element in `ls $1`
    do  
        dir_or_file=$element
        if [ -d $dir_or_file ]
        then 
             echo "----------------compress $dir_or_file"
             path=../../../../../$dir_or_file/res/raw-assets/resources/games 
             mkdir -p "${path}"
             mv "${dir_or_file}" "${path}"
             7z a ../../../../../"${dir_or_file}".zip "../../../../../$dir_or_file"
             rm -rf "../../../../../$dir_or_file"
        fi  
    done
}

#压缩import文件夹
function compressImportDir
{
    for element in `ls $1`
    do  
        dir_or_file=$element
        if [ -d $dir_or_file ]
        then 
            echo "----------------compress $dir_or_file"
            # path=../../../../../$dir_or_file/res/import
            # mkdir -p "${path}" 
            # mv "${dir_or_file}" "${path}"
            7z a "${dir_or_file}".zip "./$dir_or_file"
            rm -rf "./$dir_or_file"
        fi
    done  
}

#提审版本
#暂时不需要提审
IOS_RV="10.0.0"

if [[ $CFG_VALUE = "\"hotupdate\"" ]] || [[ $CFG_VALUE = "\"116hotupdate\"" ]]
then
    #不需要更新的文件
    #rm -rf ./build/jsb-link/res/raw-assets/poly/project.manifest


    rm -rf ./hotupdate
    mkdir ./hotupdate
    mkdir ./hotupdate/$Ver
    mkdir -p ./hotupdate/$Ver/hall/src
    cp -rf ./build/jsb-link/src/*.* ./hotupdate/$Ver/hall/src
    cp -rf ./build/jsb-link/res ./hotupdate/$Ver/hall

    cd ./hotupdate/$Ver/hall/res/raw-assets/resources/games
    compressSubGame "$(pwd)"
    cd ../../../../res/import
    cd ../../../../../
    
    if [[ $CFG_VALUE = "\"116hotupdate\"" ]]
    then
         IOS_RV="10.0.0"
         UPDATE_URL="http://116.62.136.51/poly99/hotupdate/"
    fi    


    #poly热更包
    node ./hotupdate_generator.js -v $1 -u $UPDATE_URL -aav 1.0.0 -fa false -iav 1.0.0 -fi false -rv $IOS_RV -aaurl https://download.poly99online.com -iaurl https://download.poly99online.com -s ./build/jsb-link/ -d ./hotupdate/
    BUILDTIME="$(date +%Y_%m_%d)_$(date +%H_%M)"

    if [[ $CFG_VALUE = "\"116hotupdate\"" ]]
    then
        7z a ./"LamiSlot_116hotupdate_${1}_${BUILDTIME}".zip ./hotupdate
        rm -rf ~/Documents/web/lamislot/LamiSlot_116hotupdate_*.zip
        cp -rf ./"LamiSlot_116hotupdate_${1}_${BUILDTIME}".zip ~/Documents/web/lamislot
    else
        7z a ./"LamiSlot_hotupdate_${1}_${BUILDTIME}".zip ./hotupdate
        rm -rf ~/Documents/web/lamislot/LamiSlot_hotupdate*.zip
        cp -rf ./"LamiSlot_hotupdate_${1}_${BUILDTIME}".zip ~/Documents/web/lamislot
        echo "~/Documents/web/lamislot/LamiSlot_hotupdate_${1}_${BUILDTIME}.zip" > /tmp/poly.txt
    fi




    git checkout ./assets/game/GlobalVar.js
    git_status=$(git status)
    check_nothing=$((echo $git_status )| grep "nothing to commit, working directory clean")
    if [ ${#check_nothing} -eq 0 ]
    then
        git add .
        git commit -am "修改版本信息subgamever"
        git push origin develop
    else
         addfile=$((echo $git_status )| grep "no changes added to commit")
            if [ ${#addfile} -eq 0 ]
            then
                git add .
                git commit -am "添加版本信息subgamever"
                git push origin develop
            fi    
    fi    

    echo "########### finish version $1"

elif [[ $CFG_VALUE = "\"app\"" ]] || [[ $CFG_VALUE = "\"116app\"" ]]
then
    
    echo "#### 开始编译底包"
fi
