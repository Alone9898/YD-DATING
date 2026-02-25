/**
 * 消息处理基类
 */
export class BaseHandler {
    _delayCfg: Map<number, number>;// 延迟
    _handlerMap: Map<number, Function>; // 消息处理函数表
    _noCacheHandlerMap: Map<number, Function> // 不需要消息缓冲的消息处理函数;
    _msgQueue: any[];
    _timeCode: any;       // 定时器code
    _canPlayCmd: boolean;    // 是否可播放命令

    _stopRec: boolean = true;  //是否暂停 接受服务器数据

    constructor() {
        this.reset();
    }

    reset() {
        this._delayCfg = new Map();
        this._handlerMap = new Map();
        this._noCacheHandlerMap = new Map();
        this._msgQueue = [];
        this._canPlayCmd = false;
        this._timeCode = 0;
        this._stopRec = true;
    }

    run() {
        this._stopRec = false;
    }

    stop() {
        this._stopRec = true;
    }

    /**
     * 注册不需要缓存的命令
     * @param cmd
     * @param handler
     */
    registerNoCacheHandler(cmd: number, handler: Function) {
        this._noCacheHandlerMap.set(cmd, handler);
        cc.vv.NetManager.registerMsg(cmd, this.onData, this, false);
    }

    /**
     * 注册消息处理函数
     * @param cmd 
     * @param handler 
     * @param delayTime 
     */
    registerHandler(cmd: number, handler: Function, delayTime: number) {
        this._handlerMap.set(cmd, handler);
        this._delayCfg.set(cmd, delayTime);
        cc.vv.NetManager.registerMsg(cmd, this.onData, this, false);
    }

    /**
     * dic
     */
    onData(pack: any) {
        if (this._stopRec) return;
        // console.log("#onData#", pack);
        let cmd = pack.c;
        if (this._noCacheHandlerMap.has(cmd)) {
            // cc.log(`#执行无缓冲命令${cmd}`);
            this._noCacheHandlerMap.get(cmd)(pack);
        } else {
            try {
                if (this._canPlayCmd) {
                    this._msgQueue.push(pack);
                    if (this._msgQueue.length > 5) { // 如果堆积命令超过5条发起重连命令
                        this.clearMsgQueue();
                        cc.vv.NetManager.reconnect();
                    } else {
                        this.playCmd();
                    }
                } else {
                    if (this._msgQueue.length > 5) {
                        this.clearMsgQueue();
                        cc.vv.NetManager.reconnect();
                    } else {
                        this._msgQueue.push(pack);
                    }
                }
            } catch (e) {
                cc.log(e);
            }
        }
    }

    /**
     * 清除定时器
     */
    _clearTimer() {
        if (this._timeCode != -1) {
            clearTimeout(this._timeCode);
            this._timeCode = -1;
        }
    }

    /**
     * 暂停命令播放
     */
    pauseCmd() {
        // cc.log("#pause cmdManager#")
        this._canPlayCmd = false;
        this._clearTimer();
    }

    /**
     * 恢复命令播放
     */
    resumeCmd() {
        // cc.log("#resume cmdManager#")
        this._canPlayCmd = true;
        if (this._msgQueue.length > 0) {
            this.playCmd();
        }
    }

    /**
     * 获取命令延迟时间
     * @param cmd 命令
     */
    _getCmdDelayTime(cmd: number) {
        let reTimes = this._delayCfg.get(cmd);
        return reTimes;
    }

    /**
     * 清理资源
     */
    clear() {
        this._handlerMap && this._handlerMap.forEach((_, k) => {
            cc.vv.NetManager.unregisterMsg(k, this.onData, false, this)
        });
        this._noCacheHandlerMap && this._noCacheHandlerMap.forEach((_, k) => {
            cc.vv.NetManager.unregisterMsg(k, this.onData, false, this)
        });
        this.clearMsgQueue();
        this._handlerMap = null;
        this._noCacheHandlerMap = null;
    }

    /**
     * 清空消息队列
     */
    clearMsgQueue() {
        this._msgQueue = [];
        this._canPlayCmd = false;
        this._timeCode = 0;
    }

    /**
     * 执行命令
     * @param pack
     */
    exeCuteCmd(pack) {
        let cmd = pack.c;
        // cc.log(`#exe cmd:${cmd}`);
        let handler = this._handlerMap.get(cmd);
        if (handler) {
            handler(pack);
        } else {
            cc.log(`#cannot find handler:${cmd}`);
        }
    }

    /**
     * 从队列中取出命令执行
     */
    playCmd() {
        if (this._msgQueue.length <= 0) {
            return;
        }
        let msg = this._msgQueue[0];
        // cc.log(`#playCmd${msg.c}`);
        let time = this._getCmdDelayTime(msg.c);
        if (time) {
            this._timeCode = setTimeout(this.playNexCmd.bind(this), time * 1000);
        } else {
            this.playNexCmd();
        }
    }

    playNexCmd() {
        // cc.log("#playNextCmd", this._msgQueue.length);
        this._clearTimer();
        if (this._msgQueue.length > 0 && this._canPlayCmd) {
            let msg = this._msgQueue.shift();
            this.exeCuteCmd(msg);
            this.playCmd();
        }
    }

    /**
     * 开始播放命令
     */
    startPlayCmd() {
        // cc.log("#playNextCmd#");
        this._canPlayCmd = true;
        this.playNexCmd();
    }
}