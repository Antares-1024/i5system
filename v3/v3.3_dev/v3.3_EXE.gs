//i5system　メイン処理部

//↓↓　設定　↓↓
  this.CONF    =                                        {
    system   :{
      rootpw          : ``,
      rootMin         : 5 ,
      runLim_min      : 80,
      trig            : {
        dly_min : 10,//処理の起動時間n分の公約数
        itv : [//時、分のみ指定
            [[00,10], "mail"           ],
            [[01,00], "rss"            ],
            [[04,00], "site"           ],
        ],
        fix : [
            [[00,00], "lineLmUpdate"   ],
            [[00,00], "sysRep"         ],
            [[00,00], "schedule_cache" ],
            [[18,00], "schedule_send"  ],
        ]
      }
    },
    gss      :{
      exeLog         : ``,
      HachmakiBotLog : ``,
      schedule       : ``,
      addressLs      : ``,
      petLog         : ``,
    },
    discord  :{
      name:{
        "Antares":`<@>`
      },
      server:{
        "welcome"          /*　　　　　　*/: ``,//不要
        //PUBLIC
        "schedule"         /*　　　　　　*/: ``,
        "classroom"        /*　　　　　　*/: ``,
        "遅延証明書"                 /*　*/: ``,
        "掲示板"                 /*　　　*/: ``,//不要
        //PRIVATE
        "i5systemRunLog"   /*　　　　　　*/: ``,
        "i5systemExelog"   /*　　　　　　*/: ``,
        "webhookFail"      /*　　　　　　*/: ``,
        "iot"              /*　　　　　　*/: ``,
        "site"             /*　　　　　　*/: ``,
        //NEWS(RSS)
        "nhk_総合"             /*　　　　*/: ``,
        "itmedia_総合"         /*　　　　*/: ``,
        "itmedia_ait"      /*　　　　　　*/: ``,
        "itmedia_aiplus"   /*　　　　　　*/: ``,
        "itmedia_business" /*　　　　　　*/: ``,
        "mynavi_企業IT"        /*　　　　*/: ``,
        "mynavi_テクノロジー"          /**/: ``,
        "mynavi_白書"          /*　　　　*/: ``,
        "mynavi_パソコン"          /*　　*/: ``,
        "business_plusit"  /*　　　　　　*/: ``,
        "虚構新聞"                 /*　　*/: ``,
      }
    },
    line     :{
      token:{
        "i5system"     :
          "",
        "HachimakiBot" : //dev
          "",
        "HamusukeBot"  :
          "",
      },
      id:{
        user:{
        },
        group:{
        }
      },
      HachimakiBotHelp :`[n日後/○曜日/nn日/今日/明日.../1週間]+[の予定]\n　今日〜1週間後の1日分まで又は1週間分の予定\n[予定表]\n　予定表のスプシURL(小テストのメモ等が可能)\n[次の鶴見線]\n　鶴見小野発鶴見行き(祝日は考慮してません)\n[アドレス<名前>]\n　学校垢のメルアド`,
    },
    mail     :{
      bodyLim: 200,
      address:{
      
        "classroom"                      : `classroom`       ,
      },
      bkLs:[//0に対象要素を取得する関数名、1に対象の文字列
        [`getSubject`,`Review edits to your Apps Script project`],
      ]
    },
    rss      :{
      getLim : 5,
      ls : [
        {//NHK
          fmt  : {
            item    : [`<item>`       , `</item>`        ],
            title   : [`<title>`      , `</title>`       ],
            link    : [`<link>`       , `</link>`        ],
            body    : [`<description>`, `</description>` ],
            img     : [null           , null             ],
            time    : [`<pubDate>`    , `</pubDate>`     ],
            timeFmt : `_____DD_MMM_YYYY_HH_mm_SS______`
          },
          ls : [
            [`https://www.nhk.or.jp/rss/news/cat0.xml`          , `nhk_総合`],
          ]
        },
        {//ITmedia
          fmt  : {
            item    : [`<item>`       , `</item>`        ],
            title   : [`<title>`      , `</title>`       ],
            link    : [`<link>`       , `</link>`        ],
            body    : [`<description>`, `</description>` ],
            img     : [null           , null             ],
            time    : [`<pubDate>`    , `</pubDate>`     ],
            timeFmt : `_____DD_MMM_YYYY_HH_mm_SS______`
          },
          ls : [
            [`https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml`, `itmedia_総合`],
            [`https://rss.itmedia.co.jp/rss/2.0/ait.xml`        , `itmedia_ait`],
            [`https://rss.itmedia.co.jp/rss/2.0/aiplus.xml`     , `itmedia_aiplus`],
            [`https://rss.itmedia.co.jp/rss/2.0/business.xml`   , `itmedia_business`],
          ]
        },
        {//Mynavi
          fmt  : {
            item    : [`<item`        , `</item>`        ],//※ここは脱字ではない！
            title   : [`<title>`      , `</title>`       ],
            link    : [`<link>`       , `</link>`        ],
            body    : [`<description>`, `</description>` ],
            img     : [`<img>`        , `</img>`         ],
            time    : [`<dc:date>`    , `</dc:date>`     ],
            timeFmt : `YYYY_MM_DD_HH_mm_SS______`
          },
          ls : [
            [`https://news.mynavi.jp/rss/techplus/enterprise`   , `mynavi_企業IT`],
            [`https://news.mynavi.jp/rss/techplus/technology`   , `mynavi_テクノロジー`],
            [`https://news.mynavi.jp/rss/techplus/whitepaper`   , `mynavi_白書`],
            [`https://news.mynavi.jp/rss/digital/pc`            , `mynavi_パソコン`],
          ]
        },
        {//ビジネス+IT
          fmt  : {
            item    : [`<item>`       , `</item>`        ],
            title   : [`<title>`      , `</title>`       ],
            link    : [`<link>`       , `</link>`        ],
            body    : [`<description>`, `</description>` ],
            img     : [null           , null             ],
            time    : [`<pubDate>`    , `</pubDate>`     ],
            timeFmt : `_____DD_MMM_YYYY_HH_mm_SS______`
          },
          ls : [
            [`https://www.sbbit.jp/rss/HotTopics.rss`           , `business_plusit`]
          ]
        },
      ]
    },
    site     :{
      ls : [
      ],
    },
    schedule :{
      shortTt : {
        A: ``,
        B: ``,
        C: ``,
      },
      tt : {
        "1-3":{}
      },
    },
    thurumi  :{
      tt:{
        wd:[
          [                                 ],
          [                                 ],
          [                                 ],
          [                                 ],
          [                                 ],
          [                                 ],
          [02,13,22,29,36,42,46,50,55       ],
          [00,05,12,18,23,27,32,35,41,47,53 ],
          [00,05,09,14,17,25,32,37,40,45,53 ],
          [00,12,23,34,50                   ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,13,23,35,45,54                ],
          [01,06,11,16,22,30,38,43,51,58    ],
          [07,12,17,24,33,42,52             ],
          [03,15,27,43,53                   ],
          [08,24,38,53                      ],
          [08,28,48                         ],
          [08,28,48                         ],
          [08,45                            ],
        ],
        we:[
          [                                 ],
          [                                 ],
          [                                 ],
          [                                 ],
          [                                 ],
          [                                 ],
          [02,13,33,43,53                   ],
          [04,15,25,35,45,54                ],
          [02,15,23,31,44,55                ],
          [12,25,38                         ],
          [00,20,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,43                         ],
          [03,23,33,43,53                   ],
          [03,13,23,33,43,52                ],
          [03,13,23,34,45,55                ],
          [08,18,31,48                      ],
          [03,16,36,53                      ],
          [08,35                            ],
          [23                               ],
          [08,45                            ],
        ],
      }
    },
  };
