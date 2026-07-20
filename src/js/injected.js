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

var defaultHome = "/home";

var mutedWords = [];
mutedWords._ready = new Promise((resolve, reject)=>{
    mutedWords._set_ready = resolve;
});

var circleAmount = 0;

var circleCache = new Map()

function messageExt(request, value=undefined) {
    let id = 0;
    while (_msgIds.includes(id)) {
        id = Math.ceil(Math.random() * 4096);
    }
    _msgIds.push(id);
    let promise = new Promise((resolve, reject)=>{
        let listener = (e)=>{
            let data = JSON.parse(e.detail);
            if (data && data.response == request && data.id == id) {
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
            case "updateSettings":
                let changes = JSON.parse(data.value);
                if (changes.defaultHome) {
                    defaultHome = changes.defaultHome.newValue || "/home";
                }
                if (changes.mutedWords != undefined) {
                    mutedWords.splice(0, mutedWords.length, ...Array.from(changes.mutedWords.newValue || []));
                    mutedWords._set_ready();
                }
                break;
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
                break;
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

function createBigImg(img) {
    let popup = document.createElement("div");
    popup.className = "pointer-events-none bg-transparent fixed inset-0 z-40 min-h-[100dvh] w-screen duration-300 z-20";

    let bigImg = img.cloneNode();
    bigImg.className = "pointer-events-none scale-90 opacity-0 object-contain duration-300";

    popup.appendChild(bigImg);

    return popup;
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
    let circleParent = document.querySelector(":where(div:where(div:first-child, div:first-child + div) + header + main > div > div > div:first-child, main:not(:nth-child(3)) > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex):has(> div.relative):not(:has(> div.aspect-square))");
    if (circleParent) {
        let updater = circleParent[Object.keys(circleParent).filter(key=>key.startsWith("__reactProps"))[0]].children.props.value;
        updater(null);
    }
}

var _loadedCalled = false;

function convertQRCodeSVG(svg) {
    let size = svg.viewBox.baseVal.width;
    let ar = new Int8Array(size*size);

    let quietOffset = 2;

    ds = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    grs = [];
    exs = [];

    svg.querySelectorAll("use").forEach((el)=>{
        ar[el.x.baseVal.value + el.y.baseVal.value * size] = 1;
    });

    for (let k = 0; k < ar.length; k++) {
        if (ar[k] == 1) {
            let x = k % size, y = (k - x) / size;

            if (x > 0 && ar[k-1] > 1 || y > 0 && ar[k-size] > 1) {
                ar[k] = 2;
            } else {
                let d = 0;
                let gr = [];

                if (x > 0) {
                    ar[k-1] = -1;
                }
                if (y > 0) {
                    ar[k-size] = -1;
                }
                grs.push(gr);
                while (true) {
                    gr.push([x,y]);
                    ar[x+y*size] = 2;
                    let td;
                    for (td = d-1; td < d+3; td++) {
                        let [dx, dy] = ds.at((td+4)%4);
                        if (x+dx < 0 || x+dx >= size || y+dy < 0 || y+dy >= size) {
                            continue;
                        }
                        if (ar[x+dx+(y+dy)*size] > 0) {
                            if (x+y*size == k && ar[x+dx+(y+dy)*size] == 2) {
                                td = d+3;
                                break;
                            }
                            d = (td + 4) % 4;
                            x += dx;
                            y += dy;
                            break;
                        } else {
                            ar[x+dx+(y+dy)*size] = -1;
                        }
                    }
                    if ((d - td + 4) % 4 > 0) {
                        if (gr.length == 1) {
                            gr.push([...gr[0]]);
                        }
                        break;
                    }
                }
            }
        }
        if (k / size < size - 1 && ar[k] > 0 && (k % size < size - 1 && ar[k+1] > 0 && ar[k+size+1] == 0 || ar[k+size] == 0)) {
            let x = k % size, y = (k - x) / size;
            let d = ar[k+size] == 0 ? 0 : 3;
            let ex = [];
            exs.push(ex);
            while (true) {
                ex.push([x,y]);
                ar[x+y*size] = 3;
                let td;
                for (td = d+1; td > d-3; td--) {
                    let [dx, dy] = ds.at((td+4)%4);
                    if (x+dx < 0 || x+dx >= size || y+dy < 0 || y+dy >= size) {
                        continue;
                    }
                    if (ar[x+dx+(y+dy)*size] > 0) {
                        if (x+y*size == k && ar[x+dx+(y+dy)*size] == 3) {
                            td = d-3;
                            break;
                        }
                        d = (td + 4) % 4;
                        x += dx;
                        y += dy;
                        break;
                    } else {
                        ar[x+dx+(y+dy)*size] = -1;
                    }
                }
                if ((d - td + 4) % 4 > 0) {
                    if (ex.length == 1) {
                        ex.push([...ex[0]]);
                    }
                    break;
                }
            }
            ex.forEach((point)=>{
                ar[point[0]+point[1]*size] = 2;
            });
        }
    }

    svg.replaceChildren(svg.firstChild, document.createElementNS("http://www.w3.org/2000/svg", "path"));

    svg.lastChild.style.fill = "black";

    svg.lastChild.setAttribute("d", (grs.map((ps)=>
        ps.reduce((acc, _cur, _index, _arr)=>{
            let cur = _arr.at(_index - _arr.length);
            if (acc.length < 2) { acc.push(cur); }
            else {
                if ((acc.at(-1)[0] - acc.at(-2)[0]) * (cur[0] - acc.at(-1)[0]) + (acc.at(-1)[1] - acc.at(-2)[1]) * (cur[1] - acc.at(-1)[1]) <= 0) {
                    acc.push(cur);
                } else {
                    acc.splice(-1, 1, cur);
                }
            }
            return acc;
        }, []).reduce((acc, cur, index, arr)=>{
            let next = arr.at(index % (arr.length - 1) - arr.length + 1);
            let prev = arr.at(index - 1);
            let dp = [cur[0] - prev[0], cur[1] - prev[1]];
            let dn = [next[0] - cur[0], next[1] - cur[1]];
            let res;
            if (index == 0) {
                if (dn[1] == 0) {
                    if (dn[0] != 0) {
                        res = `M ${quietOffset+cur[0]+1} ${quietOffset+cur[1]}`;
                    } else {
                        res = `M ${quietOffset+cur[0]+0.5} ${quietOffset+cur[1]}`;
                    }
                } else {
                    res = `M ${quietOffset+cur[0]+1} ${quietOffset+cur[1]+1}`;
                }
            } else {
                let s = dp[1] < 0 ? -1 : (dp[1] > 0 ? 1 : 0), c = dp[0] < 0 ? -1 : (dp[0] > 0 ? 1 : 0);
                let ds = dp[0] * dn[1] - dp[1] * dn[0], dc = dp[0] * dn[0] + dp[1] * dn[1];
                ds = ds < 0 ? -1 : (ds > 0 ? 1 : 0);
                dc = dc < 0 ? -1 : (dc > 0 ? 1 : 0);
                if (ds >= 0) {
                    res = acc + ` l ${dp[0] - 0.5 * c} ${dp[1] - 0.5 * s}`;
                    if (ds > 0 || dc < 0) {
                        res += ` a 0.5 0.5 0 ${s == 0 && c == 0 ? 1 : 0} 1 `;
                        if (ds > 0) {
                            res += `${0.5*(c-s)} ${0.5*(s+c)}`;
                        } else {
                            res += `${-s} ${c}`;
                        }
                    } else if (s == 0 && c == 0) {
                        res += ` a 0.5 0.5 0 0 1 0 1 a 0.5 0.5 0 0 1 0 -1`;
                    }
                    res += ` l ${0.5 * (c*dc - s*ds)} ${0.5 * (s*dc + c*ds)}`;
                } else {
                    res = acc + ` l ${dp[0] - c} ${dp[1] - s}`;
                }
            }
            return res;
        }, "") + " Z"
    ).concat(exs.map((ps)=>
        ps.reduce((acc, _cur, _index, _arr)=>{
            let cur = _arr.at(_index - _arr.length);
            if (acc.length < 2) { acc.push(cur); }
            else {
                if ((acc.at(-1)[0] - acc.at(-2)[0]) * (cur[0] - acc.at(-1)[0]) + (acc.at(-1)[1] - acc.at(-2)[1]) * (cur[1] - acc.at(-1)[1]) <= 0) {
                    acc.push(cur);
                } else {
                    acc.splice(-1, 1, cur);
                }
            }
            return acc;
        }, []).reverse().reduce((acc, cur, index, arr)=>{
            let next = arr.at(index % (arr.length - 1) - arr.length + 1);
            let prev = arr.at(index - 1);
            let dp = [cur[0] - prev[0], cur[1] - prev[1]];
            let dn = [next[0] - cur[0], next[1] - cur[1]];
            let res;
            if (index == 0) {
                if (dn[1] == 0) {
                    if (dn[0] != 0) {
                        res = `M ${quietOffset+cur[0]+1} ${quietOffset+cur[1]}`;
                    } else {
                        res = `M ${quietOffset+cur[0]+0.5} ${quietOffset+cur[1]}`;
                    }
                } else {
                    res = `M ${quietOffset+cur[0]+1} ${quietOffset+cur[1]+1}`;
                }
            } else {
                let s = dp[1] < 0 ? -1 : (dp[1] > 0 ? 1 : 0), c = dp[0] < 0 ? -1 : (dp[0] > 0 ? 1 : 0);
                let ds = dp[0] * dn[1] - dp[1] * dn[0], dc = dp[0] * dn[0] + dp[1] * dn[1];
                ds = ds < 0 ? -1 : (ds > 0 ? 1 : 0);
                dc = dc < 0 ? -1 : (dc > 0 ? 1 : 0);
                if (ds >= 0) {
                    res = acc + ` l ${dp[0] - 0.5 * c} ${dp[1] - 0.5 * s}`;
                    if (ds > 0 || dc < 0) {
                        res += ` a 0.5 0.5 0 ${s == 0 && c == 0 ? 1 : 0} 1 `;
                        if (ds > 0) {
                            res += `${0.5*(c-s)} ${0.5*(s+c)}`;
                        } else {
                            res += `${-s} ${c}`;
                        }
                    } else if (s == 0 && c == 0) {
                        res += ` a 0.5 0.5 0 0 1 0 1 a 0.5 0.5 0 0 1 0 -1`;
                    }
                    res += ` l ${0.5 * (c*dc - s*ds)} ${0.5 * (s*dc + c*ds)}`;
                } else {
                    res = acc + ` l ${dp[0] - c} ${dp[1] - s}`;
                }
            }
            return res;
        }, "") + " Z"
    ))).join(" "));

    svg.viewBox.baseVal.width += quietOffset * 2;
    svg.viewBox.baseVal.height += quietOffset * 2;
}

function onHomeClicked(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    next.router.prefetch(defaultHome);
    next.router.push(defaultHome);
}

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
    // Overwrite home button behavior
    let homebutton = document.querySelector("a[href=\"/home\"]:has(> img)");
    if (homebutton && !homebutton._overwritten) {
        homebutton.addEventListener("click", onHomeClicked, {capture: true});
        homebutton._overwritten = true;
        messageExt("getSettings").then((settings)=>{
            defaultHome = settings.defaultHome || "/home";
        });
    }

    // load muted words
    messageExt("getSettings").then((settings)=>{
            mutedWords.splice(0, mutedWords.length, ...(settings.mutedWords || []));
            mutedWords._set_ready();
    });
    await mutedWords._ready;

    if (location.pathname.startsWith("/field/")) {
        let qrPopup = document.querySelector("div:has(> h3 + img[src^=\"data:\"] + p:nth-child(3))");
        if (location.pathname.match("\\/field\\/"+username+"(?:[?/].*)?$") && qrPopup != undefined) {
            (async ()=>{
                try {
                    // create QR code
                    let images = {};

                    let qrdiv = document.createElement("div");
                    let qrcode = new QRCode(qrdiv, {
                        text: location.href,
                        correctLevel: QRCode.CorrectLevel.M,
                        useSVG: true
                    });

                    let qrSVG = qrdiv.firstElementChild;

                    qrSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");

                    convertQRCodeSVG(qrSVG);

                    let qrImg = new Image(qrSVG.viewBox.baseVal.width * 16, qrSVG.viewBox.baseVal.height * 16);
                    qrSVG.setAttribute("width", qrImg.width + "px");
                    qrSVG.setAttribute("height", qrImg.height + "px");
                    console.log(qrSVG);

                    let btns = document.createElement("div");
                    btns.className = "relative w-full inline-flex flex-col items-stretch gap-2";

                    let urlEntry = document.createElement("input");
                    urlEntry.type = "text";
                    urlEntry.value = location.href; //"https://fiicen.jp/field/" + username;
                    urlEntry.className = "w-full rounded-full border p-4 focus:border-sky-500";
                    urlEntry.style.paddingRight = "4.5rem";
                    btns.appendChild(urlEntry);

                    urlEntry.addEventListener("focus", (e)=>{
                        urlEntry.select();
                        navigator.clipboard.writeText(urlEntry.value)
                            .then(()=>alertMoment("リンクをコピーしました"))
                            .catch(()=>alertMoment("リンクのコピーに失敗しました"));
                    })

                    for (let item of [{
                        text: "copy",
                        className: "absolute top-2 right-2 accent-bg accent-bg-hover w-full rounded-full px-2 py-2 font-bold",
                        style: {
                            "width": "4rem",
                        },
                        callback: (e)=>{
                            urlEntry.select();
                        }
                    }, {
                        text: ".pngをダウンロード",
                        className: "accent-bg accent-bg-hover w-full rounded-full px-6 py-2 font-bold",
                        callback: (e)=>{
                            if (images.png != undefined) {
                                images.png.then((url)=>{
                                    let anchor = document.createElement("a");
                                    anchor.style.display = "none";
                                    anchor.href = url;
                                    anchor.setAttribute("download", "qrcode.png");
                                    document.body.append(anchor);
                                    anchor.click();
                                    anchor.remove();
                                });
                            }
                        }
                    }, {
                        text: ".svgをダウンロード",
                        className: "accent-bg accent-bg-hover w-full rounded-full px-6 py-2 font-bold",
                        callback: (e)=>{
                            if (images.svg != undefined) {
                                console.log("svg...");
                                images.svg.then((url)=>{
                                    console.log("svg");
                                    let anchor = document.createElement("a");
                                    anchor.style.display = "none";
                                    anchor.href = url;
                                    anchor.setAttribute("download", "qrcode.svg");
                                    document.body.append(anchor);
                                    anchor.click();
                                    anchor.remove();
                                });
                            }
                        }
                    }]) {
                        let btn = document.createElement("button");
                        btn.innerText = item.text;
                        btn.className = item.className || "";
                        if (item.style) {
                            for (let [key, value] of Object.entries(item.style)) {
                                btn.style[key] = value;
                            }
                        }
                        btns.appendChild(btn);
                        btn.addEventListener("click", item.callback);
                    }

                    let qrImgEl = qrPopup.querySelector("img");
                    qrImgEl.insertAdjacentElement("afterend", qrImgEl.cloneNode());
                    qrImgEl.style.display = "none";
                    qrImgEl.classList.add("hidden");
                    qrImgEl = qrImgEl.nextElementSibling;

                    let svgDataUrl = "data:image/svg+xml;base64,"+btoa(Array.from((new TextEncoder()).encode(qrSVG.outerHTML), (i)=>String.fromCodePoint(i)).join(""));

                    qrImgEl.src = svgDataUrl;

                    images.svg = new Promise((resolve, reject)=>{
                        resolve(qrImgEl.src);
                    });

                    images.png = new Promise((resolve, reject)=>{
                        qrImg.addEventListener("load", (e)=>{
                            let canvas = new OffscreenCanvas(qrImg.width, qrImg.height);
                            let ctx = canvas.getContext("2d");
                            ctx.fillStyle = "#ffffff";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(qrImg, 0, 0, qrImg.width, qrImg.height);

                            canvas.convertToBlob({type: "image/png"}).then((blob)=>{
                                let objUrl = URL.createObjectURL(blob);
                                resolve(objUrl);
                                qrImgEl.src = objUrl;
                            }).catch(reject);
                        });
                        qrImg.src = qrImgEl.src;
                    });

                    qrPopup.classList.add("qrcode-popup");

                    qrPopup.lastChild.insertAdjacentElement("beforebegin", btns);
                } catch (e) {
                    outputError(e);
                }
            })();
        }
        if (!document.querySelector("div:has(> div:where(div:first-child, div:first-child + div) + header + main) > div:first-child > div:not(:has(> div:nth-child(3))) > p:nth-child(2) > img")) {
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
                    if (document.querySelector("div:has(> div:where(div:first-child, div:first-child + div) + header + main)")) {
                        // user seems to exist
                        let _inject_badge = setInterval(()=>{
                            let displayNameP = document.querySelector("div:has(> div:where(div:first-child, div:first-child + div) + header + main) > div:first-child > div:not(:has(> div:nth-child(3))) > p:nth-child(2)");
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
                let nextSibEl = document.querySelector("div:has(> div:where(div:first-child, div:first-child + div) + header + main) > div:first-child > div:not(:has(> div:nth-child(3))):not(:has(> div.flex > span.text-danger)) > div.grid");
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
            let circles = document.querySelectorAll(":where(div:where(div:first-child, div:first-child + div) + header + main > div > div > div:first-child, main:not(div:where(div:first-child, div:first-child + div) + header + main) > div:first-child > div, header + div.flex > div.mt-10 > div:last-child > div.flex) > div.relative:not(.aspect-square)");
            if (circles.length == 0) {
                return;
            } else {
                clearInterval(__timer_id);
            }
            for (let circleIndex = 0; circleIndex < circles.length; circleIndex++) {
                let circle = circles[circleIndex];
                clearInterval(circle.__timer_id);
                if (circle.matches(":has(> a)")) {
                    continue;
                }
                circle.__timer_id = setInterval((circle)=>{
                    let props;
                    try {
                        props = circle.parentElement[Object.keys(circle.parentElement).filter((key)=>key.startsWith("__reactProps"))[0]].children.props.children[circleIndex].props.defaultCircle;
                    } catch (e) {
                        return;
                    }
                    clearInterval(circle.__timer_id);
                    modifyDynamicCircle(circle, props);
                    modifyCircle(props);
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
    } else if (location.pathname.startsWith("/message")) {
        {
            let entries = document.querySelectorAll("main > div > div > div + ul > li");

            for (let entryIndex = 0; entryIndex < entries.length; entryIndex++ ) {
                let entry = entries[entryIndex];
                entry.__timer_id = setInterval((entry)=>{
                    let props;
                    try {
                        props = entry.parentElement[Object.keys(entry.parentElement).filter((key)=>key.startsWith("__reactProps"))[0]].children[entryIndex].props;
                    } catch (e) {
                        return;
                    }
                    clearInterval(entry.__timer_id);
                    
                    if (props.badge == null && props.direct_user != null && entry.firstChild.firstChild.lastChild.firstChild.querySelector("img") == undefined) {
                        modifyUser(props.direct_user);
                        props.badge = props.direct_user.badge;
                        if (props.badge != null) {
                            let badge = document.createElement("img");
                            let encodedBadgeURI = encodeURIComponent(props.badge.image);
                            badge.alt = props.badge.type;
                            badge.loading = "lazy";
                            badge.width = 16;
                            badge.height = 16;
                            badge.async = true;
                            badge.className = "ml-1 size-4 shrink-0";
                            badge.style.color = "transparent";
                            badge.srcset = "/_next/image?url=" + encodedBadgeURI + "&w=16&q=75 1x, /_next/image?url=" + encodedBadgeURI + "&w=32&q=75 2x";
                            badge.src="/_next/image?url=" + encodedBadgeURI + "&w=32&q=75";
                            entry.firstChild.firstChild.lastChild.firstChild.lastChild.insertAdjacentElement("beforebegin", badge);
                        }
                    }
                }, 20, entry);
            }
        }
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

function addQuoteButton(popupWindow, data) {
    if (popupWindow && data && popupWindow.querySelector("& > div:first-child > button.quote") == undefined) {
        let shareBtn = document.createElement("button");
        shareBtn.className = "quote base-bg-hover flex w-full gap-4 px-4 py-3";
        shareBtn.append(document.createElement("img"));
        assets["quote"].then((url)=>{
            shareBtn.firstChild.src = url;
        });
        shareBtn.firstChild.className = "size-5";
        shareBtn.firstChild.style.color = "transparent";
        shareBtn.append(document.createElement("p"));
        shareBtn.lastChild.innerText = "サークルを疑似引用";
        let [circleId, circleAuthor] = ((data)=>{
            while (data.refly_from) {
                data = data.refly_from;
            }
            return [data.id, data.author.account_name];
        })(data);
        shareBtn.addEventListener("click", ()=>{
            let createCircleBtn = document.querySelector("nav > button");
            let circleTextArea = document.querySelector("body > div > div > form:has(input[name=\"media_attachments\"]) textarea");
            popupWindow.click();
            createCircleBtn.click();
            if (circleTextArea) { // if not, not logined
                let timer = setInterval(()=>{
                    if (!circleTextArea.disabled) {
                        clearInterval(timer);
                        circleTextArea.value = `\n@${circleAuthor} https://fiicen.jp/circle/${circleId}`;
                        circleTextArea.nextElementSibling.textContent = `${circleTextArea.value}\u200b`;
                        circleTextArea.style.height = `${circleTextArea.nextElementSibling.clientHeight}px`;
                        circleTextArea.selectionStart = circleTextArea.selectionEnd = 0;
                        circleTextArea.focus();
                        circleTextArea[Object.keys(circleTextArea).filter(key=>key.startsWith("__reactProps"))[0]].onChange({target: circleTextArea});
                    }
                }, 10);
            }
        });
        popupWindow.firstChild.lastChild.insertAdjacentElement("beforebegin", shareBtn);
        return true;
    }
    return false;
}

function doHighlight(contentDiv) {
    // highlight muting words

    if (!CSS.highlights) {
        return;
    }

    let ranges = [];

    contentDiv.querySelectorAll("& > span > :where(span, a)")
        .forEach((el)=>{
            let text = el.textContent.toLowerCase();
            mutedWords.forEach((word)=>{
                if (text.includes(word)) {
                    console.log(contentDiv, word);
                    let offset = 0;
                    while (offset < text.length) {
                        let index = text.indexOf(word, offset);
                        if (index < 0) {
                            break;
                        } else {
                            let range = new Range();
                            range.setStart(el.childNodes[0], index);
                            range.setEnd(el.childNodes[0], index + word.length);
                            ranges.push(range);
                            offset = index + 1;
                        }
                    }
                }
            });
        });

    const mutedWordsHighlight = CSS.highlights.get("muted-words") || new Highlight();

    ranges.flat().forEach((r)=>mutedWordsHighlight.add(r));

    CSS.highlights.set("muted-words", mutedWordsHighlight);
}

function modifyDynamicCircle(circle, data) {
    try {
        let contentDiv = circle.querySelector("& > div:nth-last-child(2) > div:nth-last-child(2):has(> div.mt-1.whitespace-pre-wrap.break-all)");
        let contentDivProps = contentDiv ? contentDiv[Object.keys(contentDiv).filter(key=>key.startsWith("__reactProps"))[0]] : null;

        if (data && data.id) {
            circleCache.set(data.id, data);

            // check muting words
            let text = data.text != null ? data.text : data.refly_from?.text;

            if ("string" == typeof text && mutedWords.some((word)=>text.includes(word)) && !circle.classList.contains("__muted")) { // FIXME: impl
                // mute it
                circle.classList.add("__muted");
                console.log(circle, data, mutedWords.filter((word)=>text.includes(word)));
                
                circle.querySelector("& > div:not(.base-border) > div > button.absolute.inset-0")?.addEventListener("click", (ev)=>{
                    circle.classList.remove("__muted");
                    ev.preventDefault();
                    ev.stopImmediatePropagation();

                    doHighlight(contentDiv.querySelector("& > div.mt-1.whitespace-pre-wrap.break-all"));
                }, {once: true});

                circle.__onShowMore = ()=>{doHighlight(contentDiv.querySelector("& > div.mt-1.whitespace-pre-wrap.break-all"));}; // on show-more-button pressed
            }
        }
    } catch(e) {
        console.error(e);
    }
}

function modifyCircle(circleData) {
    console.log(circleData);
    if (Object.prototype.isPrototypeOf(circleData)) {
        circleCache.set(circleData.id, circleData);
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
    let embeds = document.querySelectorAll(":where(div:where(div:first-child, div:first-child + div) + header + main > div > div > div:first-child, main:not(:nth-child(3))"
        + " > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex)"
        + " > div.relative > div:nth-last-child(2) > div:not(:first-child)"
        + " div.relative:has(> a[href=\"" + url + "\"]),"
        + " div.min-h-screen.border-x > div:first-child > div:first-child div.relative:has(> a[href=\"" + url + "\"]),"
        + " body > div.fixed.inset-0 > div.base-bg.absolute > div.base-bg-float.sticky + div:not(.p-4) > div:first-child > div > div:nth-child(2)"
        + " div.relative:has(> a[href=\"" + url + "\"])");
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
        
        if (circle) {
            quoted.append(circle.children[0].querySelector("& > div.min-w-0:first-child > div").cloneNode(3), document.createElement("div"));
            quoted.children[1].append(...[...circle.children[1].querySelectorAll("& > div:first-child, & > p:first-child, & > p:first-child + div")].map((el)=>el.cloneNode(2)));
            quoted.children[1].children[0].querySelectorAll("& > div, & > span > div").forEach((div)=>{
                let anchor =  div.querySelector("& > a:not(:first-child)");
                if (anchor) {
                    anchor.className = "relative z-[1] text-sub hover:underline";
                    anchor.innerText = div.querySelector(".text-sub")?.innerText || anchor.href;
                    div.insertAdjacentElement("beforebegin", anchor);
                }
                div.remove();
            });
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

            let imgs = Array.from(circle.querySelectorAll("div.grid > div.relative > div > div:has(> img):first-child > img"));
            let videos = circle.querySelectorAll("video");
            if (imgs.length + videos.length > 0) {
                let mediaGroup = document.createElement("div");
                mediaGroup.className = "media-group base-border";
                imgs.forEach((el)=>{
                    let img = el.cloneNode();
                    let bigImg = createBigImg(img);
                    img.className = "";
                    img.setAttribute("style", "");
                    mediaGroup.append(document.createElement("div"));
                    mediaGroup.lastChild.append(img, bigImg);
                });
                videos.forEach((el)=>{
                    let video = el.cloneNode();
                    video.className = "";
                    mediaGroup.append(document.createElement("div"));
                    mediaGroup.lastChild.append(video);
                });
                quoted.append(mediaGroup);
            }
        } else {
            quoted.append(document.createElement("div"));
            quoted.firstChild.classList.add("text-center", "text-gray-500");

            quoted.firstChild.append(document.createElement("span"));
            quoted.firstChild.firstChild.innerText = "読み込みに失敗しました";
        }

        let redirector = document.createElement("button");
        quoted.append(redirector);

        // change its style
        quoted.querySelector("div:first-child > div:first-child > div")?.classList.add("items-center");
        quoted.children[0].querySelectorAll("a.relative, a.relative > img").forEach((el)=>{
            el.classList.replace("size-10", "size-8");
        });
        quoted.children[0].querySelector("a.relative + div")?.classList.replace("flex-col", "flex-row");
        quoted.children[0].querySelector("a.relative + div")?.classList.add("gap-2");

        let embeds = document.querySelectorAll(":where(div:where(div:first-child, div:first-child + div) + header + main > div > div > div:first-child, main:not(:nth-child(3))"
            + " > div > div, header + div.flex > div.mt-10 > div:last-child > div.flex)"
            + " > div.relative > div:nth-last-child(2) > div:not(:first-child)"
            + " div.relative:has(> a[href=\"" + url + "\"]),"
            + " div.min-h-screen.border-x > div:first-child > div:first-child div.relative:has(> a[href=\"" + url + "\"]),"
            + " body > div.fixed.inset-0 > div.base-bg.absolute > div.base-bg-float.sticky + div:not(.p-4) > div:first-child > div > div:nth-child(2)"
            + " div.relative:has(> a[href=\"" + url + "\"])");
        for (let embed of embeds) {
            embed.classList.add("quoted-circle");
            embed.classList.remove("relative", "group", "items-center", "second-bg-hover");
            embed.replaceChildren(document.createElement("button"), document.createElement("div"));
            embed.lastChild.append(...quoted.cloneNode(5).children);
            embed.lastChild.lastChild.remove();
            let imgs = Array.from(embed.querySelectorAll(".media-group > div > img"));
            imgs.forEach((img)=>{
                let bigImg = img.nextElementSibling;
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
            });
            let videos = Array.from(embed.querySelectorAll(".media-group > div > video"));
            videos.forEach((video)=>{
                video.addEventListener("click", (e)=>{
                    e.preventDefault();
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            });
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

function createModal(title, beforeClose=undefined) {
    let modal = document.createElement("div");

    modal.className = "fixed bottom-0 left-0 z-10 h-screen w-screen duration-300 pointer-events-none bg-transparent z-20 flex flex-col justify-end p-4 md:justify-center undefined";

    modal.append(
        document.createElement("div")
    );

    modal.firstChild.className = "base-bg mx-auto h-2/3 w-full max-w-xl rounded-3xl scale-75 opacity-0 blur overflow-y-auto duration-300 h-auto p-4"

    modal.firstChild.append(
        document.createElement("div"),
        document.createElement("div")
    );

    modal.firstChild.firstChild.className = "mb-2 flex items-center justify-between";
    modal.firstChild.lastChild.className = "flex flex-col gap-4 text-left";

    modal.firstChild.firstChild.append(
        document.createElement("h1"),
        document.createElement("button")
    );

    modal.firstChild.firstChild.firstChild.className = "text-xl font-bold";
    modal.firstChild.firstChild.firstChild.innerText = title;
    
    modal.firstChild.firstChild.lastChild.className = "base-bg-hover rounded-full p-2";

    modal.firstChild.firstChild.lastChild.append(
        document.createElementNS("http://www.w3.org/2000/svg","svg")
    );

    modal.firstChild.firstChild.lastChild.firstChild.setAttribute("class", "size-5");
    modal.firstChild.firstChild.lastChild.firstChild.setAttribute("fill", "none");
    modal.firstChild.firstChild.lastChild.firstChild.setAttribute("viewBox", "0 0 24 24");
    modal.firstChild.firstChild.lastChild.firstChild.setAttribute("stroke", "currentColor");
    modal.firstChild.firstChild.lastChild.firstChild.setAttribute("strokeWidth", "1.5");

    modal.firstChild.firstChild.lastChild.firstChild.append(
        document.createElementNS("http://www.w3.org/2000/svg","path")
    );

    modal.firstChild.firstChild.lastChild.firstChild.firstChild.setAttribute("stroke-linecap", "round");
    modal.firstChild.firstChild.lastChild.firstChild.firstChild.setAttribute("stroke-linejoin", "round");
    modal.firstChild.firstChild.lastChild.firstChild.firstChild.setAttribute("d", "M6 18 18 6M6 6l12 12");

    modal.firstChild.lastChild.append(
        document.createElement("div")
    );

    modal.firstChild.lastChild.firstChild.append(
        document.createElement("div")
    );

    let openModal = ()=>{
        modal.classList.add("bg-black/20");
        modal.classList.remove("pointer-events-none", "bg-transparent");
        modal.children[0].classList.remove("blur", "scale-75", "opacity-0");
    }


    let closeModal = ()=>{
        if (beforeClose) {
            beforeClose();
        }
        modal.classList.remove("bg-black/20");
        modal.classList.add("pointer-events-none", "bg-transparent");
        modal.children[0].classList.add("blur", "scale-75", "opacity-0");
    };

    modal.querySelector("button").onclick = closeModal;

    modal.onclick = (ev)=>{
        if (ev.target == modal) {
            closeModal();
        }
    };

    return {modal: modal, body: modal.firstChild.lastChild.firstChild.firstChild, open: openModal, close: closeModal};
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

        let compactModeButton = document.createElement("label");
        compactModeButton.className = "flex items-center gap-4 p-4 dark-bg-base";

        compactModeButton.append(
            document.createElement("input"),
            document.createElement("p")
        );

        compactModeButton.firstChild.type = "checkbox";
        compactModeButton.firstChild.name = "use-compact-mode";
        compactModeButton.firstChild.className = "fiicen-improver-checkbox";
        compactModeButton.firstChild.disabled = true;

        compactModeButton.lastChild.innerText = "コンパクトに表示";

        settingForm.querySelector("label:last-child").insertAdjacentElement("afterend", systemThemeButton);
        systemThemeButton.insertAdjacentElement("afterend", compactModeButton);

        messageExt("getSettings").then((settings)=>{
            if (settings.systemTheme !== undefined) {
                systemThemeButton.firstChild.checked = settings.systemTheme;
                systemThemeButton.firstChild.disabled = false;
                settingForm.addEventListener("submit", ()=>{
                    messageExt("setSettings", {systemTheme: systemThemeButton.firstChild.checked});
                });
            }
            if (settings.customStyle !== undefined) {
                compactModeButton.firstChild.checked = settings.customStyle == "compact";
                compactModeButton.firstChild.disabled = false;
                settingForm.addEventListener("submit", ()=>{
                    messageExt("setSettings", {customStyle: compactModeButton.firstChild.checked ? "compact" : null});
                });
            }
        });
    }

    if (location.pathname == "/settings/privacy-and-security/what-you-see" && document.querySelector("main ul > li:has(> a[href=\"/settings/privacy-and-security/what-you-see/muted-accounts\"]) + li:not(:has(> a))") == undefined) {
        // muted words settings
        let detailSettingList = document.querySelector("main ul:has(> li > a[href=\"/settings/privacy-and-security/what-you-see/muted-accounts\"])");

        // setting item

        let muteSettingItem = document.createElement("li");

        muteSettingItem.className = "relative false _fiicen_improver_settings";

        muteSettingItem.append(document.createElement("div"));
        muteSettingItem.firstChild.append(
            document.createElement("div"),
            document.createElementNS("http://www.w3.org/2000/svg","svg")
        );

        muteSettingItem.firstChild.className = "base-bg-hover flex items-center justify-between p-4";

        muteSettingItem.firstChild.firstChild.appendChild(document.createElement("p"));
        muteSettingItem.firstChild.firstChild.firstChild.innerText = "ミュート中の言葉を管理";

        muteSettingItem.firstChild.lastChild.setAttribute("class", "size-6 shrink-0 opacity-50");
        muteSettingItem.firstChild.lastChild.setAttribute("fill", "currentColor");
        muteSettingItem.firstChild.lastChild.setAttribute("viewBox", "0 0 24 24");
        muteSettingItem.firstChild.lastChild.setAttribute("stroke", "none");

        muteSettingItem.firstChild.lastChild.append(
            document.createElementNS("http://www.w3.org/2000/svg","path")
        );

        muteSettingItem.firstChild.lastChild.firstChild.setAttribute("d", "M 3 4 C 3 3.448 3.448 3 4 3 L 19.978 3 C 20.241 2.994 20.506 3.092 20.707 3.293 C 20.908 3.494 21.006 3.759 21 4.022 L 21 20 C 21 20.552 20.552 21 20 21 C 19.448 21 19 20.552 19 20 L 19 6.414 L 4.707 20.707 C 4.317 21.098 3.683 21.098 3.293 20.707 C 2.902 20.317 2.902 19.683 3.293 19.293 L 17.586 5 L 4 5 C 3.448 5 3 4.552 3 4 Z");

        // setting modal

        let {
            modal: muteSettingModal,
            body: muteSettingBody,
            open: openMuteSettingModal,
            close: closeMuteSettingModal
        } = createModal("ミュート中の言葉を管理", ()=>{history.pushState({}, '', location.pathname);});

        muteSettingBody.classList.add("flex", "flex-col", "max-h-\[80vh\]", "h-80");

        let muteWordForm = document.createElement("form");
        muteWordForm.className = "flex flex-row gap-2 mb-2";

        muteWordForm.append(document.createElement("div"));
        muteWordForm.lastChild.className = "form-field w-full";
        muteWordForm.lastChild.append(document.createElement("input"));
        muteWordForm.lastChild.lastChild.type = "text";
        muteWordForm.lastChild.lastChild.name = "word";
        muteWordForm.lastChild.lastChild.placeholder = "ミュートする言葉を入力...";
        muteWordForm.lastChild.lastChild.required = true;
        muteWordForm.lastChild.lastChild.className = "size-full disabled:opacity-50";

        muteWordForm.append(document.createElement("input"));
        muteWordForm.lastChild.type = "submit";
        muteWordForm.lastChild.value = "追加";
        muteWordForm.lastChild.className = "accent-bg w-20 rounded-full px-6 py-2 font-bold disabled:opacity-50";


        muteSettingBody.append(muteWordForm);

        muteSettingBody.append(document.createElement("ul"));
        muteSettingBody.lastChild.style.overflowY = "scroll";

        let updateMutedWords = (words)=>{
            muteSettingBody.lastChild.replaceChildren(document.createElement("div"));
            muteSettingBody.lastChild.firstChild.className = "size-8 animate-spin rounded-full border-4 border-main/50 border-t-main mx-auto";

            Array.from(muteWordForm.elements).forEach((el)=>{
                el.disabled = true;
            });

            return new Promise((resolve, reject)=>{
                messageExt("setSettings", {mutedWords: words}).finally(()=>{
                    // mutedWords would already be updated by update event handler
                    messageExt("getSettings").then((settings)=>{
                        mutedWords.splice(0, mutedWords.length, ...settings.mutedWords);
                        Array.from(muteWordForm.elements).forEach((el)=>{
                            el.disabled = false;
                        });
                        showMutedWords();
                    }).then(resolve).catch(reject);
                });
            });
        };

        let showMutedWords = ()=>{
            muteSettingBody.lastChild.replaceChildren();
            mutedWords.forEach((word)=>{
                muteSettingBody.lastChild.appendChild(
                    document.createElement("li")
                );

                muteSettingBody.lastChild.lastChild.className = "base-bg-hover overflow-hidden p-4 flex gap-1 items-center justify-between";

                muteSettingBody.lastChild.lastChild.append(
                    document.createElement("span"),
                    document.createElement("button")
                );

                muteSettingBody.lastChild.lastChild.firstChild.innerText = word;

                muteSettingBody.lastChild.lastChild.lastChild.innerText = "解除";
                muteSettingBody.lastChild.lastChild.lastChild.className = "rounded-full border border-danger px-6 py-2 font-bold text-danger duration-300 hover:bg-danger/10 disabled:opacity-50";

                muteSettingBody.lastChild.lastChild.lastChild.onclick = (e)=>{
                    updateMutedWords(mutedWords.filter((w)=>w != word));
                }
            });
        };

        showMutedWords();

        muteWordForm.onsubmit = (e)=>{
            e.preventDefault();
            let word = e.target.elements["word"]?.value?.toLowerCase();

            if (!word) {
                window.alert("言葉を入力してください");
            } else if (mutedWords.includes(word)) {
                window.alert("その言葉はすでに登録済みです");
            } else {
                e.target.elements["word"].value = "";
                updateMutedWords([...mutedWords, word]);
            }

            e.target.elements["word"]?.focus();
        };

        muteSettingItem.append(muteSettingModal);

        detailSettingList.append(muteSettingItem);

        muteSettingItem.children[0].addEventListener("click", ()=>{
            if (location.hash != "#fiicen-improver-settings--muted-words") {
                location.hash = "#fiicen-improver-settings--muted-words";
            }
            showMutedWords();
            openMuteSettingModal();
        });

        if (location.hash == "#fiicen-improver-settings--muted-words") {
            showMutedWords();
            openMuteSettingModal();
        }
    }

    let settingList = document.querySelector("main > div > ul");
    let settingItem;

    if (settingList.lastChild.lastChild.tagName.toUpperCase() != "DIV") {
        settingItem = document.createElement("li");

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

        // setting modal

        let {
            modal: settingModal,
            body: settingBody,
            open: openSettingModal,
            close: closeSettingModal
        } = createModal("Fiicen Improver の設定", ()=>{history.pushState({}, '', location.pathname);});

        for (let item of [
            {name: "datasaver", text: "データセーバー"},
            {name: "asyncNotification", text: "リアルタイム通知"},
            {name: "defaultHome", text: "デフォルトホーム"},
            {name: "debug", text: "デバッグモード"}
        ]) {
            settingBody.append(
                document.createElement("section")
            );

            settingBody.lastChild.append(
                document.createElement("label"),
                document.createElement(item.name != "defaultHome" ? "input" : "select")
            );

            settingBody.lastChild.firstChild.innerText = item.text;
            settingBody.lastChild.firstChild.setAttribute("for", item.name);

            settingBody.lastChild.lastChild.setAttribute("name", item.name);

            if (item.name != "defaultHome") {
                settingBody.lastChild.lastChild.setAttribute("type", "checkbox");
            } else {
                for (let entry of [
                    {name: "おすすめ", value: "/home"},
                    {name: "フォロー中", value: "/home/following"},
                ]) {
                    settingBody.lastChild.lastChild.append(
                        document.createElement("option")
                    );
                    settingBody.lastChild.lastChild.lastChild.innerText = entry.name;
                    settingBody.lastChild.lastChild.lastChild.setAttribute("value", entry.value);
                }
            }

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
                let item = settingBody.querySelector(`input[name="${key}"], select[name="${key}"]`);
                if (item == undefined) {
                    continue;
                }
                if (item.tagName == "INPUT" && item.type == "checkbox") {
                    item.checked = settings[key];
                    item.addEventListener("change", (ev)=>{
                        let data = {};
                        data[ev.target.getAttribute("name")] = ev.target.checked;
                        messageExt("setSettings", data);
                    });
                } else {
                    item.value = settings[key];
                    item.addEventListener("change", (ev)=>{
                        let data = {};
                        data[ev.target.getAttribute("name")] = ev.target.value;
                        messageExt("setSettings", data);
                    });
                }
            }
        });

        settingItem.append(settingModal);

        settingList.append(settingItem);

        settingItem.children[0].addEventListener("click", ()=>{
            if (location.hash != "#fiicen-improver-settings") {
                location.hash = "#fiicen-improver-settings";
            }
            openSettingModal();
        });
    } else {
        settingItem = settingList.lastChild;
    }

    if (location.hash == "#fiicen-improver-settings") {
        settingItem.children[0].click();
    }
}

// Improve post form

document.addEventListener("paste", (e)=>{
    if (!e.target.form || !e.target.form.elements["media_attachments"]) {
        return;
    }
    let mediaInput = e.target.form.elements["media_attachments"];
    addMediaFiles(mediaInput, e.clipboardData.files);
}); 

function addMediaFiles(targetInput, files) {
    let promises = [];
    for (let file of files) {
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
            promises.push(
                file.arrayBuffer().then((buffer)=>{
                    return new File([buffer,], file.name,
                        {
                            type: file.type,
                            lastModified: file.lastModified
                        }
                    );
                }).catch(()=>{})
            );
        }
        Promise.all(promises).then((files)=>{
            if (targetInput) {
                targetInput[Object.keys(targetInput).filter(key=>key.startsWith("__reactProps"))[0]].onChange({
                    target: {
                        files: files
                    }
                });
            }
        });
    }
}

window.addEventListener("dragenter", (e)=>{
    if (e.target.matches("form:has(textarea), form:has(textarea) *")) {
        let f = e.target;
        while (f.tagName != "FORM") {
            f = f.parentElement;
        }

        if (f.elements["media_attachments"] && !f.classList.contains("drag-in")) {
            f.classList.add("drag-in");

            let ondragleave = (e)=>{
                if (f.contains(e.target) && (e.relatedTarget == null || !f.contains(e.relatedTarget))) {
                    f.classList.remove("drag-in");
                    f.removeEventListener("dragleave", ondragleave);
                    f.removeEventListener("dragover", ondragover);
                    f.removeEventListener("drop", ondrop);
                }
            };

            let ondragover = (e)=>{
                e.preventDefault();
            };

            let ondrop = (e)=>{
                e.preventDefault();
                f.removeEventListener("dragleave", ondragleave);
                f.removeEventListener("dragover", ondragover);
                f.classList.remove("drag-in");
                let mediaInput = f.elements["media_attachments"];
                addMediaFiles(mediaInput, e.dataTransfer.files || []);
            };

            f.addEventListener("dragleave", ondragleave);
            f.addEventListener("dragover", ondragover);
            f.addEventListener("drop", ondrop, {once: true});
        }
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
                    } else if (results[0].unread_messages_count != undefined) {
                        results.forEach((entry)=>{
                            if (entry.direct_user != null && entry.badge == null) {
                                let user = entry.direct_user;
                                if (user.account_name == developer_account) {
                                    entry.badge = {
                                        type: "extension-developer",
                                        image: badgeURLs.developer
                                    };
                                } else if (testers.includes(user.account_name)) {
                                    entry.badge = {
                                        type: "extension-tester",
                                        image: badgeURLs.tester
                                    };
                                } else if (user.account_name == username) {
                                    entry.badge = {
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
function datasaverClickListener(e) {
    if (e.target.tagName == "IMG" && (e.target.computedStyleMap && e.target.computedStyleMap().get("--imprv-saved") || window.getComputedStyle && window.getComputedStyle(e.target).getPropertyValue("--imprv-saved"))) {
        // it is data-saved image
        let bigImg = (e.target.parentElement.parentElement.classList.contains("media-group") ? e.target.nextElementSibling : e.target.parentElement.nextElementSibling)?.querySelector("img");
        e.target.srcset = (e.target.srcset || e.target.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
        e.target.src = (e.target.src || e.target.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
        if (bigImg) {
            bigImg.srcset = (bigImg.srcset || bigImg.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
            bigImg.src = (bigImg.src || bigImg.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
        }
        let mediaElement = e.target.parentElement.parentElement.parentElement;
        if (mediaElement.classList.contains("relative")) {
            if (!mediaElement.classList.contains("aspect-square")) {
                try {
                    let props = mediaElement[Object.keys(mediaElement).filter(key=>key.startsWith("__reactProps"))[0]].children[0].props;
                    if (props.asset.url.includes("?")) {
                        props.asset.url += "&_=_";
                    } else {
                        props.asset.url += "?_=_";
                    }
                } catch {}
            } else {
                try {
                    let props = mediaElement[Object.keys(mediaElement).filter(key=>key.startsWith("__reactProps"))[0]].children.props;
                    if (props.src.includes("?")) {
                        props.src += "&_=_";
                    } else {
                        props.src += "?_=_";
                    }
                    props.children.props.src = props.src;
                } catch {}
            }
        }
    }
}

document.addEventListener("click", datasaverClickListener);

// hack Event.prototype.stopPropagation to catch all events
Event.prototype._stopPropagation = Event.prototype._stopPropagation || Event.prototype.stopPropagation;

Event.prototype.stopPropagation = (function() {
    this._stopPropagation();
    if (this.type == "click") {
        datasaverClickListener(this);
    }
});

var observer = new MutationObserver((records, obs)=>{
    for (let record of records) {
        for (let node of record.addedNodes) {
            if (node.parentElement == document.body && node.classList.contains("fixed")) {
                if (node.matches("div.fixed:has(> div.base-bg.absolute:first-child:last-child > div.p-4:not(:first-child):last-child > button.w-full.rounded-full):has(> div.base-bg.absolute:first-child:last-child > .base-bg-hover)")) {
                    // node would be popup
                    try {
                        let circle_id = node[Object.keys(node).filter((key)=>key.startsWith("__reactProps"))[0]].children.props.children.find((child)=>child && child.props && child.props.id != undefined).props.id;
                        addQuoteButton(node, circleCache.get(circle_id));
                    } catch (e) {console.error(e);}
                } else if (node.matches("div.fixed:has(> div.base-bg.absolute:first-child:last-child > div.p-4:not(:first-child):last-child > button.w-full.rounded-full):has(> div.base-bg.absolute:first-child:last-child > .base-bg-float.sticky + div > form)")) {
                    // circle detail
                    // highlight muted words
                    node.querySelectorAll("& > div > div:not(.sticky):not(.p-4) > div.base-border:not(.flex):not(.text-sm) > div:not(.relative) > div:not(.flex):nth-child(2) > div.mt-1.whitespace-pre-wrap.break-all, & > div > div:not(.sticky):not(.p-4) > div.base-border:not(.flex):not(.text-sm) > div.relative > div > div.base-border > div.mt-1.whitespace-pre-wrap.break-all")
                        .forEach(doHighlight);
                } else if (node.matches("div.fixed:has(> img, div.w-full.h-full img.rounded-full)")) {
                    // zoomed image
                    let bigImg = node.querySelector("img");
                    try {
                        bigImg.srcset = (bigImg.srcset || bigImg.getAttribute("_srcset") || "").replaceAll("image?url=", "image?_&url=");
                        bigImg.src = (bigImg.src || bigImg.getAttribute("_src") || "").replace("image?url=", "image?_&url=");
                    } catch (e) {console.error(e);}
                }
            }
        }
        if (record.target.matches("div.mt-1.whitespace-pre-wrap.break-all")) {
            for (let node of record.removedNodes) {
                if (node.matches("button.relative.text-sm.font-semibold.text-main")) {
                    // it's show more button, so check links again
                    // call __onShowMore of circle element
                    let onShowMore = record.target.parentElement.parentElement.parentElement.__onShowMore;
                    if (onShowMore) {
                        onShowMore();
                    }
                }
            }
        }
    }
    try {
        circleAmount = 0;
        let circleParents = document.querySelectorAll(":where(div:where(div:first-child, div:first-child + div) + header + main > div > div > div:first-child, main:not(div:where(div:first-child, div:first-child + div) + header + main) > div:first-child > div:first-child, div:where(.p-4, .px-4.pt-2) > div > div.flex.flex-col.gap-4:has( > div.relative.flex))");
        for (let circleParent of circleParents) {
            let _circleAmount = circleParent._circleAmount || 0;
            let circles = Array.from(circleParent.children).filter((child)=>child.matches("div.relative"));
            let circleDatas = Array.from(circleParent[Object.keys(circleParent).filter((key)=>key.startsWith("__reactProps"))[0]].children.props.children).filter((prop)=>prop.type != "div");
            if (_circleAmount < circles.length) {
                circleParent._circleAmount = circles.length;
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
