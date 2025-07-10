CHUTORO 🍣 - 多機能クイズアプリ
CHUTOROは、Google Spreadsheetをデータベースとして利用する、高機能でカスタマイズ可能なクイズアプリケーションです。Vanilla JS（ライブラリやフレームワークに依存しない、素のJavaScript）で構築されており、軽量でありながらパワフルな機能を提供します。

✨ Features (主な機能)
このアプリケーションは、単なるクイズアプリではありません。あなたの学習体験を最大化するための多彩な機能を搭載しています。

動的データソース:

Google Spreadsheetと連携し、Google Apps Script(GAS)を介してクイズデータを動的に取得。 面倒なデプロイなしで問題の追加・更新が可能です。

多彩なクイズモード:

通常モード: 教科、難易度、問題数を自由にカスタマイズして挑戦。

お任せモード: 全範囲からランダムに出題される実力試しモード。

ランキングモード: 全ユーザー共通のレギュレーション（難易度「難しい」x10問）でスコアを競い合うモード。結果はFirebase Realtime Databaseに永続化されます。

再挑戦モード: 前回のセッションで間違えた問題のみを抽出し、効率的な復習をサポート。

永続化 & 設定:

Firebase連携: ランキングモードのスコアをリアルタイムで保存・集計。

localStorage利用: 「間違えた問題」や「除外教科設定」など、ユーザー個別の設定をブラウザに保存。

優れたUX:

選択肢シャッフル: 選択肢の表示順を毎回ランダム化し、位置で回答を記憶してしまうのを防ぎます。

タイマー機能: 制限時間を示すプログレスバーで、視覚的な緊迫感を演出。

スキップ機能: ランキングモード以外では、問題をスキップしてテンポよく学習を進められます。

🛠️ Tech Stack (使用技術)
Frontend: HTML5, CSS3, JavaScript (ES6+)

Framework/Library: Bootstrap 5

Database: Google Spreadsheet (as a CMS), Firebase Realtime Database (for Ranking)

Serverless: Google Apps Script (GAS)

🚀 Quick Start (始め方)
リポジトリをクローン:

Bash

git clone https://github.com/AmaebiRoll/CHUTORO.git
cd CHUTORO
Google Spreadsheetの準備:

指定されたフォーマットでクイズデータを作成します。

Google Apps Script(GAS)をデプロイし、ウェブアプリのURLを取得します。

Firebaseプロジェクトの作成:

Firebaseで新規プロジェクトを作成し、Realtime Databaseを有効化します。

ウェブアプリの設定情報（firebaseConfig）を取得します。

設定情報の更新:

script.js内のSPREADSHEET_URLとfirebaseConfigを、ご自身の情報に書き換えます。

ブラウザで開く:

index.htmlをブラウザで開けば、あなただけのクイズアプリが起動します。

📜 script.js のアーキテクチャ
CHUTOROのscript.jsは、以下の関心事を分離して設計されています。

セクション

役割

DOM要素

HTML要素への参照を定数として保持。

状態変数

アプリケーションの状態（現在の問題、スコアなど）を管理。

初期化処理

DOMの読み込み完了後、イベントリスナの設定やデータ取得を実行。

データ処理・準備

スプレッドシートからのデータ整形や、配列のシャッフルなど。

クイズ制御

各種モードのハンドリングと、クイズの開始・進行を制御。

結果・ランキング表示

クイズ終了後の結果表示、FirebaseやlocalStorageへの保存。

設定機能

ユーザーによる設定変更と、localStorageへの永続化。


Google スプレッドシートにエクスポート
開発者 AmaebiRoll より、愛を込めて。 💖
