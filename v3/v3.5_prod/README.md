# i5system v3.5_prod

## バージョンの概要
対象ユーザーを学年全員に広げたバージョン

## システムの仕組み
[起動用スクリプト](v3.5_BOOT.gs)から起動し、[処理用スクリプト](v3.5_EXE.gs)を呼び出して処理を行う\
このようにすることで、処理部を変更しても再度デプロイを行いURLを更新する必要がなくなる

### 処理系統

> ①ゆりかごシステム\
> "cradle"から起動し、最後に時限処理系統が実行された時刻を調べる\
> もし基準より古ければエラーメッセージを送信したうえで再起動する

> ②時限処理系統\
> "timeTrig"から起動し、起動した時刻を基準にいくつかの関数を実行する\
> (メール転送、予定通知、RSS 等)

> ③LINE処理系統
> "doPost"から起動し、ユーザーから送られたメッセージに応じた関数を実行してメッセージを返す

> ④Readme送信系統\
> "doGet"から起動し、BOTの簡易的なReadMeのHTMLを返す

### トリガー
    <name>     <形式>
    cradle    1時間ごとの定期タイマー
    timeTrig  conf.system.trig.itv_min 分ごとに自己トリガー
    doPost    httpリクエスト skdBotのみ
    doGet     httpリクエスト
    
### プロパティサービス
    <Key>             <InitialValue>  <内容>
    runTime           0               1日の実行時間の総計
    cradle_lastRun    undefined       timeTrigの最終実行時刻(ms)
    cradle_lastGet    undefined       cradleSystemの最終取得時刻(ms)
    news              {}              newsの最終取得の情報
    LineUsrInfo_<Id>  {}              ユーザー情報
    holiday           false           今日が休日か

### キャッシュサービス
    <Key>             <InitialValue>  <内容>
    siteCheck         {}              前回取得した情報
    skd               []              スケジュールのキャッシュ