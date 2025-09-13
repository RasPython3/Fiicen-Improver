console.log("Injected Fiicen Extension's script");

console.log("check if nextjs is ready...");
var _nextjs_ready = new Promise((resolve, reject)=>{
    let __nextjs_timer_id = setInterval(()=>{
        try {
            if (document[Object.keys(document).filter(key=>key.startsWith("__reactContainer"))[0]].child != null) {
                // nextjs is ready!
                clearInterval(__nextjs_timer_id);
                console.log("nextjs is ready");
                resolve();
            }
        } catch (e) {
            // it seems like this is something like login page...
            clearInterval(__nextjs_timer_id);
            if (document.head.children.length > 1) {
                alertMoment("Failed to start injected script: " + e);
            } else {
                // error page
            }
            reject();
        }
    }, 10);
});
_nextjs_ready.catch((e)=>{}); // to prevent "Uncaught (in promise)"

window._org_fetch = window._org_fetch || window.fetch;

var _injectedjs_url = (document.currentScript || {}).src;

var _ext_ready_resolve = undefined;
var _ext_ready = new Promise((resolve, reject)=>{
    _ext_ready_resolve = resolve;
});

var _msgIds = [0];
const badgeURLs = {
    "developer": "developer",
    "tester": "tester",
    "user": "user"
};

const developer_account = "RasPython3";

const testers = [
    "nyannyan110011",
    "shiroko_bridge",
    "momizimoti",
    "Ponzu",
    "shirotarou",
    "anitoradance0210",
    "001",
    "Kawashiro",
    "yosiiiiii",
    "yuu_8313",
    "note",
    "ushii",
    "non",
    "tanasan_o38",
    "878"
];

var circleAmount = 0;

function messageExt(request, value=undefined) {
    let id = 0;
    while (_msgIds.includes(id)) {
        id = Math.ceil(Math.random() * 4096);
    }
    _msgIds.push(id);
    let promise = new Promise((resolve, reject)=>{
        let listener = (e)=>{
            let data = JSON.parse(e.detail);
            if (data.response == request && data.id == id) {
                window.removeEventListener("ext-message", listener);
                _msgIds.splice(_msgIds.indexOf(id), 1);
                resolve(data.value);
            }
        };
        window.addEventListener("ext-message", listener);
    });
    let ev = new CustomEvent("ext-message", {
        detail: JSON.stringify({request:request, value:value, id:id})
    });
    window.dispatchEvent(ev);
    return promise;
}

window.addEventListener("ext-message", (e)=>{
    let data;
    try {
        data = JSON.parse(e.detail);
    } catch {}
    if (data && data.request) {
        switch (data.request) {
            case "updateNotificationCount":
                let counts = JSON.parse(data.value);
                let notificationItem = document.querySelector("nav a[href=\"/notification\"]");
                let messageItem = document.querySelector("nav a[href=\"/message\"]");
                for (let i of [
                    {
                        name: "notification",
                        item: notificationItem
                    },
                    {
                        name: "message",
                        item: messageItem
                    }
                ]) {
                    if (!i.item || i.name == "message" && location.pathname.startsWith("/message")) {
                        continue;
                    }
                    let countBadge = i.item.querySelector("div:last-child");
                    if (counts[i.name] > 0) {
                        if (!countBadge) {
                            countBadge = document.createElement("div");
                            countBadge.className = "absolute right-0 top-0 size-5 text-center leading-5 rounded-full bg-main font-bold text-white";
                        }
                        countBadge.innerText = counts[i.name] > 99 ? "99+" : counts[i.name];
                        if (counts[i.name] > 99) {
                            countBadge.classList.add("text-[0.5rem]");
                            countBadge.classList.remove("text-xs");
                        } else {
                            countBadge.classList.add("text-xs");
                            countBadge.classList.remove("text-[0.5rem]");
                        }
                        i.item.appendChild(countBadge);
                    } else if (counts[i.name] != undefined && counts[i.name] != null) {
                        if (countBadge) {
                            countBadge.remove();
                        }
                    } else {
                        continue;
                    }
                }
            default:
                return;
        }
        e.stopImmediatePropagation();
    }
});

const urls = {}; // currently not used

const assets = {
    "qr": messageExt("extURL", "images/followQR.svg"),
    "quote": messageExt("extURL", "images/quoteCircle.svg")
};

var username = "";

function setUsername() {
    if (!username) {
        try {
            username = document.querySelector("nav > a:last-child").href.match(".*/field/([^/]+)$")[1];
        } catch {}
    } else if (location.pathname.startsWith("/login")) {
        username = "";
    }
    return username;
}

var errorBoxes;

function outputError(e) {
    console.log(e);
    try {
        let trace;
        if (typeof(e) == "string") {
            trace = `Error: ${e}`;
        } else {
            trace = `File "${e.filename}", line ${e.lineno}, col ${e.colno}\nError: ${e.message}`;
        }
        let box = document.createElement("span");
        box.innerText = trace;
        errorBoxes.append(box);
        box.onclick = ()=>{
            box.remove();
        }
        return true;
    } catch {}
}

/* エラー検証 */
messageExt("debug").then((debug)=>{
    console.log(debug);
    if (debug) {
        errorBoxes = document.createElement("div");
        errorBoxes.className = "errors";
        document.body.append(errorBoxes);
        window.addEventListener("error", (e)=>{
            if (e.filename == _injectedjs_url) {
                outputError(e);
            }
        });
    }
});

// original alert
function alertMoment(text) {
    let alertPopup = document.createElement("span");
    alertPopup.className = "alert-moment accent-bg";
    alertPopup.innerText = text;
    alertPopup.addEventListener("animationend", (ev)=>{
        alertPopup.remove();
    }, {once: true});
    document.body.append(alertPopup);
}

