//i5system 実行用スクリプト
"use strict";

/**第零階層 基本関数/環境変数
 */
const Parser = ParserGS;
//▽ビルトインオブジェクト拡張▽
  Object.assign(Object.prototype,{
    /**プロパティ存在判定
     * @return {boolean}
     */
    _exist(){
      return !!Object.keys(this).length;
    },
  });
  Object.assign(Array .prototype,{
    /**階層別ごとの最大配列長を浅度順の配列に ※要素0の階層は無視
     * @return {number[]}
     */
    _dpLength(){
      const exe=(ary)=>{
        if(Array.isArray(ary)){
          const ret_num = ary.reduce((pre_num,cur_el)=>Math.max(pre_num,exe(cur_el)),0);
          ret_ary = ret_num ? [ret_num,...ret_ary] : ret_ary;
          return ary.length;
        }else{
          return null;
        };
      };
      let ret_ary = [/*(exe(this))とすると未定義のまま再帰処理が始まる*/];
      return [exe(this),...ret_ary];
    },
  });
  Object.assign(Date  .prototype,{
    __methods:[`FullYear`,`Month`,`Date`,`Hours`,`Minutes`,`Seconds`,`Milliseconds`],
    /**setの糖衣構文
     * @param  {string} method_str - FullYear/Month/Date/Hours/Minutes/Seconds/Milliseconds
     * @param  {number} set_num    - set{methos_str}の引数
     * @return {Date}
     */
    _set(method_str,set_num){
      this[`set${method_str}`](set_num);
      return this;
    },
    /**7単位別にDate加減算
     * @param  {number} add_ary - 年,月,日,時,分,秒,ミリ秒(0埋め/省略可)
     * @return {Date}
     */
    _adds(...add_ary){
      add_ary = Array.isArray(add_ary[0]) ? add_ary[0] : add_ary;
      return add_ary.reduce((pre_da,cur_num,idx)=>pre_da._set(this.__methods[idx],pre_da[`get${this.__methods[idx]}`]()+cur_num),_.date(this));
    },
    /**7単位別にDate設定
     * @param  {number} set_ary - 年,月,日,時,分,秒,ミリ秒(nullかundefined埋め/省略可)
     * @return {Date}
     */
    _sets(...set_ary){
      set_ary = Array.isArray(set_ary[0]) ? set_ary[0] : set_ary;
      return set_ary.reduce((pre_da,cur_num,idx)=>pre_da._set(this.__methods[idx],cur_num??pre_da[`get${this.__methods[idx]}`]()),_.date(this));
    },
    /**Date→曜日1文字
     * @return {string}
     */
    _wkdayJP(){
      return '日月火水木金土'[this.getDay()];
    },
    /**thisを基準に文字列→Date変換
     * @param  {string}  tgt_str - 変換対象
     * @param  {string}  fmt_str - YYYY→年(4桁)/YY→年(下2桁)/MM→月(数字)/MMM→月(略称)/DD→日/HH→時/mm→分/SS→秒
     * @param  {boolean} sec_rst - 秒をリセットするか
     * @return {Date}
     */
    _toDate(tgt_str,fmt_str,sec_rst=false){
      const ret_de = _.date(this)._sets([,,,,,sec_rst ? 0 : null,0]);
      for(let i = 0; i < fmt_str.length; i++){
        switch(fmt_str[i]){//NOTE:iへの加算が必要なため三項演算子使用不可
          case `Y`: if(fmt_str[i+3]===`Y`){ret_de.setFullYear(Number(             tgt_str.slice(i,i+4) )  );                 i+=3;break;}
                    else                  {ret_de.setFullYear(Number(             tgt_str.slice(i,i+2) )  );ret_de._add(100);i+=1;break;}
          case `M`: if(fmt_str[i+2]!==`M`){ret_de.setMonth   (Number(             tgt_str.slice(i,i+2) )-1);                 i+=1;break;}
                    else                  {ret_de.setMonth   (Number(Date._mthAbb(tgt_str.slice(i,i+3)))-1);                 i+=2;break;}
          case `D`:                       {ret_de.setDate    (Number(             tgt_str.slice(i,i+2) )  );                 i+=1;break;}
          case `H`:                       {ret_de.setHours   (Number(             tgt_str.slice(i,i+2) )  );                 i+=1;break;}
          case `m`:                       {ret_de.setMinutes (Number(             tgt_str.slice(i,i+2) )  );                 i+=1;break;}
          case `S`:                       {ret_de.setSeconds (Number(             tgt_str.slice(i,i+2) )  );                 i+=1;break;}
        };
      };
      return ret_de;
    },
  });
  Object.assign(Date            ,{
    /**月の三文字略↔N月 相互変換
     * @param  {string|number} - stringの場合の1文字目は大文字
     * @return {number|string}
     */
    _mthAbb(arg){
      const abb_ary = [`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`]
      return typeof arg===`string` ? abb_ary.indexOf(arg)+1 : abb_ary[arg-1]
    },
  });
