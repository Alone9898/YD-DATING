/*
** Define the event id 
*/

var eventId = cc.Class({
    extends: cc.Component,

    statics: {
        LOGIN_POP_UI:"NEXT_LOGIN_POP_UI", //登录弹框
        NOT_ENOUGH_COIN_POP_UI:"NOT_ENOUGH_COIN_POP_UI", //登录弹框
        NEXT_POP_UI: "NEXT_POP_UI", //弹框
        NOT_ENOUGH_COINS:"not_enough_coins",
        REFRESH_PLAYER_HEAD:"REFRESH_PLAYER_HEAD",
        UPDATE_TASK_REDPOINT:"UPDATE_TASK_REDPOINT",
        REFUSH_CH_MAIL_STATE:"REFUSH_CH_MAIL_STATE", //刷新cashhero的邮件状态
        REMOVE_CH_MAIL_ITEM:"REMOVE_CH_MAIL_ITEM", //删除cashhero的邮件
        CHANGE_USER_HEAD:"CHANGE_USER_HEAD",// 修改玩家头像
        REFRESH_SHOP_COIN:"REFRESH_SHOP_COIN",// 商品页面刷新金币

        SYS_CHANGE_LANGUAGE:"SYS_CHANGE_LANGUAGE",//切换UI语言
    },
});
window.EventId = eventId;