function modifyUser(userData) {
    console.log(userData);
    if (Object.prototype.isPrototypeOf(userData)) {
        if (!userData.badge) {
            if (userData.account_name == developer_account) {
                userData.badge = {
                    type: "extension-developer",
                    image: badgeURLs.developer
                };
            } else if (testers.includes(userData.account_name)) {
                userData.badge = {
                    type: "extension-tester",
                    image: badgeURLs.tester
                };
            } else if (userData.account_name == username) {
                userData.badge = {
                    type: "extension-user",
                    image: badgeURLs.user
                };
            }
        }
    }
    return userData;
}


var __timer_id;

function redrawCircles() {
    let circleParent = document.querySelector(":where(main:nth-child(3) > div > div > div:first-child, main:not(:nth-child(3)) > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex)");
    let updater = circleParent[Object.keys(circleParent).filter(key=>key.startsWith("__reactProps"))[0]].children.props.value;
    updater(null);
}

var _loadedCalled = false;

async function onLoaded() { // first load or nextjs's router
    // re-arrange field header
    console.log("onLoaded called");
    try {
        await _nextjs_ready;
    } catch {
        // something failed
        console.log("nextjs seems to get something wrong");
        return;
    }
    console.log("nextjs seems to be ready");
    _loadedCalled = true;
    circleAmount = 0;
    setUsername();
    if (errorBoxes && location.pathname == "/field/" + developer_account) {
        let error = new ErrorEvent("error", {
            message: "This is test.",
            filename: _injectedjs_url
        });
        window.dispatchEvent(error);
    }
    if (location.pathname.startsWith("/field/")) {
        if (location.pathname.match("\\/field\\/"+username+"(?:[?/].*)?$") && !document.querySelector("button > svg[name=\"qrcode\"]")) {
            (async ()=>{
                try {
                    // create QR code button
                    if (errorBoxes) {
                        outputError("qr 1");
                    }
                    let url = await messageExt("extURL", "qr-button.html");
                    if (errorBoxes) {
                        outputError("qr 2");
                    }
                    let text = await (await fetch(url)).text();
                    if (errorBoxes) {
                        outputError("qr 3");
                    }
                    let btn = document.createElement("div");
                    btn.innerHTML = text;
                    btn.querySelector("div[title=\"field\"]").outerHTML = new QRCode(document.createElement("div"), {text: location.href, useSVG: true})._el.innerHTML;
                    btn.querySelector("div._qrcode svg").style.border = "solid 2rem white";
                    btn.querySelector("div._qrcode svg").style.borderRadius = "1.5rem";
                    btn.children[0].addEventListener("click", ()=>{
                        btn.children[1].classList.add("bg-black/20");
                        btn.children[1].classList.remove("pointer-events-none", "bg-transparent");
                        btn.children[1].children[0].classList.remove("blur", "scale-75", "opacity-0");
                    });
                    let close = ()=>{
                        btn.children[1].classList.remove("bg-black/20");
                        btn.children[1].classList.add("pointer-events-none", "bg-transparent");
                        btn.children[1].children[0].classList.add("blur", "scale-75", "opacity-0");
                    };
                    btn.children[1].addEventListener("click", (ev)=>{
                        if (ev.target == btn.children[1]) {
                            close();
                        }
                    });
                    btn.children[1].querySelector("button").addEventListener("click", close);
                    await _ext_ready;
                    let _inject_button = setInterval(()=>{
                        if (errorBoxes) {
                            outputError("qr 4");
                        }
                        let buttons = document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))) > div.flex:has(div)");
                        if (buttons == undefined) {
                            return;
                        }
                        clearInterval(_inject_button);
                        if (errorBoxes) {
                            outputError("qr 5");
                        }
                        buttons.append(btn);
                    }, 10);
                } catch (e) {
                    outputError(e);
                }
            })();
        }
        if (!document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))) > p:nth-child(2) > img")) {
            let badgeData;
            if (location.pathname.match("/field/" + developer_account + "(?:[?/].*)?$")) {
                badgeData = {
                    type: "extension-developer",
                    image: badgeURLs.developer
                };
            } else if (testers.includes(location.pathname.replace(/\/field\/(.*)(?:[?/].*)?$/, "$1"))) {
                badgeData = {
                    type: "extension-tester",
                    image: badgeURLs.tester
                };
            } else if (location.pathname.match("/field/" + username + "(?:[?/].*)?$")) {
                badgeData = {
                    type: "extension-user",
                    image: badgeURLs.user
                };
            }
            if (badgeData) {
                (async ()=>{
                    let badge = document.createElement("img");
                    let encodedBadgeURI = encodeURIComponent(badgeData.image);
                    badge.alt = badgeData.type;
                    badge.loading = "lazy";
                    badge.width = 16;
                    badge.height = 16;
                    badge.async = true;
                    badge.className = "ml-1 size-4 inline align-middle";
                    badge.style.color = "transparent";
                    badge.srcset = "/_next/image?url=" + encodedBadgeURI + "&w=16&q=75 1x, /_next/image?url=" + encodedBadgeURI + "&w=32&q=75 2x";
                    badge.src="/_next/image?url=" + encodedBadgeURI + "&w=32&q=75";
                    await _ext_ready;
                    if (document.querySelector("div:has(> main:nth-child(3))")) {
                        // user seems to exist
                        let _inject_badge = setInterval(()=>{
                            let displayNameP = document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))) > p:nth-child(2)");
                            if (displayNameP == undefined) {
                                return;
                            }
                            clearInterval(_inject_badge);
                            displayNameP.append(badge);
                        }, 10);
                    }
                })();
            }
        }
        fetch("https://fiicen.jp/field/" + location.pathname.match(/\/field\/([^?\/]+)/)?.at(1), {
            "method": "HEAD",
        }).then((res)=>{
            if (!res.ok && res.status == 403) {
                let nextSibEl = document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))):not(:has(> div.flex > span.text-danger)) > div.grid");
                if (nextSibEl) {
                    let banned = document.createElement("div");
                    banned.className = "flex justify-center mb-2";
                    banned.append(document.createElement("span"));
                    banned.firstChild.className = "opacity-80 rounded-md second-bg text-sm px-2 py-1 text-danger";
                    banned.firstChild.innerText = "BANされています";

                    nextSibEl.insertAdjacentElement("beforebegin", banned);
                }
            }
        })
    } else if (location.pathname.startsWith("/home") || location.pathname.startsWith("/explore/") || location.pathname.startsWith("/search/") || location.pathname.startsWith("/tag/") || location.pathname.startsWith("/circle/")) {
        if (location.pathname.startsWith("/circle/")) {
            for (let circleElement of document.querySelectorAll(
                "div.min-h-screen.border-x > div:first-child > div:first-child,"
                + "div.min-h-screen.border-x > div:first-child > div:first-child > div.relative")) {
                let props;
                if (circleElement.classList.contains("relative")) {
                    props = circleElement[Object.keys(circleElement).filter((key)=>key.startsWith("__reactProps"))[0]].children.props;
                } else {
                    props = circleElement[Object.keys(circleElement).filter((key)=>key.startsWith("__reactProps"))[0]].children[1].props;
                }
                if (props.author.badge == null) {
                    props.author = modifyUser(props.author);
                    if (props.author.badge != null) {
                        let badge = document.createElement("img");
                        let encodedBadgeURI = encodeURIComponent(props.author.badge.image);
                        badge.alt = props.author.badge.type;
                        badge.loading = "lazy";
                        badge.width = 16;
                        badge.height = 16;
                        badge.async = true;
                        badge.className = "ml-1 size-4 shrink-0";
                        badge.style.color = "transparent";
                        badge.srcset = "/_next/image?url=" + encodedBadgeURI + "&w=16&q=75 1x, /_next/image?url=" + encodedBadgeURI + "&w=32&q=75 2x";
                        badge.src="/_next/image?url=" + encodedBadgeURI + "&w=32&q=75";
                        circleElement.lastChild.querySelector("div:first-child > div > a.group").append(badge);
                    }
                }
            }
        }
        clearInterval(__timer_id);
        __timer_id = setInterval(()=>{
            let circles = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child, main:not(:nth-child(3)) > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex) > div.relative");
            if (circles.length == 0) {
                return;
            } else {
                clearInterval(__timer_id);
            }
            for (let circleIndex = 0; circleIndex < circles.length; circleIndex++) {
                let circle = circles[circleIndex];
                clearInterval(circle.__timer_id);
                circle.__timer_id = setInterval((circle)=>{
                    let props;
                    try {
                        props = circle.parentElement[Object.keys(circle.parentElement).filter((key)=>key.startsWith("__reactProps"))[0]].children.props.children[circleIndex].props.defaultCircle;
                    } catch (e) {
                        return;
                    }
                    clearInterval(circle.__timer_id);
                    modifyDynamicCircle(circle, props);
                    let _props = props;
                    do {
                        _props.author = modifyUser(_props.author);
                    } while (_props = _props == props && props.refly_from ? props.refly_from : _props.reply_to);
                    redrawCircles();
                    let embededAnchors = circle.querySelectorAll("& > div:nth-last-child(2) > div:nth-last-child(2) > div.mt-1.whitespace-pre-wrap.break-all > div:not(.quoted-circle):has(> a) > a");
                    let embeddedUrls = [];
                    for (let anchor of embededAnchors) {
                        if (anchor.href.startsWith("https://fiicen.jp/circle/") && !embeddedUrls.includes(anchor.href)) {
                            embeddedUrls.push(anchor.href);
                        }
                    }
                    for (let url of embeddedUrls) {
                        try {
                            modifyEmbed(url);
                        } catch {}
                    }
                }, 20, circle);
            }
        }, 50);
    } else if (location.pathname.startsWith("/settings")) {
        modifySettings();
    }
    if (location.pathname.startsWith("/notification") || location.pathname.startsWith("/message")) {
        let countBadge = document.querySelector("nav a > p.font-bold + div");
        if (countBadge && Object.keys(countBadge).filter(key=>key.startsWith("__reactProps")).length == 0) {
            countBadge.remove();
        }
    }
    _ext_ready_resolve();

    // just in case
    setTimeout(()=>{
        try {
            redrawCircles();
        } catch {}
    }, 1000);
}

