// 适配样式
function adapterStyle() {


    // 笔记面板位置适配
    topPanelAdapter();

    // 字体自适应
    notePanelFontAdapter();

    // 在DOM变化后也触发重新渲染
    triggerCanvasRerender();

}

// 笔记面板字体自适应
function notePanelFontAdapter() {

 ;

}

// 触发canvas重新渲染
function triggerCanvasRerender() {
    // 获取canvas元素
    const canvas = document.querySelector('canvas');
    if (canvas) {
        // 方法1: 触发窗口resize事件
        window.dispatchEvent(new Event('resize'));

    }
}

// 笔记面板位置适配
function topPanelAdapter() {

    // 将阅读控制栏移动到顶部栏内
    const readerControls = document.querySelector('.readerControls');
    const readerTopBarInner = document.querySelector('.readerTopBar_inner');
    if (readerControls && readerTopBarInner) {
        // 获取第二个子元素
        const secondChild = readerTopBarInner.children[1];
        // 将readerControls插入到第二个位置
        readerTopBarInner.insertBefore(readerControls, secondChild);
    }
}