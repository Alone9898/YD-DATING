
const { ccclass, property } = cc._decorator;
import LudoMasterLogic from "../LudoMasterLogic";

let gameOverStr = {
    WINBG: 'gameOver_win',
    // WINLABEL: 'gameOver_win_title',
    FAILBG: 'gameOver_failure',
    // FAILLABEL: 'gameOver_failure_title',
}

@ccclass
export default class gameOver extends cc.Component {

    @property(cc.SpriteAtlas)
    gameAtlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    titleBg: cc.Sprite = null;

    @property(cc.Node)
    fail: cc.Node = null;
    @property(cc.Node)
    win: cc.Node = null;

    // @property(cc.Sprite)
    // titleBg: cc.Sprite= null;

    // @property(cc.Sprite)
    // noSpr: cc.Sprite = null;

    @property(cc.Button)
    restart: cc.Button = null;

    @property(cc.Button)
    exit: cc.Button = null;

    get facade(): LudoMasterLogic {
        return facade as LudoMasterLogic;
    }

    onLoad() {
        this.titleBg = cc.find('layout/titleBg/bg', this.node).getComponent(cc.Sprite)
        this.fail = cc.find('layout/titleBg/fail', this.node)
        this.win = cc.find('layout/titleBg/win', this.node)

        this.restart = cc.find('layout/funBtn/restart', this.node).getComponent(cc.Button)
        this.restart.node.on('click', this.onClickRestart, this)
        this.exit = cc.find('layout/funBtn/exit', this.node).getComponent(cc.Button)
        this.exit.node.on('click', this.onClickExit, this)
    }

    showGameOverInfo(msg: any) {
        let _winIdx = 0
        let _winUid = 0
        // 如果有大于0的赢家赋值 没有则算第一位玩家获胜
        for (let i = 0; i < msg.wincoins.length; i++) {
            if (msg.wincoins[i].wincoinshow > 0) {
                _winUid = msg.wincoins[i].uid
                _winIdx = i
            }
        }
        if (_winUid < 1) {
            _winUid = msg.wincoins[0].uid
            _winIdx = 0
        }

        let bWin: boolean = _winUid == cc.vv.UserManager.uid ? true : false
        let _titleBg = bWin ? gameOverStr.WINBG : gameOverStr.FAILBG
        this.titleBg.spriteFrame = this.gameAtlas.getSpriteFrame(_titleBg)
        this.fail.active = !bWin
        this.win.active = bWin
        // 通过uid找到win的seatid {1,2,3,4}
        let p = this.facade.dm.playersDm.getPlayerByUid(_winUid)
        let _resultOne = cc.find('layout/result1', this.node)
        let scp = _resultOne.getComponent('gameOverResult')
        scp.initData(msg.settle.pannel[_winIdx][1], msg.settle.pannel[_winIdx][2])
        scp.updateHeadIcon(p)

        for (let i = 0; i < 4; i++) {
            let _curIdx = 2
            let _resultNode = cc.find(cc.js.formatStr("layout/result%s", _curIdx), this.node)
            if (_resultNode) {
                let bShow: boolean = i < msg.settle.pannel.length
                _resultNode.active = bShow
                if (bShow) {
                    if (i == _winIdx) {
                        continue
                    } else {
                        _curIdx++
                        let player = this.facade.dm.playersDm.getPlayerByUid(msg.wincoins[i].uid)
                        let _resultOne = cc.find('layout/result1', this.node)
                        let scp = _resultOne.getComponent('gameOverResult')
                        scp.initData(msg.settle.pannel[i][1], msg.settle.pannel[i][2])
                        scp.updateHeadIcon(player)
                    }
                }
            }
        }

        // 倒计时自动关闭
        let _curTime = 0
        if (msg.delayTime) {
            this.schedule(() => {
                _curTime++
                if (_curTime >= msg.delayTime) {
                    // 结束
                    if (cc.isValid(this.node)) {
                        this.onClickExit()
                    }
                }
            }, 1, msg.delayTime)
        }
    }

    showTitle() {

    }

    showNoSpr() {

    }

    onClickRestart() {
        // 重新开始协议
        // this.facade.dm.msgWriter.sendExit();
        this.restart.interactable = false
        this.node.destroy()
    }

    onClickExit() {
        this.facade.dm.msgWriter.sendExit();
        this.exit.interactable = false
        this.node.destroy()
    }

    // update (dt) {}
}
