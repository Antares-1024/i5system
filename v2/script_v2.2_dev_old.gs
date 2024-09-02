
/*
----------------<コーディングルール>----------------
  ・命名規則
    ・関数　f_
      ・開発　dv_
      ・起動　bt_
      ・共有　sh_
      ・個別　mp_
      ・通常　pr_
    ・変数　l_
    ・定数　c_
  ・変数は極力varではなくletを使う
  ・GSSのへ読み込みは書き込みより先に行う
  ・過度に自由度を意識しない→プログラムが冗長かつ難解になる
  ・過度な余裕を作らない→無駄に処理方法が複雑になる

----------------<覚書>------------------------
  ・KEY Properties Service
    ・stop 停止時刻を記録
    ・runtime 実行時間を記録
    ・rss_ rssの最終取得時間
  ・KEY Chache Servise
    ・gss_ GSSキャッシュ
  ・GETリクエスト
    /esp32　→esp32
      ?type=tmp wheel=n tmp1=n tmp2=n tmp3=n　→定期レポート
      ?type=stop　→システム停止 手動再起動必要
      ?type=income　→インターホン
      ?type=call　→呼び出し
      ?type=tmp_high tmp=n　→高温アラート
      ?type=tmp_low tmp=n　→低温アラート
  ・POSTリクエスト
    /linebot　→LINEbot
  ・起動関数
    トリガー
    ・f_bt_surveillance　0時
    ・f_bt_cache　5時間ごと&0時
    ・f_bt_mail　5分ごと
    ・f_bt_rss　1時間ごと
    ・f_bt_schedule(予定+課題)　18時
    ・f_bt_pet　20時
    ・f_bt_weather  ?時
    ・f_bt_plan　不定期
    POSTリクエスト
    ・linebot
    GETリクエスト
    ・esp32
*/

//環境変数
  //主要ID
    const c_id_gss = "";
    const c_id_mainacct = "";
    const c_id_discacct = "";
    const c_id_wh_log_opr = "";//稼働
    const c_id_wh_log_exe = "";//実行
    const c_id_wh_ex_wh = "";//例外
  //リスト
    const c_list_func =
    [
      [//定期
        ["f_bt_cache",[,,,5,,,]],
        ["f_bt_mail",[,,,,5,,]],
        ["f_bt_rss",[,,,1,,,]]
      ],
      [//定時
        ["f_bt_schedule",[,,,18,,,]],
        ["f_bt_pet",[,,,20,,,]],
        ["f_bt_werther",[,,,20,,,]]//仮
      ]
    ];
  //設定
    const c_limit_runtime = 80*60*1000;
    const c_limit_mailbody = 200;

//開発用関数
  function f_dv_system_boot(){
    ScriptApp.newTrigger("f_bt_survaillance").timeBased().at(f_sh_date(new Date,[,,1,,,,],[,,,0,0,0,0])).create();
  };

  function f_dv_ps_del(){
    Logger.log(PropertiesService.getScriptProperties().getProperties())
    PropertiesService.getScriptProperties().deleteAllProperties()
    Logger.log(PropertiesService.getScriptProperties().getProperties())
  };

