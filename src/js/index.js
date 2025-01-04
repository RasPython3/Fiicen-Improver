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
      try {
        responseData = {id:data.id, response:"extURL", value:chrome.runtime.getURL(data.value)};
      } catch {
        responseData = {id:data.id, response:"extURL", value:""};
      }
      break;
  }
  let response = new CustomEvent("ext-message", {
    detail: JSON.stringify(responseData)
  });
  window.dispatchEvent(response);
});
