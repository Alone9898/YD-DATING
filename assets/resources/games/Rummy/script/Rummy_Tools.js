/**
 * 工具类
 */

let Rummy_Tools = {}
Rummy_Tools.CardType = {
    Invalid:0, //非法牌
    Pts:1,   //单牌
    Set:2,  //刻子
    Seq:3,  //顺子
    PureSeq:4,//纯顺子
}
//花色排序
Rummy_Tools.sortCardColor = function(datas){
    let result = []
    for(let i = 0 ; i < datas.length; i++){
        let color_val = Rummy_Tools.getPokerColor(datas[i])
        result[color_val] = result[color_val] || []
        result[color_val].push(datas[i])
    }

    return result
}

//花色1,2,3,4分别表示方块，梅花，红桃，黑桃
Rummy_Tools.getPokerColor = function(card16Idx){
    return ((card16Idx & 0xf0) >> 4)
}

// 牌值2~E分别表示2,3,4,,,,,,,10,J,Q,K,A
Rummy_Tools.getPokerVal = function(card16Idx){
    return card16Idx & 0x0f
},

// 获取牌值显示
Rummy_Tools.getValShow = function(val){
    let val_arry = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"]
    return val_arry[val-2]
},

//是否癞子
Rummy_Tools.isWild = function(card16Idx,wildVal){
    return Rummy_Tools.isJoker(card16Idx) || Rummy_Tools.getPokerVal(card16Idx) == Rummy_Tools.getPokerVal(wildVal)
}

//是否大小王
Rummy_Tools.isJoker = function(card16Idx){
    return card16Idx == 0x51 || card16Idx == 0x52
}

// 是否A
Rummy_Tools.isAce = function (card16Idx) {
    return (card16Idx & 0x0F) == 0x0E
}

// A的小值
Rummy_Tools.getAceMinValue = function (card16Idx) {
    return Rummy_Tools.getPokerColor(card16Idx) * 16 + 1
}

//计算点数
Rummy_Tools.getCardPoint = function(card16Idx){
    let val = Rummy_Tools.getPokerVal(card16Idx)
    if(val > 10){
        return 10
    }
    return val
}

//结算牌组总分数
Rummy_Tools.getCardScore = function(orgcards,wildVal){
    let val = 0
    let cards = Global.copy(orgcards)
    for(let i = 0; i < cards.length; i++){
        let item = cards[i]
        let isWild = Rummy_Tools.isWild(item,wildVal)
        if(!isWild){
            //癞子不算分
            val += Rummy_Tools.getCardPoint(item)
        }
    }
    return val
}

//是否顺子
// 3个或以上同花色的连续牌，癞子可以代替任意牌
// 顺子优先级高于刻子，如 A,大王，小王的牌型算作顺子而不是刻子
Rummy_Tools.isSequence = function(orgcards,wildVal){
    let cards = Global.copy(orgcards)
    if(cards.length<3) return false
    let wildcnt = 0
    let normals = []
    for(let i = 0; i < cards.length; i++){
        if(Rummy_Tools.isWild(cards[i],wildVal)){
            wildcnt += 1
        }
        else{
            normals.push(cards[i])
        }
    }

    let len = normals.length
    if(len <= 0) return true
    //判断普通牌是否同花色
    let color = Rummy_Tools.getPokerColor(normals[0])
    for(let i = 1; i < len; i++){
        if(Rummy_Tools.getPokerColor(normals[i]) != color){
            return false
        }
    }

    //判断组成顺子需要的万能牌数量
    normals.sort((a,b)=>{ //有小到大排序
        return a - b
    })
    let s = 0; 
    for(let i = 1; i < len; i++){
        if(normals[i] == normals[i-1]) return false
        s = s + normals[i] - normals[i-1] - 1
    }
    if (s <= wildcnt) return true

    //如果有A，需要把A当作1点再算一次
    if (Rummy_Tools.isAce(normals[len-1])) {
        let c = Rummy_Tools.getAceMinValue(normals[len-1])
        s = normals[0]-c-1
        for(let i=1; i<len-1; i++){
            s = s + normals[i] - normals[i-1] - 1
        }
        if (s <= wildcnt) return true
    }
    return false
}

//是否纯顺子
Rummy_Tools.isPureSequence = function(orgcards){
    let cards = Global.copy(orgcards)
    if(cards.length < 3) return false
    cards.sort((a,b)=>{
        return a - b
    })
    //A可以放2前面，也可以放K后面
    if (Rummy_Tools.isAce(cards[cards.length-1])) {
        //先把A当1算，再把A当14算
        if (cards[0] == Rummy_Tools.getAceMinValue(cards[cards.length-1]) + 1) {
            let res = true
            for (let i=1; i<cards.length-1; i++) {
                if (cards[i] != cards[i-1]+1) {
                    res = false
                    break
                }
            }
            if (res) return true
        }
    }

    //正常纯顺子
    for(let i = 1; i < cards.length; i++){
        if(cards[i] != cards[i-1] +1) return false
    }
    return true
}

//是否刻子
//刻子由3张或4张数值相同花色不同的牌组成，癞子可以代替任意牌
Rummy_Tools.isSet = function(orgcards,wild){
    let cards = Global.copy(orgcards)
    if(cards.length < 3 || cards.length >4) return false
    
    let wildcnt = 0
    let normals = []
    for(let i = 0; i < cards.length; i++){
        if(Rummy_Tools.isWild(cards[i],wild)){
            wildcnt += 1
        }
        else{
            normals.push(cards[i])
        }
    }

    for(let i = 0; i < normals.length-1; i++){
        for (let j = i+1; j < normals.length; j++) {
            let c1 = normals[i]
            let c2 = normals[j]
            if(Rummy_Tools.getPokerVal(c1) != Rummy_Tools.getPokerVal(c2)){
                return false
            }
            if(Rummy_Tools.getPokerColor(c1) == Rummy_Tools.getPokerColor(c2)){
                return false
            }
        }
    }
    return true
},

//获取牌型
Rummy_Tools.getCardType = function(orgcards,wild){
    let cards = Global.copy(orgcards)
    let nType = Rummy_Tools.CardType.Invalid
    if(Rummy_Tools.isPureSequence(cards)){
        nType = Rummy_Tools.CardType.PureSeq
        return nType
    }
    else if(Rummy_Tools.isSequence(cards,wild)){
        nType = Rummy_Tools.CardType.Seq
        return nType
    }
    else if(Rummy_Tools.isSet(cards,wild)){
        nType = Rummy_Tools.CardType.Set
        return nType
    }
    else if(cards.length == 1){
        nType = Rummy_Tools.CardType.Pts
        return nType
    }
    return nType
}

//获取总分数
Rummy_Tools.GetTotalScore = function(orgcards,wild){

}



module.exports = Rummy_Tools;
