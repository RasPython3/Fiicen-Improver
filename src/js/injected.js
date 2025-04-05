console.log("Injected Fiicen Extension's script");

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

const testers = [
    "nyannyan110011",
    "sunaookami_bridg",
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
    "katatsumuri"
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

const urls = {}; // currently not used

const assets = {
    "qr": messageExt("extURL", "images/followQR.svg"),
    "quote": messageExt("extURL", "images/quoteCircle.svg")
};

const username = document.querySelector("nav > a:last-child").href.match(".*/field/([^/]+)$")[1];

var errorBoxes;

function outputError(e) {
    console.log(e);
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


var __timer_id;

function redrawCircles() {
    let circleParent = document.querySelector(":where(main:nth-child(3) > div > div > div:first-child, main:not(:nth-child(3)) > div > div:first-child)");
    let updater = circleParent[Object.keys(circleParent).filter(key=>key.startsWith("__reactProps"))[0]].children.props.value;
    updater(null);
}

var _loadedCalled = false;

async function onLoaded() { // first load or nextjs's router
    // re-arrange field header
    console.log("onLoaded called");
    _loadedCalled = true;
    circleAmount = 0;
    if (errorBoxes && location.pathname == "/field/RasPython3") {
        let error = new ErrorEvent("error", {
            message: "This is test.",
            filename: _injectedjs_url
        });
        window.dispatchEvent(error);
    }
    if (location.pathname.startsWith("/field/")) {
        if (document.querySelector("div:has(> main) > div > div").children.length > 2) {
            let card = document.querySelector("div:has(> main) > div > div");
            let info = document.createElement("div");
            info.append(...document.querySelectorAll("div:has(> main) > div > div > *:not(div:last-child)"));
            card.insertAdjacentElement("afterbegin", info);
        }
        if (location.pathname.match("\\/field\\/"+username+"(?=\\?|$)")) {
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
                        let buttons = document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))) > div:first-child > div.flex:has(div)");
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
        if (location.pathname == "/field/RasPython3") {
            (async ()=>{
                let badge = document.createElement("img");
                badge.alt = "extension-developer";
                badge.loading = "lazy";
                badge.width=16;
                badge.height=16;
                badge.async = true;
                badge.className = "ml-1 size-4 inline align-middle";
                badge.style.color = "transparent";
                badge.srcset = "/_next/image?url=" + encodeURIComponent(badgeURLs.developer) + "&w=16&q=75 1x, /_next/image?url=" + encodeURIComponent(badgeURLs.developer) + "&w=32&q=75 2x";
                badge.src="/_next/image?url=" + encodeURIComponent(badgeURLs.developer) + "&w=32&q=75";
                await _ext_ready;
                let _inject_badge = setInterval(()=>{
                    let displayNameP = document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))) > div:first-child > p:nth-child(2)");
                    if (displayNameP == undefined) {
                        return;
                    }
                    clearInterval(_inject_badge);
                    displayNameP.append(badge);
                }, 10);
            })();
        } else if (testers.includes(location.pathname.replace(/\/field\/(.*)/, "$1"))) {
            (async ()=>{
                let badge = document.createElement("img");
                badge.alt = "extension-tester";
                badge.loading = "lazy";
                badge.width=16;
                badge.height=16;
                badge.async = true;
                badge.className = "ml-1 size-4 inline align-middle";
                badge.style.color = "transparent";
                badge.srcset = "/_next/image?url=" + encodeURIComponent(badgeURLs.tester) + "&w=16&q=75 1x, /_next/image?url=" + encodeURIComponent(badgeURLs.tester) + "&w=32&q=75 2x";
                badge.src="/_next/image?url=" + encodeURIComponent(badgeURLs.tester) + "&w=32&q=75";
                await _ext_ready;
                let _inject_badge = setInterval(()=>{
                    let displayNameP = document.querySelector("div:has(> main:nth-child(3)) > div > div:not(:has(> div:nth-child(3))) > div:first-child > p:nth-child(2)");
                    if (displayNameP == undefined) {
                        return;
                    }
                    clearInterval(_inject_badge);
                    displayNameP.append(badge);
                }, 10);
            })();
        }
    } else if (location.pathname.startsWith("/home") || location.pathname.startsWith("/explore/") || location.pathname.startsWith("/search/") || location.pathname.startsWith("/circle/")) {
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
                    if (props.author.account_name == "RasPython3") {
                        props.author.badge = {
                            type: "extension-developer",
                            image: badgeURLs.developer
                        };
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
                        circleElement.lastChild.querySelector("div:first-child > div > a.group").append(badge);
                    } else if (testers.includes(props.author.account_name)) {
                        props.author.badge = {
                            type: "extension-tester",
                            image: badgeURLs.tester
                        };
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
                        circleElement.lastChild.querySelector("div:first-child > div > a.group").append(badge);
                    } else if (props.author.account_name == username) {
                        props.author.badge = {
                            type: "extension-user",
                            image: badgeURLs.user
                        };
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
                        circleElement.lastChild.querySelector("div:first-child > div > a.group").append(badge);
                    }
                }
            }
        }
        clearInterval(__timer_id);
        __timer_id = setInterval(()=>{
            let circles = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child > div.relative, main:not(:nth-child(3)) > div > div > div.relative)");
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
                        if (_props.author.account_name == "RasPython3" && !_props.author.badge) {
                            // extension developper
                            _props.author.badge = {
                                kind: "extension-developer",
                                image: badgeURLs.developer
                            };
                        } else if (testers.includes(_props.author.account_name) && !_props.author.badge) {
                            // extension tester
                            _props.author.badge = {
                                kind: "extension-tester",
                                image: badgeURLs.tester
                            };
                        } else if (_props.author.account_name == username && !_props.author.badge) {
                            // extension user
                            _props.author.badge = {
                                kind: "extension-user",
                                image: badgeURLs.user
                            };
                        }
                    } while (_props = _props.reply_to || (_props != props.refly_from ? props.refly_from : null));
                    redrawCircles();
                    let embededAnchors = circle.querySelectorAll("& > div:nth-last-child(2) > div.mt-1.whitespace-pre-wrap.break-all > div:not(.quoted-circle):has(> a) > a");
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
    }
    _ext_ready_resolve();
}

