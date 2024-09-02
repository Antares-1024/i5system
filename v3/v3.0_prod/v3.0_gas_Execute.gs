const 設定 = MyLibrary.共有設定
const 関数 = MyLibrary.共有関数
const Parser = MyLibrary.既存ライブラリ.Parser
const hoge="hogr"
/* function boot (){
  システム操作.システム起動()
} */

this.システム操作 =
  {
    システム起動: function(){
      関数.プロパティ.削除()
      システム操作.初期化処理()
      UrlFetchApp.fetch(設定.基盤システム.CradleSystemURL+"?start")
      主要処理.トリガー処理()
    },
    システム停止: function(){
      UrlFetchApp.fetch(設定.基盤システム.CradleSystemURL)
      関数.トリガー.削除()
    },
    初期化処理: function(){
      //システム監視
        関数.プロパティ.設定("実行時間","0")
        関数.プロパティ.設定("実行ログ","[]")
      //スケジュール
        const 天気予報翌日分初期化配列 = ["天気","降水確率","最低気温","最高気温"]
        天気予報翌日分初期化配列.forEach((要素)=>{関数.プロパティ.設定("天気予報翌日分_"+要素,"不明")})
    }
  }

//起動用関数
  //ーーー起動関数_特殊ーーー
  function boot_トリガー()　　　　    {主要処理.メイン処理({関数:["トリガー処理"]})}
  //ーーー起動関数_定期ーーー
  function boot_メール転送()　　　    {主要処理.メイン処理({関数:["時限処理","メール転送"]})}
  function boot_RSS()　　　　　　　　 {主要処理.メイン処理({関数:["時限処理","RSS"]})}
  function boot_遅延証明書()　　　    {主要処理.メイン処理({関数:["時限処理","遅延証明書"]})}
  function boot_サイト更新通知()　    {主要処理.メイン処理({関数:["時限処理","サイト更新通知"]})}
  function boot_気象庁チェック()　    {主要処理.メイン処理({関数:["時限処理","気象庁チェック"]})}
  //ーーー起動関数_定時ーーー
  function boot_システム監視()　　    {主要処理.メイン処理({関数:["時限処理","システム監視"]})}
  function boot_スケジュール()　　    {主要処理.メイン処理({関数:["時限処理","スケジュール"]})}
  function boot_ペット()　　　　　    {主要処理.メイン処理({関数:["時限処理","ペット"]})}
  //ーーー起動関数_外部ーーー
  function boot_外部(引数)   {主要処理.メイン処理(引数)}
//※関数名と全く同じ文字列を渡すこと!

