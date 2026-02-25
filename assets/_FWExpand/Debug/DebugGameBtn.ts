const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class DebugGameBtn extends cc.Component {

    @property
    gameid = 0;
    @property
    userCount = 0;
    @property
    chair = 5;

    onLoad() {
        this.node.on("click", () => {
            let msg = {
                "c": 43,
                "deskinfo": {
                    "bet": 1000,
                    "gameid": this.gameid,
                    "preWinners": [],
                    "deskid": 581326,
                    "mult": 1,
                    "users": [],
                    "isViewer": 0,
                    "round": {
                        "delayTime": 0,
                        "pots": [],
                    },
                    "state": 1,
                    "prize": 3600,
                    "ssid": 1,
                    "conf": {
                        "shuffle": 1,
                        "entry": 1000,
                        "voice": 0,
                        "turntime": 0,
                        "create_time": 1663146509,
                        "score": 1000,
                        "private": 0,
                        "round": 1,
                        "roomtype": 6,
                        "seat": 4
                    },
                    "seat": this.chair,
                    "owner": 11556,
                    "delayTime": 6,
                    "maxView": 20,
                    "leagueInfo": {
                        "stopTime": 3600,
                        "isOpen": 1,
                        "isSign": 0
                    },
                    "open777": 1,
                    "name": "game",
                    "curround": 0,
                    "isDestroy": false,
                    "curseat": 1,
                    "views": [],
                    "maxRound": 5,
                    "betList": [500, 1000],
                    "potCoin": 0,
                    "can_show": 1,
                    "can_side_show": 0,
                },
                "gameid": this.gameid,
                "c_idx": 110,
                "code": 200
            }
            let user = {
                "score": 0,
                "usericon": "1",
                "race_type": 0,
                "wincoinshow": 0,
                "round": {
                    "cards": [],
                    "needScore": -1,
                    "score": 0,
                    "tags": [],
                    "dashCall": -1,
                    "pass": -1,
                    "isWin": 0
                },
                "diamond": 100,
                "race_id": 0,
                "chatskin": "chat_000",
                "state": 1,
                "create_time": 1663144951,
                "levelexp": 0,
                "svip": 0,
                "isexit": 0,
                "resetTimes": 0,
                "autoTotalTime": 0,
                "luckBuff": true,
                "isnew": 1,
                "rp": 0,
                "leavetime": 1663149596,
                "playername": "123",
                "winTimes": 0,
                "wincoin": 0,
                "coin": 25000,
                "ssid": 1,
                "level": 1,
                "leaguelevel": 1,
                "auto": 0,
                "mic": 0,
                "settlewin": 0,
                "uid": 11556,
                "token": "006c91030f6f2bc4ac39748f72ad5fdf1aaIAAsPfHZnwjyyrw7g5MMulkMA2lwK0TEBbOLSUv9rd7Gyh/BVDi7id9dIgCfOAAAjesiYwQAAQAdqCFjAwAdqCFjAgAdqCFjBAAdqCFj",
                "avatarframe": "avatarframe_1000",
                "frontskin": "font_color_0",
                "offline": 0,
                "leagueexp": 0,
                "seatid": 1
            }
            for (let i = 0; i < this.userCount; i++) {
                let tempUser = Global.deepClone(user);
                // tempUser.uid = i == 0 ? cc.vv.UserManager.uid : 100 + i;
                tempUser.uid = i + 1;
                tempUser.seatid = i + 1;
                tempUser.usericon = i + 1;
                tempUser.playername = "User" + i + 1;
                tempUser.mic = i % 2 == 0 ? 1 : 0;
                msg["deskinfo"]["users"].push(tempUser);
            }
            window["debug_game"] = true;
            // cc.vv.NetManager.dispatchNetMsg(msg);
            if (msg.gameid == 293) {
                let gameData = require("Delphi_GameData");
                cc.vv.gameData = new gameData();
                cc.vv.gameData.init(msg.deskinfo, msg.gameid, 0);
                cc.director.loadScene("Delphi");
            } else if (msg.gameid == 291) {
                let gameData = require("TeenPatti_GameData");
                cc.vv.gameData = new gameData();
                cc.vv.gameData.init(msg.deskinfo, msg.gameid, 0);
                cc.director.loadScene("TeenPatti");
            }
        })
    }


}
