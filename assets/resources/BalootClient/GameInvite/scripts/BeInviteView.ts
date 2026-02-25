const { ccclass, property } = cc._decorator;

@ccclass
export default class BeInviteView extends cc.Component {

    @property(cc.Button)
    btn_agree: cc.Button = null;
    @property(cc.Button)
    btn_refuse: cc.Button = null;
    private msg: any;


    onLoad() {
        this.btn_agree.node.on('click', this.onAgree, this);
        this.btn_refuse.node.on('click', this.onRefuse, this);
    }
    onInit(msg) {
        this.msg = msg;
    }

    onAgree() {
        let needVip = cc.vv.UserManager.getSalonVip()
        if(needVip > cc.vv.UserManager.svip){
            //调往充值
            let tipsmsg = cc.js.formatStr("Upgrade your VIP level to VIP%s to enjoy the Salon", needVip)
            cc.vv.AlertView.show(___(tipsmsg), () => {
                Global.dispatchEvent("OpenCharge")
            }, () => {

            }, false, null, null, null, "Upgrade Now");
            cc.vv.PopupManager.removePopup(this.node);
            return false //不可以进入
        }

        cc.vv.NetManager.send({ c: MsgId.SALON_INVITE_APPLY, type: 1, idx: this.msg.idx, from: this.msg.from, gameid: this.msg.gameid, deskid: this.msg.deskid });
        cc.vv.NetManager.send({
            c: MsgId.FRIEND_ROOM_JOIN,
            gameid: this.msg.gameid,
            deskid: this.msg.deskid
        });
        cc.vv.PopupManager.removePopup(this.node);
    }
    onRefuse() {
        cc.vv.NetManager.send({ c: MsgId.SALON_INVITE_APPLY, type: 0, idx: this.msg.idx, from: this.msg.from, gameid: this.msg.gameid, deskid: this.msg.deskid });
        cc.vv.PopupManager.removePopup(this.node);
    }


}