window.addEventListener("popstate", ()=>{
    _ext_ready = new Promise((resolve, reject)=>{
        _ext_ready_resolve = resolve;
    });
    let count = 0;
    let id = setInterval(()=>{
        if (document[Object.keys(document).filter(key=>key.startsWith("__reactContainer"))[0]].flags == 0) {
            clearInterval(id);
            _prev_url = location.href;
            try {
                document.querySelector("div:has(> main) > div > div").children.length;
            } catch {
                console.log("something is going wrong!");
            }
            onLoaded();
        }
        count++;
        if (count >= 300) {
            // maybe something went wrong so that the loop likely to go forever
            clearInterval(id);
            console.error("popstate handler is not likely to stop looping maybe bacause something went wrong.");
            _prev_url = location.href;
            onLoaded();
        }
    }, 10);
});

window.addEventListener("pageshow", ()=>{
    onLoaded();
});

var _hack_next_interval = setInterval(()=>{
    if (window.next == undefined || window.next.router == undefined || window.next.router["back"] == undefined) {
        return;
    } else {
        clearInterval(_hack_next_interval);
    }
    for (let key of Object.keys(next.router)) {
        next.router["_org_"+key] = next.router["_org_"+key] || next.router[key];

        next.router[key] = (...args)=>{
            let prevState = JSON.stringify(history.state);
            let result = (next.router["_org_"+key])(...args);
            return result;
        };
    }
}, 10);

var _prev_url = location.href;