//△ビルトインオブジェクト拡張△
const conf  =              {
  system     :{
    bootGsId:``,
    timeTrig:{
      itv_min  : 20,//処理開始時間n分の最大公約数
      time_obj : {//時、分のみ指定
        itv_ary:[
          [[ 0,20], "mailTrans"    ],
          [[ 3, 0], "skdCasheSave" ],
          [[ 5, 0], "siteCheck"    ],
          [[ 6, 0], "news"         ],
        ],
        fix_ary:[
          [[ 0, 0], "skdBotUpdate" ],
          [[ 0, 0], "sysRep"       ],
          [[18, 0], "schedule_send"],
        ],
      },
    },
    psDef   :{
      runTime       : "0",
      news          : "{}",
      cradle_lastRun: 0,
    },
  },
  gssId      :{
    skd       : ``,
    addressLs : ``,
  },
  disc       :{
    ch_obj :{
      "welcome"         : ``                                                                                        ,//不要
      //PUBLIC
      "skd"             : ``,
      "classroom"       : ``,
      "forum"           : ``                                                                                        ,//不要
      //PRIVATE
      "skdBot_feedback" : ``,
      "i5systemRunLog"  : ``,
      "i5systemExelog"  : ``,
      "webhookFail"     : ``,
      "siteCheck"       : ``,
      //NEWS
      "nhk_all"         : ``,
      "itmedia_all"     : ``,
      "itmedia_ait"     : ``,
      "itmedia_aiplus"  : ``,
      "itmedia_business": ``,
      "mynavi_tech_ent" : ``,
      "mynavi_tech_tech": ``,
      "mynavi_tech_wtpa": ``,
      "mynavi_dig_pc"   : ``,
      "business_plusit" : ``,
    },
    usrId  :{
      antares:``
    },
  },
  skd        :{
    sheetLs :,
    stTt    :{
      A: ,
      B: ,
      C: ,
    },
    tt_obj  :{
      "1-1":{
        月: [],
        火: [],
        水: [],
        木: [],
        金: [],
      },
      "1-2":{
        月: [],
        火: [],
        水: [],
        木: [],
        金: [],
      },
      "1-3":{
        月: [],
        火: [],
        水: [],
        木: [],
        金: [],
      },
      "1-4":{
        月: [],
        火: [],
        水: [],
        木: [],
        金: [],
      },
      "1-5":{
        月: [],
        火: [],
        水: [],
        木: [],
        金: [],
      },
      "1-6":{
        月: [],
        火: [],
        水: [],
        木: [],
        金: [],
      },
    },
  },
  skdBot     :{
    token_str: "",
    rootPw :``,
    rmImgId: {
      "left" :"",
      "right":"",
    },
    readMe:`<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>ReadMe</title></head><body><H1>【はちまきBotの使い方】</H1><h2>管理者より</h2><p>・LINEユーザーIDと所属クラスをBotの動作のために収集します。</p><p>　データはBotと管理者しかアクセスできない場所に保管されます。</p><p>　なお、登録時のメッセージのために取得した表示名は送信後に破棄されます。</p><p>・このBotは非公開であり、IDが流出しないかぎり外部からのアクセスはできません。</p><p>・このBotをグルーブラインに追加することは可能です。</p><p>　ただし、仕様上管理者が閲覧可能な状態になります。</p><p>　(個人チャットも含め、わざわざ確認しに行くつもりはないですが)</p><p>・いたずら目的のボタン連打はやめてください。明らかなものはBANします。</p><p>　ガスで動かしているため、実行可能時間を使い切ってシステム全体が落ちます。</p><h2>[基本機能]タブについて</h2><h3>・N日の予定</h3><p>　押したあとに出てくる日付選択画面から予定を知りたい日を選択してください。</p><p>　指定可能な日は今日から1週間後までです。</p><p>　指定された日の時間割や天気等を返します。</p><p>　短縮時程や全体予定は情報が存在する場合のみメッセージに含まれます。</p><h3>・1週間の予定</h3><p>　翌日から1週間後までの[N日の予定]を横に連結したメッセージを返します。</p><h3>・予定表編集</h3><p>　上の機能の情報源であるスプレッドシートが開きます。</p><p>　編集することで、授業のメモ(テスト等)を追加できます。</p><p>　クラス別のシートになっていて、編集した内容はクラス全体に適用されます。</p><h3>・次の電車</h3><p>　その名の通りです。</p><p>　休日、祝日も考慮したうえで返します。</p><p>　現在登録されている駅は以下の通りです。</p><p>　・鶴見線　鶴見小野駅発　　鶴見方面</p><p>　・京急線　花月総持寺駅発　浦賀方面</p><h3>・アドレス検索</h3><p>　ボタンを押したあとに名前を送信することで、学校のアカウントのメールアドレスを検索できます。</p><p>　GoogleDriveのファイルの共有等に活用できます。</p><p>　ただ...一部信憑性は微妙です。</p><h2>[その他]タブについて</h2><h3>・クラス登録</h3><p>　押されたらクラスの選択肢を返します。</p><p>　そこから自分のクラスを登録してください。</p><p>　間違えた場合は押し直せば登録し直せます。</p><h3>・フィードバック</h3><p>　ボタンを押した後に内容を入力して送信してください。</p><p>　送信者は記録していないため、できるだけ詳細に書いてもらえるとありがたいです。</p><h3>・アドレス表編集</h3><p>　[アドレス検索]の情報源であるスプレッドシートが開きます。</p><p>　間違いに気付いたら修正していただけるとありがたいです。</p><h3>・それ以外のボタン</h3><p>　システム管理用のボタンです。</p><p>　押してもいいですが、パスワードがかかっています。</p><h2>グルーブライン/PC環境での使い方</h2><p>　「はちまきbot」と呼べば選択肢を返します。</p><p>　利用可能なのは数日分の予定送信のみです。</p></body></html>`,
  },
  mailTrans  :{
    textLim_num : 200,
    add_obj     : {
    },
    bkLs:[//0に対象要素を取得する関数名、1に対象の文字列
      [`getSubject`,`Review edits to your Apps Script project`],
    ],
  },
  news       :{
    getLim_num: 5,
    table     : [
      {//NHK
        info: {
          baceUrl: `https://www.nhk.or.jp/rss/news/`   ,
          item   : [`<item>`       ,`</item>`       ]  ,
          title  : [`<title>`      ,`</title>`      ]  ,
          link   : [`<link>`       ,`</link>`       ]  ,
          body   : [`<description>`,`</description>`]  ,
          img    : [null           , null           ]  ,
          time   : [`<pubDate>`    , `</pubDate>`   ]  ,
          timeFmt: `_____DD_MMM_YYYY_HH_mm_SS______`   ,
        },
        ls  : [
          [`cat0.xml`           ,`nhk_all`         ],
        ]
      },
      {//ITmedia
        info: {
          baceUrl: `https://rss.itmedia.co.jp/rss/2.0/`,
          item   : [`<item>`       ,`</item>`       ]  ,
          title  : [`<title>`      ,`</title>`      ]  ,
          link   : [`<link>`       ,`</link>`       ]  ,
          body   : [`<description>`,`</description>`]  ,
          img    : [ null          , null           ]  ,
          time   : [`<pubDate>`    ,`</pubDate>`    ]  ,
          timeFmt: `_____DD_MMM_YYYY_HH_mm_SS______`   ,
        },
        ls  : [
          [`news_bursts.xml`    ,`itmedia_all`     ],
          [`ait.xml`            ,`itmedia_ait`     ],
          [`aiplus.xml`         ,`itmedia_aiplus`  ],
          [`business.xml`       ,`itmedia_business`],
        ]
      },
      {//Mynavi
        info: {
          baceUrl: `https://news.mynavi.jp/rss/`       ,
          item   : [`<item`        ,`</item>`       ]  ,//※ここは脱字ではない！
          title  : [`<title>`      ,`</title>`      ]  ,
          link   : [`<link>`       ,`</link>`       ]  ,
          body   : [`<description>`,`</description>`]  ,
          img    : [`<img>`        ,`</img>`        ]  ,
          time   : [`<dc:date>`    ,`</dc:date>`    ]  ,
          timeFmt: `YYYY_MM_DD_HH_mm_SS______`         ,
        },
        ls  : [
          [`techplus/enterprise`,`mynavi_tech_ent` ],
          [`techplus/technology`,`mynavi_tech_tech`],
          [`techplus/whitepaper`,`mynavi_tech_wtpa`],
          [`digital/pc`         ,`mynavi_dig_pc`   ],
        ]
      },
      {//ビジネス+IT
        info: {
          baceUrl: `https://www.sbbit.jp/rss/`         ,
          item   : [`<item>`       ,`</item>`       ]  ,
          title  : [`<title>`      ,`</title>`      ]  ,
          link   : [`<link>`       ,`</link>`       ]  ,
          body   : [`<description>`,`</description>`]  ,
          img    : [null           ,null            ]  ,
          time   : [`<pubDate>`    ,`</pubDate>`    ]  ,
          timeFmt: `_____DD_MMM_YYYY_HH_mm_SS______`   ,
        },
        ls  : [
          [`HotTopics.rss`      ,`business_plusit` ],
        ]
      },
    ],
  },
  siteCheck  :{
    ls:[
    ],
  },
  train      :{
    tsurumionoUp:{
      wd:[
        [                                ],
        [                                ],
        [                                ],
        [                                ],
        [                                ],
        [                                ],
        [ 2,13,22,29,36,42,46,50,55      ],
        [ 0, 5,12,18,23,27,32,35,41,47,53],
        [ 0, 5, 9,14,17,25,32,37,40,45,53],
        [ 0,12,23,34,50                  ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,13,23,35,45,54               ],
        [ 1, 6,11,16,22,30,38,43,51,58   ],
        [ 7,12,17,24,33,42,52            ],
        [ 3,15,27,43,53                  ],
        [ 8,24,38,53                     ],
        [ 8,28,48                        ],
        [ 8,28,48                        ],
        [ 8,45                           ],
      ],
      we:[
        [                                ],
        [                                ],
        [                                ],
        [                                ],
        [                                ],
        [                                ],
        [ 2,13,33,43,53                  ],
        [ 4,15,25,35,45,54               ],
        [ 2,15,23,31,44,55               ],
        [12,25,38                        ],
        [ 0,20,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,43                        ],
        [ 3,23,33,43,53                  ],
        [ 3,13,23,33,43,52               ],
        [ 3,13,23,34,45,55               ],
        [ 8,18,31,48                     ],
        [ 3,16,36,53                     ],
        [ 8,35                           ],
        [23                              ],
        [ 8,45                           ],
      ],
    },
    kagetsuDown:{
      wd:[
        [ 7,25                  ],
        [                       ],
        [                       ],
        [                       ],
        [                       ],
        [ 8,30,51               ],
        [11,28,43,49            ],
        [ 0,12,25,30,40,47,50,59],
        [ 4,10,17,22,34,42,51,58],
        [ 8,18,26,35,45,56      ],
        [ 6,16,25,32,47,53      ],
        [ 1,11,22,31,42,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,42,53,59   ],
        [12,18,25,32,41,51      ],
        [ 0, 8,15,23,30,42,52   ],
        [ 1,11,21,31,42,51      ],
        [ 1,11,22,31,41,51,59   ],
        [11,19,29,40,50,59      ],
        [ 9,18,30,40,49,59      ],
        [ 9,22,30,42,51         ],
        [ 0,11,26,38,54         ],
      ],
      we:[
        [ 7,23                  ],
        [                       ],
        [                       ],
        [                       ],
        [                       ],
        [ 8,30,48               ],
        [ 5,22,35,51            ],//6
        [ 4,18,30,35,46,57      ],
        [ 8,18,28,38,48,59      ],
        [ 9,19,28,39,51         ],
        [ 3,11,22,32,42,52      ],
        [ 2,12,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,31,41,51      ],
        [ 1,11,21,24,33,44,54   ],
        [ 4,14,24,34,44,54      ],
        [ 4,13,24,33,44,52,59   ],
        [ 8,17,28,43,54,59      ],
        [11,26,35,46,56         ],
      ],
    },
  },
  colorTable :{
    While   : 0xFFFFFF,
    Silver  : 0xC0C0C0,
    Gray    : 0x808080,
    Black   : 0x000000,
    Red     : 0xFF0000,
    Maroon  : 0x800000,
    Yellow  : 0xFFFF00,
    Olive   : 0x808000,
    Lime    : 0x00FF00,
    Green   : 0x008000,
    Aqua    : 0x00FFFF,
    Teal    : 0x008080,
    Blue    : 0x0000FF,
    Navy    : 0x000080,
    Fuchsia : 0xFF00FF,
    Purple  : 0x800080,
  },
};
const _ =                  {
  /**Date生成の糖衣構文
   * @param  {number} arg - new Date の引数
   * @return {Date}
   */
  date :(...arg) => new Date(...arg),
  /**UrlFetchAppの糖衣構文
   * @param  {string}  url                - リクエスト先(本来の第1引数)
   * @param  {string}  method             - GET/POST/PUT/DELETE etc... (def:GET)
   * @param  {object}  payload            - 本文データ
   * @param  {string}  contentType        - 本文データのタイプ (def:JSON)
   * @param  {object}  headers            - ヘッダー
   * @param  {boolean} muteHttpExceptions - レスポンス!=200でも例外を投げない (def:false)
   * @return {HTTPResponse}
   */
  fetch:(url,method="GET",payload,contentType="application/json",headers,muteHttpExceptions=false) => {
    return UrlFetchApp.fetch(url,{
      method             : method            ,
      payload            : payload           ,
      contentType        : contentType       ,
      headers            : headers           ,
      muteHttpExceptions : muteHttpExceptions,
    });
  },
  gSS  :class{
    /**gss操作クラス
     * @param  {string} fileId    - 既存ファイルID/新規ファイル名/undefinedでactiveファイル
     * @param  {string} sheetName - 既存or新規シート名/`ALL`で全シート/undefinedでactiveシート
     * @return {this}
     */
    constructor(fileId,sheetName){
      this.ss = SpreadsheetApp;
      this.ss = fileId    ?                     this.ss.openById            (fileId   )
                            ||                  this.ss.create              (fileId   )
                          :                     this.ss.getActiveSpreadsheet(         );
      this.ss = sheetName ?                     this.ss.getSheetByName      (sheetName)
                            ||                  this.ss.insertSheet         (sheetName)
                          : sheetName===`ALL` ? this.ss.getSheets           (         )
                                              : this.ss.getActiveSheet      (         );
      return this;
    };
    /**範囲取得メソッド
     * @param {number|string} rowS - 行番号/LAST±nで最終行(※自体)±n undefinedでactive範囲
     * @param {number|string} colS - 列番号/LAST±nで最終列(※自体)±n (省略可)
     * @param {number|string} rowE - 行番号/LAST±nで最終行(※自体)±n (省略可)
     * @param {number|string} colE - 列番号/LAST±nで最終列(※自体)±n (省略可)
     * @return {this}
     */
    range(rowS,colS=1,rowE=1,colE=1){
      rowS = rowS.slice?.(0,4)===`LAST` ? this.ss.getLastRow   ()       +Number(rowS.slice(4)) : rowS;
      colS = colS.slice?.(0,4)===`LAST` ? this.ss.getLastColumn()       +Number(colS.slice(4)) : colS;
      rowE = rowE.slice?.(0,4)===`LAST` ? this.ss.getLastRow   ()-rowS+1+Number(rowE.slice(4)) : rowE;
      colE = colE.slice?.(0,4)===`LAST` ? this.ss.getLastColumn()-colS+1+Number(colE.slice(4)) : colE;
      this.cells = rowS&&colS ? this.ss.getRange      (rowS,colS,rowE,colE)
                              : this.ss.getActiveRange(                   );
      return this;
    };
    /**セル取得 ※先にrangeを呼び出し
     * @return {array[]}
     */
    cGet(){
      return this.cells.getValues();
    };
    /**セル設定 ※rangeの呼び出し不要
     * @param  {array[]}       val_ary - 2次元配列
     * @param  {number|string} rowS    - 行番号/LAST±nで最終行(※自体)±n
     * @param  {number|string} colS    - 列番号/LAST±nで最終列(※自体)±n (省略可)
     * @return {this}
     */
    cSet(val_ary,rowS,colS){
      this.range(rowS,colS,val_ary.length,val_ary._dpLength()[1]).cells.setValues(val_ary);
      return this;
    };
    /**セルの色設定 ※先にrangeを呼び出し
     * @param  {number|string} font_str - Hexカラーコード/カラーネーム/undefinedで黒
     * @param  {number|string} back_str - Hexカラーコード/カラーネーム/undefinedで白
     * @return {this}
     */
    cColor(font_str,back_str){
      font_str = typeof font_str === `number` ? `#${font_str.toString(16)}` : font_str;
      back_str = typeof back_str === `number` ? `#${back_str.toString(16)}` : back_str;
      this.cells.setFontColor(font_str||`#000000`).setBackground(back_str||`#FFFFFF`);
      return this;
    };
    /**セル削除 ※rangeの呼び出し不要
     * @param  {string} dir_str    - ROW/COL
     * @param  {number} start_num  - 開始番号
     * @param  {number} length_num - 削除数(省略可)
     * @return {this}
     */
    cDel(dir_str,start_num,length_num=1){
      dir_str===`ROW` ? this.ss.deleteRows(start_num,length_num) : this.ss.deleteColumns(start_num,length_num);
      return this;
    };
  },
  gPS  :{
    _ps_obj: PropertiesService.getScriptProperties(),
    /**プロパティ取得
     * @param  {string|undefined} key_str - キー/undefinedで全取得
     * @return {string}
     */
    pGet(key_str){
      return key_str ? this._ps_obj.getProperty(key_str) : this._ps_obj.getProperties();
    },
    /**プロパティ設定
     * @param  {string|object}   key_str - キー/objectでkey-valueペアをそのまま設定
     * @param  {string|undefined} val_str - 内容/objectであればundefinedに
     * @return {undefined}
     */
    pSet(key_str,val_str){
      !(typeof key_str===`object`) ? this._ps_obj.setProperty(key_str,val_str) : this._ps_obj.setProperties(key_str);
    },
    /**プロパティ削除
     * @param  {string|undefined} key_str - キー/undefinedで全削除
     * @return {undefined}
     */
    pDel(key_str){
      key_str ? this._ps_obj.deleteProperty(key_str) : this._ps_obj.deleteAllProperties();
    },
  },
  gCS  :{
    _cs_obj: CacheService.getScriptCache(),
    /**キャッシュ取得
     * @param  {string|undefined} key - キー/undefinedで全取得
     * @return {string}
     */
    cGet(key){
      return !(Array.isArray(key)) ? this._cs_obj.get(key) : this._cs_obj.getAll();
    },
    /**キャッシュ設定
     * @param  {string|array}     key     - キー/arrayでkey-valueペアを設定
     * @param  {string|undefined} val_str - 内容/arrayであればundefinedに
     * @param  {number}           exp_sec - 有効秒数/省略で6時間(最長)
     * @return {undefined}
     */
    cSet(key,val_str,exp_sec=6*60*60){
      !(Array.isArray(key)) ? this._cs_obj.put(key,val_str,exp_sec) : this._cs_obj.putAll(key,exp_sec);
    },
    /**キャッシュ削除
     * @param  {string|undefined} key - キー/undefinedで全削除
     * @return {undefined}
     */
    cDel(key){
      !(Array.isArray(key)) ? this._cs_obj.remove(key) : this._cs_obj.removeAll();
    },
  },
  gTrig:{
    /**トリガー設定
     * @param  {string} func_str - 対象とする関数名
     * @param  {string} type_str - 関数内の表を参照
     * @param  {any}    time     - 関数内の表を参照
     * @return {undefined}
     */
    tSet(func_str,type_str,...time){
      /*  type_str      time　　　　          制約
          atDate        year,month,day　　　　0時±15分
          onMonthDay    毎月number日　        -
          onWeekDay     毎週[weekday]曜日     -
          everyWeeks    number週間ごと        -
          everyDays     number日　ごと        この場合だけ特殊処理
          everyHours    number時間ごと        -
          everyMinutes  number分　ごと        1,5,10,15,30 のどれか
          after         bynverミリ秒後        -
          at            [Date]　　　　        -
      */
      const timeTrig = ScriptApp.newTrigger(func_str).timeBased();
      type_str!==`everyDays` ? timeTrig[type_str](...time                                          ).create()
                             : timeTrig.everyDays(time[0]).atHour(time[1]||0).nearMinute(time[2]||0).create();
    },
    /**トリガー削除
     * @param  {string[]|undefined} func_ary  - フィルター対象関数名/undefinedで全削除
     * @param  {boolean}            mode_bool - falceで一致、trueで非一致を削除
     * @return {udefined}
     */
    tDel(func_ary,mode_bool){
      func_ary = Array.isArray(func_ary) ? func_ary : [func_ary];
      ScriptApp.getProjectTriggers().forEach(el_obj=>
        (func_ary ? func_ary.includes(el_obj.getHandlerFunction()) ? !mode_bool : mode_bool : true) ? ScriptApp.deleteTrigger(el_obj) : null
      );
    },
  },
  disc :class{
    /**discビルダー
     * @return {this}
     */
    constructor(){
      this.embed = {};
    };
    /**フィールド
     * @param  {string}  name_str    - フィールドタイトル
     * @param  {string}  val_str     - フィールドの中身
     * @param  {boolean} inline_bool - フィールドを横並びにするか(true同士で連結)
     * @return {this}
     */
    fields (name_str,val_str,inline_bool){
      this.embed.fields = this.embed.fields ?  this.embed.fields : []
      this.embed.fields[this.embed.fields.length] = {
        name   : name_str   ,
        value  : val_str    ,
        inline : inline_bool,
      };
      return this;
    };
    /**フッター
     * @param  {string} text_str - フッターテキスト
     * @param  {string} icon_str - フッターアイコン(URL)
     * @return {this}
     */
    footer (text_str,icon_str){
      this.embed.footer = {
        text     : text_str,
        icon_url : icon_str,
      };
    return this;
    };
    /**投稿者
     * @param  {string} name_str - 投稿者名
     * @param  {string} url_str  - 投稿者のURL
     * @param  {string} icon_str - 投稿者アイコンURL
     * @return {this}
     */
    author (name_str,url_str,icon_str){
      this.embed.author = {
        name     : name_str,
        url      : url_str ,
        icon_url : icon_str,
      };
      return this;
    };
    /**埋め込み
     * @param  {string} title_str       - 題名
     * @param  {string} url_str         - 題名のURL
     * @param  {string} description_str - 本文
     * @param  {string} thumbnail_str   - 小さい画像
     * @param  {string} image_str       - 大きい画像
     * @param  {Date}   timestamp_de    - 投稿時間 省略で現在時刻
     * @param  {str}    color           - 左の線の色(conf.colorTableに登録済のみ) 省略で青
     * @return {this}
     */
    embeds (title_str,url_str,description_str,thumbnail_str,image_str,timestamp_de=_.date(),color=`Blue`){
      Object.assign(this.embed,{
        title       : title_str             ,
        url         : url_str               ,
        description : description_str       ,
        thumbnail   : {url:thumbnail_str}   ,
        image       : {url:image_str}       ,
        timestamp   : timestamp_de          ,
        color       : conf.colorTable[color],
      });
      return this;
    };
    /**メッセージ
     * @param  {string} content_str  - プレーンテキスト
     * @param  {string} username_str - アカウント名
     * @return {this}
     */
    message(content_str,username_str){
      Object.assign(this,{
        content  : content_str ,
        username : username_str,
      });
      return this;
    };
    /**送信
     * @param  {string}    webhook_str - https://discord.com/api/webhooks/<ココ>
     * @return {undefined}
     */
    send   (webhook_str=conf.disc.ch_obj.webhookFail){
      this.embeds = this.embed._exist() ? [this.embed] : null;
      delete this.embed;
      for(let i = 0; i < 5; i++){
        try{
          _.fetch(`https://discord.com/api/webhooks/${webhook_str}`,"POST",JSON.stringify(this),undefined,{"Content-type":"application/json"})
          return;
        }catch(error_obj){
          if(error_obj.message.slice(0,57)===`Request failed for https://discord.com returned code 429.`){
            Utilities.sleep(500);
          }else{
            throw error_obj;
          };
        };
      };
    };
    /**メンション作成
     * @param  {string|number} usrId - ユーザーID
     * @return {string}
     */
    static mention(usrId){
      return `<@${usrId}>`;
    };
  },
  line :class{
    /**lineビルダー ※リッチコンテンツビルダーは使わない
     * @return {this}
     */
    constructor(){
      this.messages = [];
    };
    /**リッチメッセージ
     * @param  {object} cont    - 中身となるオブジェクト ※carouselであれば {type:carousel,contents:[bubble配列]}
     * @param  {string} altText - 代替テキスト(省略で"hoge")
     * @return {object}
     */
    richMessage(cont,altText="_"){
      this.messages.push({
        "type"      : "flex" ,
        "altText"   : altText,
        "contents"  : cont   ,
      });
      return this;
    };
    //NOTE:イメージマップは画像の取得元がDriveである以上実装不可(URL/幅px で複数の画像を用意する必要あり)
    /**動画
     * @param  {string} vid_url - オリジナル(mp4/200MB以下)
     * @param  {string} pv_url  - サムネイル(JPEGorPNG/こっちも必須)
     * @return {this}
     */
    vid(vid_url,pv_url){
      this.messages.push({
        "type"               : "video",
        "originalContentUrl" : vid_url,
        "previewImageUrl"    : pv_url,
      });
      return this;
    };
    /**画像
     * @param  {string} org_url - オリジナル(JPEGorPNG/クリック時に表示)
     * @param  {string} pv_url  - サムネイル(JPEGorPNG/こっちも必須)
     * @return {this}
     */
    img(org_url,pv_url){
      this.messages.push({
        "type"               : "image",
        "originalContentUrl" : org_url,
        "previewImageUrl"    : pv_url ,
      });
      return this;
    };
    /**プレーンテキスト
     * @param  {string} text_str - 通常テキスト
     * @param  {string} qteToken - 引用トークン(省略可)
     * @return {this}
     */
    txt(text_str,qteToken){
      this.messages.push({
        "type"       : "text",
        "text"       : text_str,
        "quoteToken" : qteToken
      });
      return this;
    };
    /**クイックリプライ
     * @param  {obj}    action_obj - ポストバック/メッセージ/URI/日時選択/カメラ/カメラロール/位置情報/クリップボード　　　　　　　形式同じか確認
     * @param  {string} icon_url   - ボタンのアイコン画像のURL(1:1/PNG)
     * @return {this}
     */
    qkReply(action_obj,icon_url){
      this.quickReply = this.quickReply ?  this.quickReply : {"items":[]};
      this.quickReply.items[this.quickReply.items.length] = {
        "type"     : "action"  ,
        "imageUrl" : icon_url  ,
        "action"   : action_obj,
      };
      return this;
    };
    /**Botのプロフ
     * @param  {string} name_str - Botの名前
     * @param  {string} icon_url - Botのアイコン画像のURL(1:1/PNG)
     * @return {this}
     */
    prof(name_str,icon_url){
      this.sender= {
        "name"    : name_str,
        "iconUrl" : icon_url,
      };
      return this;
    };
    /**送信
     * @param  {string} token_str - LineBotのトークン
     * @param  {string} way_str   - 送信方法(reply/push/multicast/broadcast)
     * @param  {string} to_str    - 送信先　(リプライトークン/対象のID/対象のID配列/undefined)
     * @return {undefined}
     */
    send(token_str,way_str,to_str){
      _.fetch(
        `https://api.line.me/v2/bot/message/${way_str}`,
        "POST",
        JSON.stringify(Object.assign(this,way_str===`reply` ? {"replyToken":to_str} : way_str===`push`||way_str===`multicast` ? {"to":to_str} : {})),
        undefined,
        {"Content-Type":`application/json`,"Authorization":`Bearer ${token_str}`}
      );
    };
    /**ヘッダー
     * @param  {string} botToken - トークン文字列
     * @return {object}
     */
    static header(botToken){
      return {"Content-Type":"application/json","Authorization":`Bearer ${botToken}`}
    };
  },
};

