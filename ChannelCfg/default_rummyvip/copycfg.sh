#!/bin/bash   
  
project_path=$(cd `dirname $0`; pwd)
echo $project_path # 获取当前路径

git submodule update

#更新代码
git checkout develop
git reset --hard
git pull origin develop

cd $project_path/../../assets/framework
git checkout develop
git reset --hard
git pull origin develop

cd $project_path/../../assets/_FWExpand
git checkout develop
git reset --hard
git pull origin develop

cd $project_path/../../assets/resources/slots_common
git checkout yd
git reset --hard
git pull origin yd


cd $project_path/../../assets/resources/Table_Common
git checkout develop
git reset --hard
git pull origin develop

#pokerbase YD
poker_games=("PokerBase")
for element in ${poker_games[*]}
do
echo "开始更新："$element
cd $project_path/../../assets/resources/games/$element
git checkout YD
git reset --hard
git pull origin YD

done

#pokers YD
yd_games=("Domino" "Nudo" "Uno")
for element in ${yd_games[*]}
do
echo "开始更新："$element
cd $project_path/../../assets/resources/games/$element
git checkout yd
git reset --hard
git pull origin yd

done

#slots develop
slots_games=("Archer" "Alibaba" "Xerxes" "Skygarden" "Sinbad" "Sphinx" "G_Cleopatra" "LampOfAladdin"  "AndarBahar" "Baccarat" 
"BlackJack21" "Carsh" "Fortunewheel" "Jhandimunda" "lhdz" "RegalTiger" "Roulette36" "SevenUpDown" "TheLegendOfDragon" "WingoLottery" "Rummy" "HorseRace" "AladingWheel" 
"TeenPatti" "Delphi" "PowerOfTheKraken" "CricketX" "Aviatrix" "CrashX" "Aviator" "Zeppelin" "JetX" "Dice" "Limbo" "Coins" "Plinko" "Hilo" "Mines" "Keno" "Tower")
for element in ${slots_games[*]}
do
echo "开始更新："$element
cd $project_path/../../assets/resources/games/$element
git checkout develop
git reset --hard
git pull origin develop

done

# echo "====删除不需要的游戏===="
# #del old game
# old_games=("turnRect")
# for element in ${old_games[*]}
# do
# echo "开始删除："$element
# #删除游戏目录
# rm -rf $project_path/../../assets/resources/games/$element
# rm -rf $project_path/../../assets/resources/games/${element}.meta

# done

echo "====删除不需要的res===="
#del old game
old_games=("5" "10" "50" "100" "500" "1000" "5000" "10000" "50000" "100000")
for element in ${old_games[*]}
do

rm -rf $project_path/../../assets/resources/games/PokerBase/texture/jettom/${element}.png
rm -rf $project_path/../../assets/resources/games/PokerBase/texture/jettom/${element}.png.meta
done

old_games=("logo" "btn_h5_download" "btn_h5_fb" "btn_share_fb")
for element in ${old_games[*]}
do

rm -rf $project_path/../../assets/resources/games/PokerBase/texture/${element}.png
rm -rf $project_path/../../assets/resources/games/PokerBase/texture/${element}.png.meta
done

old_games=("bid")
for element in ${old_games[*]}
do

rm -rf $project_path/../../assets/resources/games/PokerBase/texture_ph/${element}.png
rm -rf $project_path/../../assets/resources/games/PokerBase/texture_ph/${element}.png.meta
done


old_games=("league_down" "league_downgrade" "league_up" "league_upgrade" "bgm_bet" "bgm_wheel" 
"interactive/gaodian" "interactive/shuiyan" "interactive/hongcha" "interactive/gift_kiss" "interactive/gift_ring" "interactive/gift_car"
"card_swipe_1" "card_swipe_2" "card_swipe_3" "card_take_1" "card_swipe_3" "card_drag_1" "card_drag_2" "card_drag_3" "deal_a_card_4" "deal_a_card_3" "deal_a_card_2"
"hwfish918")
for element in ${old_games[*]}
do

rm -rf $project_path/../../assets/resources/games/PokerBase/audio/${element}.mp3
rm -rf $project_path/../../assets/resources/games/PokerBase/audio/${element}.mp3.meta
done

