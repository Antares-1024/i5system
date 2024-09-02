/*
[コーディングルール]
・命名規則
  ・関数　f_
  ・変数　l_
  ・定数　c_
・変数は極力varではなくletを使う
・GSSのへ読み込みは書き込みより先に行う
・ブラックボックスを作らない
・過度に自由度を意識しない→プログラムが冗長かつ難解になる
*/

//メモ
  /*
  プロパティ使用状況　→システム監視にリセット機能を組み込む
    キャッシュ　cache_nn_n　→引き継ぎ不要
    システム稼働状況　stop　→引き継ぎ不要
    システム動作時間　runtime　→引き継ぎ不要
    予定バッファ　plan　→引き継ぎ(ほぼ)不要
    最終取得rss　news_last_〇〇　→引き継ぎ必須
  その他
    Discordの送信
    →レート制限食らったら送れるまで繰り返し送り続けるという強引な処理だが大丈夫？
  */

//環境変数▽
  //マスターID▽
    const c_disc_id = "";//ディスコードのアカウントID
    const c_admin_address = "";//メイン実行アカウントのアドレス
    const c_system_webhook = "" //システムメッセージ用のWebhookURL
    const c_execute_log_webhook = ""; //実行ログ用のwebhookURL
    const c_xls_db = ""; //データベースGSSのID
  //関数オートトリガー系▽
    //関数登録 ※システム監視とdopostを除く全てのトリガー関数を登録するように
    const c_func_num_int = ["f_b_cache","f_b_mail","f_b_plan_inform_reserve","f_b_rss"];//定期実行(1日の初回起動) ※f_b_cacheは"自己トリガー"のため注意
    const c_func_num_res = ["f_b_schedule","f_b_homework","f_b_pet_inform","f_b_weather"];//定時実行
    //実行間隔 年、月、日、時、分、秒、ミリ秒
    const c_func_int = {
      "f_b_cache": [,,,12,,,],
      "f_b_mail": [,,,,30,,],
      "f_b_plan_inform_reserve": [,,,,30,,],
      "f_b_rss": [,,,,30,,]
    };
    const c_int_cache = [,,,12,,,];
    //実行時刻 年、月、日、時、分、秒、ミリ秒
    const c_func_res = {
      "f_b_schedule": [,,,18,0,,],
      "f_b_homework": [,,,18,0,,],
      "f_b_pet_inform": [,,,21,0,,],
      "f_b_weather": [,,,21,0,,]//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー仮数値
    };
  //設定▽
    //キャッシュ位置▽ ※1スタート
      const c_cache_schedule = 1;
      const c_cache_mail = 15;
      const c_cache_rss = 17;
    //その他
    const c_stop_time = 80;//実行時間上限(分指定)
    const c_mail_get_limit = 100;//未読メール取得数上限
    const c_mail_txt_limit = 200;//メールの文字数上限
    const c_plan_inform_int = [,,,,-10,,];//予定通知を行う時間(マイナスで指定)
    const c_rss_limit = 10;//RSSの取得数上限

//開発関数▽
  function dev_boot_i5system(){//ok システム起動
    /*  <------稼働前チェックリスト-------->
        ・キャッシュ位置の設定は正しい？
        ・scheduleシートの最上段は>>>昨日の<<<日付になっている？
        ・今日はほかのシステムを稼働させていない？
        ・別垢はちゃんとGUIの定期発火トリガーを設定した？
    */
    const now_time = new Date;
    dev_ps_reset()
    f_set_trigger("f_b_surveil",f_date_plus(f_date_set(now_time,[,,,0,0,,]),[,,1,,,,]));
  };

  function dev_ps_reset(){ //ok　キャッシュリセット
    Logger.log(PropertiesService.getScriptProperties().getProperties())
    PropertiesService.getScriptProperties().deleteAllProperties()
    Logger.log(PropertiesService.getScriptProperties().getProperties())
    f_gss_cache();
    Logger.log(PropertiesService.getScriptProperties().getProperties())
  };

