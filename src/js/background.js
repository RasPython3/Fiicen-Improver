var dataSaving = false;
const badgeRegExp = /fiicen.jp\/_next\/image[?]url[=](developer|tester|user)(?:[&](?:w|q)[=][^&]*)+$/;
const datasaverRegExp = /fiicen.jp\/_next\/image[?]url[=](?:http|https)[%][^&]*?[^_](?:[?&](?:w|q)[=][^&=]*)+$/;
const datasaverExceptRegExp = /fiicen.jp\/_next\/image[?]url[=]http[%]3[aA][%]2[fF][%]2[fF]localhost[%]3[aA]8000[%]2[fF]media[%]2[fF]user[%]2[fF][^&]*?(?:[&](?:w|q)[=][^&]*)+$/;

function webRequestHandler(details) {
  let badgeMatch = details.url.match(badgeRegExp);
  let datasaverMatch;
  let datasaverExceptMatch;
  if (dataSaving && details.type != "main_frame") {
    datasaverMatch = details.url.match(datasaverRegExp);
    datasaverExceptMatch = details.url.match(datasaverExceptRegExp);
  }
  if (badgeMatch) {
    return {
      redirectUrl: chrome.runtime.getURL("/images/badges/" + badgeMatch[1] + ".svg")
    };
  } else if (datasaverExceptMatch) {
    let redirectUrl = new URL(details.url);
    redirectUrl.searchParams.set("_", "");
    redirectUrl.searchParams.set("w", 64);
    return {
      redirectUrl: redirectUrl.href
    };
  } else if (datasaverMatch) {
    let redirectUrl = new URL(details.url);
    redirectUrl.searchParams.set("w", 16);
    redirectUrl.searchParams.set("q", 75);
    return {
      redirectUrl: redirectUrl.href
    };
  }
}

chrome.storage.local.get({
  datasaver: false,
}, (items)=>{
  // initialize
  try {
    dataSaving = items.datasaver;
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
  } catch {
    // declarativeNetRequest API is unavailable
    chrome.webRequest.onBeforeRequest.addListener(
      webRequestHandler,
      {
        urls:[
          "https://fiicen.jp/_next/image[?]url[=](developer|tester|user)(?:[&](?:w|q)[=][^&]*)+",
          "https://fiicen.jp/_next/image[?]url[=](?:http|https)[%][^&]*?[^_](?:[?&](?:w|q)[=][^&=]*)+",
          "https://fiicen.jp/_next/image[?]url[=]http[%]3[aA][%]2[fF][%]2[fF]localhost[%]3[aA]8000[%]2[fF]media[%]2[fF]user[%]2[fF][^&]*?(?:[&](?:w|q)[=][^&]*)+"
        ],
        types:["image", "other", "sub_frame"]
      },
      ["blocking"]
    );
  }
});

chrome.storage.local.onChanged.addListener(
  (changes)=>{
    if (changes.datasaver != undefined) {
      if (changes.datasaver.newValue) {
        dataSaving = true;
        chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: [],
          enableRulesetIds: ["datasaver"]
        }).then().catch(console.error);
      } else {
        dataSaving = false;
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