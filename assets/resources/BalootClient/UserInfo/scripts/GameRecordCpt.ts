import PopupGameRecordCpt from "./PopupGameRecordCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameRecordCpt extends cc.Component {

    // @property(cc.Node)
    // listViewNode: cc.Node = null;
    // @property(cc.SpriteAtlas)
    // hallAtlas: cc.SpriteAtlas = null;
    @property(cc.Prefab)
    recordPrefab: cc.Prefab = null;

    @property(cc.PageView)
    pageView: cc.PageView = null;
    @property(cc.Node)
    pageNode: cc.Node = null;

    private uid: number;
    private favorite_games: any[] = [];
    allGameData: any[] = [];
    itemNodeList: cc.Node[] = [];
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.pageNode.active = false;
        this.allGameData = this.getGameList();
        // 数据分页
        let pageData = [];
        while (this.allGameData.length > 0) {
            pageData.push(this.allGameData.splice(0, 10));
        }
        // 生成所有游戏记录的入口
        for (const item of pageData) {
            let onePageNode = cc.instantiate(this.pageNode);
            onePageNode.active = true;
            // onePageNode.position = cc.v3(0, 0)
            cc.find("item", onePageNode).active = false;
            for (const gameid of item) {
                let itemNode = cc.instantiate(cc.find("item", onePageNode))
                itemNode.parent = onePageNode;
                itemNode.active = true;
                itemNode.on("click", this.onClickItem.bind(this, gameid), this);
                itemNode["gameid"] = gameid;
                this.itemNodeList.push(itemNode);
            }
            this.pageView.addPage(onePageNode);
        }
        this.updateView();
    }

    getGameList() {
        return Global.deepClone(cc.vv.UserConfig.allGameIds()).filter((gameid) => {
            for (const data of cc.vv.UserManager.gameList) {
                if (data.id == gameid) return true;
            }
            return false;
        });
    }


    onInit(uid) {
        this.uid = uid;
    }

    setLikeGame(favorite_games) {
        this.favorite_games = favorite_games;
        // this.updateView();
        for (const item of this.itemNodeList) {
            let gameid = item["gameid"];
            cc.find("like", item).active = this.favorite_games.indexOf(gameid) >= 0;
        }
    }


    updateView() {
        for (const item of this.itemNodeList) {
            let gameid = item["gameid"];
            cc.vv.UserConfig.setGameIconFrame(cc.find("icon", item).getComponent(cc.Sprite), gameid);
            cc.vv.UserConfig.setGameTitleFrame(cc.find("label", item).getComponent(cc.Sprite), gameid);
        }
    }

    onClickItem(gameid) {
        // 查看战绩
        cc.vv.PopupManager.addPopup(this.recordPrefab, {
            opacityIn: true,
            onShow: (node: cc.Node) => {
                node.getComponent(PopupGameRecordCpt).onInit(this.uid, gameid)
            }
        })
    }

}
