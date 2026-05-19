var settings = {
  datasaver: document.querySelector("input[name=\"datasaver\"]"),
  asyncNotification: document.querySelector("input[name=\"asyncNotification\"]"),
  defaultHome: document.querySelector("select[name=\"defaultHome\"]"),
  debug: document.querySelector("input[name=\"debug\"]")
};

if (window.KAGI) {
  settings.datasaver.disabled = true;
}

chrome.storage.local.get({datasaver: false, asyncNotification: true, defaultHome: "/home", debug: false}, (items)=>{
  document.querySelector("input[name=\"datasaver\"]").checked = items.datasaver;
  document.querySelector("input[name=\"asyncNotification\"]").checked = items.asyncNotification;
  document.querySelector("select[name=\"defaultHome\"]").value = items.defaultHome;
  document.querySelector("input[name=\"debug\"]").checked = items.debug;
});

chrome.storage.local.onChanged.addListener((changes)=>{
  if (changes.datasaver != undefined) {
    settings.datasaver.checked = changes.datasaver.newValue || false;
  }
  if (changes.asyncNotification != undefined) {
    settings.asyncNotification.checked = changes.asyncNotification.newValue || false;
  }
  if (changes.defaultHome != undefined) {
    settings.defaultHome.value = changes.defaultHome.newValue || "";
  }
  if (changes.debug != undefined) {
    settings.debug.checked = changes.debug.newValue || false;
  }
});

settings.datasaver.addEventListener("change", ()=>{
  chrome.storage.local.set({
    datasaver: settings.datasaver.checked
  }, ()=>{});
});

settings.asyncNotification.addEventListener("change", ()=>{
  chrome.storage.local.set({
    asyncNotification: settings.asyncNotification.checked
  }, ()=>{});
});

settings.defaultHome.addEventListener("change", ()=>{
  chrome.storage.local.set({
    defaultHome: settings.defaultHome.value == "/home/following" ? "/home/following" : "/home"
  }, ()=>{});
});

settings.debug.addEventListener("change", ()=>{
  chrome.storage.local.set({
    debug: settings.debug.checked
  }, ()=>{});
});