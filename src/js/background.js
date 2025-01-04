// handle data saver
chrome.storage.local.get({
  datasaver: false
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
