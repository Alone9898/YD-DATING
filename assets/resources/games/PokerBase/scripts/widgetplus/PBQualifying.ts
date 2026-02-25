import ImgSwitchCmpTS from "../../../../../BalootClient/game_common/common_cmp/ImgSwitchCmpTS";
import { PBRoomType } from "../PBCommonData";

const { ccclass, property } = cc._decorator;

/**
 * 排位赛组件
 */
@ccclass
export class PBQualifying extends cc.Component {
    @property(cc.Label)
    rest_time_label: cc.Label = null;
    @property(ImgSwitchCmpTS)
    icon_switch: ImgSwitchCmpTS = null;

    _isJoin = false;    // 是否加入
    _isOpen = false;    // 是否开启
    _restTime: number = 0; // 剩余时间
    _isLoaded = false; // 是否加载

    btnLeagueNode: cc.Node;

    onLoad() {
        this._isLoaded = true;
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.LEAGUE_CHANGE_NOTIFY, this.LEAGUE_CHANGE_NOTIFY, this);
        netListener.registerMsg(MsgId.LEAGUE_APPLY, this.LEAGUE_APPLY, this);
        this.node.active = false;
        this._updateView();
    }

    // 联赛开启或者关闭通知
    LEAGUE_CHANGE_NOTIFY(msg) {
        if (facade.dm.tableInfo.roomType == PBRoomType.friend) return;
        this._isJoin = msg.signed == 1;
        this._isOpen = msg.isopen == 1;
        if (!!msg.stopTime) this._restTime = msg.stopTime;
        if (!this._isLoaded) {
            return;
        }
        this._updateView();
    }

    LEAGUE_APPLY(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        this._isJoin = true;
        this._updateView();
    }

    hide() {
        this.stop();
        this.node.active = false;
    }

    stop() {
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
    }

    /**
     * 显示倒计时
     * @param time 倒计时时间
     */
    show(isJoin: boolean, isOpen: boolean, restTime: number) {
        this._isJoin = isJoin;
        this._isOpen = isOpen;
        this._restTime = restTime;
        if (!this._isLoaded) {
            return;
        }
        this._updateView();
    }

    _tick() {
        this.scheduleOnce(() => {
            this._restTime--;
            if (this._restTime > 0) {
                this._tick();
            } else {
                this._restTime = 0;
                this.hide();
            }
            this._showRestTime();
        }, 1);
    }

    _showRestTime() {
        let hour = Math.floor(this._restTime / 3600);
        let hourStr = hour > 9 ? hour : `0${hour}`;
        let min = Math.floor(this._restTime % 3600 / 60);
        let minStr = min > 9 ? min : `0${min}`;
        let sec = Math.floor(this._restTime % 60);
        let secStr = sec > 9 ? sec : `0${sec}`;
        this.rest_time_label.string = `${hourStr}:${minStr}:${secStr}`;
    }

    async _updateView() {
        if (!this.btnLeagueNode) {
            let btnPrefab = await cc.vv.ResManager.loadPrefab("games/PokerBase/prefabs/league_btn");
            if (this.btnLeagueNode && cc.isValid(this.btnLeagueNode)) this.btnLeagueNode.destroy();
            this.btnLeagueNode = cc.instantiate(btnPrefab)
            this.btnLeagueNode.parent = this.node;
            this.btnLeagueNode.position = cc.v3(0, -22);
            this.btnLeagueNode.on("click", this.onClickLeagueApply, this);
        }

        this.btnLeagueNode.active = this._isOpen && !this._isJoin;

        cc.find("icon_clock", this.node).active = this._isOpen && this._isJoin;
        cc.find("label", this.node).active = this._isOpen && this._isJoin;

        if (!this._isOpen || this._restTime < 1) {
            this.hide();
            return;
        }
        this.stop();
        this.node.active = !Global.isSingle();
        this.icon_switch.setIndex(this._isJoin ? 1 : 0);
        this._showRestTime();
        this._tick();
    }

    onClickLeagueApply() {
        cc.vv.NetManager.send({ c: MsgId.LEAGUE_APPLY, gameid: facade.dm.tableInfo.gameId }, true);
    }
}