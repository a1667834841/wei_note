chrome.runtime.onInstalled.addListener(() => {
  cleanupStorage();
  chrome.action.setBadgeText({
    text: "OFF",
  });
  // 加载vditor
  chrome.scripting.executeScript({
    files: ["scripts/vditor/dist/index.min.js"],
  });
});

const webstore = 'https://weread.qq.com/';



chrome.action.onClicked.addListener(async (tab) => {



  if (tab.url.startsWith(webstore)) {
    const prevState = await getTabState(tab.id);
    console.log(prevState);
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';


    if (nextState === "ON") {
      // 打开笔记面板
      await openNote(tab);
    } else if (nextState === "OFF") {
      // 清理JavaScript状态和DOM
      await closeNote(tab);
    }

     // 保存新状态
     await saveTabState(tab.id, nextState);

     await chrome.action.setBadgeText({
       tabId: tab.id,
      text: nextState,
    });
  }
});


async function closeNote(tab) {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      // 查看是否有加载过scripts/wei_note.js
      console.log(`关闭笔记面板`);
      closeNotePanel();
      triggerCanvasRerender();
    }
  });

  // 移除CSS
  await chrome.scripting.removeCSS({
    target: { tabId: tab.id },
    files: ["wei-note.css"]
  });
}

async function openNote(tab) {
  
     // 先插入CSS
     await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["wei-note.css"]
    });

  // 再执行JS
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      console.log(`打开笔记面板`);
      try {
        initWeiNote();

      } catch (error) {
        // 如果发生错误，确保清理已插入的CSS
        try {
          chrome.scripting.removeCSS({
            target: { tabId: tab.id },
            files: ["wei-note.css"]
          });
        } catch (cleanupError) {
          console.error('清理CSS失败:', cleanupError);
        }
        console.error('打开笔记面板失败:', error);
        throw error;
      }
    }
  });

}

// 定期清理过期的存储数据（可选）
async function cleanupStorage() {
  const storage = await chrome.storage.local.get(null);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数

  for (const key in storage) {
    if (key.startsWith('wei-note-tab-')) {
      if (now - storage[key].timestamp > oneDay) {
        await chrome.storage.local.remove(key);
      }
    }
  }
}

// 保存tab状态到storage
async function saveTabState(tabId, state) {
  await chrome.storage.local.set({
    [`wei-note-tab-${tabId}`]: {
      state: state,
      timestamp: Date.now()
    }
  });
}

// 获取tab状态
async function getTabState(tabId) {
  const result = await chrome.storage.local.get(`wei-note-tab-${tabId}`);
  return result[`wei-note-tab-${tabId}`]?.state || 'OFF';
}

// 每天理一次存储（可选）
// setInterval(cleanupStorage, 24 * 60 * 60 * 1000);

// 添加标签页更新监听
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 只在页面完成加载时处理
  if (changeInfo.status === 'complete' && tab.url.startsWith(webstore)) {
    // 获取该标签页之前保存的状态
    const state = await getTabState(tabId);
    
    // 更新badge显示
    await chrome.action.setBadgeText({
      tabId: tabId,
      text: state
    });

    // 如果之前是开启状态，重新打开笔记面板
    if (state === 'ON') {
      await openNote(tab);
    }
  }
});