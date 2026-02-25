import PopupRoomLeagueView from "./scripts/PopupRoomLeagueView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomLeagueCpt extends cc.Component {

    @property(cc.Sprite)
    sp_icon: cc.Sprite = null;

    @property(cc.Label)
    label_rank: cc.Label = null;

    leagueexp: number = 0;
    leagueRank: number = 0;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.LEAGUE_EXP_CHANGE, this.LEAGUE_EXP_CHANGE, this);
        netListener.registerMsg(MsgId.GET_LEAGUE_INFO, this.GET_LEAGUE_INFO, this);
        this.node.on("click", this.onClickLeagueInfo, this);
        cc.vv.NetManager.sendAndCache({ c: MsgId.GET_LEAGUE_INFO, gameid: facade.dm.deskInfo.gameid });
        this.updateView();
    }

    GET_LEAGUE_INFO(msg) {
        if (msg.code != 200) return;
        if (facade.dm.deskInfo.gameid == msg.gameid) {
            this.leagueexp = msg.score || -1;
            this.leagueRank = msg.rank || -1;
        }
        this.updateView();
    }
    LEAGUE_EXP_CHANGE(msg) {
        if (msg.code != 200) return;
        cc.vv.NetManager.sendAndCache({ c: MsgId.GET_LEAGUE_INFO, gameid: facade.dm.deskInfo.gameid });
    }

    updateView() {
        let rankData = cc.vv.UserConfig.getRank(this.leagueexp);
        cc.vv.UserConfig.setRankBigFrame(this.sp_icon, rankData.stage);
        if (this.leagueRank > 0) {
            this.label_rank.string = ___("No.{1}", this.leagueRank.toString());
        } else {
            this.label_rank.string = "";
        }
    }

    onClickLeagueInfo() {
        if (this.leagueRank <= 0 || this.leagueexp <= 0) {
            cc.vv.FloatTip.show(___("对不起,您目前还没有排位积分,请努力吧"));
            return;
        }
        let wroldPos = this.node.convertToWorldSpaceAR(cc.v3(0, 200));
        let endPos = cc.find("Canvas").convertToNodeSpaceAR(wroldPos);
        cc.vv.PopupManager.addPopup("games/PokerBase/module/League/prefabs/PopupRoomLeague", {
            noCloseHit: true,
            noMask: true,
            onShow: (node) => {
                endPos = endPos.add(cc.v3(-node.width / 2 - 40, 0));
                node.position = endPos.add(cc.v3(node.width, 0));
                cc.tween(node).to(0.2, { opacity: 255, position: endPos }, { easing: 'quadOut' }).start();
                node.getComponent(PopupRoomLeagueView).onInit(facade.dm.deskInfo.gameid);
            }
        })
    }

}
