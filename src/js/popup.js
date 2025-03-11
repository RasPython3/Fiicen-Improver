var settings = {
  datasaver: document.querySelector("input[name=\"datasaver\"]"),
  debug: document.querySelector("input[name=\"debug\"]")
};

chrome.storage.local.get({datasaver: false, debug: false}, (items)=>{
  document.querySelector("input[name=\"datasaver\"]").checked = items.datasaver;
  document.querySelector("input[name=\"debug\"]").checked = items.debug;
});

chrome.storage.local.onChanged.addListener((changes)=>{
  if (changes.datasaver != undefined) {
    settings.datasaver.checked = changes.datasaver.newValue || false;
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

settings.debug.addEventListener("change", ()=>{
  chrome.storage.local.set({
    debug: settings.debug.checked
  }, ()=>{});
});