// 红点组件,决定了监听哪一种类型的红点数量,实时更新
cc.Class({
    extends: cc.Component,
    properties: {
        key: "",
        valueLabel: cc.Label,

        advanced: false,

        //互斥key, 当互斥key的count为0 才考虑显示
        key_mutually_exclusive: {
            default: "",
            // type: cc.String,
            visible: function () {
                return this.advanced;
            },
        },
        // 是否在内存中记录count
        check_memory: {
            default: false,
            visible: function () {
                return this.advanced;
            },
        },
        // 内存中记录count的按钮触发
        btn_memory: {
            default: null,
            type: cc.Button,
            visible: function () {
                return this.advanced;
            },
        },
    },
    onLoad() {
        cc.vv.RedHitManager.register(this);
        if (this.btn_memory) {
            this.btn_memory.node.on("click", this.onClickRecord, this);
        }
    },
    onEnable() {
        // 更新自己的显示
        this.updateView();
    },
    onDestroy() {
        cc.vv.RedHitManager.unregister(this);
    },
    updateView() {
        let data = cc.vv.RedHitManager.data;
        if (this.key.length <= 0) {
            this.node.active = false;
            return;
        }
        if (this.advanced) {
            // 互斥key检测
            if (this.key_mutually_exclusive) {
                let keyArr = this.key_mutually_exclusive.split(',');
                keyArr = keyArr.filter((key) => { return cc.vv.RedHitManager.filterKey.indexOf(key) < 0 })
                let count = 0;
                for (const key of keyArr) {
                    if (key == "friendsmsg") {
                        for (const _k in data[key]) {
                            count += data[key][_k];
                        }
                    } else {
                        if (data[key] && data[key] > 0) {
                            count += data[key]
                        }
                    }
                }
                if (cc.vv.RedHitManager.clickRecordList.indexOf(this.key_mutually_exclusive) >= 0) {
                    count = 0;
                }
                if (count > 0) {
                    this.node.active = false;
                    return;
                }
            }
            // 判断是否需要检查内存是否点击过
            if (this.check_memory) {
                if (cc.vv.RedHitManager.clickRecordList.indexOf(this.key) >= 0) {
                    this.node.active = false;
                    return;
                }
            }
        }
        let keyArr = this.key.split(',')
        keyArr = keyArr.filter((key) => { return cc.vv.RedHitManager.filterKey.indexOf(key) < 0 })
        let count = 0;
        for (const key of keyArr) {
            if (key == "friendsmsg") {
                for (const _k in data[key]) {
                    count += data[key][_k];
                }
            } else {
                if (data[key] && data[key] > 0) {
                    count += data[key]
                }
            }
        }
        // cc.log("RedHitCmp", this.key, count);
        if (count > 0) {
            this.node.active = true;
            if (this.valueLabel) {
                this.valueLabel.string = count;
            }
        } else {
            this.node.active = false;
        }
    },
    onClickRecord() {
        if (this.check_memory && this.node.active) {
            if (cc.vv.RedHitManager.clickRecordList.indexOf(this.key) < 0) {
                cc.vv.RedHitManager.clickRecordList.push(this.key);
                // 进行刷新
                cc.vv.RedHitManager.updateView();
            }
        }
    },

});