if (window.navigation) {
    navigation.addEventListener("navigatesuccess", ()=>{
        if (!window.navigation.canGoForward) {
            _ext_ready = new Promise((resolve, reject)=>{
                _ext_ready_resolve = resolve;
            });
            if (location.href != _prev_url) {
                onLoaded();
                _prev_url = location.href;
            } else {
                _ext_ready_resolve();
            }
        }
    });
} else {
    history._processing = false;
    for (let key of ["pushState", "replaceState"]) {
        history["_org_" + key] = history["_org_" + key] || history[key].bind(history);
        Object.defineProperty(history, key, {
            get() {
                let func = (...args)=>{
                    let result, error;
                    if (!history._processing) {
                        history._processing = true;
                        try {
                            result = ((this["_" + key]) || this["_org_" + key])(...args);
                        } catch (e) {
                            error = e;
                        }
                        history._processing = false;
                    } else {
                        try {
                            result = this["_org_" + key](...args);
                        } catch (e) {
                            error = e;
                        }
                        if (error) {
                            throw error;
                        }
                        return result;
                    }
                    let main = document.querySelector("main");
                    let mainProps = main ? (main[Object.keys(main).filter(key=>key.startsWith("__reactProps"))[0]] || {children:{}}).children.props : null;
                    if (_prev_url != location.href) {
                        _ext_ready = new Promise((resolve, reject)=>{
                            _ext_ready_resolve = resolve;
                        });
                        let obs_callback = (records, observer)=>{
                            let main = document.querySelector("main");
                            let _mainProps = main ? (main[Object.keys(main).filter(key=>key.startsWith("__reactProps"))[0]] || {children:{}}).children.props : null;
                            let pageState = document[Object.keys(document).filter(key=>key.startsWith("__reactContainer"))[0]].updateQueue.baseState.element.props.children.props.children.props.value.state;
                            if (mainProps != _mainProps
                                || !pageState.focusAndScrollRef.apply
                            ) {
                                observer.disconnect();
                                clearInterval(__hist_timer_id);
                                try {
                                    onLoaded().catch(()=>_ext_ready_resolve());
                                } catch {
                                    _ext_ready_resolve();
                                }
                            }
                        };
                        let obs = new MutationObserver(obs_callback);
                        let __hist_timer_id = setInterval(()=>obs_callback([], obs), 100);
                        obs.observe(document.body, {subtree: true, childList: true});
                        _prev_url = location.href;
                    }
                    if (error) {
                        throw error;
                    }
                    return result;
                };
                func.bind = (...args)=>{
                    return this["_org_" + key].bind(...args);
                };
                return func;
            },
            set(value) {
                return this["_" + key] = value;
            }
        });
    }
}

async function modifyFieldLayout(data) {
    return data;
}

function modifyDynamicCircle(circle, data) {
    if (circle.querySelector("& > div:last-child > div:last-child button.quote") == undefined) {
        if (data && data.id) {
            let shareBtn = document.createElement("button");
            shareBtn.className = "quote base-bg-hover flex w-full gap-4 px-4 py-3";
            shareBtn.append(document.createElement("img"));
            assets["quote"].then((url)=>{
                shareBtn.firstChild.src = url;
            });
            shareBtn.firstChild.className = "size-5";
            shareBtn.firstChild.style.color = "transparent";
            shareBtn.append(document.createElement("p"));
            shareBtn.lastChild.innerText = "サークルを引用";
            let circleURL = "https://fiicen.jp/circle/" + ((data)=>{
                while (data.refly_from) {
                    data = data.refly_from;
                }
                return data.id;
            })(data);
            shareBtn.addEventListener("click", ()=>{
                let createCircleBtn = document.querySelector("nav > button");
                let circleTextArea = document.querySelector("nav > button + div textarea");
                circle.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.click();
                createCircleBtn.click();
                if (circleTextArea) { // if not, not logined
                    let timer = setInterval(()=>{
                        if (!circleTextArea.disabled) {
                            clearInterval(timer);
                            circleTextArea.value = `\n${circleURL}`;
                            circleTextArea.nextElementSibling.textContent = `${circleTextArea.value}\u200b`;
                            circleTextArea.style.height = `${circleTextArea.nextElementSibling.clientHeight}px`;
                            circleTextArea.selectionStart = circleTextArea.selectionEnd = 0;
                            circleTextArea.focus();
                        }
                    }, 10);
                }
            });
            circle.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.insertAdjacentElement("beforebegin", shareBtn);
        }
    }
}

function modifyCircle(circleData) {
    console.log(circleData);
    if (Object.prototype.isPrototypeOf(circleData)) {
        if (circleData.reply_to) {
            modifyCircle(circleData.reply_to);
        }
        if (circleData.refly_from) {
            modifyCircle(circleData.refly_from);
        }
        circleData.author = modifyUser(circleData.author)
    }
    return circleData;
}

function modifyMessage(messageData) {
    console.log(messageData);
    if (Object.prototype.isPrototypeOf(messageData)) {
        /*if (messageData.reply_to) {
            modifyMessage(messageData.reply_to);
        }*/
        if (messageData.sender && !messageData.sender.badge) {
            messageData.sender = modifyUser(messageData.sender);
        }
    }
    return messageData;
}

