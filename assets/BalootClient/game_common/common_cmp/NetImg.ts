import { NetResLoader } from "./NetResLoader";

const { ccclass, property, executeInEditMode, disallowMultiple, requireComponent, menu } = cc._decorator;

/**
 * 图片类型
 */
export enum NetImgType {
    net = 1,    // 网络图片
    local = 2,  // 本地图片
    atlas = 3   // 图集
}

@ccclass
@executeInEditMode
@requireComponent(cc.Sprite)
@disallowMultiple
@menu("通用/NetImg")
export default class NetImg extends cc.Component {
    @property({ type: cc.Enum(NetImgType) })
    imgType = NetImgType.net;

    @property({
        displayName: "本地路径",
        visible() { return this.imgType == NetImgType.local }
    })
    localPath = "";

    @property({
        type: cc.SpriteAtlas,
        visible() { return this.imgType == NetImgType.atlas }
    })
    imgAtlas: cc.SpriteAtlas = null;

    @property({
        type: cc.Sprite,
        displayName: "默认图片"
    })
    imgSprite: cc.Sprite = null;

    @property({
        displayName: "是否自动显示隐藏图片"
    })
    autoVisible: boolean = true;

    _url: string = "";
    @property({
        type: cc.String,
        displayName: "url地址",
        tooltip: "net:网络图片地址 local:本地图片名字 atlas:图集中的图片名字"
    })
    get url(): string {
        return this._url;
    }
    set url(url: string) {
        if (this._url == url) {
            return;
        }
        this._url = url;
        if (this.autoVisible && this.imgType == NetImgType.net && this._checkValid(this.imgSprite)) {
            this.imgSprite.node.active = false;
        }
        if(this._netResLoader) {
            this._netResLoader.break();
            this._netResLoader = null;
        }
        this._loadImg();
    }

    _netResLoader:NetResLoader = null;

    onLoad() {
        if (!this.imgSprite) {
            this.imgSprite = this.node.getComponent(cc.Sprite);
        }
        if(this.imgSprite) {
            if(this.autoVisible) {
                this.imgSprite.node.active = this._checkValid(this.imgSprite);
            }
        }else {
            console.log("#error# NetImg 找不到cc.Sprite");
        }
    }

    protected onDestroy(): void {
        if(this._netResLoader) {
            this._netResLoader.break();
            this._netResLoader = null;
        }
    }

    /**
     * 加载本地图片
     */
    _loadLocalImg(localUrl: string, cmpHandler: (result: any) => void = null) {
        this.localPath.endsWith("")
        localUrl = this.localPath + (this.localPath.endsWith("/") ? "" : "/") + localUrl;
        cc.loader.loadRes(localUrl, cc.SpriteFrame, (err, spf) => {
            if (!err) {
                if (this._checkValid(this.imgSprite) && spf) {
                    this.autoVisible && (this.imgSprite.node.active = true);
                    this.imgSprite.spriteFrame = spf;
                    cmpHandler && cmpHandler(true);
                }else {
                    cc.log("#图片节点失效#");
                }
            } else {
                cc.log("加载本地图片失败:", localUrl);
                cmpHandler && cmpHandler(false);
            }
        })
    }

    _loadImg(cmpHandler: (result: any) => void = null) {
        if (!this._checkValid(this.imgSprite)) {
            return;
        }
        if (!this.url) {
            if (this.autoVisible) {
                this.imgSprite.node.active = false;
            }
            return;
        }
        switch (this.imgType) {
            case NetImgType.net:
                let url = this.url;
                var arrStr = url.split('/')
                var filename = arrStr[arrStr.length - 1]
                let req = { url: url, ignoreMaxConcurrency: true }
                if (filename.indexOf('.') < 0) {
                    req['type'] = "jpg";
                }
                if(this._netResLoader) {
                    this._netResLoader.break();
                }
                this._netResLoader = new NetResLoader();
                this._netResLoader.request(req, (err, res)=>{
                    if (!err) {
                        if (this._checkValid(this.imgSprite) && res) {
                            this.autoVisible && (this.imgSprite.node.active = true);
                            let sprf = new cc.SpriteFrame(<any>res);
                            this.imgSprite.spriteFrame = sprf;
                            cmpHandler && cmpHandler(true);
                        } else {
                            cc.log("#图片节点失效#");
                        }
                    } else {
                        cc.log("图像加载失败出错");
                        cc.log(err);
                        if (this.autoVisible && this._checkValid(this.imgSprite)) {
                            this.imgSprite.node.active = false;
                        }
                        cmpHandler && cmpHandler(false);
                    }
                }, 2);
                break;
            case NetImgType.local:
                this._loadLocalImg(this.url, cmpHandler);
                break;
            case NetImgType.atlas:
                if (this._checkValid(this.imgSprite) && this.imgAtlas) {
                    this.autoVisible && (this.imgSprite.node.active = true);
                    this.imgSprite.spriteFrame = this.imgAtlas.getSpriteFrame(this.url);
                }
                break;
        }
    }

    _checkValid(val:cc.Sprite|cc.Node) {
        if(val instanceof cc.Sprite) {
            return cc.isValid(val) && cc.isValid(val.node);
        }else {
            return cc.isValid(val);
        }
    }

    /**
     * 加载图片附带完成回调
     */
    loadUrl(url: string, cmpHandler: (result: any) => void = null) {
        if (url == this._url) {
            cmpHandler && cmpHandler(true);
            return;
        }
        this._url = url;
        if (this.autoVisible && this.imgType == NetImgType.net && this._checkValid(this.imgSprite)) {
            this.imgSprite.node.active = false;
        }
        if(this._netResLoader) {
            this._netResLoader.break();
            this._netResLoader = null;
        }
        if (this._url) {
            this._loadImg(cmpHandler);
        }
    }

    setUrlValue(url: string) {
        this._url = url
    }

}