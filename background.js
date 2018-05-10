/* global chrome */
/* eslint semi: [2, 'always'] */

chrome.contextMenus.create({
  title: '色を取得',
  type: 'normal',
  contexts: ['image'],
  onclick(info) {
    const srcUrl = encodeURIComponent(info.srcUrl);
    srcMap[info.srcUrl] = srcUrl;
    chrome.tabs.create({ url: `color.html?srcUrl=${info.srcUrl}` });
  }
});

let srcMap = {};
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.displayName === "popup") {
      srcMap[request.fileName] = request.src;
      chrome.tabs.create({ url: `color.html?srcUrl=${request.fileName}` }, function (tab) {
        sendResponse({ result: "complete", message: `complete` });
      });
    }

    if (request.displayName === "color") {
      sendResponse(srcMap[request.fileName]);
    }
    return true;
  });