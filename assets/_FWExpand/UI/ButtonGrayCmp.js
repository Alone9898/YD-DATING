// 增强button功能,让button在置灰的时候,子节点也显示灰色
cc.Class({
    extends: cc.Component,
    editor: {
        menu: '通用/ButtonGaryCmp',
        requireComponent: cc.Button,
        executeInEditMode: true,
    },
    properties: {
        _interactable: true,
        interactable: {
            get: function () {
                return this._interactable;
            },
            set: function (value) {
                this._interactable = value;
                // 设置按钮状态
                let button = this.getComponent(cc.Button);
                button.enableAutoGrayEffect = true;
                button.interactable = value;

                // let btnSp = this.node.getComponent(cc.Sprite);
                // if (btnSp) {
                //     btnSp.setMaterial(0, cc.Material.getBuiltinMaterial(value ? '2d-sprite' : '2d-gray-sprite'))
                // }
                // let btnLabel = this.node.getComponent(cc.Label);
                // if (btnLabel) {
                //     btnLabel.setMaterial(0, cc.Material.getBuiltinMaterial(value ? '2d-sprite' : '2d-gray-sprite'))
                // }

                // 设置子节点的显示shader
                let sprites = this.node.getComponentsInChildren(cc.Sprite);
                for (const sp of sprites) {
                    sp.setMaterial(0, cc.Material.getBuiltinMaterial(value ? '2d-sprite' : '2d-gray-sprite'))
                }
                let labels = this.node.getComponentsInChildren(cc.Label);
                for (const lb of labels) {
                    lb.setMaterial(0, cc.Material.getBuiltinMaterial(value ? '2d-sprite' : '2d-gray-sprite'))
                }
            }
        }
    },
});
