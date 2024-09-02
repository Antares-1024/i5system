this.既存ライブラリ =
  {
    Parser: Parser//1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw
  }

this.共有設定 =
  {
    基盤システム:
      {
        実行時間制限: 80,//分
        処理時間警告: 3, //分
        ログファイルID: "",
        CradleSystemURL: ""//デプロイ版
      },
    トリガー:
      {
        トリガー間隔: 10,//分
        定期:
          [
            [[  ,  ,  ,  ,10,00,00], "boot_メール転送"　　    ],
            [[  ,  ,  ,01,00,00,00], "boot_RSS"　　　　　　　 ],
            [[  ,  ,  ,01,00,00,00], "boot_遅延証明書"　　    ],
            [[  ,  ,  ,04,00,00,00], "boot_サイト更新通知"    ],//6時間以内
          ],
        定時:
          [   //上位桁は必ずnull
            [[  ,  ,  ,00,00,00,00], "boot_システム監視"　    ],
            [[  ,  ,  ,18,00,00,00], "boot_スケジュール"　    ],
            [[  ,  ,  ,20,00,00,00], "boot_ペット"　　　      ]
          ]
      },
    ディスコ:
      {
        アカウント: "",
        システム:
          {
            稼働ログ: "",
            実行ログ: "",
            指定失敗: ""
          },
        色:
          {
            赤: "FF0000",
            青: "0000FF",
            緑: "008000"
          }
      },
    LINE:
      {
        トークン:
          {
            i5system:
              "",
            はちまきbot:
              "",
            ペット:
              ""
          },
        対応表:
          [
            //ユーザー
            //グループ
          ],
        はちまきbot:
          {
            GSS:
              {
                ID: ""
              }
          }
      },
    メール転送:
      {
        メール本文文字数上限: 200,
        ブラリス:
          [
            ["getSubject","Review edits to your Apps Script project"]
          ],
        対応表:
          [
          ],
        特殊フック:
          {
            クラスルーム:
              ""
          }
      },
    RSS:
      {
        記事取得数上限: 3,
        対応表:
          [
            [//NHK
              {
                記事　　 : ["<item>"        ,"</item>"        ],
                タイトル : ["<title>"       ,"</title>"       ],
                リンク　 : ["<link>"        ,"</link>"        ],
                本文　　 : ["<description>" ,"</description>" ],
                サムネ　 : [null            ,null             ],
                時刻　　 : ["<pubDate>"     ,"</pubDate>"     ],
                時刻形式 : "_____DD_MMM_YYYY_HH_mm_SS______"
              },
              [//総合
                "https://www.nhk.or.jp/rss/news/cat0.xml",
                ""
              ]
            ],
            [//ITmedia
              {
                記事　　 : ["<item>"        ,"</item>"        ],
                タイトル : ["<title>"       ,"</title>"       ],
                リンク　 : ["<link>"        ,"</link>"        ],
                本文　　 : ["<description>" ,"</description>" ],
                サムネ　 : [null            ,null             ],
                時刻　　 : ["<pubDate>"     ,"</pubDate>"     ],
                時刻形式 : "_____DD_MMM_YYYY_HH_mm_SS______"
              },
              [//総合
                "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
                ""
              ],
              [//@IT
                "https://rss.itmedia.co.jp/rss/2.0/ait.xml",
                ""
              ],
              [//AI+
                "https://rss.itmedia.co.jp/rss/2.0/aiplus.xml",
                ""
              ],
              [//ビジネス
                "https://rss.itmedia.co.jp/rss/2.0/business.xml",
                ""
              ]
            ],
            [//Mynavi
              {
                記事　　 : ["<item"         ,"</item>"        ],//※ここは誤字ではない！
                タイトル : ["<title>"       ,"</title>"       ],
                リンク　 : ["<link>"        ,"</link>"        ],
                本文　　 : ["<description>" ,"</description>" ],
                サムネ　 : ["<img>"         ,"</img>"         ],
                時刻　　 : ["<dc:date>"     ,"</dc:date>"     ],
                時刻形式 : "YYYY_MM_DD_HH_mm_SS______"
              },
              [//企業IT
                "https://news.mynavi.jp/rss/techplus/enterprise",
                ""
              ],
              [//テクノロジー
                "https://news.mynavi.jp/rss/techplus/technology",
                ""
              ],
              [//ホワイトペーパー
                "https://news.mynavi.jp/rss/techplus/whitepaper",
                ""
              ],
              [//パソコン
                "https://news.mynavi.jp/rss/digital/pc",
                ""
              ]
            ],
            [//ビジネス+IT
              {
                記事　　 : ["<item>"        ,"</item>"        ],
                タイトル : ["<title>"       ,"</title>"       ],
                リンク　 : ["<link>"        ,"</link>"        ],
                本文　　 : ["<description>" ,"</description>" ],
                サムネ　 : [null            ,null             ],
                時刻　　 : ["<pubDate>"     ,"</pubDate>"     ],
                時刻形式 : "_____DD_MMM_YYYY_HH_mm_SS______"
              },
              [//総合
                "https://www.sbbit.jp/rss/HotTopics.rss",
                ""
              ]
            ],
            [//国会図書館調査資料
              {
                記事　　 : ["<item>"        ,"</item>"        ],
                タイトル : ["<title>"       ,"</title>"       ],
                リンク　 : ["<link>"        ,"</link>"        ],
                本文　　 : ["<description>" ,"</description>" ],
                サムネ　 : [null            ,null             ],
                時刻　　 : ["<pubDate>"     ,"</pubDate>"     ],
                時刻形式 : "_____DD_MMM_YYYY_HH_mm_SS______"
              },
              [//総合
                "https://www.ndl.go.jp/jp/diet/publication/document/rss/rss.xml",
                ""
              ]
            ],
            [//虚構新聞
              {
                記事　　 : ["<item>"        ,"</item>"        ],
                タイトル : ["<title>"       ,"</title>"       ],
                リンク　 : ["<link>"        ,"</link>"        ],
                本文　　 : ["<description>" ,"</description>" ],
                サムネ　 : [null            ,null             ],
                時刻　　 : [null            ,null             ],
                時刻形式 : null
              },
              [//総合
                "https://kyoko-np.net/index.xml",
                ""
              ]
            ]
          ]
      },
    サイト更新通知:
      {
        対象サイトリスト:
          [
          ],
        ウェブフック: ""
      },
    スケジュール:
      {
        シートID: "",
        時程:
          {
            A: "",
            B: "",
            C: ""
          },
        時間割:
          {
            月: [],
            火: [],
            水: [],
            木: [],
            金: [],
          },
        ウェブフック: ""
      },
    遅延証明書:
      {
        ウェブフック: "",
        取得対象: ["東海道線","横須賀線・総武快速線","京浜東北線・根岸線","横浜線"],
        JR東日本: //遅延証明書の掲載順
          [
            "東海道線",
            "横須賀線・総武快速線",
            "京浜東北線・根岸線",
            "横浜線",
            "南武線",
            "山手線",
            "中央快速線・中央本線",
            "中央・総武線各駅停車",
            "青梅線",
            "五日市線",
            "宇都宮線",
            "高崎線",
            "埼京線・川越線",
            "常磐快速線・常磐線",
            "常磐線各駅停車",
            "京葉線",
            "武蔵野線"
          ]
      },
    esp32:
      {
        ウェブフック: "",
        ペットGSSID: "",
        温度送信間隔: 30,//分
      }
  }