function modifyEmbed(url) {
    let embeds = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child, main:not(:nth-child(3))"
        + " > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex)"
        + " > div.relative > div:nth-last-child(2) > div:not(:first-child)"
        + " div.relative:has(> a[href=\"" + url + "\"]),"
        + " div.min-h-screen.border-x > div:first-child > div:first-child div.relative:has(> a[href=\"" + url + "\"])");
    for (let embed of embeds) {
        // release embed from being under next.js
        embed.outerHTML = "<!-- -->" + embed.outerHTML;
    }
    (async ()=>{
        let parser = new DOMParser();
        let circlePage = parser.parseFromString(await (await fetch(url)).text(), "text/html");
        let circle = circlePage.querySelector("div:has(+ main) > div:first-child > div:not(.relative)");

        // construct quoted
        let quoted = document.createElement("div");
        quoted.append(circle.children[0].cloneNode(3), document.createElement("div"));
        quoted.children[1].append(...[...circle.children[1].querySelectorAll("& > div:first-child, & > p:first-child, & > p:first-child + div")].map((el)=>el.cloneNode(2)));
        quoted.children[1].children[0].querySelectorAll("& > div").forEach((div)=>div.remove());
        // handle badge
        let author = quoted.querySelector("div:first-child > div:first-child > div > a").href.split("/").at(-1);
        if (author == developer_account) {
            let badge = document.createElement("img");
            badge.alt = "extension-developer";
            badge.loading = "lazy";
            badge.width=16;
            badge.height=16;
            badge.async = true;
            badge.className = "ml-1 size-4 shrink-0";
            badge.style.color = "transparent";
            badge.srcset = "/_next/image?url=" + encodeURIComponent(badgeURLs.developer) + "&w=16&q=75 1x, /_next/image?url=" + encodeURIComponent(badgeURLs.developer) + "&w=32&q=75 2x";
            badge.src="/_next/image?url=" + encodeURIComponent(badgeURLs.developer) + "&w=32&q=75";
            quoted.querySelector("div:first-child > div:first-child > div > a").append(badge);
        } else if (testers.includes(author)) {
            let badge = document.createElement("img");
            badge.alt = "extension-tester";
            badge.loading = "lazy";
            badge.width=16;
            badge.height=16;
            badge.async = true;
            badge.className = "ml-1 size-4 shrink-0";
            badge.style.color = "transparent";
            badge.srcset = "/_next/image?url=" + encodeURIComponent(badgeURLs.tester) + "&w=16&q=75 1x, /_next/image?url=" + encodeURIComponent(badgeURLs.tester) + "&w=32&q=75 2x";
            badge.src="/_next/image?url=" + encodeURIComponent(badgeURLs.tester) + "&w=32&q=75";
            quoted.querySelector("div:first-child > div:first-child > div > a").append(badge);
        } else if (author == username) {
            let badge = document.createElement("img");
            badge.alt = "extension-user";
            badge.loading = "lazy";
            badge.width=16;
            badge.height=16;
            badge.async = true;
            badge.className = "ml-1 size-4 shrink-0";
            badge.style.color = "transparent";
            badge.srcset = "/_next/image?url=" + encodeURIComponent(badgeURLs.user) + "&w=16&q=75 1x, /_next/image?url=" + encodeURIComponent(badgeURLs.user) + "&w=32&q=75 2x";
            badge.src="/_next/image?url=" + encodeURIComponent(badgeURLs.user) + "&w=32&q=75";
            quoted.querySelector("div:first-child > div:first-child > div > a").append(badge);
        }

        let img = circle.querySelector("div:not(:first-child) > div:has(> img):first-child > img");
        let bigImg = img ? img.parentElement.nextElementSibling : undefined;
        let video = circle.querySelector("video");
        if (img != undefined || video != undefined) {
            let mediaGroup = document.createElement("div");
            mediaGroup.className = "media-group base-border";
            if (img != undefined) {
                img = img.cloneNode();
                bigImg = bigImg.cloneNode(1);
                img.className = "";
                img.setAttribute("style", "");
                mediaGroup.append(document.createElement("div"));
                mediaGroup.lastChild.append(img, bigImg);
            }
            if (video != undefined) {
                video = video.cloneNode();
                video.className = "";
                mediaGroup.append(document.createElement("div"));
                mediaGroup.lastChild.append(video);
                mediaGroup.lastChild.classList.add("base-border");
            }
            quoted.append(mediaGroup);
        }
        let redirector = document.createElement("button");
        quoted.append(redirector);

        // change its style
        quoted.querySelector("div:first-child > div:first-child > div").classList.add("items-center");
        quoted.children[0].querySelectorAll("a.relative, a.relative > img").forEach((el)=>{
            el.classList.replace("size-10", "size-8");
        });
        quoted.children[0].querySelector("a.relative + div").classList.replace("flex-col", "flex-row");
        quoted.children[0].querySelector("a.relative + div").classList.add("gap-2");

        let embeds = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child, main:not(:nth-child(3))"
            + " > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex)"
            + " > div.relative > div:nth-last-child(2) > div:not(:first-child)"
            + " div.relative:has(> a[href=\"" + url + "\"]),"
            + " div.min-h-screen.border-x > div:first-child > div:first-child div.relative:has(> a[href=\"" + url + "\"])");
        for (let embed of embeds) {
            embed.classList.add("quoted-circle");
            embed.classList.remove("relative", "group", "items-center", "second-bg-hover");
            embed.replaceChildren(document.createElement("button"), document.createElement("div"));
            embed.lastChild.append(...quoted.cloneNode(5).children);
            embed.lastChild.lastChild.remove();
            let img = embed.querySelector(".media-group > div > img");
            let bigImg = img ? img.nextElementSibling : undefined;
            if (img != undefined) {
                img.addEventListener("click", ()=>{
                    bigImg.classList.remove("pointer-events-none", "bg-transparent");
                    bigImg.classList.add("bg-black/20", "backdrop-blur");
                    bigImg.firstChild.classList.remove("pointer-events-none", "scale-90", "opacity-0");
                });
                bigImg.firstChild.addEventListener("click", ()=>{
                    bigImg.classList.add("pointer-events-none", "bg-transparent");
                    bigImg.classList.remove("bg-black/20", "backdrop-blur");
                    bigImg.firstChild.classList.add("pointer-events-none", "scale-90", "opacity-0");
                });
            }
            /* FIXME: following may not work well */
            let video = embed.querySelector(".media-group > div > video");
            if (video != undefined) {
                video.addEventListener("click", ()=>{
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            }
            embed.firstChild.addEventListener("click", ()=>{
                try {
                    next.router.push(url);
                } catch {
                    location.href = url;
                }
            });
        }
    })();
}

