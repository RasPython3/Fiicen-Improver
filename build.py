import base64
import os
import glob
import shutil
import zipfile
import json
import re

about_html = ""

def zip_files(directory, output):
    files = glob.glob("**", root_dir=directory, recursive=True)
    dirs = glob.glob("**/", root_dir=directory, recursive=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for file in files:
            if file not in dirs and file + os.sep not in dirs:
                zf.write(f"{directory}/{file}", arcname=file.replace(os.sep, "/"))
        

def build_chromium():
    shutil.copy("LICENSE", "build/chromium/Fiicen-Improver/LICENSE")

    with open("build/chromium/Fiicen-Improver/about.html", mode="w", encoding="utf-8") as f:
        f.write(about_html)

    manifest = ""
    with open("build/chromium/Fiicen-Improver/manifest.json", mode="r", encoding="utf-8") as f:
        manifest = json.load(f)

    with open("chrome-publickey.pem", mode="r", encoding="utf-8") as f:
        manifest["key"] = re.match(r"^-----BEGIN PUBLIC KEY-----\n((?:\s|\S)*)-----END PUBLIC KEY-----\n*$", f.read(), flags=re.MULTILINE).groups()[0].replace("\n", "")

    with open("build/chromium/Fiicen-Improver/manifest.json", mode="w", encoding="utf-8") as f:
        manifest = json.dump(manifest, f)

def build_firefox():
    shutil.copy("LICENSE", "build/firefox/LICENSE")

    with open("build/firefox/about.html", mode="w", encoding="utf-8") as f:
        f.write(about_html)

    manifest = ""
    with open("build/firefox/manifest.json", mode="r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest["background"] = {
        "scripts": [
            "js/background.js"
        ]
    }
    manifest["browser_specific_settings"] = {
        "gecko": {
            "id": "FiicenImprover@RasPython3"
        }
    }

    with open("build/firefox/manifest.json", mode="w", encoding="utf-8") as f:
        manifest = json.dump(manifest, f)

def build_orion():
    shutil.copy("LICENSE", "build/orion/LICENSE")

    with open("build/orion/about.html", mode="w", encoding="utf-8") as f:
        f.write(about_html)

    manifest = ""
    with open("build/orion/manifest.json", mode="r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest["permissions"] = ["storage", "webRequest", "webRequestBlocking"]
    del manifest["declarative_net_request"]

    # startup.js is not working well on Orion
    manifest["content_scripts"].pop(0)

    with open("build/orion/manifest.json", mode="w", encoding="utf-8") as f:
        manifest = json.dump(manifest, f)

    with open("build/orion/js/background.js", mode="r", encoding="utf-8") as f:
        backgroundjs = f.read()
    with open("build/orion/js/index.js", mode="r", encoding="utf-8") as f:
        indexjs = f.read()
    with open("build/orion/qr-button.html", mode="r", encoding="utf-8") as f:
        qrbutton = f.read()
    with open("build/orion/images/quoteCircle.svg", mode="r", encoding="utf-8") as f:
        quote_circle_svg = f.read()

    for badge in glob.glob("**", root_dir="build/orion/images/badges"):
        badgename = badge.split(".")[0]
        with open(f"build/orion/images/badges/{badge}", mode="r", encoding="utf-8") as f:
            badgesrc = f.read()
        backgroundjs = backgroundjs.replace(f"/*{badgename} badge base64*/", base64.b64encode(badgesrc.encode()).decode())

    indexjs = indexjs.replace("/*qr-button.html*/", "value:\"data:text/html;base64,{}\"".format(base64.b64encode(qrbutton.encode()).decode()))
    indexjs = indexjs.replace("/*quoteCircle.svg*/", "value:\"data:image/svg+xml;base64,{}\"".format(base64.b64encode(quote_circle_svg.encode()).decode()))

    with open("build/orion/js/background.js", mode="w", encoding="utf-8") as f:
        f.write(backgroundjs)

    with open("build/orion/js/index.js", mode="w", encoding="utf-8") as f:
        f.write(indexjs)

def build_about():
    global about_html

    with open("src/manifest.json", encoding="utf-8", mode="r") as f:
        version = json.load(f)["version"]

    with open("src/js/injected.js", encoding="utf-8", mode="r") as f:
        testers = re.split(r"[ \",\r\n]+",
            re.search(r" testers\s*=\s*\[((?:\s|\S)+?)\]", f.read())[1])[1:-1]

    with open("src/about.html", encoding="utf-8", mode="r") as f:
        about_html = f.read()

    with open("LICENSE", encoding="utf-8", mode="r") as f:
        copyright = re.search(r"^Copyright\s+\(c\)\s+([0-9]+(?:-[0-9]+)?)\s+(.*)$", f.read(), flags=re.MULTILINE)

    about_html = about_html\
        .replace("<!--VERSION-->", version)\
        .replace("<!--COPYRIGHT-->", " ".join((copyright[1], copyright[2])))\
        .replace("<!--TESTERS-->", "\n".join(
            ["<li><a href=\"https://fiicen.jp/field/{0}\">@{0}</a></li>".format(tester) for tester in testers]
        ))

def build():
    try:
        shutil.rmtree("build")
    except:
        pass

    with open("src/manifest.json", mode="r", encoding="utf-8") as f:
        version = json.load(f)["version"]

    build_about()

    os.makedirs("build/chromium")

    shutil.copytree("src", "build/chromium/Fiicen-Improver")
    build_chromium()
    zip_files("build/chromium", f"build/Fiicen-Improver_{version}.chromium.zip")

    shutil.copytree("src", "build/firefox")
    build_firefox()
    zip_files("build/firefox", f"build/Fiicen-Improver_{version}.firefox.xpi")

    shutil.copytree("src", "build/orion")
    build_orion()
    zip_files("build/orion", f"build/Fiicen-Improver_{version}.orion.zip")

if __name__ == "__main__":
    build()