console.log("field.js was loaded");

var translateElement = (r, el)=>{
  let children = el.children ? [...el.children].map((el)=>translateElement(r, el)) : [];
  return (0, r.jsx)(el.tagName,
    Object.values(el.attributes).reduce((al, attr)=>{
      al[attr.nodeName] = attr.value
      return al;
    }, {children: children}));
}

(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[25565], {
  25565: function(e, t, n) {
    "use strict";
    n.d(t, {
        default: function() {
            return x
        }
    });
    var r = n(7437)
      , s = n(2265)
      , h = e => {
        let {image: t, display_name: n, introduce: s} = e;
        return (0,
        r.jsxs)("div", {
            className: "flex flex-col gap-4 text-left",
            children: (0,
            r.jsx)("div", {
                children:  translateElement(r, (new QRCode(document.createElement("div"), {text: location.href, useSVG: true}))._el)
            })
        })
    }
      , b = n(3561)
      , x = e => {
        let {image: t, display_name: n, introduce: a} = e
          , [c,l] = (0,
        s.useState)(!1);
        return ((result)=>{
          console.log(result);
          return result;
        })((0,
        r.jsxs)("div", {
            children: [(0,
            r.jsx)("button", {
                onClick: () => l(!0),
                className: "rounded-full border border-gray-500 px-6 py-2 font-bold duration-300 hover:bg-black/10 hover:dark:bg-white/10",
                children: (0,
                  r.jsx)("img", {
                      src: ((url)=>{
                        url.pathname="/images/followQR.svg";
                        return url.href;
                      })(new URL(_injectedjs_url))
                  })
            }), (0,
            r.jsxs)(b.Z, {
                isOpen: c,
                close: () => l(!1),
                className: "h-auto p-4",
                children: [(0,
                r.jsxs)("div", {
                    className: "mb-2 flex items-center justify-between",
                    children: [(0,
                    r.jsx)("h1", {
                        className: "text-xl font-bold",
                        children: "QRコード"
                    }), (0,
                    r.jsx)("button", {
                        type: "button",
                        onClick: () => l(!1),
                        className: "base-bg-hover rounded-full p-2",
                        children: (0,
                        r.jsx)("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            strokeWidth: 1.5,
                            stroke: "currentColor",
                            className: "size-5",
                            children: (0,
                            r.jsx)("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M6 18 18 6M6 6l12 12"
                            })
                        })
                    })]
                }), (0,
                r.jsx)(h, {
                    image: t,
                    display_name: n,
                    introduce: a
                })]
            })]
        }))
    }
  }
}]);