this.主要処理 =
  {
    トリガー処理: function()
      {
        関数.トリガー.削除()
        const 時間_今回 = 関数.Date操作.設定(new Date,[,,,,Math.trunc((new Date).getMinutes()/設定.トリガー.トリガー間隔)*設定.トリガー.トリガー間隔,0,0])
        const 時間_次回 = 関数.Date操作.加算(時間_今回,[,,,,設定.トリガー.トリガー間隔,,])
        const トリガー配列 =
          設定.トリガー.定期.reduce(
            (前回配列,要素)=>{
              for(let 時間_実行 = 関数.Date操作.設定(時間_今回,[,,,0,0,0,0]); 時間_実行.getDate()==時間_今回.getDate(); 時間_実行 = 関数.Date操作.加算(時間_実行,要素[0])){
                if (時間_今回 <= 時間_実行 && 時間_実行 < 時間_次回) 前回配列.push([要素[1],時間_実行])
              }
              return 前回配列
            },
            [["boot_トリガー",時間_次回]]
              .concat(
                設定.トリガー.定時.reduce(
                  (前回配列,要素)=>{
                    let 時間_実行 = 関数.Date操作.設定(時間_今回,要素[0])
                    if (時間_今回 <= 時間_実行 && 時間_実行 < 時間_次回) 前回配列.push([要素[1],時間_実行])
                    return 前回配列
                  },
                  []
                )
              )
          )
        if(トリガー配列.length > 20){
          (new 関数.ディスコ)
            .フィールド([["原因","トリガー数制限超過"]])
            .埋め込み("システム停止",null,null,null,null,new Date,"赤")
            .メッセージ("メンション")
            .送信(設定.ディスコ.システム.稼働ログ)
          return
        }
        トリガー配列.forEach((要素)=>{
          if(要素[1]<(new Date) || (要素[1].getMinutes()==(new Date).getMinutes() && 30<(new Date).getSeconds())) 要素[1] = 関数.Date操作.加算(new Date,[,,,,1,,])
          関数.トリガー.設定(要素[0],要素[1])
        })
      },
    メイン処理: function(引数)
      {
        if(設定.基盤システム.実行時間制限*60*1000 < Number(関数.プロパティ.取得("実行時間"))){
          関数.トリガー.削除()
          (new 関数.ディスコ)
            .フィールド([["原因","実行時間制限超過間際"]])
            .埋め込み("システム停止",null,null,null,null,new Date,"赤")
            .メッセージ("メンション")
            .送信(設定.ディスコ.システム.稼働ログ)
          return
        }
        const 時間_起動 = new Date()
        let 実行結果 = "成功"
        let エラーメッセージ = "-"
        try{
          引数.関数=="トリガー処理" ? this.トリガー処理() : globalThis[引数.関数[0]].呼び出し(引数)
        }catch(エラー){
          Logger.log(JSON.stringify(エラー));//意味なし
          Logger.log(JSON.stringify(エラー.message));
          Logger.log(JSON.stringify(エラー.stack));//メッセージの後に改行挟んでコールスタック　
          Logger.log(JSON.stringify(エラー.name));//意味なし
          Logger.log(JSON.stringify(エラー.toString()));//エラーメッセージそのまま
          (new 関数.ディスコ)
            .フィールド([["エラー内容",エラー.message],["処理",引数.関数.join("ー")]])
            .埋め込み("エラー発生",null,null,null,null,new Date,"赤")
            .メッセージ("メンション")
            .送信(設定.ディスコ.システム.実行ログ)
          実行結果 = "失敗"
          エラーメッセージ = エラー.message
        }
        let 処理時間 = (new Date).getTime() - 時間_起動.getTime()
        let 処理時間文字列 = `${Math.floor(処理時間/1000)}.${(処理時間%1000)}秒`
        関数.プロパティ.設定("実行時間",String(Number(関数.プロパティ.取得("実行時間"))+処理時間))
        if(設定.基盤システム.処理時間警告*60*1000 < 処理時間){
          (new 関数.ディスコ)
            .フィールド([["処理時間",処理時間文字列],["処理",引数.関数]])
            .埋め込み("警告：処理時間",null,null,null,null,new Date,"赤")
            .メッセージ("メンション")
            .送信(設定.ディスコ.システム.実行ログ)
        }
        let 実行ログ = 関数.配列操作.配列化(関数.プロパティ.取得("実行ログ")).concat([[(new Date).toString(),引数.関数.reduce((A,B)=>{A+=B+" "}),処理時間文字列,実行結果,エラーメッセージ]])
        if(10<=実行ログ.length){
          関数.GSS.設定(設定.基盤システム.ログファイルID,String((new Date).getFullYear())+"."+String((new Date).getMonth()+1),"LAST",1,実行ログ)
          実行ログ = []
        }
        関数.プロパティ.設定("実行ログ",関数.配列操作.文字列化(実行ログ))
        関数.プロパティ.設定("最終実行時刻",(new Date).getTime())
      }
  }

function dev(){
  時限処理.スケジュール()
}

