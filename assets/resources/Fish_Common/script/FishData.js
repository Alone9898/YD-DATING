
cc.Class({
    extends: require("GameDataInterface"),
    
    setEventId() {
    },

    registerMsg() {
    },

    unregisterMsg() {
    },

    getRoomData: function() {
        return this._deskInfo;
    },

    formatNumber: function(number) {
        number = Math.floor(number)
        let str = ""+number;
        // if (number >= 100)
        //     str = str.substr(0, str.length-2) + "." + str.substr(-2);
        // else if (number >= 10)
        //     str = "0." + number;
        // else
        //     str = "0.0" + number;
        return str;
    },

    update(dt){

    } 
});
