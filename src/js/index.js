// inject injected.js
const injectedScript = document.createElement("script");
injectedScript.src = chrome.runtime.getURL("js/injected.js");
document.body.insertAdjacentElement("afterbegin", injectedScript);

// inject other scripts
for (let js of [
    {
      path: "js/qrcode.js",
      async: false
    }])
  {
  let script = document.createElement("script");
  script.src = chrome.runtime.getURL(js.path);
  if (js.async) {
    script.setAttribute("async", "");
  }
  document.body.insertAdjacentElement("afterbegin", script);
}

// handle messages from injected.js
window.addEventListener("ext-message", (ev)=>{
  let data = JSON.parse(ev.detail);
  if (!Object.prototype.isPrototypeOf(data) || !data.request) {
    return;
  }
  let responseData = null;
  switch (data.request) {
    case "extURL":
      if (data.value == "qr-button.html" && window.KAGI != undefined) {
        responseData = {id:data.id, response:"extURL", /*qr-button.html*/};
      } else if (data.value == "images/quoteCircle.svg" && window.KAGI != undefined) {
        responseData = {id:data.id, response:"extURL", /*quoteCircle.svg*/};
      } else {
        try {
          responseData = {id:data.id, response:"extURL", value:chrome.runtime.getURL(data.value)};
        } catch {
          responseData = {id:data.id, response:"extURL", value:""};
        }
      }
      break;
    case "webRequestReplace":
      {
        let alertPopup = document.createElement("span");
        alertPopup.className = "alert-moment accent-bg";
        alertPopup.innerText = `webRequestReplace\nfrom: ${data.value}\nto: ${data.replacer}`;
        alertPopup.addEventListener("animationend", (ev)=>{
            alertPopup.remove();
        }, {once: true});
        document.body.append(alertPopup);

        let targetUrl = new URL(data.value);
        for (let el of document.body.querySelectorAll(`img[srcset~=\"${targetUrl.href}\"], img[srcset~=\"${targetUrl.pathname+targetUrl.search}\"]`)) {
          el.setAttribute("_src", el.src);
          el.setAttribute("_srcset", el.srcset);
          el.removeAttribute("srcset");
          el.src = data.replacer;
        }
      }
      return;
    case "setSettings":
    case "getSettings":
    case "debug":
      chrome.runtime.sendMessage(JSON.stringify(data));
      return;
    case "version":
      responseData = {id:data.id, response:"version", value: chrome.runtime.getManifest().version};
      break;
  }
  let response = new CustomEvent("ext-message", {
    detail: JSON.stringify(responseData)
  });
  window.dispatchEvent(response);
});

chrome.runtime.onMessage.addListener((message) => {
  let data;
  try {
    data = JSON.parse(message);
  } catch {
    return;
  }
  if (Object.prototype.isPrototypeOf(data) && data.request) {
    switch (data.request) {
      case "checkNotificationCount":
        (async (NextActionValue)=>{
          let result = {};
          for (let i of [
            {
              name: "notification",
              url: "https://fiicen.jp/notification",
              body: "[\"http://localhost:8000/notifications/count\"]"
            },
            {
              name: "message",
              url: "https://fiicen.jp/message",
              body: "[\"http://localhost:8000/message/count\"]"
            },
          ]) {
            let res = await fetch(i.url, {
              method: "POST",
              body: i.body,
              headers: {
                "next-action": NextActionValue,
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
              },
              "mode": "cors",
              "credentials": "include"
            });
            result[i.name] = JSON.parse((await res.text()).match(/1:(.*)/)?.at(1) || "{}").json?.count;
          }
          chrome.runtime.sendMessage(JSON.stringify({
            request: "updateNotificationCount",
            value: JSON.stringify(result)
          }));
        })(data.value);
        return;
    }
  }
  let response = new CustomEvent("ext-message", {
    detail: message
  });
  window.dispatchEvent(response);
});