/**第一階層 全処理共通処理
 * @param  {object} bootInfo - func:""(対象関数名),data:"対象関数に渡すデータ"
 * @return {呼び出し先に依存(現在無し)}
 */
function sysCall (bootInfo){
  const boot_de = _.date();
  try      {
    return globalThis[bootInfo.func]?.(bootInfo.data);
  }catch(e){
    new _.disc()
      .fields(`[${e.name}]`,e.message)
      .fields(`[Stack]`,e.stack.split(`\n    at `).slice(1).reverse().reduce((pre,row,idx)=>pre+=`\n└${`ー`.repeat(idx)}${row}`,`ROOT`))
      .embeds(`ExeFail`,null,null,null,null,_.date(),`Red`)
      .message(_.disc.mention(conf.disc.usrId.antares))
      .send(conf.disc.ch_obj.i5systemExelog);
    throw e;
  }finally {
    _.gPS.pSet(`runTime`,Number(_.gPS.pGet(`runTime`)) + _.date().getTime() - boot_de.getTime())
  };
};









/**第二階層 ゆりかごシステム
 */
function cradle  (        ){
  if(_.gPS.pGet(`cradle_lastGet`)===_.gPS.pGet(`cradle_lastRun`)){
    new _.disc().embeds(`timeTrig停止`,null,null,null,null,_.date(),`Red`).message(_.disc.mention(conf.disc.usrId.antares)).send(conf.disc.ch_obj.i5systemRunLog);
    timeTrig();
  };
  _.gPS.pSet(`cradle_lastGet`,_.gPS.pGet(`cradle_lastRun`));
};

