const { ccclass, property } = cc._decorator;

@ccclass
export default class ID extends cc.Component {

    @property
    id: string = '';

}