old_games=( 
"dianxin" "shuiyan" "hongcha" "gift_kiss/spine" "gift_ring/spine" "gift_car/spine")
for element in ${old_games[*]}
do

rm -rf $project_path/../../assets/resources/games/PokerBase/spine/interactive_emotion/${element}.png
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/interactive_emotion/${element}.png.meta
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/interactive_emotion/${element}.json
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/interactive_emotion/${element}.json.meta
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/interactive_emotion/${element}.atlas
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/interactive_emotion/${element}.atlas.meta
done


rm -rf $project_path/../../assets/resources/games/PokerBase/audio/chat
rm -rf $project_path/../../assets/resources/games/PokerBase/audio/bid
rm -rf $project_path/../../assets/resources/games/PokerBase/audio/card
rm -rf $project_path/../../assets/resources/games/PokerBase/texture_ph/777
rm -rf $project_path/../../assets/resources/games/PokerBase/texture/dissolve_room
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/card_flash
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/more_coin
rm -rf $project_path/../../assets/resources/games/PokerBase/spine/settlement
rm -rf $project_path/../../assets/resources/games/PokerBase/texture/big_card.png
rm -rf $project_path/../../assets/resources/games/PokerBase/texture/big_card.plist

rm -rf $project_path/../../assets/resources/BalootClient/KnockoutMatch/fnt
rm -rf $project_path/../../assets/resources/BalootClient/KnockoutMatch/prefabs
rm -rf $project_path/../../assets/resources/BalootClient/KnockoutMatch/texture

rm -rf $project_path/../../assets/resources/BalootClient/NewerGuide/PopupNewGuideUserName.prefab
rm -rf $project_path/../../assets/resources/BalootClient/NewerGuide/PopupNewGuideUserName.prefab.meta
rm -rf $project_path/../../assets/resources/BalootClient/NewerGuide/texture
rm -rf $project_path/../../assets/resources/BalootClient/NewerGuide/texture.meta
rm -rf $project_path/../../assets/resources/BalootClient/NewerGuide/scripts/PopupNewGuideName.js
rm -rf $project_path/../../assets/resources/BalootClient/NewerGuide/scripts/PopupNewGuideName.js.meta


rm -rf $project_path/../../assets/BalootClient/Salon

#cp res
cp -rf $project_path/replace/base.png $project_path/../../assets/resources/games/PokerBase/texture/base.png
cp -rf $project_path/replace/base.plist $project_path/../../assets/resources/games/PokerBase/texture/base.plist
cp -rf $project_path/replace/cardBgAtlas.png $project_path/../../assets/resources/games/PokerBase/texture_ph/cardBgAtlas.png
cp -rf $project_path/replace/cardBgAtlas.plist $project_path/../../assets/resources/games/PokerBase/texture_ph/cardBgAtlas.plist
cp -rf $project_path/replace/icon_download.png $project_path/../../assets/BalootClient/BaseRes/images/icon_download.png
cp -rf $project_path/replace/icon_logo.png $project_path/../../assets/BalootClient/Login/texture/icon_logo.png
cp -rf $project_path/replace/bg_login.jpg $project_path/../../assets/BalootClient/BaseRes/images/bg_login.jpg

cp -rf $project_path/replace/aboutus/01.png $project_path/../../assets/resources/BalootClient/Setting/images/aboutus/01.png
cp -rf $project_path/replace/aboutus/02.png $project_path/../../assets/resources/BalootClient/Setting/images/aboutus/02.png
cp -rf $project_path/replace/aboutus/03.png $project_path/../../assets/resources/BalootClient/Setting/images/aboutus/03.png
cp -rf $project_path/replace/aboutus/04.png $project_path/../../assets/resources/BalootClient/Setting/images/aboutus/04.png

cp -rf $project_path/replace/FairPlay/3_01.png $project_path/../../assets/resources/BalootClient/Setting/images/FairPlay/3_01.png
cp -rf $project_path/replace/FairPlay/3_02.png $project_path/../../assets/resources/BalootClient/Setting/images/FairPlay/3_02.png
cp -rf $project_path/replace/FairPlay/3_03.png $project_path/../../assets/resources/BalootClient/Setting/images/FairPlay/3_03.png

