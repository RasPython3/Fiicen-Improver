var dataSaving = false;
const badgeRegExp = /fiicen.jp\/_next\/image[?]url[=](developer|tester|user)(?:[&](?:w|q)[=][^&]*)+$/;
const datasaverRegExp = /fiicen.jp\/_next\/image[?]url[=](?:http|https)[%][^&]*?[^_](?:[?&](?:w|q)[=][^&=]*)+$/;
const datasaverExceptRegExp = /fiicen.jp\/_next\/image[?]url[=]http[%]3[aA][%]2[fF][%]2[fF]localhost[%]3[aA]8000[%]2[fF]media[%]2[fF]user[%]2[fF][^&]*?(?:[&](?:w|q)[=][^&]*)+$/;

function webRequestHandler(details) {
  let badgeMatch = details.url.match(badgeRegExp);
  let datasaverMatch;
  let datasaverExceptMatch;

  let doCancel = false;
  let redirectUrl;

  if (dataSaving && details.type != "main_frame") {
    datasaverMatch = details.url.match(datasaverRegExp);
    datasaverExceptMatch = details.url.match(datasaverExceptRegExp);
  }
  if (badgeMatch) {
    switch (badgeMatch[1]) {
      case "developer":
        redirectUrl = "data:image/svg+xml;base64,/*developer badge base64*/";
        break;
      case "tester":
        redirectUrl = "data:image/svg+xml;base64,/*tester badge base64*/";
        break;
      case "user":
        redirectUrl = "data:image/svg+xml;base64,/*user badge base64*/";
        break;
    }
    doCancel = true;
  } else if (datasaverExceptMatch) {
    redirectUrl = new URL(details.url);
    redirectUrl.searchParams.set("_", "");
    redirectUrl.searchParams.set("w", 64);
    doCancel = true;
  } else if (datasaverMatch) {
    redirectUrl = new URL(details.url);
    if (redirectUrl.searchParams.get("w") != "16") {
      redirectUrl.searchParams.set("w", 16);
      redirectUrl.searchParams.set("q", 75);
      doCancel = true;
    }
  }

  if (doCancel) {
    chrome.tabs.sendMessage(details.tabId, JSON.stringify({
      id: undefined,
      request: "webRequestReplace",
      value: details.url,
      replacer: (redirectUrl && redirectUrl.href ? redirectUrl.href : redirectUrl)
    }));
    return {
      cancel: true
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
          "https://fiicen.jp/_next/image",
          "https://www.fiicen.jp/_next/image",
          "https://*.fiicen.jp/_next/image",
          "*://*.fiicen.jp/_next/image",
          "https://fiicen.jp/_next/image?*",
          "https://www.fiicen.jp/_next/image?*",
          "https://*.fiicen.jp/_next/image?*",
          "*://*.fiicen.jp/_next/image?*"
        ]
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
    case "setSettings":
      {
        let settings = data.value;
        if (settings.hasOwnProperty("datasaver")) {
          chrome.storage.local.set({
            datasaver: settings.datasaver
          }, ()=>{});
        }
        if (settings.hasOwnProperty("debug")) {
          chrome.storage.local.set({
            debug: settings.debug
          }, ()=>{});
        }
      }
      chrome.tabs.sendMessage(tabId, JSON.stringify({
        id: data.id, response: "setSettings", value: true
      }));
      return;
    case "getSettings":
      chrome.storage.local.get({
        datasaver: false,
        debug: false
      }, (items)=>{
        responseData = {
          id: data.id,
          response: "getSettings",
          value: items
        };
        chrome.tabs.sendMessage(tabId, JSON.stringify(responseData));
      });
      return;
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