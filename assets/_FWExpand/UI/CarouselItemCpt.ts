import CarouselCpt from "./CarouselCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CarouselItemCpt extends cc.Component {
    carouselCpt: CarouselCpt = null;
    @property
    reportKey: string = "";
    public _isOpen = true;
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(value) {
        this._isOpen = value;
        if (this.carouselCpt)
            this.carouselCpt.updateView();
    }

    public ord = 0;

}