//共有関数
  //Discord
    function f_sh_disc_send(l_hook_url,l_message){
      const c_payload = {
        "method": "post",
        "headers": {"Content-type": "application/json"},
        "muteHttpExceptions": true,
        "payload": JSON.stringify(l_message)
      };
      if(l_hook_url == "" || l_hook_url == null){
        l_hook_url = c_id_wh_ex_wh;
      };
      while(true){
        let l_response = "";
        try{
          l_response = UrlFetchApp.fetch(l_hook_url, c_payload);
          break;
        }catch(e){
          const c_error_429 = "Request failed for https://discord.com returned code 429."
          if(e.message.slice(56) == c_error_429){
            Utilities.sleep(500);
          }else{
            const c_embed = f_sh_disc_embed(
              "送信失敗",
              null,
              null,
              null,
              null,
              new Date,
              "FF0000",
              null,
              [
                f_sh_disc_field("エラーが発生した処理","Discordへの送信"),
                f_sh_disc_field("GASのエラーメッセージ",e.message),
                f_sh_disc_field("httpレスポンス",l_response)
              ],
              null
            );
            const c_message = f_sh_disc_message(null,null,c_embed);
            f_sh_disc_send(c_id_wh_log_exe,c_message);
            break;
          };
        };
      };
    };

    function f_sh_disc_message(arg_content,arg_username,arg_embeds){
      let l_return = {
        "content": arg_content,
      };
      if(arg_username != null){
        l_return["username"] = arg_username;
      };
      if(arg_embeds != null){
        l_return["embeds"] = [arg_embeds];
      };
      return l_return;
    };

    function f_sh_disc_embed(arg_title,arg_url,arg_description,arg_thumbnail_url,arg_image_url,arg_timestamp,arg_color/*hex*/,arg_author,arg_fields/*ary*/,arg_footer){
      let l_embed = {
        "title": arg_title, 
        "url": arg_url,
        "description":arg_description,
        "thumbnail": {"url": arg_thumbnail_url},//右上アイコン
        "image": {"url": arg_image_url},//埋め込み画像
        "timestamp":arg_timestamp,
        "author": arg_author,
        "footer": arg_footer
      };
      if(arg_color != null){
        l_embed["color"] = parseInt(arg_color, 16);;//左側面の線の色
      };
      if(arg_fields != null){
        l_embed["fields"] = arg_fields;
      };
      return l_embed;
    };

    function f_sh_disc_field(arg_name,arg_value,arg_inline){
      let l_fields = {
        "name": arg_name,
        "value": arg_value
      };
      if(arg_inline == true){
        l_fields["inline"] = true;
      }else{
        l_fields["inline"] = false;
      };
      return l_fields;
    };

    function f_sh_disc_footer(arg_text,arg_icon_url){
      return {
        "text": arg_text,
        "icon_url": arg_icon_url
      };
    };

    function f_sh_disc_author(arg_name,arg_url,arg_icon_url){
      return {
        "name": arg_name,
        "url": arg_url,
        "icon_url": arg_icon_url
      };
    };
    
  //Date ※操作しない部分は0ではなくnull
    function f_sh_date(l_time,l_plus,l_set){
      let l_return = new Date(l_time);
      if(l_plus != null){
        for(let i = 0; i < 7; i++){
          if(l_plus[i] != null){
            switch(i){
              case 0:
                l_return.setFullYear(l_return.getFullYear() + l_plus[0]);
                break;
              case 1:
                l_return.setMonth(l_return.getMonth() + l_plus[1]);
                break;
              case 2:
                l_return.setDate(l_return.getDate() + l_plus[2]);
                break;
              case 3:
                l_return.setHours(l_return.getHours() + l_plus[3]);
                break;
              case 4:
                l_return.setMinutes(l_return.getMinutes() + l_plus[4]);
                break;
              case 5:
                l_return.setSeconds(l_return.getSeconds() + l_plus[5]);
                break;
              case 6:
                l_return.setMilliseconds(l_return.getMilliseconds() + l_plus[6]);
                break;
            };
          };
        };
      };
      if(l_set != null){
        for(let i = 0; i < 7; i++){
          if(l_set[i] != null){
            switch(i){
              case 0:
                l_return.setFullYear(l_set[0]);
                break;
              case 1:
                l_return.setMonth(l_set[1]);
                break;
              case 2:
                l_return.setDate(l_set[2]);
                break;
              case 3:
                l_return.setHours(l_set[3]);
                break;
              case 4:
                l_return.setMinutes(l_set[4]);
                break;
              case 5:
                l_return.setSeconds(l_set[5]);
                break;
              case 6:
                l_return.setMilliseconds(l_set[6]);
                break;
            };
          };
        };
      };
      return l_return;
    };

  //GSS
    function f_sh_gss_get(l_sheet_name,l_start_row,l_start_column,l_get_row,l_get_column){//シート名、開始行、開始列、取得行数、取得列数
      const c_ss = SpreadsheetApp.openById(c_xls_db).getSheetByName(l_sheet_name);
      if(c_ss.getLastRow() == 0){
        return "データ存在ぜず";
      };
      if(l_get_row == 0 || l_get_column == 0){
        return "範囲指定失敗";
      };
      if(typeof(l_get_row) == "number" && typeof(l_get_column) == "number"){
        return c_ss.getRange(l_start_row,l_start_column,l_get_row,l_get_column).getValues();
      }else if(typeof(l_get_row) == "string" && typeof(l_get_column) == "number"){
        return c_ss.getRange(l_start_row,l_start_column,c_ss.getLastRow(),l_get_column).getValues();
      }else if(typeof(l_get_row) == "number" && typeof(l_get_column) == "string"){
        return c_ss.getRange(l_start_row,l_start_column,l_get_row,c_ss.getLastColumn()).getValues();
      }else if(typeof(l_get_row) == "string" && typeof(l_get_column) == "string"){
        return c_ss.getRange(l_start_row,l_start_column,c_ss.getLastRow(),c_ss.getLastColumn()).getValues();
      };
    };

  //Properties
    function f_sh_ps_set(l_key,l_value){
      PropertiesService.getScriptProperties().setProperty(l_key,l_value);
    };

    function f_sh_ps_get(l_key){
      return PropertiesService.getScriptProperties().getProperty(l_key);
    };

  //cache
    function f_sh_cache_set(l_key,l_value,l_sec){
      CacheService.getScriptCache().put(l_key,l_value,l_sec);
    };

    function f_sh_cache_del(l_key){
      CacheService.getScriptCache().remove(l_key);
    };

    function f_sh_cache_get(l_key){
      CacheService.getScriptCache().get(l_key);
    };

  //trigger
    function f_sh_trigger_set(l_func,l_time){//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー開発中の誤動作防止でコメントアウト
      l_time = f_sh_date_set(l_time,[,,,,,0,0]);
      //ScriptApp.newTrigger(l_func).timeBased().at(l_time).create();
    };

    function f_sh_trigger_del(l_func) {
      const c_trigger = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_trigger.length; i++){
        if(c_trigger[i].getHandlerFunction() == l_func){
          ScriptApp.deleteTrigger(c_trigger[i]);
          break;
        };
      };
    };

  //convert_month
    function f_sh_convert_month(l_month){//Dateに合わせて-1は>>していない<<
      switch (l_month){
        case "Jan":
          return "1";
        case "Feb":
          return "2";
        case "Mar":
          return "3";
        case "Apr":
          return "4";
        case "May":
          return "5";
        case "Jun":
          return "6";
        case "Jul":
          return "7";
        case "Aug":
          return "8";
        case "Sep":
          return "9";
        case "Oct":
          return "10";
        case "Nov":
          return "11";
        case "Dec":
          return "12";
        default:
          return "error";
      };
    };

