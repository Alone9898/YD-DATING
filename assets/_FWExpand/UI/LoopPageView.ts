const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.PageView)
export default class LoopPageView extends cc.Component {

    private pageView: cc.PageView;

    onLoad() {
        this.pageView = this.getComponent(cc.PageView);
        let pages = this.pageView.getPages();
        // 复制两份
        for (const itemPage of pages) {
            this.pageView.addPage(cc.instantiate(itemPage));
        }
        for (const itemPage of pages) {
            this.pageView.addPage(cc.instantiate(itemPage));
        }

        // TODO

        // let exPageFrist = cc.instantiate(pages[0])
        // let exPageLast = cc.instantiate(pages[pages.length - 1])
        // // 复制最后一页 加入到第一页
        // // 复制第一页 加入最后一页
        // this.pageView.insertPage(exPageLast, 0);

        // 设置当前页面索引
        // this.pageView.setCurrentPageIndex(1);

        this.pageView.node.on("page-end", (pageView: cc.PageView) => {
            cc.log(pageView.getCurrentPageIndex())
            // 如果已经达到第一个或者最后一个则交换
            if (pageView.getCurrentPageIndex() == 0) {
                // cc.log("已经达到第一个");
                // let page = pageView.getPages();
                // let lastPage = page[page.length - 1];
                // pageView.removePageAtIndex(page.length - 1);
                // pageView.insertPage(lastPage, 0);
                // pageView.setCurrentPageIndex(1);
                // page.unshift(lastPage);
            } else if (pageView.getCurrentPageIndex() == pageView.getPages().length - 1) {
                // cc.log("已经达到最后一个");
            }
        });

        // // 开启自动滑动
        // this.schedule(this.nextPage, 1);
    }

    nextPage() {
        let index = this.pageView.getCurrentPageIndex();
        this.pageView.scrollToPage(++index, 1);
    }

}