/**第二階層 時限処理
 */
function timeTrig(        ){
  const now_de = _.date()._sets(null,null,null,null,Math.trunc(_.date().getMinutes()/conf.system.timeTrig.itv_min)*conf.system.timeTrig.itv_min,0,0);
  _.gPS.pSet(`cradle_lastRun`,now_de);
  _.gTrig.tDel(`timeTrig`);
  _.gTrig.tSet(`timeTrig`,`at`,now_de._adds(null,null,null,null,conf.system.timeTrig.itv_min));
  const res = [
    ...conf.system.timeTrig.time_obj.itv_ary.reduce((pre_ary,trigInfo)=>
      [...pre_ary, !(now_de._sets(1970,0,1)._adds(0,0,0,9).getTime() % _.date(1970,0,1,...trigInfo[0],0,0)._adds(0,0,0,9).getTime()) ? trigInfo[1] : null]
    ,[]),
    ...conf.system.timeTrig.time_obj.fix_ary.reduce((pre_ary,trigInfo)=>
      [...pre_ary, now_de.getTime()===now_de._sets(null,null,null,...trigInfo[0],0,0).getTime()                                       ? trigInfo[1] : null]
    ,[]),
  ].filter(Boolean).reduce((error_obj,funcName)=>{try{timeTrig_exe[funcName]();return error_obj;}catch(e){return e;}},{});
  if(res._exist()){throw res;};
};

/**第二階層 スケジュールbot
 * @param {object} data - Line鯖からのPostData
 */
