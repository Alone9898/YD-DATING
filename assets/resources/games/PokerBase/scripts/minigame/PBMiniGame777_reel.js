
/**
 * 卷轴
 */
let itemScriptName = "LMSlots_Subgame777_item"
cc.Class({
    extends: require("LMSlots_PauseUI_Base"),

    properties: {
        prefab_item: {
            default: null,
            type: cc.Prefab,
            tooltip: "物品的预制"
        },
        reelIdx: 0,
        _num: 3,
        _allItems: [],
        _curInterv: 0,
        _gamecfg: null,

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    createItems: function (cfg) {
        this._gamecfg = cfg
        //多创建一列，是为了旋转时循序转的效果
        for (let i = 0; i < this._num + 1; i++) {
            let obj = cc.instantiate(this.prefab_item)
            obj.position = this.getItemPosition(i)
            this.node.addChild(obj)
            let scriptcmp = obj.getComponent(itemScriptName)
            if (scriptcmp) {
                scriptcmp.resetItem(i, this.reelIdx, this._gamecfg)
                scriptcmp.showRandSprite()
            }
            this._allItems.push(obj)

        }
    },

    //可根据自己的排序方式计算位置
    //idx 0开始
    getItemPosition: function (idx) {
        let height = this.node.height
        let xPos = 0
        let yPos = height / (this._num - 1) * (idx)
        return cc.v2(xPos, yPos)
    },

    //开始旋转
    startMove: function (resultReel) {
        this._resultReel = resultReel

        let items = this._allItems
        for (let i = 0; i < items.length; i++) {
            let obj = items[i]
            let scriptcmp = obj.getComponent(itemScriptName)
            if (scriptcmp) {
                scriptcmp.setMoveState('moveing')
                scriptcmp.clrearItemData()
            }
        }
        this._bStartMove = true
        this._curInterv = 0
        this._moveIntervCfg = 1 / 60
        //  let cfg = cc.vv.gameData.getGameCfg()
        this._moveSpeed = 40
        this._roundMax = 5
        this._stopNum = 0
    },

    stopMove: function () {
        let items = this._allItems
        this._moveSpeed = this._moveSpeed * 10
        for (let i = 0; i < items.length; i++) {
            let obj = items[i]
            let scriptcmp = obj.getComponent(itemScriptName)
            if (scriptcmp) {
                scriptcmp.setRound(this._roundMax - 1)
            }
        }
    },



    addStopItemNum: function () {
        this._stopNum += 1
        if (this._stopNum == this._allItems.length) {
            this.doReelStopAction()
        }
    },

    //列停止表现
    doReelStopAction: function () {
        Global.dispatchEvent("REEL_STOP");
    },




    //刷新item位置，即表现转动效果
    update(dt) {
        let self = this
        if (this._bStartMove) {

            // this.checkItemBottom()
            this._curInterv += dt
            if (this._curInterv >= this._moveIntervCfg) {
                this._curInterv = 0
                let minY = this.getBottomPosY()
                let items = this._allItems
                for (let i = 0; i < items.length; i++) {
                    let obj = items[i]
                    let scriptcmp = obj.getComponent(itemScriptName)
                    if (scriptcmp) {
                        let state = scriptcmp.getMoveState()
                        if (state == "moveing") {

                            //是否已经转到最大圈数
                            let nRound = scriptcmp.getRound()
                            if (nRound < this._roundMax + this.reelIdx) {
                                obj.y -= this._moveSpeed
                                if (obj.y <= minY) {
                                    obj.y = this.getTopPosY()
                                    scriptcmp.addRound()
                                    scriptcmp.showRandSprite()
                                }
                            }
                            else {
                                //到达最大圈数
                                //设置结果图片
                                scriptcmp.showResultSprite(this._resultReel[i])
                                let tarPos = this.getItemPosition(scriptcmp.getItemIdx())
                                let nDur = (obj.y - tarPos.y) / ((1 / this._moveIntervCfg) * this._moveSpeed)
                                scriptcmp.setMoveState("easing")
                                cc.tween(obj)
                                    .to(nDur, { position: tarPos }, { easing: 'elasticIn' })
                                    .call(() => {
                                        scriptcmp.setMoveState('idle')
                                        self.addStopItemNum()
                                    })
                                    .start()
                            }

                        }
                    }
                }
            }
        }
    },

    getBottomPosY: function () {
        return -this.getItemPosition(1).y
    },

    getTopPosY: function () {
        return this.getItemPosition(this._num).y
    },
});
