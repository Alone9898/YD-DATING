import { facade } from "../PBLogic";

export class PBMsgWriter {

    //////////////////////////////////////////////////////////////////////////////////
    sendData(req: any) {
        cc.vv.NetManager.send(req, true);
    }

    /**
     * 发送退出游戏命令
     */
    sendExit() {
        cc.log(">sendExit");
        let req = {
            c: facade.dm.msgCmd.S_EXIT,
        };
        this.sendData(req);
    }

    /**
     * 发起解散
     */
    sendApplyDismiss() {
        cc.log(">sendApplyDismiss");
        let req = {
            c: facade.dm.msgCmd.S_APPLY_DISMISS,
        };
        this.sendData(req);
    }

    /**
     * 发送(同意/拒绝)解散房间
     * rtype 1：同意，2：不同意
     */
    sendReplyDismiss(rtype: number) {
        cc.log(">sendReplyDismiss");
        let req = {
            c: facade.dm.msgCmd.S_REPLY_DISMISS,
            rtype: rtype
        };
        this.sendData(req);
    }

    /**
     * 发送取消托管命令
     */
    sendCancleAutoHost() {
        cc.log(">sendCancleAutoHost");
        let req = {
            c: facade.dm.msgCmd.S_CANCLE_AUTO_HOST,
        };
        this.sendData(req);
    }

    /**
     * 发送聊天消息
     */
    sendChatMsg(msg: string) {
        cc.log(">sendChatMsg", msg);
        let req = {
            c: facade.dm.msgCmd.S_CHAT_MSG,
            msg: msg
        };
        this.sendData(req);
    }

    /**
     * 发送准备
     */
    sendReady() {
        cc.log(">sendReady");
        let req = {
            c: facade.dm.msgCmd.S_READY,
        };
        this.sendData(req);
    }

    /**
     * 发送语音状态改变
     * @param mic 0关闭 1加入
     */
    sendVoiceChanged(mic: number) {
        cc.log(">sendVoiceChanged", mic);
        this.sendData({ c: facade.dm.msgCmd.S_VOICE_CHANGE, mic: mic });
    }

    /**
     * 主动发起托管
     */
    sendAutoHost() {
        cc.log(">sendAutoHost");
        let req = {
            c: facade.dm.msgCmd.S_AUTO_HOST,
        };
        this.sendData(req);
    }

    /**
     * 坐下
     * @param seatid 服务器seatid，需要客户端自己去计算
     */
    sendSitDown(seatid: number) {
        cc.log(">sendSitDown");
        let req = {
            c: facade.dm.msgCmd.S_SITDOWN,
            seatid: seatid
        };
        this.sendData(req);
    }

    /**
     * 换桌
     */
    sendChange() {
        cc.log(">sendCharge");
        let req = {
            c: facade.dm.msgCmd.send_change,
            uid: cc.vv.UserManager.uid,
        };
        this.sendData(req);
    }

    //////////////////////////////////////////////////////////////////////////////////
}