//システム監視(毎日0時に実行)
    function f_bt_surveillance(){//システムをできるだけ初期化
      f_bt_cache();
      f_mp_systemcheck();
      f_sh_ps_set("stop",0);
      f_sh_ps_set("runtime",0);
      const c_triggers = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_triggers.length; i++){
        ScriptApp.deleteTrigger(c_triggers[i]);
      };
      ScriptApp.newTrigger("f_bt_survaillance").timeBased().at(f_sh_date(new Date,[,,1,,,,],[,,,0,0,0,0])).create();
      f_bt_trigger();
    };

    //システムチェック
      function f_mp_systemcheck(){
        if(f_sh_ps_get("stop") == 0){
          l_color = "0000FF";
        }else{
          l_color = "FF6600";
        };
        const c_runtime = f_mp_runtime();
        const c_embed = f_sh_disc_embed(
          String(new Date.getMonth()+1)+"月"+String(new Date.getDate())+"日"+"のシステム稼働レポート",
          null,
          f_mp_stop(),
          null,
          null,
          new Date,
          l_color,
          null,
          [
            f_sh_disc_field("稼働時間",c_runtime["min"] + "分" + c_runtime["sec"] + "秒" + c_runtime["msec"] + "ミリ秒" + "/90分"),
            f_sh_disc_field("DBのセル使用数",f_mp_cell() + "セル" + "/1000万セル")
          ],
          null
        );
        const c_message = f_sh_disc_message(null,null,c_embed)
        f_sh_disc_send(c_id_wh_log_opr,c_message);
      };

      function f_mp_runtime(){
        const c_runtime = Number(f_sh_ps_get("runtime"));
        let l_return = {};
        l_return["msec"] = c_runtime % 1000;
        let count = Math.floor(c_runtime / 1000);
        l_return["sec"] = count % 60;
        count = Math.floor(count / 60);
        l_return["min"] = count;
        f_ps_set("runtime","0");
        return l_return;
      };

      function f_mp_stop(){
        const c_stop = f_sh_ps_get("stop");
        if(c_stop == "0"){
          return "システムは正常に動作しました。";
        }else{
          return "システムは" + c_stop + "に停止しました。";
        };
      };

      function f_mp_cell(){
        const c_ss = SpreadsheetApp.openById(c_id_gss).getSheets();
        let l_message = "";
        let l_count = 0;
        for (let i = 0; i < c_ss.length; i++) {
          l_count = l_count + c_ss[i].getMaxRows() * c_ss[i].getMaxColumns();
        };
        if(l_count >= 10000){
          l_message = Math.floor(l_count / 10000) + "万";
          l_count = l_count % 10000;
        };
        return l_message + String(l_count) ;
      }

