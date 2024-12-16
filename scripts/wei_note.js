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
        // 监听主题变化
        observeThemeChanges();
    };

    return iframe;
}


// 初始化函数
function initWeiNote() {
    
      // 创建笔记面板
      createNotePanel();

      // 适配样式
      adapterStyle();


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
        // 移除iframe
        weiNote.remove();
    }

    // 移除全局变量
    delete window.weiNoteInitialized;
    delete window.weiNoteObserver;
}

// 监听主题变化
function observeThemeChanges() {
    const readerControlsItems = document.querySelectorAll('.readerControls_item');

    if (readerControlsItems.length == 0) {
        return;
    }

    let readerControlsThemeItem = readerControlsItems[readerControlsItems.length - 1];

    if (!readerControlsThemeItem) {
        return;
    }

    // 默认主题
    chrome.runtime.sendMessage({
        type: 'themeChange',
        isDark: !readerControlsThemeItem.className.includes('dark')
    });

    
    readerControlsThemeItem.addEventListener('click', () => {
        const isDark = readerControlsThemeItem.className.includes('dark');
        chrome.runtime.sendMessage({
            type: 'themeChange',
            isDark: !isDark
        });
    });
}



