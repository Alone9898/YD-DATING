import System from "../System";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NetQueueSystem extends System {
    netListener: any;

    callFuncMap = {};
    noCacheCallFuncMap = {};

    queue = [];
    running = true;
    private isInit = false;

    private isBackground: boolean = false;


    onInit() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    }


    run() {
        this.clearQueue();
        this.isInit = true;
    }


    register(CMD: number, callback: Function) {
        this.callFuncMap[CMD] = callback;
        this.netListener.registerMsg(CMD, this.onHandle, this);
    }

    registerNoQueue(CMD: number, callback: Function, target) {
        this.noCacheCallFuncMap[CMD] = callback;
        this.netListener.registerMsg(CMD, this.onHandleImmediate, this);
    }

    onHandle(msg) {
        if (this.isBackground) return;
        if (!this.isInit) return;
        this.queue.push(msg);
    }

    onHandleImmediate(msg) {
        if (this.isBackground) return;
        if (!this.isInit) return;
        let callFunc = this.noCacheCallFuncMap[msg.c];
        if (callFunc) {
            callFunc(msg);
        }
    }

    onUpdate(dt) {
        if (this.running && this.queue.length > 0) {
            let msg = this.queue.shift();
            let callFunc = this.callFuncMap[msg.c];
            if (callFunc) {
                callFunc(msg);
            }
        }
    }

    clearQueue() {
        this.queue = [];
    }

    onGameHide() {
        this.clearQueue();
        this.isBackground = true;
    }
    onGameShow() {
        this.isBackground = false;
    }

}
