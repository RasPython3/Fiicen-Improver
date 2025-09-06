console.log("startup start");

const config = {
    attributes: true,
    childList: false,
    subtree: false,
    attributeOldValue: true
};

// change color theme

const isDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : undefined;

function changeTheme() {
    if (isDark) {
        const classList = document.documentElement.classList;
        if (classList.contains("dark") && !classList.contains("system-dark")) {
            classList.replace("dark", "application-dark");
        } else if(!classList.contains("dark") && classList.contains("system-dark")) {
            classList.remove("application-dark");
        }
        if (isDark.matches) {
            classList.add("dark", "system-dark");
        } else {
            classList.remove("dark", "system-dark");
        }
    }
}

function onSystemThemeChange(ev) {
    changeTheme();
}

const observer = new MutationObserver((mutationList, observer)=>{
    for (const mutation of mutationList) {
        if (mutation.type === "attributes" && mutation.attributeName == "class") {
            console.log(mutation);
            observer.disconnect();
            changeTheme();
            observer.observe(mutation.target, config);
        }
    }
});


chrome.storage.local.get({
    systemTheme: false,
}, (items)=>{
    // initialize
    if (items.systemTheme) {
        isDark.addEventListener("change", onSystemThemeChange);
        changeTheme();
        observer.observe(document.documentElement, config);
    }
});

chrome.storage.local.onChanged.addListener(
    (changes)=>{
        if (changes.systemTheme != undefined) {
            if (changes.systemTheme.newValue) {
                isDark.addEventListener("change", onSystemThemeChange);
                changeTheme();
                observer.observe(document.documentElement, config);
            } else {
                isDark.removeEventListener("change", onSystemThemeChange);
                observer.disconnect();
                document.documentElement.classList.remove("dark", "system-dark");
                document.documentElement.classList.replace("application-dark", "dark");
            }
        }
    }
);