this.時限処理 =
  {
    呼び出し: function(引数){this[引数.関数[1]]()},
    //定期実行
    メール転送: function()
      {
        return
        GmailApp.getMessagesForThreads(GmailApp.search("is:unread",0,20)).forEach(スレッド=>{
          スレッド.forEach(メッセージ=>メッセージ.markRead())
          switch (Parser.data(スレッド[0].getFrom()).from("<").to(">").build() || スレッド[0].getFrom()){
            case "no-reply@classroom.google.com":
              const テキスト = スレッド[0].getPlainBody().split("\r\n")
              const 基準A = テキスト.indexOf("通知設定  ")
              const 基準B = テキスト.indexOf("詳細を表示  ")
              let 内容 = {
                クラス名 : 　　　　　　　　　       テキスト.slice(基準A+2  ,基準A+2+1)[0]                                         ,
                通知種別 : 　　　　　　　　　       テキスト.slice(基準A+4  ,基準A+4+1)[0]        .slice( 3,   )                   ,
                タイトル : 　　　　　　　　　       テキスト.slice(基準A+6  ,基準B    )[0]                                         ,
                本文　　 : 　　　　　　　　　       テキスト.slice(基準A+6+1,基準B    ).join("\n")                                 ,
                リンク　 : 　　　　　　　　　       テキスト.slice(基準B+1  ,基準B+1+1)[0]        .slice(53,-38)                   ,
                時刻　　 : 関数.Date操作.文字列変換(テキスト.slice(基準B+2  ,基準B+2+1)[0]        .slice( 4, 19),"HH_mm____MM_DD") ,
                投稿者　 : 　　　　　　　　　       テキスト.slice(基準B+2  ,基準B+2+1)[0]        .slice(30,   )                   ,
              }
              if(テキスト.slice(基準B+2,基準B+2+1)[0][11]=="後") {内容.時刻 = 関数.Date操作.加算(内容.時刻,[,,,12,,,])};
              if(!テキスト.slice(基準A+6+1)[0].trim()) 内容.本文 = 内容.本文.split("\n").slice(1).join("\n")
             ;(new 関数.ディスコ)
                .名前(`${内容.投稿者}先生（ ${内容.クラス名} ）`)
                .埋め込み(`${内容.通知種別}：${内容.タイトル}`,内容.リンク,内容.本文,null,null,内容.時刻,null)
                .送信(設定.メール転送.特殊フック.クラスルーム)
              const LINE内容 = `【${内容.通知種別}：${内容.タイトル}】\n（${内容.クラス名}）\n\n${内容.本文}\n$投稿：{内容.リンク})`
              //関数.LINE.送信(LINE内容,設定.LINE.トークン.はちまきbot,"プッシュ",関数.LINE.ID変換("グルラ_1-3"));
              break;
            default:
              スレッド.forEach(メッセージ=>メッセージ.markRead());//一時的
              (new 関数.ディスコ)
                .名前(スレッド[0].getFrom())
                .埋め込み(
                  スレッド[0].getSubject(),
                  `https://mail.google.com/mail/u/0/#inbox/${スレッド[0].getId()}`,
                  スレッド[0].getPlainBody().slice(0,設定.メール転送.メール本文文字数上限),
                  null,
                  null,
                  スレッド[0].getDate()
                  )
                .送信(
                  設定.メール転送.対応表.filter(要素=>{
                    return [スレッド[0].getTo()].concat(スレッド[0].getCc().split(",")).concat(スレッド[0].getBcc().split(","))//送信先リスト
                      .map(送信先=>Parser.data(送信先).from("<").to(">").build() || 送信先)//送信先整形
                      .includes(要素[0])//送信先のいずれかに一致した対応表の要素を抜き出し
                  })[0][1]
              )
          }
        })
      },
    RSS: function()
      {
        設定.RSS.対応表.forEach(サイト群=>{
          for(let i = 1; i < サイト群.length; i++){
            const 記事配列 = Parser.data(UrlFetchApp.fetch(サイト群[i][0]).getContentText("utf-8")).from(サイト群[0].記事[0]).to(サイト群[0].記事[1]).iterate()
            let 送信用記事配列 = []
            for(let j = 0; j < 設定.RSS.記事取得数上限; j++){
              送信用記事配列[j] = {}
              if(サイト群[0].タイトル[0] )  送信用記事配列[j].タイトル = Parser.data(記事配列[j]).from(サイト群[0].タイトル[0]).to(サイト群[0].タイトル[1]).build()
              if(サイト群[0].リンク　[0] )  送信用記事配列[j].リンク　 = Parser.data(記事配列[j]).from(サイト群[0].リンク　[0]).to(サイト群[0].リンク　[1]).build()
              if(サイト群[0].本文　　[0] )  送信用記事配列[j].本文　　 = Parser.data(記事配列[j]).from(サイト群[0].本文　　[0]).to(サイト群[0].本文　　[1]).build()
              if(サイト群[0].サムネ　[0] )  送信用記事配列[j].サムネ　 = Parser.data(記事配列[j]).from(サイト群[0].サムネ　[0]).to(サイト群[0].サムネ　[1]).build()
              if(サイト群[0].時刻　　[0] ){ 送信用記事配列[j].時刻　　 = Parser.data(記事配列[j]).from(サイト群[0].時刻　　[0]).to(サイト群[0].時刻　　[1]).build()
                    　　　　　　　　        送信用記事配列[j].時刻　　 = 関数.Date操作.設定(関数.Date操作.文字列変換(送信用記事配列[j].時刻,サイト群[0].時刻形式),[,,,,,0,0])
                    　　　　　　　　        if(送信用記事配列[j].時刻.getTime()　　 <= Number(関数.プロパティ.取得("RSS_"+サイト群[i][0]))) break
               }else　　　　　　　　      { if(送信用記事配列[j].タイトル           ==        関数.プロパティ.取得("RSS_"+サイト群[i][0]))  break}
              if(j == 0) サイト群[0].時刻[0] ? 関数.プロパティ.設定("RSS_"+サイト群[i][0],送信用記事配列[j].時刻.getTime()) : 関数.プロパティ.設定("RSS_"+サイト群[i][0],送信用記事配列[j].タイトル)
              if(j == 設定.RSS.記事取得数上限) return//正常に取得できなかったと判断
            }
            for(let j = 0; j < 送信用記事配列.length-1; j++){//最後の要素は前回と重複
              (new 関数.ディスコ).埋め込み(送信用記事配列[j].タイトル,送信用記事配列[j].リンク,送信用記事配列[j].本文,null,送信用記事配列[j].サムネ,送信用記事配列[j].時刻,).送信(サイト群[i][1])
            }
          }
        })
      },
    遅延証明書: function()
      {
        return
        if((new Date).getHours()<6||関数.プロパティ.取得("遅延証明書最終取得")==(new Date).getDate()) return
        let 送信内容 = new 関数.ディスコ
        const JR東日本 =
          Parser
            .data(
              Parser
                .data(
                  UrlFetchApp
                    .fetch("https://traininfo.jreast.co.jp/delay_certificate/")
                    .getContentText("utf-8")
                )
                .from("<!--路線別　遅延証明書-->"  )
                .to(  "<!--//路線別　遅延証明書-->")
                .build()
            )
          .from("<tr>")
          .to( "</tr>")
          .iterate()
        for(let i = 0; i < 設定.遅延証明書.JR東日本.length; i++){
          if(設定.遅延証明書.取得対象.includes(設定.遅延証明書.JR東日本[i])){
            switch(JR東日本[i].split("\r\n")[5]){
              case "<td><p class=\"in_p\">準備中</p></td>": return
              case "<td>-</td>"　　　                     : 送信内容.フィールド([[設定.遅延証明書.JR東日本[i],"遅延無し"]]) ;break
              default:
                const インデックス = JR東日本[i].split("\r\n")[4].indexOf("href=")+6
                送信内容.フィールド([[設定.遅延証明書.JR東日本[i],`https://traininfo.jreast.co.jp${JR東日本[i].split("\r\n")[4].slice(インデックス,インデックス+56).replaceAll("amp;","")}`]])
            }
          }
        }
        送信内容
          .埋め込み(`${(new Date).getMonth()+1}月${(new Date).getDate()}日(${関数.Date操作.曜日取得(new Date)}) 7~10時の遅延証明書`)
          .送信(設定.遅延証明書.ウェブフック)
        関数.プロパティ.設定("遅延証明書最終取得",(new Date).getDate())
      },
    サイト更新通知: function()
      {
        設定.サイト更新通知.対象サイトリスト.forEach(サイト=>{
          const 前回 = 関数.キャッシュ.取得("サイト最終取得_"+サイト[0])
          const 今回 = UrlFetchApp.fetch(サイト[0]).getContentText("utf-8")
          if(前回 && 前回!=今回) (new 関数.ディスコ).埋め込み(サイト[1]+"に更新あり！").メッセージ("メンション").送信(設定.サイト更新通知.ウェブフック)
          関数.キャッシュ.設定("サイト最終取得_"+サイト[0],今回,6*60*60)
        })
      },
    //定時実行
    システム監視: function()
      {
        const 実行時間 = Number(関数.プロパティ.取得("実行時間"))
        関数.プロパティ.設定("実行時間","0")
        const セル使用数 = SpreadsheetApp.openById(設定.基盤システム.ログファイルID).getSheets().reduce((前回,今回)=> 前回 + (今回.getLastRow()*今回.getLastColumn()),0)
       ;(new 関数.ディスコ)
          .フィールド([
            ["稼働時間"　　　　    ,`${Math.floor(実行時間/1000/60)}分${String(Math.floor(実行時間/1000)%60).padStart(2,"0")}秒${String(実行時間%1000).padStart(3,"0")}ミリ秒/90分`],
            ["ログGSSのセル使用数" ,`${Math.floor(セル使用数/10000)}万${String(セル使用数%10000).padStart(4,"0")}セル/1000万0000セル`]
          ])
          .埋め込み(`${(new Date).getMonth()+1}月${(new Date).getDate()}日のシステム稼働レポート`)
          .送信(設定.ディスコ.システム.稼働ログ)
      },
    気象庁チェック: function(){
      return
      throw Error("アップロード：" + Parser.data(Parser.data(UrlFetchApp.fetch("https://www.data.jma.go.jp/developer/xml/feed/regular.xml").getContentText("utf-8")).from("<entry>").to("</entry>").iterate().filter(要素=>{return 要素.includes("【神奈川県府県週間天気予報】")})[0]).from("<updated>").to("</updated>").build() + "\nターゲット　：" + Parser.data(UrlFetchApp.fetch(Parser.data(Parser.data(UrlFetchApp.fetch("https://www.data.jma.go.jp/developer/xml/feed/regular.xml").getContentText("utf-8")).from("<entry>").to("</entry>").iterate().filter(要素=>{return 要素.includes("【神奈川県府県週間天気予報】")})[0]).from("<id>").to("</id>").build()).getContentText("utf-8")).from(`<TargetDateTime>`).to(`</TargetDateTime>`).build())
    },
    スケジュール: function(arg,arg2)
      {
        let 予定表 = 関数.GSS.取得(設定.スケジュール.シートID,"予定表",2,1,7,18)
        let 日付 = 関数.Date操作.加算(new Date,[,,1,,,,])
        while(Number(予定表[0][0])!=Number(日付.getMonth()+1) || Number(予定表[0][1])!=Number(日付.getDate())){
          関数.GSS.削除_指定行(設定.スケジュール.シートID,"予定表",2)//GSSの変更直後に取得しているが、正常であれば1日1回しか行われないため看過
          予定表 = 関数.GSS.取得(設定.スケジュール.シートID,"予定表",2,1,7,18)
        }
        if(!予定表[0][4]&&!arg) return//翌日が休みなら送らない

        let 天気予報 = hoge;
        try{天気予報 = [["天気","WeatherPart",0,""],["降水確率","ProbabilityOfPrecipitationPart",0,"％"],["最低気温","TemperaturePart",0,"℃"],["最高気温","TemperaturePart",3,"℃"]].reduce((前回,今回)=>{前回[今回[0]]=Parser.data(UrlFetchApp.fetch(Parser.data(Parser.data(UrlFetchApp.fetch("https://www.data.jma.go.jp/developer/xml/feed/regular.xml").getContentText("utf-8")).from("<entry>").to("</entry>").iterate().filter(要素=>{return 要素.includes("【神奈川県府県週間天気予報】")})[0]).from("<id>").to("</id>").build()).getContentText("utf-8")).from(`<${今回[1]}>\n`).to(`\n</${今回[1]}>`).iterate()[今回[2]].split("\n").map(要素=>{const 結果=Parser.data(要素).from(">").to("<").build();return 結果.slice(-1)==">"?"不明":結果+今回[3]});if(前回[今回[0]][0]=="不明")前回[今回[0]][0]=関数.プロパティ.取得("天気予報翌日分_"+今回[0]);関数.プロパティ.設定("天気予報翌日分_"+今回[0],前回[今回[0]][1]);return 前回},{})}catch(e){}


        let 予定 = []
        for(let i = 0; i < 7; i++){
          予定[i] = {}
          予定[i].日付 = `${String(日付.getMonth()+1).padStart(2," ")}月${String(日付.getDate()).padStart(2," ")}日(${関数.Date操作.曜日取得(日付)})`
          予定[i].天気 = 天気予報.天気?.[i]
          予定[i].概要 = []
          予定[i].詳細 = [["天気",`${天気予報.天気?.[i]}\n　（降水確率：${天気予報.降水確率?.[i]}　気温：${天気予報.最低気温?.[i]}〜${天気予報.最高気温?.[i]}）`]]
          予定表[i]=予定表[i].slice(2)
          if(予定表[i][0]) 予定[i].詳細.push(["行事予定等",`${予定表[i][0]}`])
          if(予定表[i][1]) 予定[i].詳細.push(["時程",`${設定.スケジュール.時程[予定表[i][1]] || 予定表[i][1]}`])
          if(予定表[i][2]){
            let 授業名 = ""
            for(let j = 2; j < 16; j++){
              if(!(j%2)){//授業
                if(!予定表[i][j]) break
                授業名 = `${j/2}：${isNaN(予定表[i][j][1]) ? 予定表[i][j] :  設定.スケジュール.時間割[予定表[i][j][0]][Number(予定表[i][j][1])-1] || 予定表[i][j]}`
                j==2||j==10 ? 予定[i].概要.push(授業名) : 予定[i].概要[予定[i].概要.length-1] += `　${授業名}`
              }else{//メモ
                予定[i].詳細.push([授業名,予定表[i][j] || " "])
              }
            }
          }else{
            予定[i].概要.push( "休み"      )
            予定[i].詳細.push(["休み",null])
          }
          日付 = 関数.Date操作.加算(日付,[,,1,,,,])
        }
        //予定[n日後] => [日付]  [概要][行(2~3)]  [詳細][行(2~4)][key/value]
       if(arg){
        let LINE送信内容 = ""
        switch (arg2){
          case "週間"　　: LINE送信内容 = [予定.reduce((前回,要素)=>前回+=`\n${要素.日付}　${要素.天気}\n　${要素.概要.reduce((A,B)=>{return A+=`\n　${B}`})}`,"【1週間の予定】")] ;break;
          case "明日"　　: LINE送信内容 = [予定[0].詳細.reduce((A,B)=>A+=`\n　${B[1] ? `${B[0]}　${B[1]}` : B[0]}`,`【${予定[0].日付}】`)] ;break;
          case "明後日"　: LINE送信内容 = [予定[1].詳細.reduce((A,B)=>A+=`\n　${B[1] ? `${B[0]}　${B[1]}` : B[0]}`,`【${予定[1].日付}】`)] ;break;
          case "明々後日": LINE送信内容 = [予定[2].詳細.reduce((A,B)=>A+=`\n　${B[1] ? `${B[0]}　${B[1]}` : B[0]}`,`【${予定[2].日付}】`)] ;break;
        }
        関数.LINE.送信(LINE送信内容,設定.LINE.トークン.はちまきbot,"リプライ",arg)
       }else{
         ;(new 関数.ディスコ).埋め込み("【1週間の予定】" ).フィールド(予定.map(要素=>[`${要素.日付}　${要素.天気}`,要素.概要.reduce((A,B)=>A+=`\n${B}`)])).送信(設定.スケジュール.ウェブフック)
         ;(new 関数.ディスコ).埋め込み(予定[0].日付　　　).フィールド(予定[0].詳細).送信(設定.スケジュール.ウェブフック)
       }
      },

    ペット: function()
      {
        return//IOT部が未実装のためまだ実装しない
        //GSS周りの仕様を変えたため注意
        const 取得数 = 24*60/設定.esp32.温度送信間隔
        const シート名 = String((new Date).getFullYear())+"."+String((new Date).getMonth()+1)
        const 最終行 = SpreadsheetApp.openById(設定.esp32.ペットGSSID).getSheetByName(シート名).getLastRow()
        let データ = []
        if(最終行 < 取得数){
          const シート名_昨日 = String(関数.Date操作.加算(new Date,[,-1,,,,,]).getFullYear())+"."+String(関数.Date操作.加算(new Date,[,-1,,,,,]).getMonth()-1)
          const 最終行_昨日 = SpreadsheetApp.openById(設定.esp32.ペットGSSID).getSheetByName(シート名_昨日).getLastRow()
          データ =   関数.GSS.取得(設定.esp32.ペットGSSID, シート名/* 　　*/, 1/*　　　　　　　　　　　*/, 5, 最終行, 7 )
            .concat(関数.GSS.取得(設定.esp32.ペットGSSID, シート名_昨日/**/, 最終行_昨日-(取得数-最終行), 5, "MAX", 7 ))
        }else{
          データ =   関数.GSS.取得(設定.esp32.ペットGSSID, シート名/* 　　*/, 最終行-取得数/*　　　　　*/, 5, 取得数, 7 )
        }
        let 合計値 = 0
        let 最高値 = 0
        let 最低値 = 100
        for(let i = 0; i < 取得数; i++){
          for(let j = 0; j < 3; j++){
            合計値 += データ[i][j]
            if(最高値 < データ[i][j]) 最高値 = データ[i][j]
            if(最低値 > データ[i][j]) 最低値 = データ[i][j]
          }
        }
        合計値 = 合計値 / (取得数 * 3)
        const 送信分 = "【"+String((new Date).getMonth()+1)+"/"+String((new Date).getDate())+"の定期レポート】\n平均温度:"+合計値+"\n最低温度"+最低値+"\n最高温度"+最高値
        関数.LINE送信(送信分,設定.LINE.トークン.ペット,"ブロードキャスト")
      }
  }