function skdBot  (data    ){
  /* 現在のユーザーオブジェクトの構造
   * {
   *   classReg   : number  ,//登録されたクラス
   *   lastAction : {
   *     func : systemCtrl/addSearch/feedback
   *     arg  : systemCtrlはコマンド部分
   *   }
   * }
   */
  JSON.parse(data?.postData?.contents??`{}`).events?.forEach(event=>{
    if(event.source.type==="user"&&((event.type==="message"&&event.message.type==="text")||(event.type==="postback")||(event.type==="follow"))){
      let sendContent = new _.line();
      const usrInfo = _.gPS.pGet(`LineUsrInfo_${event.source.userId}`) ? JSON.parse(_.gPS.pGet(`LineUsrInfo_${event.source.userId}`)) : {"classReg":null,"lastAction":{}};
      try      {
        switch(event.type){
          case "message" :
            skdBod_exe[usrInfo.lastAction.func]?.(sendContent,usrInfo,null,event.message.text);
            break;
          case "postback":
            if(skdBod_exe[event.postback.data.slice(0,15)]){
              _.fetch(`https://api.line.me/v2/bot/chat/loading/start`,"POST",JSON.stringify({"chatId":event.source.userId,"loadingSeconds":60}),undefined,_.line.header(conf.skdBot.token_str));
              skdBod_exe[event.postback.data.slice(0,15)](sendContent,usrInfo,event.postback.data.slice(15),event.postback.params?.date/*YYYY-MM-DD*/);
            };
            break;
          case "follow"  :
            let messageBody = ``
            messageBody +=   ``+`はじめまして！　${JSON.parse(_.fetch(`https://api.line.me/v2/bot/profile/${event.source.userId}`,"GET",null,null,_.line.header(conf.skdBot.token_str))).displayName}さん。`
            messageBody += `\n`
            messageBody += `\n`+`画面下のメニューから操作できます。`
            messageBody += `\n`+`使い方は[その他]タブの[ReadMe]にあります。`
            sendContent.txt(messageBody);
            break;
        };
      }catch(e){
        sendContent.txt(`申し訳ありません\nサーバーでの処理中にエラーが発生いたしました\n再試行しても失敗する場合はしばらく待ってからお試しください\n(全てのエラーは管理者に通知されています)`);
        throw e;
      }finally {
        _.gPS.pSet(`LineUsrInfo_${event.source.userId}`,JSON.stringify(usrInfo));
        if(sendContent.messages[0]){sendContent.send(conf.skdBot.token_str,`reply`,event.replyToken)};
      };
    };
    if(/^(はちまき|ハチマキ)(ぼっと|ボット|bot)$/u.test(event.message?.text||``)||(event.source.type==="group"&&event.type===`postback`)){
      if(event.type===`message`){
        new _.line().richMessage({
          "type"  : "bubble",
          "size"  : "kilo",
          "header": {
            "type"          : "box",
            "layout"        : "vertical",
            "paddingTop"    : "10px",
            "paddingBottom" : "10px",
            "paddingStart"  : "10px",
            "paddingEnd"    : "10px",
            "contents"      : [{
              "type"   : "text",
              "text"   : `どの日の時間割を表示しますか？`,
              "weight" : "bold",
              "size"   : "md",
              "wrap"   : true
            }],
          },
          "hero":{
            "type"    : "box",
            "layout"  : "vertical",
            "paddingTop"    : "15px",
            "paddingBottom" : "15px",
            "paddingStart"  : "30px",
            "paddingEnd"    : "30px",
            "spacing"       : "md",
            "contents": [
              {
                "type"   : "button",
                "style"  : "secondary",
                "gravity": "center",
                "height" : "sm",
                "action" : {
                  "type"        : "postback",
                  "label"       : "1週間",
                  "data"        : "schedule_______week",
                  "displayText" : "1週間",
                },
              },
              {
                "type"   : "button",
                "style"  : "secondary",
                "gravity": "center",
                "height" : "sm",
                "action" : {
                  "type"        : "postback",
                  "label"       : "今日",
                  "data"        : "schedule_______0",
                  "displayText" : "今日",
                },
              },
              {
                "type"   : "button",
                "style"  : "secondary",
                "gravity": "center",
                "height" : "sm",
                "action" : {
                  "type"        : "postback",
                  "label"       : "明日",
                  "data"        : "schedule_______1",
                  "displayText" : "明日",
                },
              },
              {
                "type"   : "button",
                "style"  : "secondary",
                "gravity": "center",
                "height" : "sm",
                "action" : {
                  "type"        : "postback",
                  "label"       : "明後日",
                  "data"        : "schedule_______2",
                  "displayText" : "明後日",
                },
              },
              {
                "type"   : "button",
                "style"  : "secondary",
                "gravity": "center",
                "height" : "sm",
                "action" : {
                  "type"        : "postback",
                  "label"       : "明明後日",
                  "data"        : "schedule_______3",
                  "displayText" : "明明後日",
                },
              },
            ],
          },
          "styles":{
            "hero":{
              "separator":true,
            }
          }
        },`選択肢`).send(conf.skdBot.token_str,`reply`,event.replyToken);
      };
      if(event.type===`postback`){
        const sendContent = new _.line();
        skdBod_exe[event.postback.data.slice(0,15)]?.(sendContent,_.gPS.pGet(`LineUsrInfo_${event.source.userId}`) ? JSON.parse(_.gPS.pGet(`LineUsrInfo_${event.source.userId}`)) : {"classReg":null,"lastAction":{}},event.postback.data.slice(15));
        sendContent.send(conf.skdBot.token_str,`reply`,event.replyToken);
      };
    };
  });
};

/**第二階層 スケジュールbotにReadMe
 */
function skdBotRM(        ){
  return HtmlService.createHtmlOutput(conf.skdBot.readMe);
};

/**第三階層 時限処理系個別処理
 */
