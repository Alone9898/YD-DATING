/**
 * 筹码节点池
 */
cc.Class({
    extends: cc.Component,

    statics: {
        _chip_pool:null,
        _chip_node:null,

        init:function(){
            this._chip_pool = new cc.NodePool()

            if(!this._chip_node){
                let url = "Table_Common/TableRes/prefab/chip"
                cc.loader.loadRes(url,cc.Prefab,(err,data)=>{
                    if(!err){
                        this._chip_node = cc.instantiate(data)
                        this._chip_node.active = false
                        cc.game.addPersistRootNode(this._chip_node)
                    }
                    
                })
            }
        },

        //创建默认个数的池子
        createDefault:function(val){
            this._bStart = val
        },

        //获取一个节点
        get:function(){
            if(this._chip_pool){
                if(this._chip_pool.size() > 0){
                    return this._chip_pool.get()
                }
                else{
                    
                    return this._createOne()
                }
            }
        },

        //回收一个节点
        put:function(node){
            
            this._chip_pool.put(node)
            // cc.log("全局可用筹码池："+this._chip_pool.size())
        },

        _createOne(){
            let temp = cc.instantiate(this._chip_node)
            temp.active = false
            if(!this._chipcnt) this._chipcnt = 1
            // cc.log("+全局筹码池："+this._chipcnt++)
            return temp
        },

        update(){// 1s调用一次
            if(this._bStart && this._chip_node){
                if(this._chip_pool ){
                    let temp = this._createOne()
                    this._chip_pool.put(temp)
                    this._bStart -=1

                }
               
            }
        }
    },

    
});