// modify settings page
function modifySettings() {
    if (location.pathname == "/settings/language-and-display/visual" && document.querySelector("input.fiicen-improver-checkbox[name=\"prefer-system-theme\"]") == undefined) {
        let settingForm = document.querySelector("main > div:last-child > header + form");

        let systemThemeButton = document.createElement("label");
        systemThemeButton.className = "flex items-center gap-4 p-4 dark-bg-base";

        systemThemeButton.append(
            document.createElement("input"),
            document.createElement("p")
        );

        systemThemeButton.firstChild.type = "checkbox";
        systemThemeButton.firstChild.name = "prefer-system-theme";
        systemThemeButton.firstChild.className = "fiicen-improver-checkbox";
        systemThemeButton.firstChild.disabled = true;
        //systemThemeButton.firstChild.checked = document.documentElement.classList.contains("")

        systemThemeButton.lastChild.innerText = "可能であればシステムのテーマを優先する(このデバイスのみ)";

        settingForm.querySelector("label:last-child").insertAdjacentElement("afterend", systemThemeButton);

        messageExt("getSettings").then((settings)=>{
            if (settings.systemTheme != undefined) {
                systemThemeButton.firstChild.checked = settings.systemTheme;
                systemThemeButton.firstChild.disabled = false;
                settingForm.addEventListener("submit", ()=>{
                    messageExt("setSettings", {systemTheme: systemThemeButton.firstChild.checked});
                });
            }
        });
    }

    let settingList = document.querySelector("main > div > ul");
    let settingItem;

    if (settingList.lastChild.lastChild.tagName.toUpperCase() != "DIV") {
        settingItem = document.createElement("li");
        let settingPopup = document.createElement("div");

        // setting item

        settingItem.className = "relative false _fiicen_improver_settings";

        settingItem.append(document.createElement("div"));
        settingItem.firstChild.append(
            document.createElement("div"),
            document.createElementNS("http://www.w3.org/2000/svg","svg")
        );

        settingItem.firstChild.className = "base-bg-hover flex items-center justify-between p-4";

        settingItem.firstChild.firstChild.appendChild(document.createElement("p"));
        settingItem.firstChild.firstChild.firstChild.innerText = "Fiicen Improver の設定";

        settingItem.firstChild.lastChild.setAttribute("class", "size-6 shrink-0 opacity-50");
        settingItem.firstChild.lastChild.setAttribute("fill", "currentColor");
        settingItem.firstChild.lastChild.setAttribute("viewBox", "0 0 24 24");
        settingItem.firstChild.lastChild.setAttribute("stroke", "none");

        settingItem.firstChild.lastChild.append(
            document.createElementNS("http://www.w3.org/2000/svg","path")
        );

        settingItem.firstChild.lastChild.firstChild.setAttribute("d", "M 3 4 C 3 3.448 3.448 3 4 3 L 19.978 3 C 20.241 2.994 20.506 3.092 20.707 3.293 C 20.908 3.494 21.006 3.759 21 4.022 L 21 20 C 21 20.552 20.552 21 20 21 C 19.448 21 19 20.552 19 20 L 19 6.414 L 4.707 20.707 C 4.317 21.098 3.683 21.098 3.293 20.707 C 2.902 20.317 2.902 19.683 3.293 19.293 L 17.586 5 L 4 5 C 3.448 5 3 4.552 3 4 Z");

        // setting popup
        settingPopup.className = "fixed bottom-0 left-0 z-10 h-screen w-screen duration-300 pointer-events-none bg-transparent z-20 flex flex-col justify-end p-4 md:justify-center undefined";

        settingPopup.append(
            document.createElement("div")
        );

        settingPopup.firstChild.className = "base-bg mx-auto h-2/3 w-full max-w-xl rounded-3xl scale-75 opacity-0 blur overflow-y-auto duration-300 h-auto p-4"

        settingPopup.firstChild.append(
            document.createElement("div"),
            document.createElement("div")
        );

        settingPopup.firstChild.firstChild.className = "mb-2 flex items-center justify-between";
        settingPopup.firstChild.lastChild.className = "flex flex-col gap-4 text-left";

        settingPopup.firstChild.firstChild.append(
            document.createElement("h1"),
            document.createElement("button")
        );

        settingPopup.firstChild.firstChild.firstChild.className = "text-xl font-bold";
        settingPopup.firstChild.firstChild.firstChild.innerText = "Fiicen Improver の設定";
        
        settingPopup.firstChild.firstChild.lastChild.className = "base-bg-hover rounded-full p-2";

        settingPopup.firstChild.firstChild.lastChild.append(
            document.createElementNS("http://www.w3.org/2000/svg","svg")
        );

        settingPopup.firstChild.firstChild.lastChild.firstChild.setAttribute("class", "size-5");
        settingPopup.firstChild.firstChild.lastChild.firstChild.setAttribute("fill", "none");
        settingPopup.firstChild.firstChild.lastChild.firstChild.setAttribute("viewBox", "0 0 24 24");
        settingPopup.firstChild.firstChild.lastChild.firstChild.setAttribute("stroke", "currentColor");
        settingPopup.firstChild.firstChild.lastChild.firstChild.setAttribute("strokeWidth", "1.5");

        settingPopup.firstChild.firstChild.lastChild.firstChild.append(
            document.createElementNS("http://www.w3.org/2000/svg","path")
        );

        settingPopup.firstChild.firstChild.lastChild.firstChild.firstChild.setAttribute("stroke-linecap", "round");
        settingPopup.firstChild.firstChild.lastChild.firstChild.firstChild.setAttribute("stroke-linejoin", "round");
        settingPopup.firstChild.firstChild.lastChild.firstChild.firstChild.setAttribute("d", "M6 18 18 6M6 6l12 12");

        settingPopup.firstChild.lastChild.append(
            document.createElement("div")
        );

        settingPopup.firstChild.lastChild.firstChild.append(
            document.createElement("div")
        );

        let settingBody = settingPopup.firstChild.lastChild.firstChild.firstChild;

        for (let item of [
            {name: "datasaver", text: "データセーバー"},
            {name: "asyncNotification", text: "リアルタイム通知"},
            {name: "debug", text: "デバッグモード"}
        ]) {
            settingBody.append(
                document.createElement("section")
            );

            settingBody.lastChild.append(
                document.createElement("label"),
                document.createElement("input")
            );

            settingBody.lastChild.firstChild.innerText = item.text;
            settingBody.lastChild.firstChild.setAttribute("for", item.name);

            settingBody.lastChild.lastChild.setAttribute("name", item.name);
            settingBody.lastChild.lastChild.setAttribute("type", "checkbox");

            if (window.KAGI && !testers.includes(username) && item.name == "datasaver") {
                settingBody.lastChild.lastChild.disabled = true;
            }
        }

        settingBody.append(document.createElement("section"));
        settingBody.lastChild.className = "base-bg-hover";

        settingBody.lastChild.append(document.createElement("a"));

        messageExt("extURL", "about.html").then((about_url)=>{
            settingBody.querySelector("section:nth-last-child(2) > a").href = about_url;
        });
        settingBody.lastChild.lastChild.target = "_blank";
        settingBody.lastChild.lastChild.innerText = "Fiicen Improver について...";

        settingBody.append(document.createElement("section"));
        settingBody.lastChild.style.display = "none";

        settingBody.lastChild.append(document.createElement("span"));

        messageExt("version").then((version)=>{
            settingBody.lastChild.lastChild.innerText = "ver. " + version;
            settingBody.lastChild.style.display = "";
        });

        messageExt("getSettings").then((settings)=>{
            for (let key of Object.keys(settings)) {
                let item = settingBody.querySelector(`input[name="${key}"]`);
                if (item == undefined) {
                    continue;
                }
                item.checked = settings[key];
                item.addEventListener("change", (ev)=>{
                    let data = {};
                    data[ev.target.getAttribute("name")] = ev.target.checked;
                    messageExt("setSettings", data);
                });
            }
        });

        settingItem.append(settingPopup);

        settingList.append(settingItem);


        settingItem.children[0].addEventListener("click", ()=>{
            if (location.hash != "#fiicen-improver-settings") {
                location.hash = "#fiicen-improver-settings";
            }
            settingItem.children[1].classList.add("bg-black/20");
            settingItem.children[1].classList.remove("pointer-events-none", "bg-transparent");
            settingItem.children[1].children[0].classList.remove("blur", "scale-75", "opacity-0");
        });

        let close = ()=>{
            history.pushState({}, '', location.pathname);
            settingItem.children[1].classList.remove("bg-black/20");
            settingItem.children[1].classList.add("pointer-events-none", "bg-transparent");
            settingItem.children[1].children[0].classList.add("blur", "scale-75", "opacity-0");
        };

        settingItem.children[1].querySelector("button").addEventListener("click", close);

        settingItem.children[1].addEventListener("click", (ev)=>{
            if (ev.target == settingItem.children[1]) {
                close();
            }
        });
    } else {
        settingItem = settingList.lastChild;
    }

    if (location.hash == "#fiicen-improver-settings") {
        settingItem.children[0].click();
    }
}

