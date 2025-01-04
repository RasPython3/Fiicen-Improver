var settings = {
  datasaver: document.querySelector("input[name=\"datasaver\"]")
};

chrome.storage.local.get({datasaver: false}, (items)=>{
  document.querySelector("input[name=\"datasaver\"]").checked = items.datasaver;
});

chrome.storage.local.onChanged.addListener((changes)=>{
  if (changes.datasaver != undefined) {
    settings.datasaver.checked = changes.datasaver.newValue || false;
  }
});

settings.datasaver.addEventListener("change", ()=>{
  chrome.storage.local.set({
    datasaver: settings.datasaver.checked
  }, ()=>{});
});