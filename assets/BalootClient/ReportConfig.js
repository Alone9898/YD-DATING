let ReportConfig = cc.Class({
    extends: cc.Component,
    statics: {
        INIT_COIN: "initcoin",
        // 设置相关
        SETTING_MUSIC_OFF: "setting_music_off",
        SETTING_MUSIC_ON: "setting_music_on",
        SETTING_SOUND_OFF: "setting_sound_off",
        SETTING_SOUND_ON: "setting_sound_on",
        SETTING_SHARE: "setting_share",
        SETTING_LIKE: "setting_like",
        SETTING_FEEDBACK: "setting_feedback",
        SETTING_BIND_TWITTER: "setting_bind_twitter",
        SETTING_BIND_FB: "setting_bind_fb",
        SETTING_SERVICE: "setting_service",
        SETTING_PRIVATE: "setting_private",
        SETTING_EMAIL: "setting_email",
        SETTING_WHATSAPP: "setting_whatsapp",
        // 皮肤商城相关(已废弃)
        SKIN_OPEN: "skin_open",
        SKIN_DIAMOND: "skin_diamond",
        SKIN_VIEW_POKER: "skin_view_poker",
        SKIN_VIEW_DESK: "skin_view_desk",
        SKIN_VIEW_CHAT: "skin_view_chat",
        SKIN_VIEW_AVATAR_FRAME: "skin_view_avatar_frame",
        SKIN_BUY_POKER_ASK: "skin_buy_poker_ask",
        SKIN_BUY_POKER_CONFIRM: "skin_buy_poker_confirm",
        SKIN_BUY_POKER_CANCEL: "skin_buy_poker_cancel",
        SKIN_BUY_DESK_CONFIRM: "skin_buy_desk_confirm",
        SKIN_BUY_DESK_CANCEL: "skin_buy_desk_cancel",
        SKIN_BUY_DESK_ASK: "skin_buy_desk_ask",
        SKIN_BUY_CHAT_CONFIRM: "skin_buy_chat_confirm",
        SKIN_BUY_CHAT_CANCEL: "skin_buy_chat_cancel",
        SKIN_BUY_CHAT_ASK: "skin_buy_chat_ask",
        SKIN_BUY_AVATAR_FRAME_CONFIRM: "skin_buy_avatar_frame_confirm",
        SKIN_BUY_AVATAR_FRAME_CANCEL: "skin_buy_avatar_frame_cancel",
        SKIN_BUY_AVATAR_FRAME_ASK: "skin_buy_avatar_frame_ask",
        // 商城相关
        SHOP_OPEN_VIP: "shop_open_vip",
        SHOP_OPEN_DIAMOND: "shop_open_diamond",
        SHOP_BUY_DIAMOND: "shop_buy_diamond",
        SHOP_BUY_SKIN: "shop_buy_skin",
        SHOP_OPEN_GOLD: "shop_open_gold",
        SHOP_BUY_GOLD: "shop_buy_gold",
        SHOP_BUY_VIP_7: "shop_buy_vip_7",
        SHOP_BUY_VIP_30: "shop_buy_vip_30",
        SHOP_SKIN_BUY: "shop_skin_buy",
        SHOP_SKIN_CANCEL: "shop_skin_cancel",
        SHOP_SKIN_INFO: "shop_skin_info",
        // 俱乐部
        // StatisticsMgr.reqReport(ReportConfig.CLUB_RANK);
        CLUB_RANK: "club_rank",
        CLUB_RANK_RULE: "club_rank_rule",
        CLUB_RULE: "club_rule",
        CLUB_SEARCH: "club_search",
        CLUB_APPLY: "club_apply",
        CLUB_CREATE: "club_create",
        CLUB_ADMIN: "club_admin",
        CLUB_ADMIN_INFO: "club_admin_info",
        CLUB_ADMIN_APPLY: "club_admin_apply",
        CLUB_ADMIN_USER: "club_admin_user",
        CLUB_SIGN: "club_sign",
        CLUB_EXIT: "club_exit",
        CLUB_CHAT: "club_chat",
        CLUB_ACTIVE: "club_active",
        CLUB_INVITE_FRIEND: "club_invite_friend",
        CLUB_INVITE_CHAT: "club_invite_chat",
        // 加入游戏
        CLUB_START_GAME: "club_start_game",
        ONLINE_START_GAME: "online_start_game",
        FRIEND_START_GAME: "friend_start_game",
        // 个人资料
        USERINFO_OPEN: "userinfo_open",
        USERINFO_CHANGE_NAME: "userinfo_change_name",
        USERINFO_CHANGE_COUNTRY: "userinfo_change_country",
        USERINFO_CHANGE_SEX: "userinfo_change_sex",
        USERINFO_CHANGE_MEMO: "userinfo_change_memo",
        USERINFO_CHANGE_HEAD: "userinfo_change_head",
        USERINFO_CHANGE_HEAD_DEFAULT: "userinfo_change_head_default",
        // 排行榜相关
        RANK_OPEN_VIEW: "rank_open_view",
        RANK_OPEN_GOLD: "rank_open_gold",
        RANK_OPEN_FRIEND: "rank_open_friend",
        RANK_OPEN_RANK: "rank_open_rank",
        RANK_OPEN_WIN: "rank_open_win",
        RANK_USERINFO_GOLD: "rank_userinfo_gold",
        RANK_USERINFO_FRIEND: "rank_userinfo_friend",
        RANK_USERINFO_RANK: "rank_userinfo_rank",
        RANK_USERINFO_WIN: "rank_userinfo_win",

        // 邀请活动
        INVITE_COPY_CODE: "invite_copy_code",
        INVITE_FB_SHARE: "invite_fb_share",
        INVITE_EDIT: "invite_edit",
        INVITE_FOLLOWER_OPEN: "invite_follower_open",
        INVITE_FOLLOWER_REWARD: "invite_follower_reward",
        EVENT_SHARE_FB: "event_share_fb",
        // VIP相关(已废弃)
        VIP_BUY_FRIST: "vip_buy_frist",
        VIP_BUY_SECOND: "vip_buy_second",
        VIP_REWARD_GET: "vip_reward_get",
        // 通行证
        PASS_OPEN: "pass_open",
        PASS_RULE: "pass_rule",
        PASS_REFRESH: "pass_refresh",
        PASS_COMPLETE: "pass_complete",
        PASS_GET_ALL_REWARD: "pass_get_all_reward",
        PASS_BUY: "pass_buy",
        PASS_GET_REWARD: "pass_get_reward",
        // 首冲
        FRIST_CHARGE_OPEN: "frist_Charge_open",
        FRIST_CHARGE_BUY: "frist_Charge_buy",
        // 广告页
        ADVERTISEMENT_CLICK: "advertisement_click",
        // 邮件相关(已废弃)
        EMAIL_OPEN: "email_open",
        EMAIL_GET: "email_get",
        EMAIL_GET_ALL: "email_get_all",
        // 全局聊天
        CHAT_SEND_EMOJI: "chat_send_emoji",
        CHAT_SEND_TEXT: "chat_send_text",
        // 社交系统
        SOCIAL_FRIEND_USERINFO: "social_friend_userinfo",  //打开好友资料
        SOCIAL_FRIEND_OPEN_CHAT: "social_friend_open_chat", //
        SOCIAL_FRIEND_GAME_INVITE: "social_friend_game_invite",
        SOCIAL_FRIEND_DELETE: "social_friend_delete",
        SOCIAL_FRIEND_ADD: "social_friend_add",
        SOCIAL_FRIEND_CHAT: "social_friend_chat",
        SOCIAL_MESSAGE_DELETE: "social_message_delete",
        SOCIAL_MESSAGE_DELETE_ALL: "social_message_delete_all",
        SOCIAL_MESSAGE_ADDFRIEND_AGREE: "social_message_addfriend_agree",
        SOCIAL_MESSAGE_ADDFRIEND_REFUSE: "social_message_addfriend_refuse",
        SOCIAL_RECENT_FRIEND_ADD: "social_recent_friend_add",
        // salon
        SOCIAL_SALON_VIEW: "social_salon_view",
        // 任务与活动系统
        SIGN_REWARD_GET: "sign_reward_get",
        EVENT_REWARD_GET: "event_reward_get",
        EVENT_REWARD_GET_SG: "event_reward_get_sg",
        EVENT_ONLINE_GET: "event_online_get",
        EVENT_ONLINE_TURNTABLE: "event_online_turntable",
        SIGN_VIP_REWARD_GET: "sign_vip_reward_get",
        // 游戏内换皮肤
        SKIN_CHANGE_OPEN: "skin_change_open",
        SKIN_CHANGE_POKER: "skin_change_poker",
        SKIN_CHANGE_DESK: "skin_change_desk",
        SKIN_CHANGE_CHAT: "skin_change_chat",

        // 匹配 房
        ONLINE_OPEN: "online_open",
        ONLINE_START_WITH: "online_start_with",
        ONLINE_INVITE_CLICK: "online_invite_click",
        ONLINE_START_TEAM_GAME: "online_start_team_game",
        // 排位赛 房
        LEAGUE_OPEN: "league_open",
        LEAGUE_RANKING_GLOBAL: "league_ranking_global",
        LEAGUE_RANKING_FRIEND: "league_ranking_friend",
        LEAGUE_VIEW_RULE: "league_view_rule",
        LEAGUE_VIEW_RANKING_RULE: "league_view_ranking_rule",
        LEAGUE_TASK_GET_REWARD: "league_task_get_reward",
        // vip 房
        VIP_OPEN: "vip_open",
        VIP_ENTER_ROOM_BY_ENTER_ROOM_ID: "vip_enter_room_by_enter_room_id",
        VIP_CREATE_SUCCESS: "vip_create_success",
        VIP_ENTER_ROOM_BY_ROOM_LIST: "vip_enter_room_by_room_list",
        VIP_FAST_SEAT: "vip_fast_seat",
        VIP_FILTER_ROOM: "vip_filter_room",
        VIP_REFRESH_ROOM_LIST: "vip_refresh_room_list",


        // 游戏内 通用
        SG_SOUND_SWITCH: "sg_sound_switch",
        SG_MUSIC_SWITCH: "sg_music_switch",
        SG_EXIT_CONFIRM: "sg_exit_confirm",
        SG_EXIT_CANCLE: "sg_exit_cancle",
        SG_CHAT_SEND_EMOTION: "sg_chat_send_emotion",
        SG_CHAT_SEND_FW: "sg_chat_send_fw",
        SG_CHAT_VIEW_RECORD: "sg_chat_view_record",
        SG_CHAT_SEND_INPUT: "sg_chat_send_input",
        SG_VIEW_SKIN: "sg_view_skin",
        SG_BTN_SHOP: "sg_btn_shop",
        SG_BTN_SETTING: "sg_btn_setting",
        SG_BTN_EXITGAME: "sg_btn_exitGame",
        SG_BTN_RECORD: "sg_btn_record",
        SG_BET: "sg_bet",
        SG_EMOTION: "sg_emotion",

        // baloot
        SG_BALOOT_VIEW_RULE: "sg_baloot_view_rule",
        SG_BALOOT_BID_CALL: "sg_baloot_bid_call",
        SG_BALOOT_BID_SIRA: "sg_baloot_bid_sira",

        // hand
        SG_HAND_CLICK_GODOWN: "sg_hand_click_godown",
        SG_HAND_CLICK_LICENSING: "sg_hand_click_licensing",
        SG_HAND_CLICK_HINT: "sg_hand_click_hint",
        SG_HAND_CLICK_DISCARD: "sg_hand_click_discard",
        SG_HAND_VIEW_RULE: "sg_hand_view_rule",
        SG_HAND_CHANGE_CARD_SIZE: "sg_hand_change_card_size",


        SALONG_CREATE_PUBLIC: "salong_create_public",
        SALONG_CREATE_PRIVATE: "salong_create_private",
        SALONG_SELECT_GAME_TAB: "salong_select_game_tab",
        SALONG_MENU_SWITCH_OPEN: "salong_menu_switch_open",
        SALONG_MENU_SWITCH_CLOSE: "salong_menu_switch_close",

        // 网络不好
        NET_DELAY: "net_delay",

        // 查看自己聊天记录
        CHECK_SELF_GAME_RECORD: "check_self_game_record",
        // 查看他人聊天记录
        CHECK_OTHER_GAME_RECORD: "check_other_game_record",

        // 弹窗打开 
        POPUP_OPEN: "popup_open",
        POPUP_CLOSE: "popup_close",
        // Tabbar切换
        TABBAR_OPEN: "tabbar_open",
        // 语音SDK 错误
        VOICE_ERORR: "voice_erorr",

        // 沙龙分享
        SALON_SHARE: "salon_share",
        // 邀请分享
        INVITE_SHARE: "invite_share",
        // 转盘分享
        WHEEL_SHARE: "wheel_share",
        // 下拉页面
        PAGE_OPEN: "page_open",
        PAGE_CLOSE: "page_close",

        // bank页面
        BANK_ADD_CASH: "Bank_AddCash",
        BANK_VERFY: "Bank_Verfy",
        BANK_WITHDRAW: "Bank_Withdraw",
        // BANK_TRANSFERNOW: "Bank_TransferNow",
        BANK_TRANSACTIONS: "Bank_Transactions",
        BANK_PAYMENTS: "Bank_Payments",

        BONUS_TRANSFER_COLLECT: "BonusTransfer_Collect",
        // refer
        REFER_WHATSAPP: "Refer_WhatsApp",
        REFER_SYSTEM_SHARE: "Refer_SystemShare",
        REFER_COPY: "Refer_Copy",
    }
});

window.ReportConfig = ReportConfig;
