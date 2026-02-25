import { PBRoomType } from "../../scripts/PBCommonData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomSocialSalonDisplay extends cc.Component {
    netListener: any;

    @property(cc.Label)
    numLabel: cc.Label = null;
    @property(cc.Label)
    numLabel2: cc.Label = null;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.netListener.registerMsg(MsgId.VIP_ROOM_LIST, this.VIP_ROOM_LIST, this);
    }

    protected onEnable(): void {
        // 判断一些 是不是Rummy 
        if (facade.dm.deskInfo.gameid == 292) {
            this.node.active = false;
            return;
        }
        // 检测只有在匹配 和沙龙 才显示
        if (facade && facade.dm && facade.dm.deskInfo && facade.dm.deskInfo.conf
            && (facade.dm.deskInfo.conf.roomtype == PBRoomType.normal || facade.dm.deskInfo.conf.roomtype == PBRoomType.friend)) {
            this.node.active = true;
            cc.vv.NetManager.send({ c: MsgId.VIP_ROOM_LIST, sort: 2 });
        } else {
            this.node.active = false;
        }
    }


    VIP_ROOM_LIST(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        // 组装房间列表
        //把自己的房间放前面+别人的房间
        let rooms = [];
        let otherrooms = [];
        for (const iterator of msg.super) {
            otherrooms = otherrooms.concat(iterator);
        }
        rooms = msg.selfrooms.concat(otherrooms);
        //过滤掉密码房--这里一定是公开的房间
        let endRooms = [];
        if (rooms.length > 0) {
            for (const ittor of rooms) {
                if (ittor.pwd) {
                    //
                } else {
                    endRooms.push(ittor);
                }
            }
        }
        let lastData = [];
        for (const item of endRooms) {
            if (item.deskid != facade.dm.deskInfo.deskid) {
                lastData.push(item);
            }
        }
        if (this.numLabel) {
            if (lastData.length <= 0) {
                this.numLabel.string = ___("沙龙");
            } else {
                this.numLabel.string = "x" + lastData.length;
            }
        }
        if (this.numLabel2) {
            if (lastData.length <= 0) {
                this.numLabel2.string = ___("沙龙");
            } else {
                this.numLabel2.string = "x" + lastData.length;
            }
        }
    }


    start() {

    }

}
