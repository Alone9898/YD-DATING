
/**
 * 聊天消息类型
 */
export enum PBChatMsgType {
    text = 1,       // 文本消息
    emotion = 2,    // 表情消息
    fast_word = 3,  // 快捷消息
    diy = 4,        // 子游戏自己diy的消息只负责不放入消息记录中
}

/**
 * 快捷发言配置
 */
export let PBChatFastWordCfg = new Map([
    [0, {get words(){ return ___("谢谢！")},  sound:"chat/game_phrase1"}],
    [1, {get words(){ return ___("快点吧")},  sound:"chat/game_phrase2"}],
    [2, {get words(){ return ___("对的就这样")},  sound:"chat/game_phrase3"}],
    [3, {get words(){ return ___("放轻松，我后面好好打")},  sound:"chat/game_phrase4"}],
    [4, {get words(){ return ___("啊呦~")},  sound:"chat/game_phrase5"}],
    [5, {get words(){ return ___("我说了算")},  sound:"chat/game_phrase6"}],
    [6, {get words(){ return ___("棒棒的，你值得拥有！")},  sound:"chat/game_phrase7"}],
    [7, {get words(){ return ___("对不起")},  sound:"chat/game_phrase8"}],
    [8, {get words(){ return ___("再见")},  sound:"chat/game_phrase9"}],
    [9, {get words(){ return ___("你太欺负人了")},  sound:"chat/game_phrase10"}],
    [10, {get words(){ return ___("兄弟，耐心一点！")},  sound:"chat/game_phrase11"}],
    
]);


/**
 * 消息对象
 */
export class PBChatMsgVo {
    rawStr:string;
    uid:number;
    nick:string;
    gender:number;          // 1:男 其他:女
    icon:string;
    avatar:string;
    chatSkin:string;        // 聊天泡泡皮肤
    fontSkin:string;
    msgType:PBChatMsgType;  // 消息类型
    sendTime:number;        // 发送时间
    content:any;            // 内容
    fcoin:number;           // 最终金币

    parse(msg:any):PBChatMsgVo {
        this.rawStr = msg;
        msg = JSON.parse(msg);
        this.uid = msg.uid;
        this.nick = msg.nick;
        this.gender = msg.gender || 0;
        this.icon = msg.icon;
        this.avatar = msg.avatar || 0;
        this.chatSkin = msg.chatSkin || "chat_000";
        this.fontSkin = msg.fontSkin || "font_color_0";
        this.msgType = msg.msgType;
        this.sendTime = msg.sendTime;
        this.content = msg.content;
        this.fcoin = msg.fcoin || 0;
        return this;
    }

    getMsg():string {
        let ret:any = {};
        ret.uid = this.uid;
        ret.nick = this.nick;
        ret.gender = this.gender;
        ret.icon = this.icon;
        ret.avatar = this.avatar;
        ret.chatSkin = this.chatSkin;
        ret.fontSkin = this.fontSkin;
        ret.msgType = this.msgType;
        ret.sendTime = this.sendTime;
        ret.content = this.content;
        ret.fcoin = this.fcoin || 0;
        return JSON.stringify(ret);
    }

    getContentText() {
        if(this.msgType == PBChatMsgType.fast_word) {
            return PBChatFastWordCfg.get(this.content).words || "";
        }else {
            return this.content;
        }
    }
}