this.外部処理 =
  {
    呼び出し: function(引数){this[引数.関数[1]].呼び出し(引数)},
    HTTP処理:
      {
        呼び出し: function(引数){this[引数.関数[2]](引数.データ)},
        line_HACHIMAKIbot: function(データ)
          {
            if(JSON.parse(データ.postData.contents).events) JSON.parse(データ.postData.contents).events.forEach(要素=>{
              if(要素.type=="message"&&要素.message.type=="text"){
                      if(要素.message.text.includes("週間の予定"　　)){
                  時限処理.スケジュール(要素.replyToken,"週間"　　)
                }else if(要素.message.text.includes("明日の予定"　　)){
                  時限処理.スケジュール(要素.replyToken,"明日"　　)
                }else if(要素.message.text.includes("明後日の予定"　)){
                  時限処理.スケジュール(要素.replyToken,"明後日"　)
                }else if(要素.message.text.includes("明々後日の予定")||要素.message.text.includes("明明後日の予定")){
                  時限処理.スケジュール(要素.replyToken,"明々後日")
                }

                関数.GSS.設定_最下行(
                  設定.LINE.はちまきbot.GSS.ID,
                  要素.source.groupId ? 関数.LINE.ID変換(要素.source.groupId) || "その他" : "その他",
                  [
                    new Date,
                    関数.LINE.ID変換(要素.source.userId) || 要素.source.userId,
                    要素.message.text,
                    要素.source.groupId || "-"
                  ]
                )
              }
            })          
          },
        iot_esp32: function(データ)
          {
            return//IOT部が未実装のためまだ実装しない
            const パラメーター = e.parameter
            switch(パラメーター.type){
              case "report"   :
                const 日時 = new Date
                関数.GSS.設定_最下行(
                  設定.esp32.ペットGSSID,
                  String(日時.getFullYear())+"."+String(日時.getMonth()+1),
                  [日時.getMonth()+1,日時.getDate(),日時.getHours(),日時.getMinutes(),パラメーター.tmp1,パラメーター.tmp2,パラメーター.tmp3]
                )
              case "stop"     : (new 関数.ディスコ).埋め込み("esp32:高温により停止").送信(設定.esp32.ウェブフック)
              case "income"   : (new 関数.ディスコ).埋め込み("income:来客あり！"  ).送信(設定.esp32.ウェブフック);break
              case "open"     : 関数.LINE送信("ケージの扉が開いています"                     ,設定.LINE.トークン.ペット,"ブロードキャスト")
              case "tmp_high" : 関数.LINE送信("ケージ内が高温です(" + パラメーター.tmp + "度)",設定.LINE.トークン.ペット,"ブロードキャスト")
              case "tmp_low"  : 関数.LINE送信("ケージ内が低音です(" + パラメーター.tmp + "度)",設定.LINE.トークン.ペット,"ブロードキャスト")
            }
          }
      }
  }






