// Improve post form

document.addEventListener("paste", async (e)=>{
    if (!e.target.form || !e.target.form.elements["circle-form-image"] || !e.target.form.elements["circle-form-video"]) {
        return;
    }
    let form = e.target.form;
    if (e.clipboardData.files.length > 0) {
        let file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
            file.arrayBuffer().then((buffer)=>{
                let imageInput = form.elements["circle-form-image"];
                imageInput[Object.keys(imageInput).filter(key=>key.startsWith("__reactProps"))[0]].onChange({
                    target: {
                        id: "circle-form-image",
                        files: [new File([buffer,], file.name, {
                            type: file.type,
                            lastModified: file.lastModified
                        }),]
                    }
                });
            });
        } else if (file.type.startsWith("video/")) {
            file.arrayBuffer().then((buffer)=>{
                let videoInput = form.elements["circle-form-video"];
                videoInput[Object.keys(videoInput).filter(key=>key.startsWith("__reactProps"))[0]].onChange({
                    target: {
                        id: "circle-form-video",
                        files: [new File([buffer,], file.name, {
                            type: file.type,
                            lastModified: file.lastModified
                        }),]
                    }
                });
            });
        }
        form.onformdata = (e)=>{
            let data = e.formData;
            if (data.get("image") != null) {
                data.set("image", form[Object.keys(form).filter(key=>key.startsWith("__reactProps"))[0]].children[2].props.media.image);
            }
            if (data.get("video") != null) {
                data.set("video", form[Object.keys(form).filter(key=>key.startsWith("__reactProps"))[0]].children[2].props.media.video);
            }
        };
    }
});

// Hack fetch(...)