const timeTrig_exe =       {
  /**ディスコへのメール転送
   */
  mailTrans   (){
    if(!GmailApp.getInboxUnreadCount()){return};
    GmailApp.getMessagesForThreads(GmailApp.search(`is:unread`,0,10)).forEach(thread=>{
      thread.forEach(message=>message.markRead());
      const message = thread[0];
      if      (conf.mailTrans.bkLs.some(ls=>message[ls[0]]().includes(ls[1]))){
        ;//do nothing
      }else if(message.getFrom().includes(`no-reply@classroom.google.com`)   ){
        const body  = message.getPlainBody().split(`\r\n`);
        const idxA  = body.findIndex(el=>el.includes(`通知設定`/*　*/));
        const idxB  = body.findIndex(el=>el.includes(`詳細を表示`/**/));
        const parse = {
          room   : body.slice(idxA+2  ,idxA+2+1)[0]              ,
          type   : body.slice(idxA+4  ,idxA+4+1)[0].slice( 3,   ),
          title  : body.slice(idxA+6  ,idxB    )[0]              ,
          text   : body.slice(idxA+6+1,idxB    )   .join("\n")   ,
          link   : body.slice(idxB+1  ,idxB+1+1)[0].slice(53,-38),
          time   : body.slice(idxB+2  ,idxB+2+1)[0].slice( 4, 20),
          author : body.slice(idxB+2  ,idxB+2+1)[0].slice(30,   ),
        };
        parse.time = _.date()._toDate(parse.time.slice(parse.time.indexOf(`:`)-2,parse.time.indexOf(`:`)-2+15),`HH_mm____MM__DD`,true);
        parse.time =   body.slice(idxB+2  ,idxB+2+1)[0][11]===`後`/**/ ? parse.time._adds(null,null,null,12)        : parse.time;
        parse.text = !(body.slice(idxA+6+1,        )[0].trim()/*　 */) ? parse.text.split(`\n`).slice(1).join(`\n`) : parse.text;
        new _.disc().author(`${parse.author}先生 (${parse.room.trim()})`).embeds(`${parse.type}：${parse.title}`,parse.link,parse.text,null,null,parse.time).send(conf.disc.ch_obj.classroom);
      }else                                                                   {
        Logger.log(`${message.getTo()},${message.getCc()},${message.getBcc()}`)
        new _.disc()
          .author(message.getFrom())
          .embeds(message.getSubject(),`https://mail.google.com/mail/u/0/#inbox/${message.getId()}`,message.getPlainBody().slice(0,conf.mailTrans.textLim_num),null,null,message.getDate())
          .send(conf.disc.ch_obj[conf.mailTrans.add_obj[
            `${message.getTo()},${message.getCc()},${message.getBcc()}`.split(`,`).filter(Boolean).map(to=>Parser.data(to).from(`<`).to(`>`).build()||to).find(add=>conf.mailTrans.add_obj[add])
          ]]);
      };
    });
  },
  /**スケジュールのキャッシュ引き継ぎ
   */
  skdCasheSave(){
    _.gCS.cSet(`skd`,_.gCS.cGet(`skd`));
  },
  /**RSSからNEWS取得
   */
  news        (){
    const getInfo = JSON.parse(_.gPS.pGet(`news`));
    conf.news.table.forEach(siteGrp=>{
      siteGrp.ls.forEach(site=>{
        Parser.data(_.fetch(`${siteGrp.info.baceUrl}${site[0]}`).getContentText("utf-8")).from(siteGrp.info.item[0]).to(siteGrp.info.item[1]).iterate()
          .some((item,idx)=>{
            const lastTime = Number(getInfo[site[0]]??0);
            const upTime   = _.date()._toDate(Parser.data(item).from(siteGrp.info.time[0]).to(siteGrp.info.time[1]).build(),siteGrp.info.timeFmt,true);
            if(!idx){getInfo[site[0]] = upTime.getTime()};
            if(upTime.getTime()<=lastTime || idx===conf.news.getLim_num){
              return true
            }else{
              new _.disc().embeds(
                siteGrp.info.title[0] ? Parser.data(item).from(siteGrp.info.title[0]).to(siteGrp.info.title[1]).build() : null,
                siteGrp.info.link [0] ? Parser.data(item).from(siteGrp.info.link [0]).to(siteGrp.info.link [1]).build() : null,
                siteGrp.info.body [0] ? Parser.data(item).from(siteGrp.info.body [0]).to(siteGrp.info.body [1]).build() : null,
                null                                                                                                          ,
                siteGrp.info.img  [0] ? Parser.data(item).from(siteGrp.info.img  [0]).to(siteGrp.info.img  [1]).build() : null,
                upTime                                                                                                        ,
              ).send(conf.disc.ch_obj[site[1]]);
            };
          });
      });
    });
    _.gPS.pSet(`news`,JSON.stringify(getInfo));
  },
  /**サイト更新チェック
   */
  siteCheck   (){
    const info = JSON.parse(_.gCS.cGet(`siteCheck`)||"{}");
    conf.siteCheck.ls.forEach(site=>{try{
      const pre_html = info[site[0]];
      const cur_html = _.fetch(site[0]).getContentText("utf-8");
      if(pre_html&&pre_html!==cur_html){new _.disc().embeds(`${site[1]}に更新あり`).message(_.disc.mention(conf.disc.usrId.antares)).send(conf.disc.ch_obj.siteCheck)};
      info[site[0]] = cur_html;
    }catch(e){}});//WARNING:サイト側のメンテを考慮しエラーは握り潰し
    _.gCS.cSet(`siteCheck`,JSON.stringify(info));
  },
  /**総計実行時間レポート
   */
  sysRep      (){
    const runTime  = Number(_.gPS.pGet(`runTime`    ));
    new _.disc()
      .fields(`runTime` ,`${Math.floor(runTime/1000/60)}m${String(Math.floor(runTime/1000)%60).padStart(2,"0")}s${String(runTime%1000).padStart(3,"0")}ms/90m`)
      .embeds(`${_.date()._adds(0,0,-1).getMonth()+1}/${_.date()._adds(0,0,-1).getDate()} SystemReport`).send(conf.disc.ch_obj.i5systemRunLog);
    _.gPS.pSet(`runTime`,`0`) ;
  },
  /**LineBotのリッチメニューとスケジュールキャッシュのアップデート
   */
  skdBotUpdate(){
    share.schduleCache();
    JSON.parse(_.fetch(`https://api.line.me/v2/bot/richmenu/list`      ,"GET",null,null,_.line.header(conf.skdBot.token_str)))?.richmenus?.forEach(rm=>
      _.fetch(`https://api.line.me/v2/bot/richmenu/`      +`${rm.richMenuId     }`,"DELETE",null,null,_.line.header(conf.skdBot.token_str))
    );
    JSON.parse(_.fetch(`https://api.line.me/v2/bot/richmenu/alias/list`,"GET",null,null,_.line.header(conf.skdBot.token_str)))?.aliases  ?.forEach(rm=>
      _.fetch(`https://api.line.me/v2/bot/richmenu/alias/`+`${rm.richMenuAliasId}`,"DELETE",null,null,_.line.header(conf.skdBot.token_str))
    );
    //リッチメニューのサイズ　幅：800px〜2500px　高さ：250px〜　※1.45<幅/高さ 画像は1MB以下
    const rmLeft  = JSON.parse(
      _.fetch(
        `https://api.line.me/v2/bot/richmenu`,
        "POST",
        JSON.stringify(
          {
            "size": {
              "width":  2500,
              "height": 1700,
            },
            "selected": true,
            "name": "rmLeft",
            "chatBarText": "メニュー",
            "areas": [
              {
                "bounds": {//リッチメニュー切り替え
                  "x"     :1250,
                  "y"     :   0,
                  "width" :1250,
                  "height": 250,
                },
                "action": {
                  "type"            : "richmenuswitch",
                  "richMenuAliasId" : "rm_right",
                  "data"            : "hoge"
                },
              },
              {
                "bounds": {//1日分の予定
                  "x"     :   0,
                  "y"     : 250,
                  "width" : 840,
                  "height": 725,
                },
                "action": {
                  "type"   : "datetimepicker",
                  "data"   : "schedule_______",
                  "mode"   : "date",
                  "initial": `${_.date()._adds(null,null,1).getFullYear()}-${String(_.date()._adds(null,null,1).getMonth()+1).padStart(2,`0`)}-${String(_.date()._adds(null,null,1).getDate()).padStart(2,`0`)}`,
                  "max"    : `${_.date()._adds(null,null,7).getFullYear()}-${String(_.date()._adds(null,null,7).getMonth()+1).padStart(2,`0`)}-${String(_.date()._adds(null,null,7).getDate()).padStart(2,`0`)}`,
                  "min"    : `${_.date()                   .getFullYear()}-${String(_.date()                   .getMonth()+1).padStart(2,`0`)}-${String(_.date()                   .getDate()).padStart(2,`0`)}`,
                },
              },
              {
                "bounds": {//1週間の予定
                  "x"     :   0,
                  "y"     : 975,
                  "width" : 840,
                  "height": 725,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "schedule_______week",
                  "displayText": "1週間の予定",
                  "inputOption": "closeRichMenu",
                },
              },
              {
                "bounds": {//鶴見線
                  "x"     : 840,
                  "y"     : 250,
                  "width" : 830,
                  "height": 725,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "tsurumionoUp___",
                  "displayText": "次の電車",
                  "inputOption": "closeRichMenu",
                },
              },
              {
                "bounds": {//予定表編集
                  "x"     : 840,
                  "y"     : 975,
                  "width" : 830,
                  "height": 725,
                },
                "action": {
                  "type": "uri",
                  "uri" : `https://docs.google.com/spreadsheets/d/${conf.gssId.skd}`
                },
              },
              {
                "bounds": {//アドレス検索
                  "x"     :1670,
                  "y"     : 250,
                  "width" : 830,
                  "height": 725,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "addSearch______",
                  "displayText": "アドレス検索",
                  "inputOption": "openKeyboard",
                  "fillInText" : "検索対象の名前>"
                },
              },
              /*
              {
                "bounds": {//空白
                  "x"     :1670,
                  "y"     : 975,
                  "width" : 830,
                  "height": 725,
                },
                "action": {
                },
              },
              */
            ],
          }
        ),
        undefined,
        _.line.header(conf.skdBot.token_str)
      )
    ).richMenuId
    _.fetch(
      `https://api-data.line.me/v2/bot/richmenu/${rmLeft}/content`,
      "POST",
      DriveApp.getFileById(conf.skdBot.rmImgId.left).getAs(`image/png`),
      `image/png`,// png/jpeg
      _.line.header(conf.skdBot.token_str)
    );
    _.fetch(
      `https://api.line.me/v2/bot/richmenu/alias`,
      "POST",
      JSON.stringify({"richMenuAliasId":"rm_left","richMenuId":rmLeft}),
      undefined,
      _.line.header(conf.skdBot.token_str)  
    );
    const rmRight = JSON.parse(
      _.fetch(
        `https://api.line.me/v2/bot/richmenu`,
        "POST",
        JSON.stringify(
          {
            "size": {
              "width":  2500,
              "height": 1700,
            },
            "selected": true,
            "name": "rmRight",
            "chatBarText": "メニュー",
            "areas": [
              {
                "bounds": {//リッチメニュー切り替え
                  "x"     :   0,
                  "y"     :   0,
                  "width" :1250,
                  "height": 250,
                },
                "action": {
                  "type"            : "richmenuswitch",
                  "richMenuAliasId" : "rm_left",
                  "data"            : "hoge"
                },
              },
              {
                "bounds": {//クラス登録
                  "x"     :   0,
                  "y"     : 250,
                  "width" : 840,
                  "height": 725,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "classReReg_____",
                  "displayText": "クラス登録",
                  "inputOption": "closeRichMenu",
                },
              },
              {
                "bounds": {//フィードバック
                  "x"     :   0,
                  "y"     : 975,
                  "width" : 840,
                  "height": 725,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "feedback_______",
                  "displayText": "フィードバック",
                  "inputOption": "openKeyboard",
                  "fillInText" : "内容>"
                },
              },
              {
                "bounds": {//月間予定表自動転記
                  "x"     : 840,
                  "y"     : 250,
                  "width" : 830,
                  "height": 490,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "systemCtrl_____schedulePost",
                  "displayText": "月間予定表自動転記",
                  "inputOption": "openKeyboard",
                  "fillInText" : "ROOTパスワード>"
                },
              },
              {
                "bounds": {//ReadMe
                  "x"     : 840,
                  "y"     : 740,
                  "width" : 830,
                  "height": 480,
                },
                "action": {
                  "type": "uri",
                  "uri" : `${conf.system.bootGsId}?from=skdBotRM`
                },
              },
              {
                "bounds": {//アドレス編集
                  "x"     : 840,
                  "y"     :1220,
                  "width" : 830,
                  "height": 480,
                },
                "action": {
                  "type": "uri",
                  "uri" : `https://docs.google.com/spreadsheets/d/${conf.gssId.addressLs}`
                },
              },
              {
                "bounds": {//システム起動
                  "x"     :1670,
                  "y"     : 250,
                  "width" : 830,
                  "height": 490,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "systemCtrl_____systemBoot",
                  "displayText": "システム起動",
                  "inputOption": "openKeyboard",
                  "fillInText" : "ROOTパスワード>"
                },
              },
              {
                "bounds": {//システム停止
                  "x"     :1670,
                  "y"     : 740,
                  "width" : 830,
                  "height": 480,
                },
                "action": {
                  "type"       : "postback",
                  "data"       : "systemCtrl_____systemStop",
                  "displayText": "システム停止",
                  "inputOption": "openKeyboard",
                  "fillInText" : "ROOTパスワード>"
                },
              },
              {
                "bounds": {//システム最終実行
                  "x"     :1670,
                  "y"     :1220,
                  "width" : 830,
                  "height": 480,
                },
              "action": {
                  "type"       : "postback",
                  "data"       : "systemCtrl_____lastBoot",
                  "displayText": "最終実行時刻",
                  "inputOption": "openKeyboard",
                  "fillInText" : "ROOTパスワード>"
                },
              },
            ]
          }
        ),
        undefined,
        _.line.header(conf.skdBot.token_str)
      )
    ).richMenuId
    _.fetch(
      `https://api-data.line.me/v2/bot/richmenu/${rmRight}/content`,
      "POST",
      DriveApp.getFileById(conf.skdBot.rmImgId.right).getAs(`image/png`),
      `image/png`,// png/jpeg
      _.line.header(conf.skdBot.token_str)
    );
    _.fetch(
      `https://api.line.me/v2/bot/richmenu/alias`,
      "POST",
      JSON.stringify({"richMenuAliasId":"rm_right","richMenuId":rmRight}),
      undefined,
      _.line.header(conf.skdBot.token_str)  
    );
    _.fetch(`https://api.line.me/v2/bot/user/all/richmenu/${rmLeft}`,"POST",null,null,_.line.header(conf.skdBot.token_str));
    try{
      _.gPS.pSet(`holiday`,JSON.parse(_.fetch(`https://holidays-jp.github.io/api/v1/date.json`,null,null,null,null,true)||`{}`)[_.date().toLocaleDateString().replaceAll(`/`,`-`)]||"");
    }catch(e){
      _.gPS.pSet(`holiday`,JSON.parse(_.fetch(`https://holidays-jp.github.io/api/v1/date.json`,null,null,null,null,true)||`{}`)[_.date().toLocaleDateString().replaceAll(`/`,`-`)]||"");
      throw e;
    }
  },
  /**Discordへの予定送信
   */
  schedule_send(){
    const info = JSON.parse(_.gCS.cGet(`skd`));
    const week = new _.disc().embeds(`【${_.date()._adds(0,0,1).getMonth()+1}/${_.date()._adds(0,0,1).getDate()}〜${_.date()._adds(0,0,7).getMonth()+1}/${_.date()._adds(0,0,7).getDate()}の予定】`);
    info.slice(1).forEach((day,idx)=>{
      week.fields(`${_.date()._adds(0,0,idx+1).getMonth()+1}月${_.date()._adds(0,0,idx+1).getDate()}日(${_.date()._adds(0,0,idx+1)._wkdayJP()})${day.weather.天気?`　${day.weather.天気}`:``}`,
      !day[`1-3`][0][0] ? `休日` : day[`1-3`].reduce((day_str,cls_ary,idx)=>day_str += cls_ary[0] ? `${idx===4 ? `\n` : `　`}${idx+1}：${cls_ary[0]}` : ``,``))
    });
    week.send(conf.disc.ch_obj.skd);
    const day = new _.disc().embeds(`【${_.date()._adds(0,0,1).getMonth()+1}月${_.date()._adds(0,0,1).getDate()}日(${_.date()._adds(0,0,1)._wkdayJP()})の予定】`);
    info[1].weather.天気 &&day.fields(`天気`,`${info[1].weather.天気}\n(降水確率：${info[1].weather.降水}％${info[1].weather.最低気温?`　気温：${info[1].weather.最低気温}〜${info[1].weather.最低気温}℃`:``})`);
    info[1].event/*　　*/&&day.fields(`行事`,`${info[1].event}`);
    info[1].stTt /*　　*/&&day.fields(`時程`,`${info[1].stTt}`);
    info[1][`1-3`][0][0] ? info[1][`1-3`].some((el,idx)=>el[0] ? !(day.fields(`${idx+1}：${el[0]}`,`　${el[1]}`)) : true) : day.fields(`休み`,``);
    day.send(conf.disc.ch_obj.skd);
  },
};