//↑↑　設定　↓↓

//↓↓共有機能↓↓
  this.Lodash  = LodashGS.load();
  this.Parser  = ParserGS;
  Object.assign(Object.prototype,{
    _isArg(type_str){//undefinedの場合は全てに値があるか
      return type_str ? !(Object.values(this).some((el)=>typeof el !== type_str)) : !(Object.values(this).some((el)=>!el));
    },
    _math(mode_str){
      const exe_obj = {
        sum(acc_num,el_num){         acc_num+el_num },
        max(acc_num,el_num){Math.max(acc_num,el_num)},
        min(acc_num,el_num){Math.min(acc_num,el_num)},
      };
      return mode_str ? (this._isArg("number") ? Object.values(this).reduce((acc_num,el_num)=>exe_obj[mode_str](acc_num,el_num)) : null) : this._isArg("number");
    },
    _deepCp(){//できればライブラリに頼らず自力で作ってみたい
      return Lodash(this);
    },
    _exist(){
      return Boolean(Object.keys(this).length);
    },
  });
  Object.assign(Object          ,{
    _deepEq(objA,objB){
      const keyA = Object.keys(objA);
      const keyB = Object.keys(objB);
      return objA===objB ? true : keyA.length!==keyB.length ? false : !(keyA.some((hoge,idx)=>keyB.includes(keyA[idx])&&this._deepEq(objA[keyA[idx]],objB[keyB[idx]]) ? false : true));
    },
  });
  Object.assign(Array .prototype,{
    _dpLength(){//階層別ごとの最大配列長を浅度順の配列で返す 但し要素0の階層は無視
      const exe=(ary)=>{
        if(Array.isArray(ary)){
          const ret = ary.reduce((acc_num,el)=>Math.max(acc_num,exe(el)),0);
          if(ret){ret_ary.unshift(ret)};
          return ary.length;
        }else{
          return null;
        };
      };
      let ret_ary = [];//ここに(exe(this))を入れるとret_aryが未定義のまま再帰処理が始まってしまう。
      return ret_ary._unshift(exe(this));
    },
    _push(add){//配列自体を返すpush
      return [...this,add];
    },
    _unshift(add){//配列自体を返すunshift
      return [add,...this];
    },
    _deepInc(word){//深層まで調べるincluds
      return this.flat().includes(word);
    },
  });
  Object.assign(String.prototype,{
  });
  Object.assign(Date  .prototype,{
    __ls:[`FullYear`,`Month`,`Date`,`Hours`,`Minutes`,`Seconds`,`Milliseconds`],
    _add(...add_ary){
      if(Array.isArray(add_ary[0])){add_ary=add_ary[0]};//配列の引数に対応
      return add_ary.reduce((acc_da,hoge,idx)=>{acc_da[`set${this.__ls[idx]}`](acc_da[`get${this.__ls[idx]}`]()+add_ary[idx] );return acc_da;},_Date(this));
    },
    _set(...set_ary){
      if(Array.isArray(set_ary[0])){set_ary=set_ary[0]};//配列の引数に対応
      return set_ary.reduce((acc_da,hoge,idx)=>{acc_da[`set${this.__ls[idx]}`](set_ary[idx]??acc_da[`get${this.__ls[idx]}`]());return acc_da;},_Date(this));
    },
    _wkday(){
      return '日月火水木金土'[this.getDay()];
    },
    _toDate(tgt_str,fmt_str){
      //フォーマット指定方法：YYYY→年(4桁)/YY→年(下2桁)/MM→月(数字)/MMM→月(略称)/DD→日/HH→時/mm→分/SS→秒
      const ret_de = _Date(this);
      for(let i = 0; i < fmt_str.length; i++){
        switch(fmt_str[i]){
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
      ret_de.setMilliseconds(0);
      return ret_de;
    },
  });
  Object.assign(Date            ,{
    _mthAbb(arg){
      const ls = [`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`]
      return typeof arg === "string" ? ls.indexOf(arg)+1 : ls[arg-1]
    },
  });
  Object.assign(Math            ,{
    _random(min_num,max_num) {
      return Math.floor(Math.random()*(max_num+1-min_num))+min_num;
    },
  });
  this._Date   = (...arg                           ) => {
    return new Date(...arg)
  };
  this.G_SS    = (fileId,sheetName                 ) => {
    let ss = SpreadsheetApp;
        ss = fileId            ?              ss.openById             (fileId       )
                                ||            ss.create               (fileId,100,50)
                                :             ss.getActiveSpreadsheet (             ) ;
        ss = sheetName===`ALL` ?              ss.getSheets            (             )
                               : sheetName ?  ss.getSheetByName       (sheetName    )
                                           || ss.insertSheet          (sheetName    )
                               :              ss.getActiveSheet       (             );
    Array.isArray(ss)||(ss=[ss]);
    return ss.map(el=>{Object.assign(el.__proto__,{
      range(                                rowS,colS,rowE=1,colE=1      ){//①LASTはデータが存在する最後の行自体を指す　②LASTに続けて数値(負も可)を記述することが可能
        typeof rowS===`string`&&rowS.slice(0,4)===`LAST`&&(rowS = this.getLastRow   ()           + Number(rowS.slice(4)));
        typeof colS===`string`&&colS.slice(0,4)===`LAST`&&(colS = this.getLastColumn()           + Number(colS.slice(4)));
        typeof rowE===`string`&&rowE.slice(0,4)===`LAST`&&(rowE = this.getLastRow   () - rowS +1 + Number(rowE.slice(4)));
        typeof colE===`string`&&colE.slice(0,4)===`LAST`&&(colE = this.getLastColumn() - colS +1 + Number(colE.slice(4)));
        return rowS&&colS ? this.getRange      (rowS,colS,rowE,colE)
                          : this.getActiveRange(                   );
      },
      cGet  (                               rowS,colS,rowE  ,colE  ,idx=0){
        return ss[idx].range(rowS,colS,rowE,colE,idx).getValues();
      },
      cSet  (val_ary,                       rowS,colS,              idx=0){
        Array.isArray(val_ary[0]) ? ss[idx].range(rowS,colS,val_ary.length,val_ary._dpLength()[1]).setValues(val_ary) : ss[idx].appendRow(val_ary);
        return ss;
      },
      cDel(start_num,length_num=1,dir_str,                        idx=0){
        dir_str===`ROW` ? ss[idx].deleteRows(start_num,length_num) : ss[idx].deleteColumns(start_num,length_num);
        return ss;
      },
      cColor(font_str,back_str,             rowS,colS,rowE  ,colE  ,idx=0){
        typeof font_str === `number`&&(font_str = `#${font_str.toString(16)}`);
        typeof back_str === `number`&&(back_str = `#${back_str.toString(16)}`);
        ss[idx].range(rowS,colS,rowE,colE).setFontColor(font_str||`#000000`).setBackground(back_str||`#FFFFFF`);
        return ss;
      },
    });return el;});
  };
  this.G_PS    =                                        {
    ps_obj: PropertiesService.getScriptProperties(),
    pGet(key_str        ){return key_str ? this.ps_obj.getProperty   (key_str        ) : this.ps_obj.getProperties      (       )},
    pSet(key_str,val_str){       val_str ? this.ps_obj.setProperty   (key_str,val_str) : this.ps_obj.setProperties      (key_str)},
    pDel(key_str        ){       key_str ? this.ps_obj.deleteProperty(key_str        ) : this.ps_obj.deleteAllProperties(       )},
  };
  this.G_CS    =                                        {
    cs_obj: CacheService.getScriptCache(),
    cGet(key                        ){return !(Array.isArray(key)) ? this.cs_obj.get   (key                ) : this.cs_obj.getAll   (key        )},
    cSet(key,val_str,exp_sec=6*60*60){       !(Array.isArray(key)) ? this.cs_obj.put   (key,val_str,exp_sec) : this.cs_obj.putAll   (key,exp_sec)},
    cDel(key                        ){       !(Array.isArray(key)) ? this.cs_obj.remove(key                ) : this.cs_obj.removeAll(key        )},
  };
  this.G_TRIG  =                                        {
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
      type_str!==`everyDays` ? ScriptApp.newTrigger(func_str).timeBased()[type_str](...time                                          ).create()
                             : ScriptApp.newTrigger(func_str).timeBased().everyDays(time[0]).atHour(time[1]||0).nearMinute(time[2]||0).create()
    },
    tDel(func_ary,mode_bool){//モード0で一致を削除
      if(func_ary&&!(Array.isArray(func_ary))){func_ary[0]=func_ary};//配列以外の引数に対応
      ScriptApp.getProjectTriggers().forEach(el=>(func_ary ? func_ary.includes(el.getHandlerFunction())  ? !mode_bool : mode_bool : true) ? ScriptApp.deleteTrigger(el) : null)
    }
  };
  this.Discord = (                                 ) => {
    return Object.create(Object.assign({
      fields(name_str,val_str,inline_bool=false                                                         ){
        Array.isArray(this.embeds[0].fields)||(this.embeds[0].fields = []);
        this.embeds[0].fields[this.embeds[0].fields.length] = {
          name        : name_str            ,
          value       : val_str             ,
          inline      : inline_bool         ,
        };
        return this;
      },
      footer(text_str,icon_str                                                                          ){
        this.embeds[0].footer = {
          text        : text_str            ,
          icon_url    : icon_str            ,
        };
        return this;
      },
      author(name_str,url_str,icon_str                                                                  ){
        this.embeds[0].author = {
          name        : name_str            ,
          url         : url_str             ,
          icon_url    : icon_str            ,
        };
        return this;
      },
      embed (title_str,url_str,description_str,thumbnail_str,image_str,timestamp_de=_Date(),color=`Blue`){
        Object.assign(this.embeds[0],{
          title       : title_str           ,
          url         : url_str             ,
          description : description_str     ,
          thumbnail   : {url:thumbnail_str} ,
          image       : {url:image_str}     ,
          timestamp   : timestamp_de        ,
          color       : DB.color[color]     ,
        });
        return this;
      },
      message(content_str,username_str                                                                   ){
        Object.assign(this,{
          content     : content_str         ,
          username    : username_str        ,
        });
        return this;
      },
      send   (webhook_str=CONF.discord.server.webhookFail                                                ){
        this.embeds[0]._exist()||(delete this.embeds);
        for(let i = 0; i < 10; i++){
          try{
            UrlFetchApp.fetch(`https://discord.com/api/webhooks/${webhook_str}`,{method:"post",headers:{"Content-type":"application/json"},payload:JSON.stringify(this)});
            return;
          }catch(error_obj){
            if(error_obj.message.slice(0,57)===`Request failed for https://discord.com returned code 429.`){Utilities.sleep(500)}else{throw error_obj};
          };
        };
      },
    },Object.prototype),{embeds:{value:[{}],writable:true,enumerable:true,configurable:true}});
  };
  this.LINE    = (cont_obj,token_str,way_str,to_str) => {
    /*  way_str    to_str
        reply      リプライトークン
        push       対象のID
        multicast  対象のID配列
        broadcast　-
    */
    UrlFetchApp.fetch(`https://api.line.me/v2/bot/message/${way_str}`,{method :"post",headers:{"Content-Type" :`application/json`,"Authorization":`Bearer ${token_str}`},
        payload:JSON.stringify(cont_obj,way_str===`reply` ? {"replyToken":to_str} : way_str===`push`||way_str===`multicast` ? {"to":to_str} : {})})
  };
  this.DB      =                                        {
    color:{
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
//↑↑共有機能↑↑

//↓↓　処理　↓↓
  this.sysCall  = (bootInfo) => {
    //return globalThis[`exe_${bootInfo.func[0]}`](bootInfo);//開発中のエラーキャッチ防止
    const boot_de = _Date();
    let   er      = {}     ;
     try     {
      return globalThis[`exe_${bootInfo.func[0]}`](bootInfo);
    }catch(e){
      er = e;
      Discord().fields(er.name,er.message).fields(`Stack`,er.stack).embed(`ExeFail`,null,null,null,null,null,"Red").message(CONF.discord.name.Antares).send(CONF.discord.server.i5systemExelog);
      throw Error(`ExeFail`);
    }finally {
      const exe_ms = _Date().getTime() - boot_de.getTime();
      let exeLog = JSON.parse(G_PS.pGet(`exeLog`)||`[]`)._push([_Date().toString(),bootInfo?.func?.join(`/`),`${Math.floor(exe_ms/1000)}.${(exe_ms%1000)}`,er.message||`[Success]`,er.stack]);
      1<=exeLog.length&&G_SS(CONF.gss.exeLog,`${_Date().getFullYear()}.${_Date().getMonth()+1}`).cSet(exeLog,`LAST+1`,1);
      G_PS.pSet({runTime:Number(G_PS.pGet(`runTime`)||0)+exe_ms,exeLog:JSON.stringify(1<=exeLog.length ? [] : exeLog)});
    };
  };
  this.exe_TRIG = (speArg  ) => {
    this.exe_mail           =()=>{//完成
      if(!GmailApp.getInboxUnreadCount()){return};
      GmailApp.getMessagesForThreads(GmailApp.search(`is:unread`,0,10)).forEach(thread=>{
        thread.forEach(message=>message.markRead());
        const message = thread[0];
        if(CONF.mail.bkLs.some(el=>message[el[0]]().includes(el[1]))){
          //do nothing
        }else if(message.getFrom().includes(`no-reply@classroom.google.com`)){
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
          parse.time = _Date()._toDate(parse.time.slice(parse.time.indexOf(`:`)-2,parse.time.indexOf(`:`)-2+15),`HH_mm____MM__DD`);
          if(                        body.slice(idxB+2  ,idxB+2+1)[0][11]===`後`/**/){parse.time = parse.time._add(null,null,null,12)        };
          if(                      !(body.slice(idxA+6+1,        )[0].trim()/*　 */)){parse.text = parse.text.split(`\n`).slice(1).join(`\n`)};
          Discord().author(`${parse.author}先生（ ${parse.room.trim()} ）`).embed(`${parse.type}：${parse.title}`,parse.link,parse.text,null,null,parse.time).send(CONF.discord.server[CONF.mail.address.classroom]);
        }else{
          Discord()
            .author(message.getFrom())
            .embed(message.getSubject(),`https://mail.google.com/mail/u/0/#inbox/${message.getId()}`,message.getPlainBody().slice(0,CONF.mail.bodyLim),null,null,message.getDate())
            .send(CONF.discord.server[CONF.mail.address[`${message.getTo()},${message.getCc()},${message.getBcc()}`.split(`,`).filter(Boolean).map(to=>Parser.data(to).from(`<`).to(`>`).build()||to).find(el=>CONF.mail.address[el])]]);
        };
      });
    };
    this.exe_rss            =()=>{//完成
      const getInfo = JSON.parse(G_PS.pGet(`rss`))||{};
      CONF.rss.ls.forEach(group=>{
        group.ls.forEach(site=>{
          Parser.data(UrlFetchApp.fetch(site[0]).getContentText("utf-8")).from(group.fmt.item[0]).to(group.fmt.item[1]).iterate().some((el,idx)=>{
            const lastUp = Number(getInfo[site[0]]||0);
            const upTime = _Date()._toDate(Parser.data(el).from(group.fmt.time[0]).to(group.fmt.time[1]).build(),group.fmt.timeFmt)._set(null,null,null,null,null,0,0);
            idx||(getInfo[site[0]]=upTime.getTime());
            if(upTime.getTime()<=lastUp||idx===CONF.rss.getLim){return true                        };
            Discord().embed(
              group.fmt.title[0] ? Parser.data(el).from(group.fmt.title[0]).to(group.fmt.title[1]).build() : ``,
              group.fmt.link [0] ? Parser.data(el).from(group.fmt.link [0]).to(group.fmt.link [1]).build() : ``,
              group.fmt.body [0] ? Parser.data(el).from(group.fmt.body [0]).to(group.fmt.body [1]).build() : ``,
              null                                                                   ,
              group.fmt.img  [0] ? Parser.data(el).from(group.fmt.img  [0]).to(group.fmt.img  [1]).build() : ``,
              upTime                                                                 ,
            ).send(CONF.discord.server[site[1]]);
          });
        });
      });
      G_PS.pSet(`rss`,JSON.stringify(getInfo));
    };
    this.exe_site           =()=>{//完成
      CONF.site.ls.forEach(site=>{try{
        const this_html = UrlFetchApp.fetch(site[0]).getContentText("utf-8");
        const last_html = G_CS.cGet(`site_${site[0]}`          );
                          G_CS.cSet(`site_${site[0]}`,this_html);
        Logger.log(this_html)
        Logger.log(last_html)
        if(last_html&&last_html!==this_html){Discord().embed(`${site[1]}に更新あり！`).message(CONF.discord.name.Antares).send(CONF.discord.server.site)};
      }catch(e){/*本来禁忌であるエラー握り潰しをしているが、サイト側のメンテ等を考慮して妥協*/}});
    };
    this.exe_lineLmUpdate   =()=>{//リッチメニューの内容を詰めてから
      UrlFetchApp.fetch(`https://api.line.me/v2/bot/richmenu/list`,{method :`get`,headers:{"Authorization":`Bearer ${CONF.line.token.HachimakiBot}`}}).richmenus.forEach(el=>UrlFetchApp.fetch(`https://api.line.me/v2/bot/richmenu/${el.richMenuId}`,{method :`delete`,headers:{"Authorization":`Bearer ${CONF.line.token.HachimakiBot}`}}));
      const lmId = UrlFetchApp.fetch(`https://api.line.me/v2/bot/richmenu`,{method :`post`,headers:{"Authorization":`Bearer ${CONF.line.token.HachimakiBot}`,"Content-Type" :`application/json`},payload:JSON.stringify({
        "size": {  //リッチメニューのサイズ設定　幅：800px〜2500px　高さ：250px〜　※1.45<幅/高さ
          "width": 2500,
          "height": 1686
        },
        "selected": true,
        "name": "リッチメニュー",
        "chatBarText": "コマンド",
        "areas": [
          {
            "bounds": {
              "x": 0, //領域左上のピクセル(0以上)
              "y": 0,
              "width": 1666,
              "height": 1686
            },
            "action": {//定型文
              "type": "postback",
              "data": "action=buy&itemid=111",//クエリパラメータ的な
              "displayText": "Buy",//ユーザーが送信したとして表示されるテキスト
              "inputOption": "openKeyboard",//その後に行うアクション？
              "fillInText": "---\nName: \nPhone: \nBirthday: \n---"//最初から入力済のテキスト
            }
          },
          {
            "actionA": {//ただのメッセージ送信
              "type": "message",
              "label": "Yes",
              "text": "Yes"
            },
            "actionB": {//指定されたURLを開く
              "type": "uri",
              "label": "メニューを見る",
              "uri": "https://example.com/menu"
            },
            "actionC": {//日付選択　形式は　2100-12-31
              "type": "datetimepicker",
              "label": "Select date",
              "data": "storeId=12345",
              "mode": "datetime",//date：日付　time：時刻　datetime：日付と日時
              "initial": "2017-12-25t00:00",//初期値(省略可)
              "max": "2018-01-24t23:59",//選択可能な範囲
              "min": "2017-12-25t00:00"
            },
            "actionD": {//クリップボード(アドレス検索に搭載？)　※リッチメニューには使用不可
              "type": "clipboard",
              "label": "Copy",
              "clipboardText": "3B48740B"
            }
          }
          ]
      })}).richMenuId;
      UrlFetchApp.fetch(`https://api-data.line.me/v2/bot/richmenu/${lmId}/content`,{method :`post`,headers:{"Authorization":`Bearer ${CONF.line.token.HachimakiBot}`,"Content-Type" : `image/png`}, payload:`http://drive.google.com/uc?export=<ファイルID>`/*1mb未満*/});
      UrlFetchApp.fetch(`https://api.line.me/v2/bot/user/all/richmenu/${lmId}`,{method :`post`,headers:{"Authorization":`Bearer ${CONF.line.token.HachimakiBot}`}});
    };
    this.exe_sysRep         =()=>{//完成
      const runTime = Number(G_PS.pGet(`runTime`    ));
                             G_PS.pSet(`runTime`,`0`) ;
      const usedCell = G_SS(CONF.gss.exeLog,`ALL`).reduce((acc_num,el)=> acc_num + (el.getLastRow()*el.getLastColumn()),0);
      Discord()
        .fields(`runTime` ,`${Math.floor(runTime/1000/60)}m${String(Math.floor(runTime/1000)%60).padStart(2,"0")}s${String(runTime%1000).padStart(3,"0")}ms/90m`)
        .fields(`usedCell`,`${usedCell.toLocaleString()}cell/10,000,000cell`                                                                                    )
        .embed (`${_Date()._add(0,0,-1).getMonth()+1}/${_Date()._add(0,0,-1).getDate()} SystemReport`).send(CONF.discord.server.i5systemRunLog);
    };
    this.exe_schedule_cache =()=>{//完成
      let weather = UrlFetchApp.fetch(Parser.data(Parser.data(UrlFetchApp.fetch(`https://www.data.jma.go.jp/developer/xml/feed/regular.xml`).getContentText("utf-8")).from(`<entry>`).to(`</entry>`).iterate().find(el=>el.includes(`【神奈川県府県週間天気予報】`))).from(`<id>`).to(`</id>`).build()).getContentText("utf-8");
      weather = [["天気","WeatherPart",0],["降水","ProbabilityOfPrecipitationPart",0],["最低気温","TemperaturePart",0],["最高気温","TemperaturePart",3]].reduce((acc_obj,info_ary)=>{acc_obj[info_ary[0]] = Parser.data(weather).from(`<${info_ary[1]}>\n`).to(`\n</${info_ary[1]}>`).iterate()[info_ary[2]].split(`\n`).map(el=>el.includes(`<`,1) ? Parser.data(el).from(`>`).to(`<`).build() : "");return acc_obj;},{});
      G_PS.pSet(`schedule`,JSON.stringify(G_SS(CONF.gss.schedule,`ALL`).reduce((acc_ary,sheet,idx,sheets)=>{
        sheets.cGet(2,1,`LAST`, 2,idx).some(row_ary => Number(row_ary[0])===_Date().getMonth()+1&&Number(row_ary[1])===_Date().getDate() ? true : !(sheets.cDel(2,1,`ROW`,idx)));
        sheets.cGet(2,3,     8,14,idx).forEach((row_ary,row_idx)=>{
          !idx ? acc_ary[row_idx] = {時程:CONF.schedule.shortTt[row_ary[0]] ? CONF.schedule.shortTt[row_ary[0]] : row_ary[0],行事:row_ary[1],
                                     天気:{天気:weather.天気[row_idx],降水:weather.降水[row_idx],最低気温:weather.最低気温[row_idx],最高気温:weather.最高気温[row_idx]}}
               : Object.assign(acc_ary[row_idx],{[sheets[idx].getSheetName()]:row_ary.reduce((acc,cell,idx)=>{acc[Math.trunc(idx/2)].push(cell);return acc;},[[],[],[],[],[],[],[]])});
        });
        return acc_ary;
      },[])));
    };
    this.exe_schedule_send  =()=>{//完成
      const info = JSON.parse(G_PS.pGet(`schedule`));
      const week = Discord().embed(`【${_Date()._add(0,0,1).getMonth()+1}/${_Date()._add(0,0,1).getDate()}〜${_Date()._add(0,0,7).getMonth()+1}/${_Date()._add(0,0,7).getDate()}の予定】`);
      info.slice(1).forEach((day,idx)=>{
        week.fields(`${_Date()._add(0,0,idx+1).getMonth()+1}月${_Date()._add(0,0,idx+1).getDate()}日(${_Date()._add(0,0,idx+1)._wkday()})${day.天気.天気?`　${day.天気.天気}`:``}`,
        !day[`1-3`][0][0] ? `休日` : day[`1-3`].reduce((day_str,cls_ary,idx)=>day_str += cls_ary[0] ? `${idx===4 ? `\n` : `　`}${idx+1}：${cls_ary[0]}` : ``,``))
      })
      week.send(CONF.discord.server.schedule);
      const day = Discord().embed(`【${_Date()._add(0,0,1).getMonth()+1}月${_Date()._add(0,0,1).getDate()}日(${_Date()._add(0,0,1)._wkday()})の予定】`);
      info[1].天気.天気 /**/&&day.fields(`天気`,`${info[1].天気.天気}\n(降水確率：${info[1].天気.降水}％${info[1].天気.最低気温?`　気温：${info[1].天気.最低気温}〜${info[1].天気.最低気温}℃`:``})`);
      info[1].行事  /*　　*/&&day.fields(`行事`,`${info[1].行事}`);
      info[1].時程  /*　　*/&&day.fields(`時程`,`${info[1].時程}`);
      info[1][`1-3`][0][0] ? info[1][`1-3`].some((el,idx)=>el[0] ? !(day.fields(`${idx+1}：${el[0]}`,`　${el[1]}`)) : true) : day.fields(`休み`,``);
      day.send(CONF.discord.server.schedule);
    };
    if(typeof speArg === `string`){return this[`exe_${speArg}`]()};
    G_TRIG.tDel(`TRIG`);
    if(CONF.system.runLim_min*60*1000<=G_PS.pGet(`runTime`)){throw new Error(`runLimOver!`)};
    const now_de  = _Date()._set(null,null,null,null,Math.trunc(_Date().getMinutes()/CONF.system.trig.dly_min)*CONF.system.trig.dly_min,0,0);
    G_TRIG.tSet("TRIG","at",now_de._add(null,null,null,null,CONF.system.trig.dly_min));
    const ret = CONF.system.trig.itv.reduce((acc_ary,el)=>!(now_de._set(1970,0,1)._add(0,0,0,9).getTime()  %  _Date(1970,0,1,...el[0],0,0)._add(0,0,0,9).getTime()) ? acc_ary._push(el[1]) : acc_ary,
                CONF.system.trig.fix.reduce((acc_ary,el)=>  now_de                             .getTime() === now_de         ._set(null,null,null,...el[0],0,0).getTime()  ? acc_ary._push(el[1]) : acc_ary,[]))
                .reduce((error_str,el)=>{try{this[`exe_${el}`]()}catch(e){error_str += `${e.message}\n${e.stack}`}finally{return error_str}},``);
    G_PS.pSet(`lastExe`,_Date().getTime());
    if(ret){throw new Error(`[TRIG内部エラー]\n${ret}`)};
  };
  this.exe_HTTP = (bootInfo) => {
    this.exe_HachimakiBot=(data)=>{
      //LINE送信関数の第一関数はオブジェクトに変更したため注意
      this.exe_schedule     =(day_num,usrCls )=>{//完成
        G_PS.pGet(`schedule`)||(exe_TRIG(`schedule_cache`));
        const info = JSON.parse(G_PS.pGet(`schedule`));
        let ret_str = ``;
        if(day_num<=7){
          const day_info = info[day_num];
          ret_str += `【${_Date()._add(0,0,day_num).getMonth()+1}月${_Date()._add(0,0,day_num).getDate()}日(${_Date()._add(0,0,day_num)._wkday()})の予定】`;
          ret_str += !day_info.天気.天気            /**/?``  /*　　*/:`\n　天気：${day_info.天気.天気}`;
          ret_str += !day_info.天気.降水            /**/?``  /*　　*/:`\n　(降水確率：${day_info.天気.降水}％${day_info.天気.最低気温?`　気温：${day_info.天気.最低気温}〜${day_info.天気.最低気温}℃`:``})`;
          ret_str += !day_info.行事             /*　　*/?``  /*　　*/:`\n　行事：${day_info.行事}`;
          ret_str += !day_info.時程             /*　　*/?``  /*　　*/:`\n　時程：${day_info.時程}`;
          ret_str += !day_info[usrCls][0][0]/*　　　　*/?`\n　休日`/**/:day_info[usrCls].reduce((acc,cell,idx)=> `${acc}${cell[0] ? `\n　${idx+1}：${cell[0]}　${cell[1]}` : ``}`,``);
        }else{
          ret_str += info.slice(1).reduce((acc_str,day_obj,idx)=>
            acc_str += `\n${_Date()._add(0,0,idx+1).getMonth()+1}月${_Date()._add(0,0,idx+1).getDate()}日(${_Date()._add(0,0,idx+1)._wkday()})${day_obj.天気.天気?`　${day_obj.天気.天気}`:``}${!day_obj[usrCls][0][0] ? `\n　休日` : day_obj[usrCls].reduce((day_str,cls_ary,idx)=>day_str += cls_ary[0] ? `${idx===0||idx===3||idx===6 ? `\n　` : `　`}${idx+1}：${cls_ary[0]}` : ``,``)}`
          ,`【${_Date()._add(0,0,1).getMonth()+1}/${_Date()._add(0,0,1).getDate()}〜${_Date()._add(0,0,7).getMonth()+1}/${_Date()._add(0,0,7).getDate()}の予定】`)
        };
        return ret_str;
      };
      this.exe_thurumi      =(               )=>{//完成
        const info = _Date().getDay()!==0&&_Date().getDay()!==6 ? CONF.thurumi.tt.wd : CONF.thurumi.tt.we;
        return info.reduce((acc,hour,idx)=>acc ? acc : hour.reduce((acc,min)=> acc ? acc : _Date() < _Date()._set(null,null,null,idx,min) ? `次の鶴見線は${Math.round((_Date()._set(null,null,null,idx,min).getTime() - _Date().getTime())/(60*1000))}分後です` : 0 ,0) ,0);
      };
      this.exe_address      =(name           )=>{//完成　スペースで分離して検索して、重複排除？
        return !name ? null : `検索結果` + (G_SS(CONF.gss.addressLs,`list_学年`).cGet(3,1,`LAST`,7).filter(row_el=>`${row_el[2]}${row_el[3]}`.includes(name)).reduce((acc,row_el)=>`${acc}\n${row_el[2]} ${row_el[3]}(${row_el[4]}組)\n　${row_el[0]}`,``) || `\n該当者無し`);
      };
      this.exe_systemCtrl   =(arg            )=>{//完成
        this.exe_schedulePost=()=>{
          G_SS(CONF.gss.schedule,`ALL`).reduce((info_ary,sheet,idx,sheets)=>{
            sheets.cGet(2,1,`LAST`,2,idx).some(row_ary => Number(row_ary[0])===_Date().getMonth()+1&&Number(row_ary[1])===_Date().getDate() ? true : !(sheets.cDel(2,1,`ROW`,idx)));
            !idx? info_ary = sheets.cGet(2,5,`LAST`,14,idx)
                : sheets.cSet(sheets.cGet(2,3,`LAST`,14,idx).map((row_ary,row)=>row_ary.map((cell,col,cellIdx)=>cellIdx %2 ? CONF.schedule.tt[sheets[idx].getSheetName()]?.[info_ary[row][col/2]?.[0]]?.[info_ary[row][col/2]?.[1]-1] ? CONF.schedule.tt[sheets[idx].getSheetName()]?.[info_ary[row][col/2]?.[0]]?.[info_ary[row][col/2]?.[1]-1] : info_ary[row][col/2] : cell)),2,3,idx);
            return info_ary;
          },[]);
        };
        if(G_CS.cGet(`root`)&&arg!==CONF.system.rootpw){
          switch (arg){
            case `起動`/*　　　*/: exe_TRIG(                ) ; return "システム起動処理完了";
            case `停止`/*　　　*/: G_TRIG.tDel(             ) ; return "システム停止処理完了";
            case `予定表転記`/**/: exe_schedulePost(        ) ; return `予定表の転記完了`;
            case `予定表更新`/**/: exe_TRIG(`schedule_cache`) ; return `予定表の更新完了`;
            case `最終実行`/*　*/:                            ; return `${_Date(Number(G_PS.pGet(`lastExe`))).toLocaleString()}`;
            default/*　　　　　*/:                            ; return `操作内容を入力してください`;
          };
        }else{
          if(arg===CONF.system.rootpw){G_CS.cSet(`root`,`1`,CONF.system.rootMin*60);return `管理者ログイン完了\n有効期限は${CONF.system.rootMin}分間です`}else{return `管理者パスワードが必要です`};
        };
      };
      this.exe_countN       =(txt,usrId,grpId)=>{//これは全てが終わってから
        if(grpId&&G_CS.cGet(`countN_${usrId}`)){
                if(/^カウント[0-9]+/u.test(txt)){

          }else if(/^[0-9]+\$/u     .test(txt)){

          }
        }
      };
      //throw Error(data.postData.contents)
      if(JSON.parse(data.postData.contents).events){JSON.parse(data.postData.contents).events.forEach(event=>{if(event.type==`message`&&event.message.type===`text`){
        let txt = event.message.text;
        let message = "";
        const usrCls = `1-${G_SS(CONF.gss.addressLs,`list_学年`).cGet(3,1,`LAST`,7).find(row_el=>row_el[2]+row_el[3]===CONF.line.id?.user[event.source.userId]?.replace(/ /u,``))?.[4]||3}`
        message =
        //関数で判定
          exe_countN(txt,event.source.userId,event.source.groupId)
        ||
        //システム系
          RegExp(`^システム(管理|監視|制御|操作)`/**/,`u`).test(txt) ? exe_systemCtrl(txt.replace(/[ 　]/ug,``).slice(6))
        : RegExp(`^(予定|授業|時間割)表` /*　　　　*/,`u`).test(txt) ? `https://docs.google.com/spreadsheets/d/${CONF.gss.schedule}/edit`
        //予定系
        : RegExp(`^([0０〇]日後|${_Date()._add(0,0,0)._wkday()}曜日?|0?${_Date()._add(0,0,0).getDate()}日|今日|本日`  /*　　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(0,usrCls)
        : RegExp(`^([1１一]日後|${_Date()._add(0,0,1)._wkday()}曜日?|0?${_Date()._add(0,0,1).getDate()}日|明日|翌日`  /*　　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(1,usrCls)
        : RegExp(`^([2２二]日後|${_Date()._add(0,0,2)._wkday()}曜日?|0?${_Date()._add(0,0,2).getDate()}日|明後日`   /*　　　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(2,usrCls)
        : RegExp(`^([3３三]日後|${_Date()._add(0,0,3)._wkday()}曜日?|0?${_Date()._add(0,0,3).getDate()}日|明明後日|明々後日`  /**/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(3,usrCls)
        : RegExp(`^([4４四]日後|${_Date()._add(0,0,4)._wkday()}曜日?|0?${_Date()._add(0,0,4).getDate()}日|明明明後日`   /*　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(4,usrCls)
        : RegExp(`^([5５五]日後|${_Date()._add(0,0,5)._wkday()}曜日?|0?${_Date()._add(0,0,5).getDate()}日`    /*　　　　　　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(5,usrCls)
        : RegExp(`^([6６六]日後|${_Date()._add(0,0,6)._wkday()}曜日?|0?${_Date()._add(0,0,6).getDate()}日`    /*　　　　　　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(6,usrCls)
        : RegExp(`^([7７七]日後|${_Date()._add(0,0,7)._wkday()}曜日?|0?${_Date()._add(0,0,7).getDate()}日|[1１一]週間後`/*　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(7,usrCls)
        : RegExp(`^([7７七]日間|[1１一]?週間`                                                                   /*　　　　　　　*/+`)の(予定|授業|時間割)`,`u`).test(txt) ? exe_schedule(8,usrCls)
        //その他機能
        : RegExp(`^(次|つぎ)の鶴見(線|せん)`/**/,`u`).test(txt) ? exe_thurumi(                            /*　*/)
        : RegExp(`^アドレス.+`    /*　　　　　*/,`u`).test(txt) ? exe_address(txt.slice(4).replace(/[ 　]/ug,``))
        : RegExp(`^(はちまき|ハチマキ)(ぼっと|ボット|bot).*(readme|help|ヘルプ)`,`u`).test(txt) ? CONF.line.HachimakiBotHelp
        : RegExp(`^(おはよう|こんにちは|こんばんは|よろしく).*(はちまき|ハチマキ)(ぼっと|ボット|bot)`,`u`).test(txt) ? `HelloWorld !`
        //非適合の場合
        : event.source.groupId ? null : `FAIL(､´･ω･)▄︻┻┳═一💥 [cmd]彡`;
        message&&LINE(message,CONF.line.token.i5system,`reply`,event.replyToken);//dev
        G_SS(CONF.gss.HachmakiBotLog,event.source.groupId ? Object.entries(CONF.line.id.group).find(el=>el[1]===event.source.groupId)?.[0] || "その他" : "その他")
          .cSet([_Date(),CONF.line.id.user[event.source.userId]||event.source.userId,event.message.text,event.source.groupId||"-"]);
      }})};
    };
    return this[`exe_${bootInfo.func[1]}`](bootInfo.data);
  };
//↑↑　処理　↑↑

//fin.



function dev(){
  Logger.log(UrlFetchApp.fetch(
    `https://api.line.me/v2/bot/richmenu/list`,
    {
      method :`get`,
      headers:{
        "Authorization":`Bearer ${CONF.line.token.i5system}`,
      },
    }
  ))
}


/*※最大20要素
ーーーー  週間  ーーーー
0日後|1日後|2日後|3日後
4日後|5日後|6日後|7日後
鶴見線|アドレス検索|GCL通知|管理画面
*/


/*コンテンツの処理方法
  スケジュール通知(1日分)
  　形式：ポストバックイベント
  　内容：タイル1枠に1日分or日付選択形式
  スケジュール通知(1週間分)
  　形式：ポストバックイベント
  　内容：タイル1枠
  鶴見線
  　形式：ポストバックイベント
  　内容：タイル1枠
  アドレス検索
  　形式："inputOption": "openKeyboard","fillInText":"アドレス検索対象の名前＞"を目的としたポストバックイベント(イベント自体は無視)
  　内容：タイル1枠　これの次の通常メッセージで返答
  クラスルーム通知
  　形式：URL
  　内容：クエリパラメータで直近の投稿一覧のHTML送信
*/

/*リッチテキストについて
  後回し
*/

//リファレンス
  //https://developers.line.biz/ja/reference/messaging-api/#postback-action

this.samplecode = () =>{
//リッチメニューのアクション設定＋作成
  UrlFetchApp.fetch(
    `https://api.line.me/v2/bot/richmenu`,
    {
      method :`post`,
      headers:{
        "Authorization":`Bearer ${CONF.line.token.i5system}`,
        "Content-Type" :`application/json`
      },
      payload:JSON.stringify(
        {
          "size": {  //リッチメニューのサイズ設定　幅：800px〜2500px　高さ：250px〜　※1.45<幅/高さ
            "width": 2500,
            "height": 1686
          },
          "selected": true,
          "name": "リッチメニュー",
          "chatBarText": "コマンド",
          "areas": [
            {
              "bounds": {
                "x": 0, //領域左上のピクセル(0以上)
                "y": 0,
                "width": 1666,
                "height": 1686
              },
              "action": {//定型文
                "type": "postback",
                "data": "action=buy&itemid=111",//クエリパラメータ的な
                "displayText": "Buy",//ユーザーが送信したとして表示されるテキスト
                "inputOption": "openKeyboard",//その後に行うアクション？
                "fillInText": "---\nName: \nPhone: \nBirthday: \n---"//最初から入力済のテキスト
              }
            },
            {
              "actionA": {//ただのメッセージ送信
                "type": "message",
                "label": "Yes",
                "text": "Yes"
              },
              "actionB": {//指定されたURLを開く
                "type": "uri",
                "label": "メニューを見る",
                "uri": "https://example.com/menu"
              },
              "actionC": {//日付選択　形式は　2100-12-31
                "type": "datetimepicker",
                "label": "Select date",
                "data": "storeId=12345",
                "mode": "datetime",//date：日付　time：時刻　datetime：日付と日時
                "initial": "2017-12-25t00:00",//初期値(省略可)
                "max": "2018-01-24t23:59",//選択可能な範囲
                "min": "2017-12-25t00:00"
              },
              "actionD": {//クリップボード(アドレス検索に搭載？)　※リッチメニューには使用不可
                "type": "clipboard",
                "label": "Copy",
                "clipboardText": "3B48740B"
              }
            }
          ]
        }
      )
    }
  )
  //レスポンス：	{"richMenuId":""}

//リッチメニューの背景画像の設定
  UrlFetchApp.fetch(
    `https://api-data.line.me/v2/bot/richmenu/${`上のレスポンスのリッチメニューID`}/content`,
    {
      method :`post`,
      headers:{
        "Authorization":`Bearer ${CONF.line.token.i5system}`,
        "Content-Type" : `image/png`//JPEG or PING　 BLOBデータでもいいかは不明
      },
      payload:`hoge`//リッチメニューの背景画像(1MB未満)
    }
  )

//リッチメニューをデフォルトに設定
  UrlFetchApp.fetch(
    `https://api.line.me/v2/bot/user/all/richmenu/${`上のレスポンスのリッチメニューID`}`,
    {
      method :`post`,
      headers:{
        "Authorization":`Bearer ${CONF.line.token.i5system}`
      }
    }
  )

//リッチメニュー削除
  UrlFetchApp.fetch(
    `https://api.line.me/v2/bot/richmenu/${`上のレスポンスのリッチメニューID`}`,
    {
      method :`delete`,
      headers:{
        "Authorization":`Bearer ${CONF.line.token.i5system}`
      }
    }
  )

//リッチメニュー一覧
  UrlFetchApp.fetch(
    `https://api.line.me/v2/bot/richmenu/list`,
    {
      method :`get`,
      headers:{
        "Authorization":`Bearer ${CONF.line.token.i5system}`,
      },
    }
  )
  const リッチメニュー配列 = {
    "richmenus":[
      {
        "richMenuId":"",
        "name":"リッチメニュー",
        "size":{"width":2500,"height":1686},
        "chatBarText":"コマンド",
        "selected":true,
        "areas":[
          {
            "bounds":{"x":0,"y":0,"width":1666,"height":1686},
            "action":{"type":"postback","data":"action=buy&itemid=111","displayText":"Buy","inputOption":"openKeyboard","fillInText":"---\nName: \nPhone: \nBirthday: \n---"}
          },
          {
            "bounds":{"x":1667,"y":0,"width":834,"height":843},
            "action":{"label":"Yes","type":"message","text":"Yes"}},
          {
            "bounds":{"x":1667,"y":844,"width":834,"height":843},
            "action":{"label":"メニューを見る","type":"uri","uri":"https://example.com/menu"}
          }
        ]
      },
      {
        "richMenuId":"",
        "name":"デフォルトのリッチメニューのテスト",
        "size":{"width":2500,"height":1686},
        "chatBarText":"Tap to open",
        "selected":false,
        "areas":[
          {
            "bounds":{"x":0,"y":0,"width":1666,"height":1686},
            "action":{"label":"タップ領域A","type":"uri","uri":"https://developers.line.biz/ja/news/"}
          },
          {
            "bounds":{"x":1667,"y":0,"width":834,"height":843},
            "action":{"label":"タップ領域B","type":"uri","uri":"https://lineapiusecase.com/ja/top.html"}
          },
          {
            "bounds":{"x":1667,"y":844,"width":834,"height":843},
            "action":{"label":"タップ領域C","type":"uri","uri":"https://techblog.lycorp.co.jp/ja/"}
          }
        ]
      }
    ]
  }
}

//↑↑　開発用　↑↑





























