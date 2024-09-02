const 設定 = MyLibrary.共有設定
const 関数 = MyLibrary.共有関数

function doGet(e){
  関数.トリガー.削除()
  if(e.queryString=="start") 関数.トリガー.設定("確認",1,"時ごと")
}

function 確認(){
  const 最終取得時刻 = 関数.プロパティ.取得("最終取得時刻")//前回の取得
  const 最終実行時刻 = 関数.プロパティ.取得("最終実行時刻")//前回の実行
  関数.プロパティ.設定("最終取得時刻",最終実行時刻)
  if(最終実行時刻==最終取得時刻){
    (new 関数.ディスコ)
    .フィールド([["最終実行時刻",new Date(Number(最終実行時刻)).toString()]])
    .埋め込み("システムダウン(原因不明) byCradleSystem",null,null,null,null,new Date,"赤")
    .メッセージ("メンション")
    .送信(設定.ディスコ.システム.稼働ログ)
  }
}