//基盤システム
  //キャッシュ
    function f_bt_cache(){
      const c_data = f_sh_gss_get("MD",2,1,MAX,MAX);
      for(let i = 0; i < c_data.length; i++){
        f_sh_cache_set("gss_" + c_data[i][0],f_sh_gss_get(c_data[i][1],c_data[i][2],c_data[i][3],MAX,MAX).join(","),21600);
      };
    };

  //トリガー設定
    function f_bt_trigger(){
      const c_triggers = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_triggers.length; i++){
        if(c_triggers.getHandlerFunction() != "f_bt_surveillance"){
          ScriptApp.deleteTrigger(c_triggers[i]);
        };
      };
      const c_time = new Date;
      let l_time_now = new Date;
      if(l_time_now.getHours % 5 != 0){
        l_time_now = f_sh_date(c_time,[,,,,-1,,],[,,,,,0,1]);
      }else{
        l_time_now = f_sh_date(c_time,[,,,,,,],[,,,,,0,1]);
      };
      const c_time_next = f_sh_date(l_time_now,[,,,,5,,],[,,,,,0,0]);
      if(l_time_now.getDay < c_time_next.getDay){
        return;
      };
      let l_trigger_ary = [["f_bt_trigger",c_time_next]];
      for(let i = 0; i < c_list_func[0].length; i++){
        let l_boottime = f_sh_date(c_time,[,,,,,,],[,,,0,0,0,0]);
        while(l_boottime.getDay == l_time_now.getDay){
          if(l_time_now < l_boottime && l_boottime < c_time_next){
            l_trigger_ary.push([c_list_func[0][i][0],l_boottime]);
          };
          l_boottime = l_boottime + c_list_func[0][i][1];
        };
      };
      for(let i = 0; i < c_list_func[1].length; i++){
        const c_boottime = f_sh_date(f_sh_date(c_time,[,,,,,,],[,,,0,0,0,0]),c_list_func[1][i][1],[,,,,,,]);
        if(l_time_now < c_boottime && c_boottime < c_time_next){
          l_trigger_ary.push([c_list_func[1][i][0],c_boottime]);
        };
      };
      l_trigger_ary.push(f_trigger_plan(l_time_now,c_time_next));
      if(l_trigger_ary.length > 18){
        f_mp_main_log("i5system","トリガー数制限超過のためシステムを停止します");
        return;
      };
      for(let i = 0; i < l_trigger_ary.length; i++){
        if(l_trigger_ary[i][1] < new Date){
          l_trigger_ary[i][1] = f_sh_date(new Date,[,,,,1,,],[,,,,,,]);
        };
        f_sh_trigger_set(l_trigger_ary[i][0],l_trigger_ary[i][1]);
      };
    };

    function f_trigger_plan(l_time_now,l_time_next){
      const c_schedule = f_sh_gss_get("schedule",2,1,5,MAX);
      for(let i = 0; i < c_schedule.length; i++){
        const c_time_now = new Date();
        if(String(c_time_now.getDay()) == c_schedule[i][2]){
          const c_plan = c_schedule[i].slice(19);
          for(let i = 0; i < c_plan.length; i++){
            if(String(c_plan[i]).slice(2,3) == ":"){
              const c_time_plan = f_sh_date(f_sh_date(c_time_now,[,,,,,,],[,,,0,0,0,0]),[,,,String(c_plan[i]).slice(0,2),String(c_plan[i]).slice(3,5),,],[,,,,,,]);
              if(l_time_now < c_time_plan && c_time_plan < l_time_next){
                f_sh_cache_set("plan",String(c_plan[i]).slice(5),5*60);
                return ["f_bt_plan",c_time_plan];
              };
            };
          };
          break;
        };
      };
    };

//メイン処理
  function f_sh_main(l_func,l_http){
    const c_time_boot = new Date;
    if(c_limit_runtime < Number(f_sh_ps_get("runtime"))){
      if(f_sh_ps_get("stop") != "0"){
        f_mp_main_log("i5system","実行時間制限超過間際のためシステムを停止します");
        f_sh_ps_set("stop",String(c_time_boot.getHours() + ":" + c_time_boot.getMinutes()));
        const c_triggers = ScriptApp.getProjectTriggers();
        for(let i = 0; i < c_triggers.length; i++){
          if(c_triggers[i].getHandlerFunction() != "f_bt_surveillance"){
            ScriptApp.deleteTrigger(c_triggers[i]);
          };
        };
        return;
      };
      return;
    };
    try{
      f_mp_main_boot(l_func,l_http);
      f_mp_main_log(l_func,"");
    }catch(e){
      f_mp_main_log(l_func,e.message);
    };
    const c_runtime = new Date - c_time_boot;
    if(Session.getActiveUser().getEmail() == c_id_mainacct){
      f_sh_ps_set("runtime",String(Number(f_sh_ps_get("runtime")) + c_runtime));
    };
  };

  function f_mp_main_log(l_func,l_message){
    let l_txt = null;
    let l_result = "";
    let l_color = "";
    if(l_message == ""){
      l_txt = null;
      l_result = "成功";
      l_color = "008000";
    }else if(l_message == "実行時間制限超過間際のためシステムを停止します"){
      l_txt = "<@" + c_id_discacct + ">";
      l_result = "停止";
      l_color = "FF0000";
    }else  if(l_message == "トリガー数制限超過のためシステムを停止します"){
      l_txt = "<@" + c_id_discacct + ">";
      l_result = "停止";
      l_color = "FF0000";
    }else{
      l_txt = "<@" + c_id_discacct + ">";
      l_result = "失敗";
      l_color = "FF0000";
    };
    const c_author = f_sh_disc_author(Session.getActiveUser().getEmail(),null,null);
    const c_embed = f_sh_disc_embed(
      "実行結果：" + l_result,
      null,
      null,
      null,
      null,
      new Date,
      l_color,
      c_author,
      [
        f_sh_disc_field("処理",l_func),
        f_sh_disc_field("メッセージ",l_message)
      ],
      null
    )
    const c_message = f_sh_disc_message(l_txt,null,c_embed);
    f_sh_disc_send(c_id_wh_log_exe,c_message);
  };

  function f_mp_main_boot(l_func,l_http){
    switch (l_func){
      case "mail":
        f_pr_mail();
        break;
      case "rss":
        f_pr_rss();
        break;
      case "schedule":
        f_pr_schedule();
        break;
      case "pet":
        f_pr_pet();
        break;
      case "werther":
        f_pr_werther();
        break;
      case "plan":
        f_pr_plan();
        break;
      case "linebot":
        f_pr_linebot(l_http);
        break;
      case "esp32":
        f_pr_esp32(l_http);
        break;
    };
  };