cp -rf $project_path/replace/ResponsibleGaming/2_01.png $project_path/../../assets/resources/BalootClient/Setting/images/ResponsibleGaming/2_01.png
cp -rf $project_path/replace/ResponsibleGaming/2_02.png $project_path/../../assets/resources/BalootClient/Setting/images/ResponsibleGaming/2_02.png

cp -rf $project_path/replace/bg_newer_gift.png $project_path/../../assets/BalootClient/BaseRes/images/bg_newer_gift.png
cp -rf $project_path/replace/9999.png $project_path/../../assets/resources/BalootClient/GameIcon/9999.png

cp -rf $project_path/replace/pokers.png $project_path/../../assets/resources/Table_Common/TableRes/plist/pokers.png
cp -rf $project_path/replace/pokers.plist $project_path/../../assets/resources/Table_Common/TableRes/plist/pokers.plist
cp -rf $project_path/replace/PokerBase/big_card2.png $project_path/../../assets/resources/games/PokerBase/texture/big_card2.png
cp -rf $project_path/replace/PokerBase/big_card2.plist $project_path/../../assets/resources/games/PokerBase/texture/big_card2.plist

cp -rf $project_path/replace/Fortunewheel/bet_area.png $project_path/../../assets/resources/games/Fortunewheel/plist/bet_area.png
cp -rf $project_path/replace/Domino/domino_card_res.png $project_path/../../assets/resources/games/Domino/texture/domino_card_res.png
cp -rf $project_path/replace/Domino/domino_card_res.plist $project_path/../../assets/resources/games/Domino/texture/domino_card_res.plist
cp -rf $project_path/replace/WingoLottery/spine.png $project_path/../../assets/resources/games/WingoLottery/spine/gunqiuji/spine.png
cp -rf $project_path/replace/WingoLottery/spine.json $project_path/../../assets/resources/games/WingoLottery/spine/gunqiuji/spine.json
cp -rf $project_path/replace/WingoLottery/spine.atlas $project_path/../../assets/resources/games/WingoLottery/spine/gunqiuji/spine.atlas

cp -rf $project_path/replace/Refer/ReferEarn.png $project_path/../../assets/BalootClient/YD/Refer/plist/ReferEarn.png
cp -rf $project_path/replace/Refer/ReferEarn.plist $project_path/../../assets/BalootClient/YD/Refer/plist/ReferEarn.plist
cp -rf $project_path/replace/Refer/biaoge.png $project_path/../../assets/BalootClient/YD/Refer/plist/biaoge.png

cp -rf $project_path/replace/popluckyspin/popluckyspin.png $project_path/../../assets/BalootClient/popluckyspin/popluckyspin.png
cp -rf $project_path/replace/popluckyspin/popluckyspin.plist $project_path/../../assets/BalootClient/popluckyspin/popluckyspin.plist

cp -rf $project_path/replace/loading/spine.png $project_path/../../assets/BalootClient/BaseRes/spines/loading/spine.png
cp -rf $project_path/replace/loading/spine.json $project_path/../../assets/BalootClient/BaseRes/spines/loading/spine.json
cp -rf $project_path/replace/loading/spine.atlas $project_path/../../assets/BalootClient/BaseRes/spines/loading/spine.atlas

cp -rf $project_path/replace/rank/rule_cash.png $project_path/../../assets/BalootClient/YD/rank/img/rule_cash.png
cp -rf $project_path/replace/rank/rule_referrals.png $project_path/../../assets/BalootClient/YD/rank/img/rule_referrals.png

cp -rf $project_path/replace/newergift/01.png $project_path/../../assets/BalootClient/YD/newergift/01.png
cp -rf $project_path/replace/newergift/02.png $project_path/../../assets/BalootClient/YD/newergift/02.png

echo "====删除临时目录===="
rm -rf $project_path/../../local
rm -rf $project_path/../../temp
rm -rf $project_path/../../library


#copy globalvar.js
cp -rf $project_path/GlobalVar.js $project_path/../../assets/BalootClient/GlobalVar.js

#copy AssetsBundle.json
cp -rf $project_path/AssetsBundle.json $project_path/../../settings/AssetsBundle.json
# cp -rf $project_path/builder.json $project_path/../../settings/builder.json