//基盤関数▽
  //Discord▽
    function f_disc_send(l_hook_url,l_message){//ok
      const c_payload = {
        "method": "post",
        "headers": {"Content-type": "application/json"},
        "muteHttpExceptions": true,
        "payload": JSON.stringify(l_message)
        };
      while(true){//429エラーが出たら送信完了するまで送り返す
        try{
          UrlFetchApp.fetch(l_hook_url, c_payload);
          break;
        }catch(e){
          break;
          /*
          const c_429_error = "Request failed for https://discord.com returned code 429. Truncated server response: {\"message\": \"You are being rate limited.\", \"retry_after\": 0.3, \"global\": false} (use muteHttpExceptions option to examine full response)";//エラーメッセージ
          if(e.message != c_429_error){
            const c_time = new Date;
            const c_embed = f_disc_make_embed(
              "送信失敗",
              null,
              null,
              null,
              null,
              new Date,
              "FF0000",
              null,
              [
                f_disc_make_field("エラーが発生した処理","Discord送信"),
                f_disc_make_field("停止時刻",String(c_time.getHours())+"時"+String(c_time.getMinutes())+"分"),
                f_disc_make_field("エラーメッセージ",e.message),
                f_disc_make_field("送信しようとした内容",l_message)
              ],
              null
            );
            const c_message = f_disc_make_message("<@"+c_disc_id+">",null,c_embed);
            f_disc_send(c_execute_log_webhook,c_message);
            break;
          };
          Utilities.sleep(100);
          */
        };
      };
    };

    function f_disc_make_message(arg_content,arg_username,arg_embeds){//ok
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

    function f_disc_make_embed(arg_title,arg_url,arg_description,arg_thumbnail_url,arg_image_url,arg_timestamp,arg_color/*hex*/,arg_author,arg_fields/*ary*/,arg_footer){//ok
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

    function f_disc_make_field(arg_name,arg_value,arg_inline){//ok
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

    function f_disc_make_footer(arg_text,arg_icon_url){//ok
      return {
        "text": arg_text,
        "icon_url": arg_icon_url
      };
    };

    function f_disc_make_author(arg_name,arg_url,arg_icon_url){//ok
      return {
        "name": arg_name,
        "url": arg_url,
        "icon_url": arg_icon_url
      };
    };

  //Date計算▽
    function f_date_plus(l_time,l_plus){ //ok 年、月、日、時、分、秒、ミリ秒
      let l_return = new Date(l_time);
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
      return l_return;
    };

    function f_date_set(l_time,l_set){ //ok 年、月、日、時、分、秒、ミリ秒
      let l_return = new Date(l_time);
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
      return l_return;
    };

  //GSS▽
    function f_get_gss(l_sheet_name,l_start_row,l_start_column,l_get_row,l_get_column){//ok シート名、開始行、開始列、取得行数、取得列数→index1で行、index2で列
      const c_ss = SpreadsheetApp.openById(c_xls_db).getSheetByName(l_sheet_name);
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
  //PS▽
    function f_ps_set(l_key,l_str){//ok
      const c_ps = PropertiesService.getScriptProperties();
      return c_ps.setProperty(l_key,l_str);
    };

    function f_ps_get(l_key){//ok
      const c_ps = PropertiesService.getScriptProperties();
      return c_ps.getProperty(l_key);
    };
  //トリガー▽
    function f_set_trigger(l_func,l_time){ //ok
      l_time = f_date_set(l_time,[,,,,,0,]);
      l_time = f_date_set(l_time,[,,,,,,0]);
      ScriptApp.newTrigger(l_func).timeBased().at(l_time).create();
    };

    function f_del_trigger(l_func) { //ok
      const c_trigger = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_trigger.length; i++){
        if(c_trigger[i].getHandlerFunction() == l_func){
          ScriptApp.deleteTrigger(c_trigger[i]);
          break;
        };
      };
    };
  //キャッシュ(もどき)取得▽
    function f_get_cache(l_start,l_num){//ok 開始行,取得行数(1スタート)→二次元化した配列
      let get_data = [];
      for(let i = l_start; i < l_start + l_num; i++){
        let l_data_ary = [];
        let k = 0;
        while(true){
          if(f_ps_get("cache"+ String(i-1).padStart(2,"0") + "_" + String(k)) != null){
            l_data_ary[k] = String(f_ps_get("cache"+ String(i-1).padStart(2,"0") + "_" + String(k))).split(",");
            k++;
          }else{
            break;
          }
        };
        get_data[i - l_start] = [];
        for(let n = 0; n < k; n++){
          get_data[i - l_start] = get_data[i - l_start].concat(l_data_ary[n]);
        };
      };
      return get_data;
    };
  //月変換▽ ※-1してない
    function f_month_convert(l_month){//Dateに合わせて-1は>>していない<<
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

//特殊関数▽
  //システム監視▽
    function f_b_surveil(){//ok システム監視
      const c_time_boot = new Date;
      f_boot_int(c_time_boot);
      f_boot_res(c_time_boot);
      f_del_trigger("f_b_surveil");
      f_set_trigger("f_b_surveil",f_date_plus(f_date_set(c_time_boot,[,,,0,0,0,0]),[,,1,,,,]));
      f_system_check();
    };

    function f_boot_int(c_time){//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーdebug
      for(let i = 0; i < c_func_num_int.length; i++){
        f_del_trigger(c_func_num_int[i]);
      };
      c_time = f_date_plus(c_time,[0,0,0,0,1,0,0]);
      for(let i = 0; i < c_func_num_int.length; i++){
        f_set_trigger(c_func_num_int[i],c_time);
      };
    };

    function f_boot_res(c_time){//ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーdebug
      for(let i = 0; i < c_func_num_res.length; i++){
        f_del_trigger(c_func_num_res[i]);
      };
      for(let i = 0; i < c_func_num_res.length; i++){
        f_set_trigger(c_func_num_res[i],f_date_set(c_time,c_func_res[c_func_num_res[i]]));
      };
    };

    //システムチェック▽
      function f_system_check(){//ok
        const now_time = f_date_plus(new Date,[0,0,-1,0,0,0,0]);
        let l_color = 0;
        if(f_ps_get("stop")==0){
          l_color = "0000FF";
        }else{
          l_color = "FF6600";
        };
        const c_runtime = f_runtime_check();
        const c_embed = f_disc_make_embed(
          String(now_time.getMonth()+1)+"月"+String(now_time.getDate())+"日"+"のシステム稼働レポート",
          null,
          f_stop_check(),
          null,
          null,
          new Date,
          l_color,
          null,
          [
            f_disc_make_field("稼働時間",c_runtime["min"] + "分" + c_runtime["sec"] + "秒" + c_runtime["msec"] + "ミリ秒" + "/90分"),
            f_disc_make_field("DBのセル使用数",f_cell_check() + "セル" + "/1000万セル")
          ],
          null
        );
        const c_message = f_disc_make_message(null,null,c_embed)
        f_disc_send(c_system_webhook,c_message);
      };

      function f_runtime_check(){//ok
        let l_runtime_obj = {};
        const c_runtime = Number(f_ps_get("runtime"));
        l_runtime_obj["msec"] = c_runtime % 1000;
        let count = Math.floor(c_runtime / 1000);
        l_runtime_obj["sec"] = count % 60;
        count = Math.floor(count / 60);
        l_runtime_obj["min"] = count;
        f_ps_set("runtime","0");
        return l_runtime_obj;
      };

      function f_cell_check(){//ok
        let l_message = "";
        const c_ss = SpreadsheetApp.openById(c_xls_db).getSheets();
        let l_count = 0;
        for (let i = 0; i < c_ss.length; i++) {
          l_count = l_count + c_ss[i].getMaxRows() * c_ss[i].getMaxColumns();
        };
        if(l_count >= 10000){
          l_message = Math.floor(l_count / 10000) + "万";
          l_count = l_count % 10000;
        };
        return l_message + l_count ;
      };

      function f_stop_check(){//ok
        const c_stop = f_ps_get("stop");
        f_ps_set("stop","0");
        if(c_stop == "0"){
          return "システムは正常に動作しました。";
        }else{
          return "システムは" + c_stop + "に停止しました。";
        };
      };


  //キャッシュ(もどき)▽
    function f_b_cache(){//ok GSSのキャッシュ  0-4 tt | 5-9 room | 10-11 rss | 12-13 line | 14-16 address | 17 block
      const c_time_boot = new Date;
      const c_time = f_date_plus(c_time_boot,c_func_int["f_b_cache"]);
      if(c_time.getDate == c_time_boot.getDate){
        f_del_trigger("f_b_cache");
        f_set_trigger("f_b_cache",c_time);
      };
      f_gss_cache();
    };

    function f_gss_cache(){//ok
      const c_xls_data = f_get_gss("cache",1,1,"MAX","MAX");
      for(let i = 0; i < c_xls_data.length; i++){
        let k = 0;
        while(c_xls_data[i].length >= 10*k){
          f_ps_set("cache" + String(i).padStart(2,"0") + "_" + String(k), c_xls_data[i].slice(10*k,10*(k+1)-1).join(','));
          k++;
        };
      };
    };


//起動関数▽
  //HTTPリクエスト▽
    function doPost(e){//httpリクエスト受信
      f_b_http(e);
    };

  //トリガー▽
    function f_b_mail(){//メール通知
      const c_user = Session.getActiveUser().getEmail();
      if(c_user == c_admin_address){
        f_main("mail");
      }else{
        f_proc_mail();
      };
    };

    function f_b_schedule(){//予定転送
      f_main("schedule");
    };

    function f_b_plan_inform_reserve(){//予定通知予約
      f_main("plan_inform_reserve");
    };

    function f_b_plan_inform(){//予定通知
      f_main("plan_inform");
    };

    function f_b_homework(){//課題通知
      f_main("homework");
    };

    function f_b_pet_inform(){//ペット通知
      f_main("pet_inform");
    };

    function f_b_weather(){//天気予報
      f_main("weather");
    };

    function f_b_rss(){//rss
      f_main("rss");
    };

    function f_b_http(http_post){//DB簡易編集
      f_main("http",http_post);
    };

//共通関数▽
  function f_main(l_boot_func,http_post){//ok
    try{
      f_main_boot(l_boot_func,http_post);
      const c_time = new Date;
      const c_embed = f_disc_make_embed(
        "実行完了",
        null,
        null,
        null,
        null,
        new Date,
        "008000",
        null,
        [
          f_disc_make_field("完了した処理",l_boot_func),
          f_disc_make_field("完了時刻",String(c_time.getHours())+"時"+String(c_time.getMinutes())+"分")
        ],
        null
      );
      const c_message = f_disc_make_message(null,null,c_embed);
      f_disc_send(c_execute_log_webhook,c_message);
    }catch(e){
      const c_time = new Date;
      const c_embed = f_disc_make_embed(
        "実行失敗",
        null,
        "エラーが発生した処理を中断し、プログラムを終了させます",
        null,
        null,
        new Date,
        "FF0000",
        null,
        [
          f_disc_make_field("エラーが発生した処理",l_boot_func),
          f_disc_make_field("停止時刻",String(c_time.getHours())+"時"+String(c_time.getMinutes())+"分"),
          f_disc_make_field("エラーメッセージ",e.message)
        ],
        null
      );
      const c_message = f_disc_make_message("<@"+c_disc_id+">",null,c_embed);
      f_disc_send(c_execute_log_webhook,c_message);
    };
  };

  function f_main_boot(l_boot_func,http_post){
    const c_time_start = new Date;
    if(f_canboot()){
      f_main_boot_junction(l_boot_func,http_post);
    }else{
      for(let i = 0; i < c_func_num_int.length; i++){
        f_del_trigger(c_func_num_int[i]);
      };
      for(let i = 0; i < c_func_num_res.length; i++){
        f_del_trigger(c_func_num_res[i]);
      };
      f_ps_set("stop",String(c_time_start.getHours() + ":" + c_time_start.getMinutes()));
      const c_embed = f_disc_make_embed(
        "アラート：システム停止",
        null,
        "surveilを除く全てのトリガーを削除しました",
        null,
        null,
        c_time_start,
        "FF0000",
        null,
        [
          f_disc_make_field("原因","実行時間制限の超過間際のため"),
          f_disc_make_field("停止時刻",String(c_time_start.getHours())+"時"+String(c_time_start.getMinutes())+"分"),
        ],
        null
      );
      const c_message = f_disc_make_message("<@"+c_disc_id+">",null,c_embed);
      f_disc_send(c_system_webhook,c_message);
    };
    const c_time_end = new Date;
    f_runtime(c_time_start,c_time_end);
  };

  function f_canboot(){//ok
    return Number(f_ps_get("runtime")) < c_stop_time*60000;
  };

  function f_runtime(l_time_start,l_time_end){//ok
    f_ps_set("runtime",String(Number(f_ps_get("runtime")) + (l_time_end - l_time_start)));
    return;
  };

  function f_main_boot_junction(l_boot_func,http_post){
    switch(l_boot_func){
      case "mail":
        f_proc_mail();
        break;
      case "schedule":
        f_proc_schedule();
        break;
      case "plan_inform_reserve":
        f_proc_plan_inform_reserve();
        break;
      case "plan_inform":
        f_proc_plan_inform();
        break;
      case "homework":
        f_proc_homework();
        break;
      case "pet_inform":
        f_proc_pet_inform();
        break;
      case "weather":
        f_proc_weather();
        break;
      case "rss":
        f_proc_rss();
        break;
      case "http":
        f_proc_http(http_post);
        break;
    };
  };

//mail▽
  function f_proc_mail(){//ok
    const c_mail_ary = GmailApp.getMessagesForThreads(GmailApp.search('is:unread',0,c_mail_get_limit));
    for(let i = 0; i < c_mail_ary.length; i++){
      for(let k = 0; k < c_mail_ary[i].length; k++){
        c_mail_ary[i][k].markRead();
      };
      const c_address_list = f_get_cache(c_cache_mail,2);
      f_mail_message(c_mail_ary[i][0],c_address_list);
    };
    const c_user = Session.getActiveUser().getEmail();
    if(c_user == c_admin_address){
      f_set_all_trigger();
    };
      f_set_mail_trigger();
  };

  function f_mail_message(l_mail,l_address_list){//ok
    if(String(l_mail.getFrom()).slice(-31) == "<no-reply@classroom.google.com>"){
      f_spe_mail_classroom(l_mail);
      return;
    };
    let l_webhook = "";
    for(let i = 0; i < l_address_list[0].length; i++){
      if(l_address_list[0][i] == l_mail.getTo()){
        l_webhook = l_address_list[1][i];
        break;
      };
    };
    if(l_webhook == ""){
      return;
    };
    const c_author = f_disc_make_author(l_mail.getFrom(),null,null);
    const c_embed = f_disc_make_embed(
      l_mail.getSubject(),
      "https://mail.google.com/mail/u/0/#inbox/" + l_mail.getId(),
      l_mail.getPlainBody().substr(0,c_mail_txt_limit),
      null,
      null,
      l_mail.getDate(),
      null,
      c_author,
      null,
      null
    );
    const c_message = f_disc_make_message(null,null,c_embed);
    f_disc_send(l_webhook,c_message);
  };

  function f_spe_mail_classroom(l_mail){
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
      f_disc_make_field("クラス",c_body[3],true),
      f_disc_make_field("投稿者",c_name,true),
      f_disc_make_field("内容",l_txt,false)
    ]
    const c_embed = f_disc_make_embed(
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
    const c_message = f_disc_make_message(null,null,c_embed);
    const c_webhook = ""
    f_disc_send(c_webhook,c_message);
  };

  function f_set_all_trigger(){//ok
    const c_time_now = new Date;
    const c_time_next = f_date_set(f_date_plus(c_time_now,c_func_int["f_b_mail"]),[,,,,,0,0]);
    for(let i = 0; i < c_func_num_int.length; i++){
      if(c_func_num_int[i] != "f_b_cache" && c_func_num_int[i] != "f_b_mail"){
        let k = 0;
        while(true){
          let c_time_boot = f_date_set(c_time_now,[,,,0,0,0,0]);
          for(let n = 0; n < k; n++){
            c_time_boot = f_date_plus(c_time_boot,c_func_int[c_func_num_int[i]]);
          };
          if(c_time_now < c_time_boot && c_time_boot <= c_time_next){
            f_del_trigger(c_func_num_int[i]);
            f_set_trigger(c_func_num_int[i],c_time_boot);
          };
          if(c_time_next < c_time_boot){
            break;
          };
          k++;
        };
      };
    };
  };

  function f_set_mail_trigger(){//ok
    const c_time_next = f_date_set(f_date_plus(new Date,c_func_int["f_b_mail"]),[,,,,,0,0]);
    f_del_trigger("f_b_mail");
    f_set_trigger("f_b_mail",c_time_next);
  };

//schedule▽
  function f_proc_schedule(){
    SpreadsheetApp.openById(c_xls_db).getSheetByName("schedule").deleteRow(2);//昨日分を削除
    const c_gss_data = f_get_gss("schedule",3,1,7,"MAX");//翌日以降を呼び出し
    const c_cache_data = f_get_cache(c_cache_schedule,14);
    for(let i = 0; i < 7; i++){
      for(let k = 0; k < 18; k++){
        if(c_gss_data[i][k] == ""){
          c_gss_data[i][k] = "-";
        };
        if(4 <= k <= 10){
          c_gss_data[i][k] = f_class_name(c_cache_data,c_gss_data[i][k]);
        };
      };
    };
    for(let i = 0; i < 7; i++){
      for(let k = 0; k < 7; k++){
        if(c_gss_data[i][k].substr(0,1) == "理"){
          c_gss_data[i][k] = c_cache_data[0][4+Number(c_gss_data[i][k].substr(1,1))];
        };
      };
    };
    f_schedule_week(c_gss_data,c_cache_data[13][0]);
    f_schedule_2days(c_gss_data,c_cache_data[13][1],c_cache_data);
  };

  function f_class_name(l_cache_data,l_class){//ok
    switch (l_class.substr(0,1)){
      case "月":
        return l_cache_data[Number(l_class.substr(1,1))-1][0];
        break;
      case "火":
        return l_cache_data[Number(l_class.substr(1,1))-1][1];
        break;
      case "水":
        return l_cache_data[Number(l_class.substr(1,1))-1][2];
        break;
      case "木":
        return l_cache_data[Number(l_class.substr(1,1))-1][3];
        break;
      case "金":
        return l_cache_data[Number(l_class.substr(1,1))-1][4];
        break;
      default:
        return l_class;
        break;
    };
  };

  function f_schedule_week(l_gss_week,l_webhook){//ok
    let l_field_ary = [];
    for(let i = 0; i < 7; i++){
      let c_school = "学校無し";
      if(l_gss_week[i][4] != "-"){
        c_school = "行事予定："+l_gss_week[i][3]+"　時程："+l_gss_week[i][2]+"\n"+
        "1:"+l_gss_week[i][4]+"　2:"+l_gss_week[i][5]+"　3:"+l_gss_week[i][6]+"　4:"+l_gss_week[i][7]+"　5:"+l_gss_week[i][8]+"　6:"+l_gss_week[i][9]+"　7:"+l_gss_week[i][10]
      };
      l_field_ary[i] = f_disc_make_field(
        l_gss_week[i][1]+"日",
        c_school,
        null
      );
    };
    const c_embed = f_disc_make_embed(
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
    const c_message = f_disc_make_message(null,null,c_embed);
    f_disc_send(l_webhook,c_message);
  };

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
      l_fields[0] = f_disc_make_field("予定",l_plan);
      if(l_gss_2days[i][4] != "-"){
        l_school_tf = "学校あり"
      l_fields[1] = f_disc_make_field("課題",f_homework_get());
      l_fields[2] = f_disc_make_field("行事予定",l_gss_2days[i][3])
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
          l_fields[k+3] = f_disc_make_field(String(k+1)+"時限目","科目:" + l_gss_2days[i][k+4] + " 教室:" + l_class + " メモ:" + l_gss_2days[i][k+4+7],true);
        };
      };
      const c_embed = f_disc_make_embed(
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
      const c_message = f_disc_make_message(null,null,c_embed);
      f_disc_send(l_webhook,c_message);
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
      const c_plan_time = f_date_plus(f_date_set(c_time_now,[,,,c_today_data[i].substr(0,2),c_today_data[i].substr(3,2),0,0]),c_plan_inform_int);
      const c_next_time = f_date_plus(c_time_now,c_func_int["f_b_plan_inform_reserve"])
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
    const c_embeds = f_disc_make_embed(
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
    const c_message = f_disc_make_message(null,null,c_embeds);
    f_disc_send(c_webhook,c_message);
  };

//homework▽
  function f_proc_homework(){//ok
    let l_sent_data = f_homework_get();
    if(l_sent_data != "＿\n"){
      const c_message = f_disc_make_message(l_sent_data,null,null);
      f_disc_send(f_get_cache(c_cache_schedule+13,1)[0][3],c_message);
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

//pet_inform▽　未着手(前提部(http)が未完成)
  function f_proc_pet_inform(){
    return
  };

//weather▽　未着手(気象庁RSSの理解不足)
  function f_proc_weather(){
    return
  };

//rss▽
  function f_proc_rss(){//ok
    let l_rss_list = f_get_cache(c_cache_rss,3);
    l_rss_list[0].shift();//1列目は特殊処理する気象庁なので削除
    l_rss_list[1].shift();
    l_rss_list[2].shift();
    for(let i = 0; i < l_rss_list[1].length; i++){
      if(l_rss_list[1][i] != ""){
        const c_rss_txt = f_get_rss(l_rss_list[1][i]);
        f_processing_rss(l_rss_list[0][i],c_rss_txt,l_rss_list[2][i]);
      };
    };
  };

  function f_get_rss(l_rss_url){//ok
    return UrlFetchApp.fetch(l_rss_url).getContentText("utf-8");
  };

  function f_processing_rss(l_rss_name,l_rss_txt,l_rss_hook){//ok
    const c_news_ary = Parser.data(l_rss_txt).from("<item>").to("</item>").iterate();
    const c_last_get = f_ps_get("news_last_"+l_rss_name);
    f_ps_set("news_last_"+l_rss_name,Parser.data(c_news_ary[0]).from("<pubDate>").to("</pubDate>").build());//記事のアップ時間を重複判定の基準に
    for(let i = 0; i < c_news_ary.length; i++){
      if(Parser.data(c_news_ary[i]).from("<pubDate>").to("</pubDate>").build() == c_last_get){
        break;//重複した時点で処理中止
      };
      f_rss_send(
        l_rss_hook,
        Parser.data(c_news_ary[i]).from("<title>").to("</title>").build(),
        Parser.data(c_news_ary[i]).from("<link>").to("</link>").build(),
        Parser.data(c_news_ary[i]).from("<pubDate>").to("</pubDate>").build(),
        Parser.data(c_news_ary[i]).from("<description>").to("</description>").build()
      );
      if(i > c_rss_limit){
        break;
      };
    };
  };

  function f_rss_send(l_rss_hook,l_rss_title,l_rss_link,l_rss_punDate,l_rss_description){//ok
    const c_timestamp = f_convert_rss_date(l_rss_punDate);
    if(l_rss_title.substr(0,3) == "PR:"){
      return;
    };
    const c_embeds = f_disc_make_embed(
      l_rss_title,
      l_rss_link,
      l_rss_description,
      null,
      null,
      c_timestamp,
      null,
      null,
      null,
      null
    );
    const c_message = f_disc_make_message(null,null,c_embeds);
    f_disc_send(l_rss_hook,c_message);
  };

  function f_convert_rss_date(l_rss_time){//ok
    //Fri, 19 Apr 2024 10:00:00 +0900　RSSの時間フォーマット
    return new Date(
      Number(l_rss_time.substr(12,4)),//年
      f_month_convert(l_rss_time.substr(8,3))-1,//月
      Number(l_rss_time.substr(5,2)),//日
      Number(l_rss_time.substr(17,2)),//時
      Number(l_rss_time.substr(20,2)),//分
      Number(l_rss_time.substr(23,2)) //秒
    );
  };

//http▽　未着手(HTTPの理解不足＆前提(ESP32)が未完成)
  function f_proc_http(){
    return
  };

//
//fin.
