//通常処理
  //mail
    function f_bt_mail(){
      f_sh_main("mail");
    };

    function f_pr_mail(){
      const c_mail_ary = GmailApp.getMessagesForThreads(GmailApp.search('is:unread',0,20));
      for(let i = 0; i < c_mail_ary.length; i++){
        for(let k = 0; k < c_mail_ary[i].length; k++){
          c_mail_ary[i][k].markRead();
        };
        f_mail_message(c_mail_ary[i][0]);
      };
    };

    function f_mail_message(l_mail){
      if(String(l_mail.getFrom()).slice(-31) == "<no-reply@classroom.google.com>"){
        f_mail_spe_classroom(l_mail);
        return;
      };
      const c_addresslist = f_sh_cache_get("gss_addresslist").split(",");
      let l_webhook = "";
      const c_mail_to = l_mail.getBcc().split(",").concat(l_mail.getCc().split(",")).concat(l_mail.getTo());
      for(let i = 0; i < c_addresslist[0].length; i++){
        for(let k = 0; k < c_mail_to.length; k++){
          if(c_addresslist[0][i] == c_mail_to[k]){
            l_webhook = c_addresslist[1][i];
            break;
          };
        };
      };
      //
      const c_author = f_sh_disc_author(l_mail.getFrom(),null,null);
      const c_embed = f_sh_disc_embed(
        l_mail.getSubject(),
        "https://mail.google.com/mail/u/0/#inbox/" + l_mail.getId(),
        l_mail.getPlainBody().substr(0,c_limit_mailbody),
        null,
        null,
        l_mail.getDate(),
        null,
        c_author,
        null,
        null
      );
      const c_message = f_sh_disc_message(null,null,c_embed);
      f_sh_disc_send(l_webhook,c_message);
    };

    function f_mail_spe_classroom(l_mail){
      const c_body = l_mail.getPlainBody().split("\n");
      const c_url = c_body[4].slice(1,-1);
      const c_body_plain = l_mail.getPlainBody();
      const c_name = c_body_plain.substr(c_body_plain.indexOf("投稿者:")+5).substr(0,c_body_plain.indexOf(" "));
      let l_txt = "";
      let i = 7;
      while(true){
        l_txt = l_txt + c_body[i];
        i++;
        if(String(c_body[i]).slice(0,5) == "詳細を表示" /*|| i > 100*/){
          break;
        }; 
      };
      const c_fields = [
        f_sh_disc_field("クラス",c_body[3],true),
        f_sh_disc_field("投稿者",c_name,true),
        f_sh_disc_field("内容",l_txt,false)
      ]
      const c_embed = f_sh_disc_embed(
        l_mail.getSubject().slice(3).replace("\n",""),
        c_url,
        null,
        null,
        null,
        new Date,
        null,
        null,
        c_fields,
        null
      );
      const c_message = f_sh_disc_message(null,null,c_embed);
      f_sh_disc_send("",c_message);
    };

  //rss
    function f_bt_rss(){
      f_sh_main("rss");
    };

    function f_pr_rss(){
      const c_rsslist = f_sh_cache_get("gss_rsslist").split(",");
      f_rss_proc(c_rsslist.slice(0,3),"nhk");
      f_rss_proc(c_rsslist.slice(3,6),"itmedia");
      f_rss_proc(c_rsslist.slice(6,9),"mynavi");
    };

    function f_rss_proc(l_rsslist,l_sitename){
      for(let i = 0; i < l_rsslist[0].length; i++){
        if(l_rsslist[1][i] == null || l_rsslist[1][i] == ""){
          break;
        };
        const c_rsstxt = UrlFetchApp.fetch(l_rsslist[1][i]).getContentText("utf-8");
        let l_rssary = [];
        switch(l_sitename){
          case "nhk":
            l_rssary = f_rss_nhk(c_rsstxt,new Date(Number(f_sh_ps_get("rss_" + "nhk_" + String(i)))));
            f_sh_ps_set("rss_" + "nhk_" + String(i),String(new Date));
            break;
          case "itmedia":
            l_rssary = f_rss_itmedia(c_rsstxt,new Date(Number(f_sh_ps_get("rss_" + "itmedia_" + String(i)))));
            f_sh_ps_set("rss_" + "itmedia_" + String(i),String(new Date));
            break;
          case "mynavi":
            l_rssary = f_rss_mynavi(c_rsstxt,new Date(Number(f_sh_ps_get("rss_" + "mynavi_" + String(i)))));
            f_sh_ps_set("rss_" + "mynavi_" + String(i),String(new Date));
            break;
        };
        if(l_rssary != [] && l_rssary != null){
          for(let k = 0; k < l_rssary.length; k++){
            const c_embed = f_sh_disc_embed(
              l_rssary[k]["title"],
              l_rssary[k]["url"],
              l_rssary[k]["body"],
              l_rssary[k]["img"],
              null,
              l_rssary[k]["time"],
              null,
              null,
              null,
              null
            );
            const c_message = f_sh_disc_message(null,null,c_embed);
            f_sh_disc_send(l_rsslist[2][i],c_message);
          };
        };
      };
    };

    function f_rss_dateconvert_A(l_date){//Fri, 19 Apr 2024 10:00:00 +0900
      return new Date(
        Number(l_date.substr(12,4)),//年
        f_sh_convert_month(l_date.substr(8,3))-1,//月
        Number(l_date.substr(5,2)),//日
        Number(l_date.substr(17,2)),//時
        Number(l_date.substr(20,2)),//分
        Number(l_date.substr(23,2)) //秒
      );
    };

    function f_rss_dateconvert_B(l_date){//2024-05-07T14:34:43+09:00
      return new Date(
        Number(l_date.substr(0,4)),//年
        Number(l_date.substr(5,3))-1,//月
        Number(l_date.substr(8,2)),//日
        Number(l_date.substr(11,2)),//時
        Number(l_date.substr(14,2)),//分
        Number(l_date.substr(17,2)) //秒
      );
    };

    //取得元別処理
      function f_rss_nhk(l_rsstxt,l_lastget){
        const c_newsary = Parser.data(l_rsstxt).from("<item>").to("</item>").iterate();
        let l_returnary = [];
        for(let i = 0; i < c_newsary.length; i++){
          const c_new = {
            "title": Parser.data(c_newsary[i]).from("<title>").to("</title>").build(),
            "url": Parser.data(c_newsary[i]).from("<link>").to("</link>").build(),
            "body": Parser.data(c_newsary[i]).from("<description>").to("</description>").build(),
            "time": f_rss_dateconvert_A(Parser.data(c_newsary[i]).from("<pubDate>").to("</pubDate>").build()),
            "img": null
          };
          if(l_lastget < c_new["time"]){
            l_returnary.push(c_new);
          }else{
            break;
          };
          if(i > 10){
            break;
          };
        };
        return l_returnary;
      };

      function f_rss_itmedia(l_rsstxt,l_lastget){
        const c_newsary = Parser.data(l_rsstxt).from("<item>").to("</item>").iterate();
        let l_returnary = [];
        for(let i = 0; i < c_newsary.length; i++){
          const c_new = {
            "title": Parser.data(c_newsary[i]).from("<title>").to("</title>").build(),
            "url": Parser.data(c_newsary[i]).from("<link>").to("</link>").build(),
            "body": Parser.data(c_newsary[i]).from("<description>").to("</description>").build(),
            "time": f_rss_dateconvert_A(Parser.data(c_newsary[i]).from("<pubDate>").to("</pubDate>").build()),
            "img": null
          };
          if(l_lastget < c_new["time"]){
            l_returnary.push(c_new);
          }else{
            break;
          };
          if(i > 10){
            break;
          };
        };
        return l_returnary;

      };

      function f_rss_mynavi(l_rsstxt,l_lastget){
        let l_newsary = Parser.data(l_rsstxt).from("<item").to("</item>").iterate();
        let l_returnary = [];
        for(let i = 0; i < l_newsary.length; i++){
          l_newsary[i] = l_newsary[i].substr(l_newsary[i].indexOf(">")+1);
          const c_new = {
            "title": Parser.data(l_newsary[i]).from("<title>").to("</title>").build(),
            "url": Parser.data(l_newsary[i]).from("<link>").to("</link>").build(),
            "body": Parser.data(l_newsary[i]).from("<description>").to("</description>").build(),
            "time": f_rss_dateconvert_B(Parser.data(l_newsary[i]).from("<dc:date>").to("</dc:date>").build()),
            "img": Parser.data(l_newsary[i]).from("<img>").to("</img>").build()
          };
          if(l_lastget < c_new["time"]){
            l_returnary.push(c_new);
          }else{
            break;
          };
          if(i > 10){
            break;
          };
        };
        return l_returnary;
      };

  //schedule
    function f_bt_schedule(){
      f_sh_main("schedule");
    };

    function f_pr_schedule(){
      const c_schedule_info = f_sh_cache_get("gss_schedule");//必要な情報
      let l_schedule = f_sh_gss_get("schedule",3,1,7,MAX);//実際の予定 今日を除外して呼び出し
      const c_homework = f_sh_gss_get("homework",1,1,MAX,MAX);//課題リスト

      for(let i = 0; i < 7; i++){
        for(let k = 0; k < l_schedule[i].length; k++){
          if(l_schedule[i][k] == "" || l_schedule[i][k] == null){
            l_schedule[i][k] = "-";
          };
          if(5 <= k <= 11){
            l_schedule[i][k] = f_mp_classname(l_schedule[i][k],c_schedule_info.slice(2,9));
            if(String(l_schedule[i][k]).slice(0,1) == "理"){
              l_schedule[i][k] = c_schedule_info[12][Number(l_schedule[i][k].substr(1,1))-1];
            };
          };
        };
      };

      let l_field_ary = [];
      for(let i = 0; i < 7; i++){
        let l_school = "学校無し";
        if(l_schedule[i][5] != "-"){
          l_school =
           "行事予定："+l_schedule[i][4]
          +"　時程："+l_schedule[i][3]+"\n"
          +"1:"+l_schedule[i][5]
          +"　2:"+l_schedule[i][6]
          +"　3:"+l_schedule[i][7]
          +"　4:"+l_schedule[i][8]+"\n"
          +"　5:"+l_schedule[i][9]
          +"　6:"+l_schedule[i][10]
          +"　7:"+l_schedule[i][11]
        };
        l_field_ary[i] = f_sh_disc_field(
          l_schedule[i][2]+"日",
          l_school,
          null
        );
      };
      const c_embed = f_sh_disc_embed(
        "1週間の予定",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        l_field_ary,
        null
      );
      const c_message = f_sh_disc_message(null,null,c_embed);
      f_sh_disc_send(c_schedule_info[1][0],c_message);

      for(let i = 2; 0 < i; i--){
        let l_field_ary = [];
        let l_school = "学校無し";

        l_field_ary[0] = "-";
        for(let k = 19; k < l_schedule[i].length; k++){
          if(k == 19){
            l_field_ary[0] = (l_schedule[i][k] + "/n");
          }else{
            l_field_ary[0].concat(l_schedule[i][k] + "/n");
          };
        };
        l_field_ary[0] = f_sh_disc_field("予定",l_field_ary[0],null);

        if(l_schedule[i][5] != "-"){
          l_school = "学校あり";
          l_field_ary[1] = f_sh_disc_field("課題",f_mp_gethomework(c_homework));
          l_field_ary[2] = f_sh_disc_field("行事予定",l_schedule[i][4]);
          
          for(let k = 0; k < 7; k++){
            let l_class = "-";
            for(let j = 0; j < c_schedule_info[9].length; j++){
              if(c_schedule_info[9][j] == l_schedule[i][k+5]){
                l_class = c_schedule_info[10][j];
                break;
              };
            };
            l_field_ary[k+3] = f_sh_disc_field(
              String(k+1)+"時限目",
              "科目:" + l_schedule[i][k+5] + " 教室:" + l_class + " メモ:" + l_schedule[i][k+5+7],
              null
            );
          };
        };

        const c_embed_2day = f_sh_disc_embed(
        l_schedule[i][1]+"月" + l_schedule[i][2]+"日",
        null,
        l_school,
        null,
        null,
        null,
        null,
        null,
        l_field_ary,
        null
        );
      const c_message_2day = f_sh_disc_message(null,null,c_embed_2day);
      f_sh_disc_send(c_schedule_info[1][1],c_message_2day);
      };
    };

    function f_mp_classname(l_class,l_info){
      switch (l_class.substr(0,1)){
        case "月":
          return l_info[Number(l_class.substr(1,1))-1][0];
          break;
        case "火":
          return l_info[Number(l_class.substr(1,1))-1][1];
          break;
        case "水":
          return l_info[Number(l_class.substr(1,1))-1][2];
          break;
        case "木":
          return l_info[Number(l_class.substr(1,1))-1][3];
          break;
        case "金":
          return l_info[Number(l_class.substr(1,1))-1][4];
          break;
        default:
          return l_class;
          break;
      };
    };

    function f_mp_gethomework(l_homework){
      let l_return = "";
      if(l_homework[0][0] != null && l_homework[0][0] != ""){
        for(let i = 0; i < c_homework_data.length; i++){
          l_return = l_return + "〜" + c_homework_data[i][0] + "月" + c_homework_data[i][1] + "日　" + c_homework_data[i][2] + "\n";
        };
      }else{
        l_return = "-";
      }
      return l_return;
    };

