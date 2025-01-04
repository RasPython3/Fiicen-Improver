import os
import shutil
import zipfile
import json

def zip_files(files, output, prefix=""):
    pass

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

    with open("build/firefox/manifest.json", mode="w") as f:
        manifest = json.dump(manifest, f)

def build():
    try:
        shutil.rmtree("build")
    except:
        pass

    os.makedirs("build/chrome")

    shutil.copytree("src", "build/chrome/Fiicen-Improver")
    build_chrome()

    shutil.copytree("src", "build/firefox")
    build_firefox()

if __name__ == "__main__":
    build()