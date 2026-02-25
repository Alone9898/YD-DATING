
cc.Class({
    extends: require("LMSlotMachine_PrizePool"),

    properties: {

    },


    // 更新奖池
    updateJackPot : function() {
        if(this._jackpotLabel){
            if(this._PauseNum){
                //暂停的时候显示奖池固定值
                let str = Global.S2P(this._PauseNum*this._mult);
                this._jackpotLabel.string = this.convertNumToShort(str,1000,4);
            }
            else{
                let str = Global.S2P(this._jackpotNum*this._mult);
                this._jackpotLabel.string = this.convertNumToShort(str,1000,4);
            }

        }
    },

    //转化数字为万、亿为单位的字符串 decimal-截取的为数
    convertNumToShort : function (num, radix, decimal, costomunitArr, criticalValue) {
        // var unitArr = ['', '万', '亿', '万亿'];
        var unitArr = ['', 'K', 'M', 'B', 'T', 'Q'];
        var sign = (num != 0)?num/Math.abs(num):1;  //符号
        num = Math.abs(num);

        //替换自定义后缀
        if(costomunitArr){
            unitArr = costomunitArr
        }

        radix = (radix == null)?1000:radix; //默认值  10000万亿
        decimal = (decimal == null)?1:decimal; //默认值
        criticalValue = (criticalValue == null)?radix:criticalValue; //默认值  进制
        var sum = 0;
        while (num >= criticalValue) {
            sum ++;
            num = num/radix;
        }
        num = num.toPrecision(decimal)//Math.floor(num*Math.pow(10, decimal))/Math.pow(10, decimal);

        return num*sign + unitArr[sum];
    }

    // update (dt) {},
});