//未着手
  //pet
    function f_bt_pet(){
      f_sh_main("pet");
    };

    function f_pr_pet(){

    };

  //weather
    function f_bt_weather(){
      f_sh_main("weather");
    };

    function f_pr_werther(){

    };

  //plan
    function f_bt_plan(){
      f_sh_main("plan");
    };
  
    function f_pr_plan(){

    };

  //post
    function doPost(e){
      if(e.pathInfo == "/linebot"){
        f_sh_main("linebot",e);
      };
    };

    //linebot
      function f_pr_linebot(){

      };

  //get
    function doGet(e){
      if(e.pathInfo == "/esp32"){
        f_sh_main("esp32",e);
      };
    };

    //esp32
      function f_pr_esp32(){

      };
//
//
//旧Verーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
//schedule▽
    //SpreadsheetApp.openById(c_xls_db).getSheetByName("schedule").deleteRow(2);//昨日分を削除 行削除するコード

  function f_schedule_2days(l_gss_2days,l_webhook,l_cache_data){//ok
    for(let i = 0; i < 1; i++){//翌日...初期値0,範囲1　翌々日...初期値1,範囲1　翌日＋翌々日...初期値0,範囲2

      let l_school_tf = "学校無し";
      let l_fields = [];
      let l_plan = "-";
      let k = 8;
      while(l_gss_2days[i][k] != "-" && l_gss_2days[i][k] != ""){
        l_gss_2days[i][k];
        l_plan.concat(l_gss_2days[i][k]+"/n");
        k++;
      };
      l_fields[0] = f_sh_disc_field("予定",l_plan);
      if(l_gss_2days[i][4] != "-"){
        l_school_tf = "学校あり"
      l_fields[1] = f_sh_disc_field("課題",f_homework_get());
      l_fields[2] = f_sh_disc_field("行事予定",l_gss_2days[i][3])

        for(let k = 0; k < 7; k++){
          let l_class = "-";
          for(let n = 0; n < 7; n++){
            for(let k = 0; k < l_cache_data[7].length; k++){//教室を設定したクラスの数だけループ
              if(l_cache_data[7][k] == l_gss_2days[i][n+4]){//k番目の教科名==i日目の授業のk番目の授業名→二重ループにすべきだった！
                l_class = l_cache_data[8][k];//なぜ両方の数値が変化する？
                break;
              };
            };
          };
          l_fields[k+3] = f_sh_disc_field(String(k+1)+"時限目","科目:" + l_gss_2days[i][k+4] + " 教室:" + l_class + " メモ:" + l_gss_2days[i][k+4+7],true);
        };
      };

      const c_embed = f_sh_disc_embed(
        l_gss_2days[i][1]+"日",
        null,
        l_school_tf,
        null,
        null,
        null,
        null,
        null,
        l_fields,
        null
      );
      const c_message = f_sh_disc_message(null,null,c_embed);
      f_sh_disc_send(l_webhook,c_message);
    };
  };