/**第三階層 スケジュールbod処理系個別処理
 */
const skdBod_exe   =       {
  /**スケジュール送信
   * @param {_.line} sendContent  - メッセージオブジェクト
   * @param {object} usrInfo      - ユーザー情報オブジェクト
   * @param {string} data         - ポストバックの詳細パラメータ部orテキスト
   * @param {string} postbackDate - ポストバックに付加された日付情報(scheduleのみ)
   */
  schedule_______(sendContent,usrInfo,data,postbackDate){
    const makeSkd = (day_num) =>{
      const day_info = info[day_num];
      return {
        "type"  : "bubble",
        "size"  : "mega",
        "header": {
          "type"          : "box",
          "layout"        : "vertical",
          "paddingTop"    : "10px",
          "paddingBottom" : "8px",
          "paddingStart"  : "5px",
          "contents"      : [{
            "type"   : "text",
            "text"   : `【${_.date()._adds(0,0,day_num).getMonth()+1}月${_.date()._adds(0,0,day_num).getDate()}日(${_.date()._adds(0,0,day_num)._wkdayJP()})の予定】`,
            "weight" : "bold",
            "size"   : "xl",
            "wrap"   : true
          }],
        },
        "hero":{
          "type"    : "box",
          "layout"  : "vertical",
          "paddingTop"    : "8px",
          "paddingBottom" : "none",
          "paddingStart"  : "15px",
          "contents": [{
            "type"    : "text",
            "contents": [
              !day_info.weather?.天気 ? null : {"type":"span","size":"lg","weight":"bold"   ,"text": "【天気】\n"},
              !day_info.weather?.天気 ? null : {"type":"span","size":"md","weight":"regular","text": `　${day_info.weather.天気}\n`},
              !day_info.weather?.降水 ? null : {"type":"span","size":"md","weight":"regular","text": `　(降水確率：${day_info.weather.降水}％気温：${day_info.weather.最低気温}〜${day_info.weather.最低気温}℃)\n`},
              !day_info.event/*　　*/? null : {"type":"span","size":"lg","weight":"bold"   ,"text": "【全体予定】\n"},
              !day_info.event/*　　*/? null : {"type":"span","size":"md","weight":"regular","text": `　${day_info.event.split(`\\n`).join(`\n　`)}\n`},
              !day_info.stTt /*　　*/? null : {"type":"span","size":"lg","weight":"bold"   ,"text": "【時程】\n"},
              !day_info.stTt /*　　*/? null : {"type":"span","size":"md","weight":"regular","text": `　${day_info.stTt}\n`},
                             /*　　*/         {"type":"span","size":"lg","weight":"bold"   ,"text": "【時間割】\n"},
              ...(
                day_info[usrInfo.classReg||`1-3`][0][0]
                  ? day_info[usrInfo.classReg||`1-3`].reduce((pre,cell,idx)=>
                      [...pre,...(cell[0] ? [           {"type":"span","size":"md" ,"weight":"bold"   ,"text": `　${idx+1}：${cell[0]}\n`},
                                              cell[1] ? {"type":"span","size":"md" ,"weight":"regular","text": `　　${cell[1]}\n`}
                                                      : null
                                            ]
                                          : []
                      )]
                    ,[])
                  : [{"type":"span","size":"md" ,"weight":"regular","text": `　学校は休みです。`}]
              )
            ].filter(Boolean),
            "wrap":true,
          }],
        },
        "styles":{
          "header":{
            "backgroundColor" : _.date()._adds(0,0,day_num).getDay()===0 ? `#FFCC99` : _.date()._adds(0,0,day_num).getDay()===6 ? `#AFEEEE` : `#FFFFFF`,
          },
          "hero":{
            "separator"       : true,
          },
        }
      };
    };
    if(!usrInfo.classReg){
      sendContent.txt(`クラスが未登録です\n[その他]タブの[クラス登録]を押して登録をお願いします`);
      return;
    }
    const info = JSON.parse(_.gCS.cGet(`skd`));
    if(data===`week`){
      const message = {"type":"carousel","contents":[]}
      for(let i = 0; i < 7; i++){
        message.contents[i] = makeSkd(i+1);
      };
      sendContent.richMessage(message,`時間割`);
    }else{
      sendContent.richMessage(
        makeSkd([null,undefined,""].includes(data) ? ((_.date(postbackDate.slice(0,4),postbackDate.slice(5,7)-1,postbackDate.slice(8,10)).getTime() - _.date()._sets(null,null,null,0,0,0,0).getTime()) / (24*60*60*1000)) : Number(data)),
        `時間割`
      );
    };
  },
  /**次の鶴見線
   * @param {_.line} sendContent - メッセージオブジェクト
   */
  tsurumionoUp___(sendContent                          ){
    const now_min = _.date().getHours()*60 + _.date().getMinutes();
    sendContent.txt(
      (_.gPS.pGet(`holiday`) || _.date().getDay()===0||_.date().getDay()===6 ? conf.train.tsurumionoUp.we : conf.train.tsurumionoUp.wd).reduce((pre,hour_ary,hour)=>
        pre ? pre
            : hour_ary.reduce((pre,min)=>
                pre ? pre
                    : now_min<(hour*60+min) ? `次の\n・鶴見小野発 鶴見方面の鶴見線　　：${(hour*60+min)-now_min-1}分後`
                                            : null
              ,null)
      ,null)
    +`\n`+
      (_.gPS.pGet(`holiday`) || _.date().getDay()===0||_.date().getDay()===6 ? conf.train.kagetsuDown.we : conf.train.kagetsuDown.wd).reduce((pre,hour_ary,hour)=>
        pre ? pre
            : hour_ary.reduce((pre,min)=>
                pre ? pre
                    : now_min<(hour*60+min) ? `・花月総持寺発 浦賀方面の京急本線：${(hour*60+min)-now_min-1}分後`
                                            : null
              ,null)
      ,null)
    );
  },
  /**システム制御
   * @param {_.line} sendContent - メッセージオブジェクト
   * @param {object} usrInfo - ユーザー情報オブジェクト
   * @param {string} data    - ポストバックの詳細パラメータ部
   * @param {string} test    - 送信されたメッセージ(dataかこれかのどちらか)
   */
  systemCtrl_____(sendContent,usrInfo,data,text        ){
    if(text){
      if(text.slice(-conf.skdBot.rootPw.length)===conf.skdBot.rootPw){
        switch(usrInfo.lastAction.arg){
          case "schedulePost" :
            share.oldScheduleDel();
            const skdInfo = new _.gSS(conf.gssId.skd,`月間予定表`).range(2,5,`LAST`,7).cGet();
            conf.skd.sheetLs.slice(1).forEach(sheetName=>{
              const ss = new _.gSS(conf.gssId.skd,sheetName);
              ss.cSet(ss.range(2,3,`LAST`,14).cGet().map((row_ary,row_idx)=>
                row_ary.map((cell,cell_idx)=>
                  cell_idx%2 ? cell
                             : conf.skd.tt_obj[sheetName]?.[skdInfo[row_idx]?.[cell_idx/2]?.[0]]?.[skdInfo[row_idx]?.[cell_idx/2]?.[1]-1] ? conf.skd.tt_obj[sheetName][skdInfo[row_idx][cell_idx/2][0]][skdInfo[row_idx][cell_idx/2][1]-1]
                                                                                                                                          : skdInfo[row_idx][cell_idx/2]
                )
              ),2,3);
            });
            sendContent.txt(`システム管理/予定表転記完了`);
            break;
          case "scheduleCashe":
            share.schduleCache();
            sendContent.txt(`システム管理/再キャッシュ完了`);
            break;
          case "systemBoot"   :
            _.gTrig.tDel();
            _.gTrig.tSet(`timeTrig`,`at`,_.date()._sets(null,null,null,null,Math.trunc(_.date().getMinutes()/conf.system.timeTrig.itv_min)*conf.system.timeTrig.itv_min,0,0)._adds(null,null,null,null,conf.system.timeTrig.itv_min));
            _.gTrig.tSet(`cradle`  ,`everyHours`,1);
            _.gPS.pSet(conf.system.psDef);
            sendContent.txt(`システム管理/起動処理完了`);
           break;
          case "systemStop"   :
            _.gTrig.tDel();
            sendContent.txt(`システム管理/停止処理完了`);
            break;
          case "lastBoot"     :
            sendContent.txt(_.date(_.gPS.pGet(`cradle_lastRun`)).toLocaleString());
            break;
        };
      }else{
        sendContent.txt(`不正なパスワードです\n操作をやり直してください`);
      };
      usrInfo.lastAction = {};
    }else{
      usrInfo.lastAction = {func:`systemCtrl_____`,arg:data};
      sendContent.txt(`ROOTパスワードを入力してください`);
    };
  },
  /**アドレス検索
   * @param {_.line} sendContent - メッセージオブジェクト
   * @param {object} usrInfo     - ユーザー情報オブジェクト
   * @param {string} data        - ポストバックの詳細パラメータ部
   * @param {string} test        - 送信されたメッセージ(dataかこれかのどちらか)
   */
  addSearch______(sendContent,usrInfo,data,text        ){
    if(text){
      usrInfo.lastAction = {};
      const ls = new _.gSS(conf.gssId.addressLs,`list_学年`).range(3,1,`LAST`,5).cGet();
      const res = text.replace(`検索対象の名前>`,``).replaceAll(`　`,` `).split(` `)?.reduce((pre_ary,name)=>{
        ls.filter(row=>name&&`${row[2]}${row[3]}`.includes(name))?.forEach(row=>pre_ary[Number(row[1])]=`　${row[2]} ${row[3]}(${row[4]}組)\n　→ ${row[0]}`)
        return pre_ary;
      },[]).filter(Boolean);
      sendContent.txt(res[0] ? `【検索結果】\n${res.join(`\n`)}` : `該当者無し`);
    }else{
      usrInfo.lastAction = {func:`addSearch______`};
      sendContent.txt(`検索対象の名前を入力してください`);
    };
  },
  /**フィードバック
   * @param {_.line} sendContent - メッセージオブジェクト
   * @param {object} usrInfo     - ユーザー情報オブジェクト
   * @param {string} data        - ポストバックの詳細パラメータ部
   * @param {string} test        - 送信されたメッセージ(dataかこれかのどちらか)
   */
  feedback_______(sendContent,usrInfo,data,text        ){
    if(text){
      usrInfo.lastAction = {};
      new _.disc().message(text).send(conf.disc.ch_obj.skdBot_feedback);
      sendContent.txt(`ご意見ありがとうございます`);
    }else{
      usrInfo.lastAction = {func:`feedback_______`};
      sendContent.txt(`内容を入力してください`);
    };
  },
  /**クラス登録
   * @param {_.line} sendContent - メッセージオブジェクト
   * @param {object} usrInfo     - ユーザー情報オブジェクト
   * @param {string} data        - ポストバックの詳細パラメータ部
   */
  classReg_______(sendContent,usrInfo,data             ){
    usrInfo.classReg = data;
    sendContent.txt(`登録完了！`);
  },
  /**クラス再登録
   * @param {_.line} sendContent - メッセージオブジェクト
   */
  classReReg_____(sendContent                          ){
    sendContent.richMessage({
      "type"  : "bubble",
      "size"  : "kilo",
      "header": {
        "type"          : "box",
        "layout"        : "vertical",
        "paddingTop"    : "10px",
        "paddingBottom" : "10px",
        "paddingStart"  : "10px",
        "paddingEnd"    : "10px",
        "contents"      : [{
          "type"   : "text",
          "text"   : `以下のリストから自身のクラスを\n選択してください`,
          "weight" : "bold",
          "size"   : "md",
          "wrap"   : true
        }],
      },
      "hero":{
        "type"    : "box",
        "layout"  : "vertical",
        "paddingTop"    : "15px",
        "paddingBottom" : "15px",
        "paddingStart"  : "30px",
        "paddingEnd"    : "30px",
        "spacing"       : "md",
        "contents": [
          {
            "type"   : "button",
            "style"  : "secondary",
            "gravity": "center",
            "color"  : `#${conf.colorTable.Yellow.toString(16).padStart(6,`0`)}` ,
            "action" : {
              "type"        : "postback",
              "label"       : "1-1",
              "data"        : "classReg_______1-1",
              "displayText" : "1-1",
            },
          },
          {
            "type"   : "button",
            "style"  : "secondary",
            "gravity": "center",
            "color"  : `#ee7800` ,
            "action" : {
              "type"        : "postback",
              "label"       : "1-2",
              "data"        : "classReg_______1-2",
              "displayText" : "1-2",
            },
          },
          {
            "type"   : "button",
            "style"  : "secondary",
            "gravity": "center",
            "color"  : `#${conf.colorTable.Fuchsia.toString(16).padStart(6,`0`)}` ,
            "action" : {
              "type"        : "postback",
              "label"       : "1-3",
              "data"        : "classReg_______1-3",
              "displayText" : "1-3",
            },
          },
          {
            "type"   : "button",
            "style"  : "secondary",
            "gravity": "center",
            "color"  : `#${conf.colorTable.Lime.toString(16).padStart(6,`0`)}` ,
            "action" : {
              "type"        : "postback",
              "label"       : "1-4",
              "data"        : "classReg_______1-4",
              "displayText" : "1-4",
            },
          },
          {
            "type"   : "button",
            "style"  : "secondary",
            "gravity": "center",
            "color"  : `#${conf.colorTable.Aqua.toString(16).padStart(6,`0`)}` ,
            "action" : {
              "type"        : "postback",
              "label"       : "1-5",
              "data"        : "classReg_______1-5",
              "displayText" : "1-5",
            },
          },
          {
            "type"   : "button",
            "style"  : "primary",
            "gravity": "center",
            "color"  : `#FF0033` ,
            "action" : {
              "type"        : "postback",
              "label"       : "1-6",
              "data"        : "classReg_______1-6",
              "displayText" : "1-6",
            },
          },
        ],
      },
      "styles":{
        "hero":{
          "separator":true,
        }
      }
    });
  },
};