this.共有関数 =
  {
    GSS:
      {
        シート取得: function(ファイルID,シート名){
          return SpreadsheetApp.openById(ファイルID).getSheetByName(シート名) || SpreadsheetApp.openById(ファイルID).insertSheet().setName(シート名)
        },
        取得: function(ファイルID,シート名,開始行,開始列,取得行,取得列){
          let シートオブジェクト = 共有関数.GSS.シート取得(ファイルID,シート名)
          if(取得行 == "MAX") 取得行 = シートオブジェクト.getLastRow()    || 1
          if(取得列 == "MAX") 取得列 = シートオブジェクト.getLastColumn() || 1
          return 開始行&&開始列&&取得行&&取得列 ? シートオブジェクト.getRange(開始行,開始列,取得行,取得列).getValues() : [[]]
        },
        設定: function(ファイルID,シート名,開始行,開始列,値配列/*二次元*/){
          const シートオブジェクト = 共有関数.GSS.シート取得(ファイルID,シート名)
          if(開始行 == "LAST") 開始行 = シートオブジェクト.getLastRow()    +1
          if(開始列 == "LAST") 開始列 = シートオブジェクト.getLastColumn() +1
          シートオブジェクト.getRange(開始行,開始列,値配列.length,共有関数.配列操作.二次元目の長さ(値配列)).setValues(値配列)
        },
        設定_最下行: function(ファイルID,シート名,値配列/*一次元*/){
          共有関数.GSS.シート取得(ファイルID,シート名).appendRow(値配列)
        },
        削除_指定行: function(ファイルID,シート名,列){
          共有関数.GSS.シート取得(ファイルID,シート名).deleteRow(列)
        }
      },
    プロパティ:
      {
        設定: function(キー,値 ){        PropertiesService.getScriptProperties().setProperty        (キー,値 )},
        取得: function(キー  　){ return PropertiesService.getScriptProperties().getProperty        (キー  　)},
        削除: function(  　　　){        PropertiesService.getScriptProperties().deleteAllProperties(  　　　)}
      },
    キャッシュ:
      {
        設定: function(キー,値,時間_sec ){        CacheService.getScriptCache().put    (キー,値,時間_sec )},
        取得: function(キー 　　　      ){ return CacheService.getScriptCache().get    (キー 　　　      )},
        削除: function(キー 　　　      ){        CacheService.getScriptCache().remove (キー 　　　      )}
      },
    トリガー:
      {
        設定: function(関数,時間,モード){
          let 時限トリガー = ScriptApp.newTrigger(関数).timeBased()
          switch(モード){//指定しなければ時刻
            case  "毎月"　 :時限トリガー.onMonthDay   (時間);break //毎月n日
            case  "曜日"　 :時限トリガー.onWeekDay    (時間);break //毎週[Weekday]
            case  "週ごと" :時限トリガー.everyWeeks   (時間);break //n週間ごと
            case  "日ごと" :時限トリガー.everyDays    (時間);break //n日　ごと
            case  "時ごと" :時限トリガー.everyHours   (時間);break //n時間ごと
            case  "分ごと" :時限トリガー.everyMinutes (時間);break //n分　ごと
            case  "間隔"　 :時限トリガー.after        (時間);break //ミリ秒
            default 　　　 :時限トリガー.at           (時間)       //[Date]
          }
          時限トリガー.create()
        },
        削除: function(関数,モード){//引数無しで全削除、モード0で該当関数削除、モード1で該当関数以外削除
          ScriptApp.getProjectTriggers().forEach(要素=>{if((!関数)||(関数==要素.getHandlerFunction()&&!モード)||(関数!=要素.getHandlerFunction()&&モード)) ScriptApp.deleteTrigger(要素)})
        }
      },
    Date操作:
      {
        加算: function(Dateオブジェクト,操作内容){
          let returnDate = new Date(Dateオブジェクト)
          if(操作内容[0])       returnDate.setFullYear     (操作内容[0] + returnDate.getFullYear()     )
          if(操作内容[1])       returnDate.setMonth        (操作内容[1] + returnDate.getMonth()        )
          if(操作内容[2])       returnDate.setDate         (操作内容[2] + returnDate.getDate()         )
          if(操作内容[3])       returnDate.setHours        (操作内容[3] + returnDate.getHours()        )
          if(操作内容[4])       returnDate.setMinutes      (操作内容[4] + returnDate.getMinutes()      )
          if(操作内容[5])       returnDate.setSeconds      (操作内容[5] + returnDate.getSeconds()      )
          if(操作内容[6])       returnDate.setMilliseconds (操作内容[6] + returnDate.getMilliseconds() )
          return returnDate
        },
        設定: function(Dateオブジェクト,操作内容){
          let returnDate = new Date(Dateオブジェクト)
          if(操作内容[0]!=null) returnDate.setFullYear     (操作内容[0]                                )
          if(操作内容[1]!=null) returnDate.setMonth        (操作内容[1]                                )
          if(操作内容[2]!=null) returnDate.setDate         (操作内容[2]                                )
          if(操作内容[3]!=null) returnDate.setHours        (操作内容[3]                                )
          if(操作内容[4]!=null) returnDate.setMinutes      (操作内容[4]                                )
          if(操作内容[5]!=null) returnDate.setSeconds      (操作内容[5]                                )
          if(操作内容[6]!=null) returnDate.setMilliseconds (操作内容[6]                                )
          return returnDate
        },
        曜日取得: function(Dateオブジェクト){
          return ["日","月","火","水","木","金","土"][Dateオブジェクト.getDay()]
        },
        月略称変換: function(引数){//※"1=1月"
          const リスト = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
          if(typeof(引数) == "number") return リスト        [引数 -1]
          if(typeof(引数) == "string") return リスト.indexOf(引数)+1
        },
        文字列変換: function(文字列,フォーマット){//※現在時刻基準&下位のリセット無し
          //フォーマット：YYYY→年(4桁)/YY→年(下2桁)/MM→月(数字)/MMM→月(略称)/DD→日/HH→時/mm→分/SS→秒
          let 日時 = new Date()
          if       (フォーマット.includes("YYYY" ))日時.setFullYear (Number(文字列.slice(フォーマット.indexOf("YYYY" ),フォーマット.indexOf("YYYY" )+ 4 ))    )
            else if(フォーマット.includes("YY"   ))日時.setFullYear (Number(String(日時.getFullYear()).slice(0,2)+文字列.slice(フォーマット.indexOf("YY"),フォーマット.indexOf("YY")+2)))
          if       (フォーマット.includes("YYYY" ))日時.setFullYear (Number(文字列.slice(フォーマット.indexOf("YYYY" ),フォーマット.indexOf("YYYY" )+ 4 ))    )
          if       (フォーマット.includes("MMM"  ))日時.setMonth    (共有関数.Date操作.月略称変換(文字列.slice(フォーマット.indexOf("MMM"),フォーマット.indexOf("MMM")+3))-1)
            else if(フォーマット.includes("MM"   ))日時.setMonth    (Number(文字列.slice(フォーマット.indexOf("MM"   ),フォーマット.indexOf("MM"   )+ 2 )) -1 )
          if       (フォーマット.includes("DD"   ))日時.setDate     (Number(文字列.slice(フォーマット.indexOf("DD"   ),フォーマット.indexOf("DD"   )+ 2 ))    )
          if       (フォーマット.includes("HH"   ))日時.setHours    (Number(文字列.slice(フォーマット.indexOf("HH"   ),フォーマット.indexOf("HH"   )+ 2 ))    )
          if       (フォーマット.includes("mm"   ))日時.setMinutes  (Number(文字列.slice(フォーマット.indexOf("mm"   ),フォーマット.indexOf("mm"   )+ 2 ))    )
          if       (フォーマット.includes("SS"   ))日時.setSeconds  (Number(文字列.slice(フォーマット.indexOf("SS"   ),フォーマット.indexOf("SS"   )+ 2 ))    )
          return 日時
        }
      },
    オブジェクト操作:
      {
        ディープコピー: function(引数){
          if(!引数 || typeof(引数)!="object") return 引数
          switch(Object.prototype.toString.call(引数).slice(8,-1)){
            case "Array": return 引数.map(要素=>共有関数.オブジェクト操作.ディープコピー(要素))
            case "Date" : return new Date(引数)
            default     : return Object.entries(引数).reduce((A,B)=>{A[B[0]]=共有関数.オブジェクト操作.ディープコピー(B[1]);return A},{})
          }
        },
        等価演算: function(引数1,引数2){
          if(引数1==引数2) return true
          let キー1 = Object.keys(引数1)
          let キー2 = Object.keys(引数2)
          if(キー1.length!=キー2.length) return false
          for(let i = 0; i < キー1.length; i++) if(!キー2.includes(キー1[i]) || !共有関数.オブジェクト操作.等価演算(引数1[キー1[i]],引数2[キー1[i]])) return false
          return true
        },
        存在判定: function(引数){
          return Object.keys(引数).length
        }
      },
    配列操作:
      {
        文字列化: function(引数){
          return JSON.stringify(引数)
        },
        配列化: function(引数){
          return JSON.parse(引数)
        },
        二次元目の長さ: function(引数){
          return 引数.map(要素=>要素.length).reduce((A,B)=>Math.max(A,B))
        }
      },
    ディスコ:
      class ディスコ{
        constructor(){
          this.embeds = [{}]
        }
        フィールド(引数){
          if(!this.embeds[0].fields) this.embeds[0].fields = []
          let 既存配列長 = this.embeds[0].fields.length
          for(let i = 0; i < 引数.length; i++){
            　　　　                     this.embeds[0].fields[既存配列長+i]        = {}
            if(引数[i][0]          　　) this.embeds[0].fields[既存配列長+i].name   = 引数[i][0]
            if(引数[i][0] && 引数[i][1]) this.embeds[0].fields[既存配列長+i].value  = 引数[i][1]
            if(引数[i][0] && 引数[i][2]) this.embeds[0].fields[既存配列長+i].inline = 引数[i][2]
          }
          return this
        }
        フッター(テキスト,アイコン){
          this.embeds[0].footer = {}
          if(テキスト)         this.embeds[0].footer.text     = テキスト
          if(アイコン)         this.embeds[0].footer.icon_url = アイコン
          return this
        }
        名前(名前,url,アイコン){
          this.embeds[0].author = {}
          if(名前)   　　      this.embeds[0].author.name     = 名前
          if(url)　　　　      this.embeds[0].author.url      = url
          if(アイコン)         this.embeds[0].author.icon_url = アイコン
          return this
        }
        埋め込み(タイトル,url,本文,サムネ,画像,タイムスタンプ,色){
          if(タイトル)　　　    this.embeds[0].title       = タイトル
          if(url)　　　　　　　 this.embeds[0].url         = url
          if(本文)　　　　　    this.embeds[0].description = 本文
          if(サムネ)　　　　    this.embeds[0].thumbnail   = {url: サムネ}
          if(画像)　　　　　    this.embeds[0].image       = {url: 画像　}
          if(タイムスタンプ)    this.embeds[0].timestamp   = タイムスタンプ
          if(色)　　　　　　    this.embeds[0].color       = parseInt(色.length==6 ? 色 : 共有設定.ディスコ.色[色], 16)
          return this
        }
        メッセージ(コンテンツ,名前){
          if(コンテンツ)       this.content  = コンテンツ=="メンション" ? `<@${共有設定.ディスコ.アカウント}>` : コンテンツ
          if(名前)　　　       this.username = 名前
          return this
        }
        送信(ウェブフック){
          if(!ウェブフック || ウェブフック.slice(0,33)!="https://discord.com/api/webhooks/") ウェブフック = 共有設定.ディスコ.システム.指定失敗
          if(!共有関数.オブジェクト操作.存在判定(this.embeds[0])) delete this.embeds
          const payload = {method:"post",headers:{"Content-type":"application/json"},payload:JSON.stringify(this)}
          while(true){
            try{
              UrlFetchApp.fetch(ウェブフック,payload)
              break
            }catch(エラー){
              if(エラー.message.slice(0,57) != "Request failed for https://discord.com returned code 429.") throw new Error(エラー.message)
              Utilities.sleep(500)
            }
          }
        }
      },
    
    LINE:
      {
        送信: function(送信内容,使用BOT,送信形式,送信先){
          //送信先：リプライ→リプライトークン/プッシュ→対象のID/マルチキャスト→対象のID(配列)/ブロードキャスト→不要
          if(!Array.isArray(送信内容)) 送信内容 = [送信内容]
          let 内容 = {"messages":送信内容.map((要素)=>({"type":"text","text":要素}))}
          let URL = ""
          switch(送信形式){
            case "リプライ"　　　　 : URL = "reply"     ;内容["replyToken"] = 送信先 ;break
            case "プッシュ"　　　　 : URL = "push"      ;内容["to"]         = 送信先 ;break
            case "マルチキャスト"　 : URL = "multicast" ;内容["to"]         = 送信先 ;break
            case "ブロードキャスト" : URL = "broadcast"
          }
          UrlFetchApp.fetch("https://api.line.me/v2/bot/message/"+URL,{method:"post",headers:{"Content-Type":"application/json",Authorization:"Bearer "+使用BOT},payload:JSON.stringify(内容)}
          )
        },
        ID変換: function(引数){
          return 引数 ? 共有設定.LINE.対応表.filter(要素=>要素[Number(!(引数.length==33))]==引数)[0] ? 共有設定.LINE.対応表.filter(要素=>要素[Number(!(引数.length==33))]==引数)[0][Number(引数.length==33)] : "" : ""
        }
      }
  }




























