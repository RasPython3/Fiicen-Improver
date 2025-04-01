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
        let targetUrl = new URL(data.value);
        for (let el of document.body.querySelectorAll(`img[srcset~=\"${targetUrl.href}\"], img[srcset~=\"${targetUrl.pathname+targetUrl.search}\"]`)) {
          el.setAttribute("_src", el.src);
          el.setAttribute("_srcset", el.srcset);
          el.removeAttribute("srcset");
          el.src = data.replacer;
        }
      }
      return;
    case "debug":
      chrome.runtime.sendMessage(JSON.stringify(data));
      return;
  }
  let response = new CustomEvent("ext-message", {
    detail: JSON.stringify(responseData)
  });
  window.dispatchEvent(response);
});

chrome.runtime.onMessage.addListener((message) => {
  let response = new CustomEvent("ext-message", {
    detail: message
  });
  window.dispatchEvent(response);
});