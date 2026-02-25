cc.Class({
    extends: cc.Component,

    editor: {
        disallowMultiple: false,
        menu: '通用/竖屏安全区域组件',
        requireComponent: cc.Widget,
    },

    onEnable() {
        this.updateArea();
        cc.view.on('canvas-resize', this.updateArea, this);
    },

    onDisable() {
        cc.view.off('canvas-resize', this.updateArea, this);
    },

    /**
     * !#en Adapt to safe area
     * !#zh 立即适配安全区域
     * @method updateArea
     * @example
     * let safeArea = this.node.addComponent(cc.SafeArea);
     * safeArea.updateArea();
     */
    updateArea() {
        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {

        }
        else {
            return
        }
        let widget = this.node.getComponent(cc.Widget);
        if (!widget) {
            return;
        }
        if (CC_EDITOR) {
            widget.top = widget.bottom = widget.left = widget.right = 0;
            widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
            return;
        }
        widget.updateAlignment();
        let lastPos = this.node.position;
        let lastAnchorPoint = this.node.getAnchorPoint();
        //
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        let screenWidth = cc.winSize.width, screenHeight = cc.winSize.height;
        let safeArea = cc.sys.getSafeAreaRect();

        cc.log(cc.js.formatStr('【winSize】height=%s,width=%s', screenHeight, screenWidth))
        cc.log(cc.js.formatStr('【safeArea】height=%s,width=%s,x=%s,y=%s', safeArea.height, safeArea.width, safeArea.x, safeArea.y))

        widget.top = screenHeight - (safeArea.y + safeArea.height);
        widget.bottom = 0; //直接取0,因为在iphoneX中 取出来的
        widget.left = safeArea.x;
        widget.right = screenWidth - (safeArea.x + safeArea.width);
        widget.updateAlignment();
        // set anchor, keep the original position unchanged
        let curPos = this.node.position;
        let anchorX = lastAnchorPoint.x - (curPos.x - lastPos.x) / this.node.width;
        let anchorY = lastAnchorPoint.y - (curPos.y - lastPos.y) / this.node.height;
        this.node.setAnchorPoint(anchorX, anchorY);
        // IMPORTANT: restore to lastPos even if widget is not ALWAYS
        widget.enabled = true;
    }
});
