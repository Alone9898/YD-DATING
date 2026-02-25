
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        Global.btnClickEvent(cc.find("bottom/tog_menu/toggle1",this.node),this.onClickToggle1,this);
        Global.btnClickEvent(cc.find("bottom/tog_menu/toggle2",this.node),this.onClickToggle2,this);
        Global.btnClickEvent(cc.find("bottom/tog_menu/toggle3",this.node),this.onClickToggle3,this);
        Global.btnClickEvent(cc.find("bottom/tog_menu/toggle4",this.node),this.onClickToggle4,this);

        // Global.btnClickEvent(cc.find("bottom/btn_back",this.node),this.onClickBack,this);

        // this.showPanel("Login");

        Global.registerEvent("Bonus_Tab",this.onShowTab,this)
    },

    start () {
        this._showDefaultPage()
    },

    //显示默认展示的页面
    _showDefaultPage(){
        let bPro = cc.vv.UserManager.isBonusPromOpen()
        let panel = "Login"
        let idx = 3
        let nWidth = 305
        this._selXpos = [0,-295,0,295]
        let selIdx = 2
        let togXPos = [0,305,-305,0]
        if(bPro){
            panel = "Prom"
            idx = 4
            nWidth = 235
            this._selXpos = [-346,-117.5,117.5,346]
            selIdx = 1
            togXPos = [117.5,352.5,-117.5,-352.5,]
        }
        for(let i=1; i < 5; i++){
            let item = cc.find("bottom/tog_menu/toggle"+i,this.node)
            item.width = nWidth
            item.x = togXPos[i-1]
            if(i==4){
                item.active = bPro
            }
        }

        let btn_sel = cc.find("bottom/tog_menu/tab_sel",this.node)
        btn_sel.width = nWidth+5
        
        this.showPanel(panel)
        this.showBtnSel(selIdx)
    },

    onClickToggle1(){
        // let tog = cc.find("bottom/tog_menu/toggle1",this.node);
        // let bCheck = tog.getComponent(cc.Toggle).isChecked;

        this.showPanel("betting")
        this.showBtnSel(3)
    },

    onClickToggle2(){
        this.showPanel("task")
        this.showBtnSel(4)
    },

    onClickToggle3(){
        this.showPanel("Login")
        this.showBtnSel(2)
    },

    onClickToggle4(){
        this.showPanel("Prom")
        this.showBtnSel(1)
    },

    showPanel(type){
        cc.find("panel_return", this.node).active = type == "betting";
        cc.find("bottom/tog_menu/toggle1",this.node).getComponent(cc.Toggle).isChecked = type == "betting";
        cc.find("panel_task", this.node).active = type == "task";
        cc.find("bottom/tog_menu/toggle2",this.node).getComponent(cc.Toggle).isChecked = type == "task";
        cc.find("PageLogin", this.node).active = type == "Login";
        cc.find("bottom/tog_menu/toggle3",this.node).getComponent(cc.Toggle).isChecked = type == "Login";
        cc.find("PageProm", this.node).active = type == "Prom";
        cc.find("bottom/tog_menu/toggle4",this.node).getComponent(cc.Toggle).isChecked = type == "Prom";
    },

    // onClickBack(){
    //     cc.vv.PopupManager.removePopup(this.node);
    // },

    showBtnSel(idx){
        
        let btn_sel = cc.find("bottom/tog_menu/tab_sel",this.node)
        btn_sel.active = true
        btn_sel.x = this._selXpos[idx-1]
    },

    onShowTab:function(data){
        let val = data.detail
        if(val == 1){
            this.onClickToggle1()
        }
        else if(val == 2){
            this.onClickToggle2()
        }
        else if(val == 3){
            this.onClickToggle3()
        }
        else if(val == 4){
            this.onClickToggle4()
        }
    }

    // update (dt) {},
});
