
const {ccclass, property} = cc._decorator;

@ccclass
export default class Desk_Table_code extends cc.Component {

    @property(cc.Label)
    codeLbl:cc.Label;

    @property(cc.Button)
    copyBtn:cc.Button;

    _deskid:0;
    set deskid(value){
        this._deskid = value;
        this.codeLbl.string = this._deskid + "";
    }
    get deskid(){
        return this._deskid;
    }

    protected onLoad(): void {
        this.copyBtn.node.on("click", this.onClickCopy, this);
    }

    onClickCopy() {
        if (CC_DEBUG) {
            cc.log("COPY: ", this.deskid)
        }
        cc.vv.FloatTip.show(___("Copy successfully! invite your friends now!"));
        cc.vv.PlatformApiMgr.Copy(this.deskid + "");
    }

    // update (dt) {}
}
