import { CommonStyle } from "../../../../../BalootClient/game_common/CommonStyle";
import { CDButtonProxy } from "../../../../../BalootClient/game_common/common_cmp/CDButtonProxy";
import { PBRoomType } from "../PBCommonData";
// import { facade } from "../PBLogic";

const { ccclass, property } = cc._decorator;

/**
 * 背景控制
 */
@ccclass
export class PBMenu extends cc.Component {
    @property(cc.Node)
    close_layer: cc.Node = null;
    @property(cc.Node)
    menu_btns_node: cc.Node = null;
    @property(cc.Button)
    btnMenuOpen: cc.Button = null;
    @property(cc.Button)
    btnMenuClose: cc.Button = null;
    @property(cc.Button)
    btnHelp: cc.Button = null;
    @property(cc.Button)
    btnSoundSwitch: cc.Toggle = null;

    @property(cc.Button)
    btnMusicSwitch: cc.Toggle = null;
    @property(cc.Button)
    btnRp: cc.Button = null;
    @property(CDButtonProxy)
    btnBackHall: CDButtonProxy = null;
    @property(cc.Button)
    btnDissolve: cc.Button = null;

    onLoad() {
        // this.node.active = !Global.isYDApp();
        this.menu_btns_node = this.node.getChildByName("menu_btns_node");

        this.btnMenuOpen.node.on("click", () => {
            this.open();
        }, this);

        this.btnMenuClose.node.on("click", () => {
            this.close();
        }, this);

        this.close_layer && this.close_layer.on(cc.Node.EventType.TOUCH_START, () => {
            this.close();
        }, false);

        this.btnHelp.node.on("click", () => {
            if ([255, 291, 292, 293, 294, 295].indexOf(facade.dm.deskInfo.gameid) >= 0) {
                this.onMenuHelpClicked();
            } else {
                facade.openRule();
            }
            // this.close();
        }, this);

        this.btnRp && this.btnRp.node.on("click", () => {
            cc.vv.PopupManager.addPopup("BalootClient/RP/PopupRPGameView", { opacityIn: true });
        }, this);


        this.btnSoundSwitch.isChecked = cc.vv.AudioManager.getEffVolume() > 0
        this.btnSoundSwitch.node.getChildByName("sprite_off").active = !this.btnSoundSwitch.isChecked;
        this.btnSoundSwitch.node.on("toggle", () => {
            if (this.btnSoundSwitch.isChecked) {
                cc.vv.AudioManager.setEffVolume(1);
            } else {
                cc.vv.AudioManager.setEffVolume(0);
            }
            this.btnSoundSwitch.node.getChildByName("sprite_off").active = !this.btnSoundSwitch.isChecked;
            this.close();
        }, this);

        this.btnMusicSwitch.isChecked = cc.vv.AudioManager["bgmVolume"] > 0;
        this.btnMusicSwitch.node.on("toggle", () => {
            if (this.btnMusicSwitch.isChecked) {
                // @ts-ignore
                cc.vv.AudioManager.setBgmVolume(1);
                facade.soundMgr.playBgm();
            } else {
                // @ts-ignore
                cc.vv.AudioManager.setBgmVolume(0);
                facade.soundMgr.stopBgm();
            }
            this.close();
        }, this);

        this.btnBackHall.addClickHandler(() => {
            this.close();
            this.askExit();
        })
        // if (this.btnDissolve) {
        //     this.btnDissolve.node.active = false;
        // }
        this.btnDissolve.node.active = facade.dm.tableInfo && facade.dm.tableInfo.roomType === PBRoomType.friend && !facade.dm.tableInfo.isViewer && facade.dm.tableStatus.isPlaying;
        this.btnDissolve.node.on("click", () => {
            facade.dm.msgWriter.sendApplyDismiss();
        });
        // 牌局记录按钮
        cc.find("BtnGameRoundCards", this.menu_btns_node).active = [256, 259, 262, 263, 264, 266, 270, 271, 272, 273, 279, 280, 281, 282, 284, 285, 289].indexOf(facade.dm.deskInfo.gameid) >= 0;
        // 牌大小切换
        cc.find("BtnGameChangeCardSize", this.menu_btns_node).active = [257, 258, 261, 283].indexOf(facade.dm.deskInfo.gameid) >= 0;

        this.close();
    }

    async askExit() {
        if (facade.dm.deskInfo.conf.roomtype == PBRoomType.match) {
            if (facade.dm.deskInfo.state == 11) {
                this.ReqBackLobby();
            } else {
                // 如果是比赛 而且处于未开始状态
                cc.vv.AlertView.show(___("如果退出,将会失去比赛机会?"), () => {
                    this.ReqBackLobby();
                }, () => {
                }, false, null, ___("退出"), null, ___("继续"));
            }
            return;
        }
        // 请求 桌子状态 确认是否可以安全离开
        if (Global.isYDApp()) {
            this.ReqBackLobby();
            return;
        }
        let config = await cc.vv.NetManager.asyncSend({ c: MsgId.REGET_DESKINFO_2 });
        if ([1, 2, 5].indexOf(config.deskInfo.state) >= 0) {
            this.ReqBackLobby();
        } else {
            cc.vv.AlertView.show(___("如果现在退出,机器人会帮您代打,可能会造成金币损失?"), () => {
                this.ReqBackLobby();
            }, () => {
            }, false, null, ___("退出"), null, ___("继续"));
        }
    }

    ReqBackLobby() {
        if (facade.dm.msgWriter) {
            facade.dm.msgWriter.sendExit();
        } else {
            cc.vv.gameData.ReqBackLobby()
        }
    }
    // 打开规则
    onMenuHelpClicked() {
        let self = this
        if (cc.vv.gameData) {
            let cfg
            let help_script
            let help_prefab_url
            cfg = cc.vv.gameData.getGameCfg()
            help_prefab_url = cfg.help_prefab
            if (!help_prefab_url) {//没配置就使用默认的
                help_prefab_url = "Table_Common/TableRes/prefab/Table_Help_prefab"
            }
            help_script = cfg.help_prefab_cfg
            if (!help_script) {
                help_script = 'Table_Help_prefab'
            }
            if (!help_prefab_url) {
                console.log("未在cfg中配置help预制的路径");
                return
            }
            cc.loader.loadRes(help_prefab_url, cc.Prefab, (err, prefab) => {
                if (!err) {
                    let old = cc.find("Canvas/help_node")
                    if (!old) {
                        old = cc.instantiate(prefab)
                        let script = old.getComponent(help_script)
                        if (!script) {
                            old.addComponent(help_script)
                        }
                        old.name = 'help_node'
                        old.parent = cc.find("Canvas")
                        old.active = true
                    }
                    else {
                        old.active = true
                    }
                }
            })
        }
    }


    close() {
        this.close_layer && (this.close_layer.active = false);
        CommonStyle.fastHide(this.menu_btns_node);
        this.btnBackHall.node.active = true;
    }

    open() {
        this.close_layer && (this.close_layer.active = true);
        CommonStyle.fastShow(this.menu_btns_node);
        this.btnBackHall.node.active = false;
        this.btnDissolve.node.active = facade.dm.tableInfo && facade.dm.tableInfo.roomType === PBRoomType.friend && !facade.dm.tableInfo.isViewer && facade.dm.tableStatus.isPlaying;
    }
}