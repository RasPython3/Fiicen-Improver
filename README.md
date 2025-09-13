<h1 align="center" style="font-size: 3em;">
<img src="src/images/logo.svg" style="width: 1.5em; height: 1.5em;" />
Fiicen Improver
</h1>

Fiicen Improver は、[Fiicen](https://fiicen.jp/)の「もうちょっとこうだったらいいのに」を(**非公式に**)解消してくれるブラウザ拡張機能です。

***

* [インストール](#インストール)
  * PC
    * [Chrome](#chrome)
    * [Edge](#edge)
    * [Opera](#opera)
    * [Firefox](#firefox)
  * Android
    * [Firefox](#firefox)
    * [Kiwi](#kiwi)
  * iPhone / iOS / Mac
    * [Orion](#orion)
* [使い方](#usage)

***

## Install

### Chrome

### Edge

### Opera

### Firefox

* PCの場合

* Androidの場合

### Kiwi

### Orion

## Build from source

1. Run :
  ```shell
  python3 build.py
  ```

2. Output files are in `build/`

## Usage

### 魔改造された見た目

| ____________ | Before | After |
| -------- | -------- | -------- |
| サークル | ![circle before](<assets/circle-before.png>) | ![circle after](<assets/circle-after.png>) |
| プロフィール | ![profile before](<assets/profile-before.png>) | ![profile after](<assets/profile-after.png>) |

### 独自バッジの追加

* あなただけのバッジを追加(ほかの人からは見えません)
* 拡張機能の開発者やテスターは一目瞭然

  | ユーザー | 開発者 | テスター |
  | -------- | -------- | -------- |
  | ![extension user badge](src/images/badges/user.svg) | ![extension developer badge](src/images/badges/developer.svg) | ![extension tester badge](src/images/badges/tester.svg) |

### 疑似引用サークル

* サークルの右下から疑似的な引用が可能

![alt text](<assets/image1.png>)

* urlをペーストすれば同時に複数の引用も

![alt text](<assets/image2.png>)

* 相手に通知は届かないので適宜メンションしましょう

### データセーバー

* 画質をめちゃくちゃ低くして通信量を節約
* 画像をタップすると元画像に戻ります

![alt text](<assets/image3.png>)

### リアルタイム通知

* ブラウザでFiicenを開いていればリアルタイムに通知が届きます

### 設定

* 独自の設定項目を追加

* データセーバーやリアルタイム通知を使うかどうかなどを切り替えられます

### その他便利機能

* QRコードで簡単にフォロー

* サークル作成時にコピペで画像や動画を添付

* デバイスのテーマを使用できます
  * [fiicen.jp/settings/language-and-display/visual](https://fiicen.jp/settings/language-and-display/visual)

* Fiicen自体の細かいスタイル崩れを修正

## About

[MIT License](License)