window.addEventListener("popstate", ()=>{
    console.log("popstate");
    _ext_ready = new Promise((resolve, reject)=>{
        _ext_ready_resolve = resolve;
    });
    let id = setInterval(()=>{
        if (_prev_url != location.href) {
            clearInterval(id);
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
            /*if (prevState != JSON.stringify(history.state)) {
                console.log("history.state was changed!");
            }*/
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
                        /*console.log(key, args);
                        console.log((this["_" + key] || this["_org_" + key]));*/
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
                        let obs = new MutationObserver((records, observer)=>{
                            let main = document.querySelector("main");
                            let _mainProps = main ? (main[Object.keys(main).filter(key=>key.startsWith("__reactProps"))[0]] || {children:{}}).children.props : null;
                            if (mainProps != _mainProps) {
                                observer.disconnect();
                                try {
                                    onLoaded();
                                } catch {
                                    _ext_ready_resolve();
                                }
                            }
                        });
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
    data[3].children[0][3].children[3].children = [
        [
            "$",
            "div",
            null,
            {
                "className": "",
                "children": data[3].children[0][3].children[3].children.slice(0, 7)
            }
        ],
        data[3].children[0][3].children[3].children.slice(7)[0] || false
    ];
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
            let circleURL = "https://fiicen.jp/circle/" + data.id;
            shareBtn.addEventListener("click", ()=>{
                let createCircleBtn = document.querySelector("nav > button");
                let circleTextArea = document.querySelector("nav > button + div textarea");
                circle.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.click();
                createCircleBtn.click();
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
        if (!circleData.author.badge) {
            if (circleData.author.account_name == "RasPython3") {
                circleData.author.badge = {
                    type: "extension-developer",
                    image: badgeURLs.developer
                };
            } else if (testers.includes(circleData.author.account_name)) {
                circleData.author.badge = {
                    type: "extension-tester",
                    image: badgeURLs.tester
                };
            } else if (circleData.author.account_name == username) {
                circleData.author.badge = {
                    type: "extension-user",
                    image: badgeURLs.user
                };
            }
        }
    }
    return circleData;
}

function modifyEmbed(url) {
    let embeds = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child > div.relative, main:not(:nth-child(3))"
        + " > div > div > div.relative) > div:nth-last-child(2) > div:not(:first-child)"
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
        if (author == "RasPython3") {
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

        let embeds = document.querySelectorAll(":where(main:nth-child(3) > div > div > div:first-child > div.relative, main:not(:nth-child(3))"
            + " > div > div > div.relative) > div:nth-last-child(2) > div:not(:first-child)"
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

// Improve post form

document.addEventListener("paste", async (e)=>{
    if (!e.target.form || !e.target.form.elements["circle-form-image"] || !e.target.form.elements["circle-form-video"]) {
        return;
    }
    let form = e.target.form;
    if (e.clipboardData.files.length > 0) {
        let file = e.clipboardData.files[0];
        console.log(file, file.size);
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
                console.log(file);
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
                console.log(file);
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
    console.log("fetch", args);
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
    let result = await window._org_fetch(...args);
    if (result.ok && args[0].hostname == "fiicen.jp") {
        if (args.length > 1 &&
            args[1].method != undefined &&
            args[1].method.toLowerCase() == "post" &&
            args[1].body != undefined)
        {
            let text = await result.text();
            try {
                let data = text
                    .matchAll(/^([0-9a-f]+):(.*)$/mg)
                    .reduce((data, m)=>{
                        data[m[1]]=JSON.parse(m[2]);
                        return data;
                    }, {});
                let results = data["1"].results != undefined
                    ? data["1"].results
                    : (
                        data["1"].json != undefined && data["1"].json.results != undefined
                        ? data["1"].json.results : undefined);
                if (results != undefined) {
                    if (results.length > 0 && results[0].account_name != undefined) {
                        results.forEach((user)=>{
                            if (user.badge == null) {
                                if (user.account_name == "RasPython3") {
                                    user.badge = {
                                        type: "extension-developer",
                                        image: badgeURLS.developer
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
                    } else {
                        results.forEach(modifyCircle);
                    }
                } else {
                    modifyCircle(data["1"]);
                }
                return new Response(
                    Object.keys(data).reduce((body, key)=>body+key+":"+JSON.stringify(data[key])+"\n", ""),
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
                            data[m[1]]={"I": m[2].startsWith("I[") ? true : false, "data":JSON.parse(m[2].startsWith("I[") ? m[2].slice(1) : m[2])};
                            return data;
                        }, {});
                    await modifyFieldLayout(data[targetUser == username ? "3" : "1"].data);
                    return new Response(
                        Object.keys(data).reduce((body, key)=>body+key+":"+(data[key].I ? "I" : "")+JSON.stringify(data[key].data)+"\n", ""),
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
        let bigImg = e.target.parentElement.nextElementSibling.children[0];
        e.target.srcset = (e.target.srcset || e.target.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
        e.target.src = (e.target.src || e.target.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
        bigImg.srcset = (bigImg.srcset || bigImg.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
        bigImg.src = (bigImg.src || bigImg.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
        let circle = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
        let props = circle[Object.keys(circle).filter(key=>key.startsWith("__reactProps"))[0]].children[2].props;
        if (props.image.includes("?")) {
            props.image += "&_=_";
        } else {
            props.image += "?_=_";
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