/**第五階層 共有処理
 */
const share        =       {
  oldScheduleDel(){
    conf.skd.sheetLs.forEach(sheetName=>{
      const ss = new _.gSS(conf.gssId.skd,sheetName);
      ss.range(2,1,`LAST`,2).cGet().some(row_ary => Number(row_ary[0])===_.date().getMonth()+1&&Number(row_ary[1])===_.date().getDate() ? true : !(ss.cDel(`ROW`,2,1)));
    });
  },
  schduleCache(){
    this.oldScheduleDel();
    const weatherId = Parser.data(
      Parser.data(
        UrlFetchApp.fetch(`https://www.data.jma.go.jp/developer/xml/feed/regular.xml`).getContentText("utf-8")||``
      ).from(`<entry>`).to(`</entry>`).iterate()?.find(el=>el.includes(`【神奈川県府県週間天気予報】`))||``
    )?.from(`<id>`)?.to(`</id>`)?.build();
    if(!weatherId){return};
    const weather = UrlFetchApp.fetch(weatherId).getContentText("utf-8");
    const monthSkd = new _.gSS(conf.gssId.skd,`月間予定表`).range(2,3,8,2).cGet();
    const classSkd = conf.skd.sheetLs.slice(1).reduce((pre_obj,sheetName)=>{
      pre_obj[sheetName] = new _.gSS(conf.gssId.skd,sheetName).range(2,3,8,14).cGet();
      return pre_obj;
    },{});
    const skd_ary = [];
    for(let i = 0; i < 8; i++){
      skd_ary[i] = {};
      
      skd_ary[i].weather = [["天気","WeatherPart",0],["降水","ProbabilityOfPrecipitationPart",0],["最低気温","TemperaturePart",0],["最高気温","TemperaturePart",3]].reduce(
        (pre_obj,info_ary)=>{
        pre_obj[info_ary[0]] = Parser.data(Parser.data(weather).from(`<${info_ary[1]}>\n`).to(`\n</${info_ary[1]}>`).iterate()[info_ary[2]].split(`\n`)
          [i-Number(Number(Parser.data(weather).from(`<TargetDateTime>`).to(`</TargetDateTime>`).build().slice(8,10))!==_.date().getDate())]||``
          ).from(`>`).to(`<`).build();
        pre_obj[info_ary[0]] = pre_obj[info_ary[0]].includes(`値なし`) ? `` : pre_obj[info_ary[0]];
        return pre_obj;
      },{});

      skd_ary[i].stTt    = conf.skd.stTt[monthSkd[i][0]] ? conf.skd.stTt[monthSkd[i][0]] : monthSkd[i][0];
      skd_ary[i].event   = monthSkd[i][1];
      conf.skd.sheetLs.slice(1).forEach(sheetName=>{
        skd_ary[i][sheetName] = classSkd[sheetName][i].reduce((pre_ary,cell,idx)=>{pre_ary[Math.trunc(idx/2)].push(cell);return pre_ary;},[[],[],[],[],[],[],[]]);
      });
    };
    _.gCS.cSet(`skd`,JSON.stringify(skd_ary));
  },
};

//fin.























