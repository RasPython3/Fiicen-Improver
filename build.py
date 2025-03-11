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

    with open("build/firefox/manifest.json", mode="w") as f:
        manifest = json.dump(manifest, f)

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

if __name__ == "__main__":
    build()