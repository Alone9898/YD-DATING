import NetImg from "../../../../../BalootClient/game_common/common_cmp/NetImg";
import UserAvatar from "../../../../../BalootClient/game_common/common_cmp/UserAvatar";
import { PBChatMsgType, PBChatMsgVo } from "./PBChatData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PBChatRecordItem extends cc.Component {
    vo:PBChatMsgVo = null;
    bind(vo:PBChatMsgVo) {
        this.vo = vo;
        let icon = cc.find("head_icon", this.node).getComponent(UserAvatar);
        let label_nick = cc.find("label_nick", this.node).getComponent(cc.Label);
        let label_content = cc.find("label_content", this.node).getComponent(cc.Label);
        let icon_emotion = cc.find("icon_emotion", this.node);

        //头像更新
        icon.updataAvatar({uid:vo.uid, icon:vo.icon, avatarFrame:vo.avatar});

        // 昵称
        label_nick.string = vo.nick || "";

        //聊天内容
        if(vo.msgType == PBChatMsgType.emotion) {
            label_content.node.active = false;
            icon_emotion.active = true;
            icon_emotion.getChildByName("icon").getComponent(NetImg).url = vo.content;

            this.scheduleOnce(()=>{
                this.node.height = Math.abs(icon_emotion.y) + icon_emotion.height/2 + 10;
            })
        }else {
            label_content.node.active = true;
            icon_emotion.active = false;
            label_content.string = vo.getContentText();
            // let color = cc.vv.UserConfig.getColor(vo.fontSkin);
            // color && (label_content.node.color = color);
            this.scheduleOnce(()=>{
                this.node.height = Math.abs(label_content.node.y) + label_content.node.height + 10;
            })
        }
    }
}