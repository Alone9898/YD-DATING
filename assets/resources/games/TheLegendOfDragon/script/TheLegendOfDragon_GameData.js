/**
 * 游戏自己的gamedata
 */
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {
        _collect: null,     //收集游戏数据
    },

    init(deskInfo,gameId,gameJackpot){
        this._super(deskInfo,gameId,gameJackpot);
        this._collect = this._deskInfo.collect;
    },
    //是否是第一次触发免费
    isFirstTriggerFree() {
        return this.GetFreeTime() > 0 && this.GetFreeTime() == this.GetTotalFree();
    },
    //是否是最后一轮免费(旋转完成)
    isLastEndFree() {
        return this.GetFreeTime() == 0 && this.GetTotalFree() > 0;
    },
    //免费赢得金币
    getFreeWinCoin() {
        return this._gameInfo.freeWinCoin;
    },
    //抽卡状态
    getPickState() {
        if (this._gameInfo.pick) return this._gameInfo.pick.state;
        return 0
    },
    //收集数据
    getCollectData() {
        return this._collect;
    },
    //当前的龙
    getDragonIdx() {
        return this._collect.didx;
    },
    //当前龙的数据
    getDragon(didx) {
        return this._collect.dragons[didx-1];
    },
    //选择龙
    setDragonIdx(didx) {
        this._collect.didx = didx;
    },
    //收集解锁押注等级
    getUnlockIdx() {
        return this._collect.unlockidx;
    },
    //当前元宝
    getIngot() {
        return this._collect.num;
    },
    //设置元宝
    setIngot(num) {
        this._collect.num = num;
    },
    //修改元宝
    modifyIngot(num) {
        this._collect.num += num;
    },
    //增加道具
    addItem(didx, itemid) {
        if (!this.hasItem(didx, itemid)) {
            this._collect.dragons[didx-1].items.push(itemid);
        }
    },
    //拥有道具
    hasItem(didx, itemid) {
        return this._collect.dragons[didx-1].items.indexOf(itemid) >= 0;
    },
    //更新所有道具
    resetItems(didx, items) {
        this._collect.dragons[didx-1].items = items;
    },
    //获取箱子
    getChest(didx, cidx) {
        return this._collect.dragons[didx-1].chests[cidx-1];
    },
    //箱子是否锁定
    isChestLocked(didx, cidx) {
        if (this._collect.dragons[didx-1].lock==1) return true;
        let unlock_level = [0,2,4];
        let row = Math.floor((cidx-1)/3);
        return this._collect.dragons[didx-1].lv<unlock_level[row];
    },
    //更新箱子
    updateChest(didx, cidx, tp, coin) {
        let chest = this._collect.dragons[didx-1].chests[cidx-1];
        chest.tp = tp;
        chest.coin = coin;
    },
    //更新所有箱子
    resetChests(didx, chests) {
        this._collect.dragons[didx-1].chests = chests;
    },
    //龙等级
    getDragonLv(didx) {
        return this._collect.dragons[didx-1].lv;
    },
    setDragonLv(didx, lv) {
        this._collect.dragons[didx-1].lv = lv;
    },
    //解锁龙
    unlockDragon(didx) {
        this._collect.dragons[didx-1].lock = 0;
    }

});