//plan_inform_reserve▽
  function f_proc_plan_inform_reserve(){//ok
    const c_time_now = new Date;
    const c_gss_data = f_get_gss("schedule",2,1,2,"MAX");
    let c_today_data = [];
    if(c_gss_data[0][1] == String(c_time_now.getDate())){
      c_today_data = c_gss_data[0].splice(0,18);
    }else{
      c_today_data = c_gss_data[1].splice(18);
    };
    f_ps_set("plan","")
    for(let i = 0; i < c_today_data.length; i++){
      const c_plan_time = f_sh_date_plus(f_sh_date_set(c_time_now,[,,,c_today_data[i].substr(0,2),c_today_data[i].substr(3,2),0,0]),c_plan_inform_int);
      const c_next_time = f_sh_date_plus(c_time_now,c_func_int["f_b_plan_inform_reserve"])
      if(c_time_now < c_plan_time && c_plan_time <= c_next_time){
        if(i == 0){
          f_ps_set("plan",[c_today_data[i].substr(6)].join(','))
        }else{
          f_ps_set("plan",f_ps_get("plan").split(",").concat([c_today_data[i].substr(6)]).join(','));
        };
        f_set_trigger("f_b_plan_inform",c_plan_time);
      };
    };
  };

//plan_inform▽
  function f_proc_plan_inform(){//ok
    const c_plan_name = f_ps_get("plan").split(",")[0];
    f_ps_set("plan",Array(f_ps_get("plan").split(",").splice(1)).join(','));
    const c_webhook = f_get_cache(c_cache_schedule+13,1)[0][2];
    const c_embeds = f_sh_disc_embed(
      c_plan_name,
      null,
      null,
      null,
      null,
      new Date,
      "FF9900",
      null,
      null,
      null
    );
    const c_message = f_sh_disc_message(null,null,c_embeds);
    f_sh_disc_send(c_webhook,c_message);
  };

//homework▽
  function f_proc_homework(){//ok
    let l_sent_data = f_homework_get();
    if(l_sent_data != "＿\n"){
      const c_message = f_sh_disc_message(l_sent_data,null,null);
      f_sh_disc_send(f_get_cache(c_cache_schedule+13,1)[0][3],c_message);
    };
  };

  function f_homework_get(){//ok
    const c_homework_data = f_get_gss("homework",1,1,"MAX",3);
    let l_return = "＿\n";
    for(let i = 0; i < c_homework_data.length; i++){
      l_return = l_return +"〜"+c_homework_data[i][0]+"月"+c_homework_data[i][1]+"日　"+c_homework_data[i][2]+"\n";
    };
    return l_return;
  };
//
//fin.
































