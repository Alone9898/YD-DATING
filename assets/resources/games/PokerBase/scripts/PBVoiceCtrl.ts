import { facade } from "./PBLogic";

const { ccclass, property } = cc._decorator;
@ccclass
export class PBVoiceCtrl extends cc.Component {

    // 断线重连,刷新所有用户的语聊的状态
    updateAll() {
        // 更具用户信息找到对应的语聊组件
        for (const info of facade.dm.playersDm.seatedPlayersInfo) {
            if (info) {
                let playerCpt = facade.playersCtrl.getPlayerByUid(info.uid);
                if (playerCpt) {
                    playerCpt.voiceToggle.mic = info.mic;
                    playerCpt.voiceToggle.joinChat = info.joinChat;
                    playerCpt.voiceToggle.updateView();
                }
            }
        }
    }

    // 语聊状态变更广播
    R_VOICE_CHANGE(msg) {
        if (!msg.users) return;
        for (const info of msg.users) {
            let playerCpt = facade.playersCtrl.getPlayerByUid(info.uid);
            if (playerCpt) {
                playerCpt.voiceToggle.mic = info.mic;
                playerCpt.voiceToggle.joinChat = info.joinChat;
                playerCpt.voiceToggle.updateView();
            }
        }
    }

    // 加入语聊频道
    joinVoiceRoom() {
        if (facade.dm.tableInfo.isOpenVoice) {
            // 没有坐下
            if (!facade.dm.playersDm.selfInfo) {
                return;
            }
            let param = {
                token: `${facade.dm.playersDm.selfInfo.token}`,
                cname: `${facade.dm.deskInfo.deskid}`,
                uid: `${cc.vv.UserManager.uid}`,
                otp: ""
            }
            cc.vv.PlatformApiMgr.LevelVoiceChannel();
            console.log("126043  #init voice#", param);
            let hasPer = cc.vv.PlatformApiMgr.checkSelfPermission();
            cc.log("#checkSelfPermission#", hasPer);
            if (hasPer) {
                cc.vv.PlatformApiMgr.JoinVoiceChannel(JSON.stringify(param), this._onSdkMsg.bind(this))
            }
        }
    }
    // 离开语聊频道
    levelVoiceRoom() {
        console.log("#126043 exit voice#");
        try {
            if (facade && facade.dm && facade.dm.tableInfo.isOpenVoice) {
                cc.vv.PlatformApiMgr.LevelVoiceChannel();
            }
        } catch (error) {
            cc.log(error);
        }
    }

    protected onDestroy(): void {
        this.levelVoiceRoom();
    }

    /**
     * 语音sdk回调 可能会多次调用
     */
    _onSdkMsg(cbData: any) {
        try {
            if (cbData) {
                // data = JSON.parse(data);
                let code = parseInt(cbData.result);
                switch (code) {
                    case 0:
                        // let dataStr = `${cbData.data}`;
                        // if (dataStr.indexOf("18") != -1) {
                        //     cc.log("#err#退出频道失败#");
                        // } else if (dataStr.indexOf("1027") != -1) {
                        //     cc.vv.FloatTip.show(___("您未开启语音权限"), true);
                        // } else {
                        //     cc.vv.FloatTip.show(`error[${cbData.data}]`, true);
                        // }
                        // 上报错误
                        cc.vv.NetManager.send({ c: MsgId.REQ_REPORT_STATISTICS, act: ReportConfig.VOICE_ERORR, ext: cbData.data });
                        break;
                    case 1:
                        let muteDetailData = JSON.parse(cbData.data);
                        //cc.vv.FloatTip.show(`[mute change] uid:${muteDetailData.uid} mute:${muteDetailData.mute}`, true);
                        break;
                    case 2:
                        let voiceDetailData = JSON.parse(cbData.data);
                        //cc.vv.FloatTip.show(`[player saying] uid:${voiceDetailData.uid} vol:${voiceDetailData.vol}`, true);
                        let uid = voiceDetailData.uid || facade.dm.playersDm.selfInfo.uid;
                        let playerVo = facade.dm.playersDm.getPlayerByUid(uid);
                        if (playerVo) {
                            facade.playersCtrl.getPlayerByPosition(playerVo.position).voiceToggle.canSaying = true;
                        }
                        break;
                }
                console.log("#_onSdkMsg#", JSON.stringify(cbData));
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * 屏蔽自己的语音
     * true-屏蔽 false-取消屏蔽
     */
    muteSelfVoice(boo: boolean) {
        console.log("#muteSelfVoice#", boo);
        cc.vv.PlatformApiMgr.SetVoiceChannelLocalMute(boo ? "1" : "0");
    }

    /**
     * 屏蔽其他玩家的语音
     */
    muteOtherVoice(uid: number, boo: boolean) {
        console.log("#muteOtherVoice#", uid, boo);
        let param = {
            uid: `${uid}`,
            mute: `${boo ? 1 : 0}`
        }
        cc.vv.PlatformApiMgr.SetVoiceChannelRemteBute(JSON.stringify(param));
    }
}