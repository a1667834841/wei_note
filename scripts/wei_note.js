function createNotePanel() {
    // 检查是否已存在笔记面板
    const weiNote = document.querySelector('.wei-note-iframe');
    if (weiNote) {
        // 添加 display: block
        weiNote.style.display = 'block';
        return;
    }

    // 获取 readerControls_item isHorizontalReader
    const readerControlsItem = document.querySelector('.readerControls_item.isHorizontalReader');
    if (readerControlsItem) {
        alert('请切换成上下滚动阅读模式');
        throw new Error('请切换成上下滚动阅读模式');
    }

    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'wei-note-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.right = '0';
    iframe.style.width = '50%';
    iframe.style.height = '100%';
    iframe.style.zIndex = '-1';
    iframe.style.border = 'none';
    
    // 设置iframe的src为wei_note.html
    iframe.src = chrome.runtime.getURL('scripts/wei_note.html');

    // 将iframe添加到页面
    document.body.appendChild(iframe);

    // 等待iframe加载完成后发送消息初始化Vditor
    iframe.onload = () => {
        iframe.contentWindow.postMessage({
            type: 'loadVditor'
        }, 'https://weread.qq.com');
    };

    return iframe;
}

// 检查是否存在横向阅读按钮并点击
function checkHorizontalReader() {
    const horizontalReader = document.querySelector('.readerControls_item.isHorizontalReader');
    if (horizontalReader) {
        horizontalReader.click();
    }
}

// 初始化函数
function initWeiNote() {
    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', createNotePanel);

    // 监听页面变化，确保在动态加载内容时也能正确显示
    if (!window.weiNoteObserver) {
        window.weiNoteObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    // 创建笔记面板
                    createNotePanel();

                    // 适配样式
                    adapterStyle();
                }
            }
        });

        // 开始观察页面变化
        window.weiNoteObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 标记已初始化
    window.weiNoteInitialized = true;
}

// 关闭笔记面板以及移除相关js
function closeNotePanel() {
    // 移除观察器
    if (window.observer) {
        window.observer.disconnect();
    }

    //  wei-note-iframe 
    const weiNote = document.querySelector('.wei-note-iframe');
    if (weiNote) {
        // 添加 display: none
        weiNote.style.display = 'none';
    }

    // 移除全局变量
    delete window.weiNoteInitialized;
    delete window.weiNoteObserver;
}