window.fetch = async (...args)=>{
    if (!_loadedCalled) {
        // when this called, document must be already loaded
        window.dispatchEvent(new Event("load"));
    }
    try {
        args[0] = new URL(args[0]);
    } catch {
        args[0] = new URL(args[0], location.href);
    }
    if (args[0].hostname == "fiicen.jp" && args[0].pathname == "/_next/image") {
        try {
            let imgURL = args[0].searchParams.get("url");
            if (imgURL == "badge") {
                args[0] = new URL(await assets["badge"]);
            }
        } catch {}
    }
    await _ext_ready;
    try {
        if (args[0].hostname == "fiicen.jp" && args.length > 1 &&
            args[1].method != undefined &&
            args[1].method.toLowerCase() == "post" &&
            args[1].body != undefined &&
            args[1].body.startsWith("[\"https://fiicen.jp/circle/"))
        {
            modifyEmbed(args[1].body.slice(2, -2));
            let result = new Response(""); // to stop default
            return result;
        }
    } catch {}
    let result;
    try {
        result = await window._org_fetch(...args);
    } catch (e) {
        throw e;
    }
    if (result.ok && args[0].hostname == "fiicen.jp") {
        if (args.length > 1 &&
            args[1].method != undefined &&
            args[1].method.toLowerCase() == "post" &&
            args[1].body != undefined)
        {
            let text = await result.text();
            try {
                let data = text
                    .matchAll(/^([0-9a-f]+):([I]?)(.*)$/mg)
                    .reduce((data, m)=>{
                        data.keys.push(m[1]);
                        data[m[1]] = {
                            I: m[2] == "I",
                            data: JSON.parse(m[3])
                        };
                        return data;
                    }, {keys: []});
                let results = data["1"].data.results != undefined
                    ? data["1"].data.results
                    : (
                        data["1"].data.json != undefined && data["1"].data.json.results != undefined
                        ? data["1"].data.json.results : undefined);
                if (results != undefined && results.length > 0) {
                    if (results[0].account_name != undefined) {
                        results.forEach((user)=>{
                            if (user.badge == null) {
                                if (user.account_name == developer_account) {
                                    user.badge = {
                                        type: "extension-developer",
                                        image: badgeURLs.developer
                                    };
                                } else if (testers.includes(user.account_name)) {
                                    user.badge = {
                                        type: "extension-tester",
                                        image: badgeURLs.tester
                                    };
                                } else if (user.account_name == username) {
                                    user.badge = {
                                        type: "extension-user",
                                        image: badgeURLs.user
                                    };
                                }
                            }
                        });
                    } else if (results[0].conversation_type != undefined) {
                        results.forEach(modifyMessage);
                    } else if (results[0].author != undefined) {
                        results.forEach(modifyCircle);
                    }
                } else {
                    modifyCircle(data["1"].data);
                }
                return new Response(
                    data.keys.reduce((body, key)=>body+key+":"+(data[key].I?"I":"")+JSON.stringify(data[key].data)+"\n", ""),
                    result
                );
            } catch(e) {
                console.error(e);
                return new Response(text, result);
            }
        } else if ((args.length == 1 || args[1].method == undefined || args[1].method.toLowerCase() == "get") && args[0].search.includes("_rsc=")) {
            // It may be going to navigate
            if (args[0].pathname.match(/^\/field\/[^/]+$/)) {
                // maybe soft-navigate to field page
                let targetUser = args[0].pathname.match(/^\/field\/([^/]+)$/)[1];
                let text = await result.text();
                try {
                    let data = text
                        .matchAll(/^([0-9a-f]+):(.*)$/mg)
                        .reduce((data, m)=>{
                            data.keys.push(m[1]);
                            data[m[1]]={"I": m[2].startsWith("I[") ? true : false, "data":JSON.parse(m[2].startsWith("I[") ? m[2].slice(1) : m[2])};
                            return data;
                        }, {keys: []});
                    await modifyFieldLayout(data[targetUser == username ? "3" : "1"].data);
                    return new Response(
                        data.keys.reduce((body, key)=>body+key+":"+(data[key].I ? "I" : "")+JSON.stringify(data[key].data)+"\n", ""),
                        result
                    );
                } catch {
                    return new Response(text, result);
                }
            } else if (args[0].pathname.match(/^\/message\/[^/]+$/)) {
                let text = await result.text();
                try {
                    let data = text
                        .matchAll(/^([0-9a-f]+):(.*)$/mg)
                        .reduce((data, m)=>{
                            data.keys.push(m[1]);
                            data[m[1]]={"I": m[2].startsWith("I[") ? true : false, "data":JSON.parse(m[2].startsWith("I[") ? m[2].slice(1) : m[2])};
                            return data;
                        }, {keys: []});
                    return new Response(
                        data.keys.reduce((body, key)=>body+key+":"+(data[key].I ? "I" : "")+JSON.stringify(data[key].data)+"\n", ""),
                        result
                    );
                } catch {
                    return new Response(text, result);
                }
            }
            return result;
        } else {
            return result;
        }
    } else {
        return result;
    }
};

// data saver
document.addEventListener("click", (e)=>{
    if (e.target.computedStyleMap && e.target.computedStyleMap().get("--imprv-saved") || window.getComputedStyle && window.getComputedStyle(e.target).getPropertyValue("--imprv-saved")) {
        // it is data-saved image
        let bigImg = e.target.parentElement.parentElement.classList.contains("media-group") ? e.target.nextElementSibling.children[0] : e.target.parentElement.nextElementSibling.children[0];
        e.target.srcset = (e.target.srcset || e.target.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
        e.target.src = (e.target.src || e.target.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
        bigImg.srcset = (bigImg.srcset || bigImg.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
        bigImg.src = (bigImg.src || bigImg.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
        let circle = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
        if (circle.classList.contains("relative")) {
            try {
                let props = circle[Object.keys(circle).filter(key=>key.startsWith("__reactProps"))[0]].children[2].props;
                if (props.image.includes("?")) {
                    props.image += "&_=_";
                } else {
                    props.image += "?_=_";
                }
            } catch {}
        }
    }
});

var observer = new MutationObserver((...args)=>{
    try {
        circleAmount = 0;
        let circleParents = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child, main:not(:nth-child(3)) > div > div:first-child, div.flex.flex-col.gap-4:has( > div.relative.flex))");
        for (let circleParent of circleParents) {
            let _circleAmount = circleParent._circleAmount || 0;
            let circles = circleParent.children;
            let circleDatas = circleParent[Object.keys(circleParent).filter((key)=>key.startsWith("__reactProps"))[0]].children.props.children;
            if (_circleAmount < circles.length) {
                for (let i = _circleAmount; i < circles.length; i++) {
                    modifyDynamicCircle(
                        circles[i], 
                        circleDatas[i].props.defaultCircle
                    );
                }
                if (location.pathname.startsWith("/field/") && circleAmount == 0) {
                    // sometimes badges are not added for some reason
                    // so, make sure badges are added
                    for (let i = circleAmount; i < circles.length; i++) {
                        modifyCircle(
                            circleDatas[i].props.defaultCircle
                        );
                    }
                    redrawCircles();
                }
            }
            circleParent._circleAmount = circles.length;
            circleAmount += circles.length;
        }
    } catch {}
});

observer.observe(document.body, {subtree:true, childList:true});
