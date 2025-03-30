import base64
import os
import glob
import shutil
import zipfile
import json

def zip_files(directory, output):
    files = glob.glob("**", root_dir=directory, recursive=True)
    dirs = glob.glob("**/", root_dir=directory, recursive=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for file in files:
            if file not in dirs and file + os.sep not in dirs:
                zf.write(f"{directory}/{file}", arcname=file.replace(os.sep, "/"))
        

def build_chrome():
    shutil.copy("LICENSE", "build/chrome/Fiicen-Improver/LICENSE")

def build_firefox():
    shutil.copy("LICENSE", "build/firefox/LICENSE")
    manifest = ""
    with open("build/firefox/manifest.json", mode="r") as f:
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
    manifest["permissions"] = ["storage", "webRequest", "webRequestBlocking"]
    del manifest["declarative_net_request"]

    with open("build/firefox/manifest.json", mode="w") as f:
        manifest = json.dump(manifest, f)

def build_orion():
    shutil.copy("LICENSE", "build/orion/LICENSE")
    manifest = ""
    with open("build/orion/manifest.json", mode="r") as f:
        manifest = json.load(f)

    manifest["permissions"] = ["storage", "webRequest", "webRequestBlocking"]
    del manifest["declarative_net_request"]

    with open("build/orion/manifest.json", mode="w") as f:
        manifest = json.dump(manifest, f)

    with open("build/orion/js/index.js", mode="r", encoding="utf-8") as f:
        indexjs = f.read()
    with open("build/orion/qr-button.html", mode="r", encoding="utf-8") as f:
        qrbutton = f.read()

    indexjs = indexjs.replace("/*qr-button.html*/", "value:\"data:text/html;base64,{}\"".format(base64.b64encode(qrbutton.encode()).decode()))

    with open("build/orion/js/index.js", mode="w", encoding="utf-8") as f:
        f.write(indexjs)

def build():
    try:
        shutil.rmtree("build")
    except:
        pass

    with open("src/manifest.json", mode="r") as f:
        version = json.load(f)["version"]

    os.makedirs("build/chrome")

    shutil.copytree("src", "build/chrome/Fiicen-Improver")
    build_chrome()
    zip_files("build/chrome", f"build/chrome-{version}.zip")

    shutil.copytree("src", "build/firefox")
    build_firefox()
    zip_files("build/firefox", f"build/firefox-{version}.zip")

    shutil.copytree("src", "build/orion")
    build_orion()
    zip_files("build/orion", f"build/orion-{version}.zip")

if __name__ == "__main__":
    build()