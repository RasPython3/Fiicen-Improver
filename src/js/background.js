// handle data saver
chrome.storage.local.get({
  datasaver: false,
}, (items)=>{
  // initialize
  if (items.datasaver) {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [],
      enableRulesetIds: ["datasaver"]
    }).then().catch();
  } else {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ["datasaver"],
      enableRulesetIds: []
    }).then().catch();
  }
});

chrome.storage.local.onChanged.addListener(
  (changes)=>{
    if (changes.datasaver != undefined) {
      if (changes.datasaver.newValue) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: [],
          enableRulesetIds: ["datasaver"]
        }).then().catch(console.error);
      } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ["datasaver"],
          enableRulesetIds: []
        }).then().catch(console.error);
      }
    }
  }
);

// handle messages from injected.js
chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab.id

  if (!tabId) {
    return;
  }
  
  let data = JSON.parse(message);
  if (!Object.prototype.isPrototypeOf(data) || !data.request) {
    return;
  }

  let responseData = null;
  switch (data.request) {
    case "debug":
      chrome.storage.local.get({
        debug: false
      }, (items)=>{
        try {
          responseData = {id:data.id, response:"debug", value:items.debug};
        } catch {
          responseData = {id:data.id, response:"debug", value:false};
        }
        chrome.tabs.sendMessage(tabId, JSON.stringify(responseData));
      });
      return;
  }

  chrome.tabs.sendMessage(tabId, {
    message: JSON.stringify(responseData)
  });
});