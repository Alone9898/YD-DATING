/**
 * 消息缓存管理器
 * 需要混存的协议使用sendAndCache的方式发送
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _nStepInter:0,
        _cacheNormalList:[],//进入大厅后慢慢请求的数据
        _bCacheHall:false,  //大厅是否已经缓存了数据
        _sendNormalIdx:0,    //第二阶段缓存的发送序号
        _popList:[],
    },

    /**
     * 初始化数据操作
     */
     init:function(){
       
        this._initPopListMsg()
    },


    /**
     * 是否已经缓存了大厅数据
     */
    isCacheHall:function(){
        return this._bCacheHall
    },

    /**
     * 设置缓存大厅数据的标识位
     * @param {*} val 
     */
    setCacheHall:function(val){
        this._bCacheHall = val
    },

    /**
     * 是否正在游戏内。每个项目可能判断有些不同。预留接口
     * 用于框架判断是否显示网络断开的提示框
     * return true/false
     */
    isPlayingGame:function(){

    },

    /**
     * 此消息是否是在缓存消息列表中。预留接口
     * 用于显示此消息发送是否要提示断开
     * return true/false
     * @param {*} msgid 
     */
    isMsgIdInCacheList:function(msgid){

    },

    /**
     * 初始化需要弹出的消息列表
     */
    _initPopListMsg:function(){

    },

    /**
     * 配置消息需要弹出提示断网
     * return true/fase
     * @param {*} msgid 
     */
    isMsgIdNeedPop:function(msgid){
        let bIn = false
        if(msgid && this._popList){
            for(let i = 0; i < this._popList.length; i++){
                let item = this._popList[i]
                if(item == msgid){
                    bIn = true
                    break
                }
            }
        }
        
        return bIn
    },

    /**
     * 发送的协议返回了
     * @param {*} msgId 
     */
    onNetBack:function(msgId){
    
    },

    /**
     * 
     * @param {*} sendItem 就是发送协议的数据结构{c:MsgId.***,}
     */
    sendCacheMsg(sendItem){
        let sendType = sendItem.sendType
        sendItem.cache = 1//区别是提前拉的消息
        delete sendItem.sendType //客户端自己添加的，发消息之前抹掉
        if(sendType == 1){
            //直接发
            cc.vv.NetManager.send(sendItem,true)
        }
        else{
            cc.vv.NetManager.sendAndCache(sendItem)
        }
    },

    update (dt) {
        if(this.isCacheHall() && this._cacheNormalList && this._cacheNormalList.length && !this._bSendNormalFinish){
            //大厅基础消息已经缓存了，说明可以进入大厅了。
            //开始第二阶段数据的缓存
            this._nStepInter += dt
            if(this._nStepInter>0.1){
                this._nStepInter = 0
                let sendItem = this._cacheNormalList[this._sendNormalIdx]
                this._sendNormalIdx++
                if(sendItem){
                    this.sendCacheMsg(sendItem)
                }
                else{
                    //发完了
                    this._bSendNormalFinish = true
                }
                
            }
        }
    },

    

 
});
