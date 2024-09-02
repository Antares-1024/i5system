
const 公開チャンネル_予定 = "";
const 公開チャンネル_クラスルーム通知 = "";

/*
----------------<命名規則>--------------------
  ・命名規則
    ・関数　f_
      ・開発　dv_
      ・起動　bt_
      ・共有　sh_
      ・個別　mp_
      ・通常　pr_
      ・初期化　rs_
    ・変数　l_
    ・定数　c_
----------------<覚書>------------------------
  ・KEY Properties Service
    ・stop 停止時刻を記録
    ・runtime 実行時間を記録
    ・rss_ rssの最終取得時間
    ・weather_lastget　ファイル自体
    ・weather_data_lastget　気象データ
  ・KEY Chache Servise
    ・gss_ GSSキャッシュ
    ・plan 予定(内容のみ)
  ・GETリクエスト
    ?from=esp32
      ?type=report wheel=n tmp1=n tmp2=n tmp3=n　→定期レポート
      ?type=stop　→システム停止 手動再起動必要
      ?type=income　→インターホン
      ?type=call　→呼び出し
      ?type=tmp_high tmp=n　→高温アラート
      ?type=tmp_low tmp=n　→低温アラート
  ・POSTリクエスト
    ?from=linebot
  ・起動関数
    トリガー
    ・f_bt_surveillance　0時
    ・f_bt_cache　5時間ごと&0時
    ・f_bt_mail　5分ごと
    ・f_bt_rss　1時間ごと
    ・f_bt_train　1時間ごと
    ・f_bt_schedule(予定+課題)　18時
    ・f_bt_pet　20時
    ・f_bt_weather  ?時
    ・f_bt_plan　不定期
    POSTリクエスト
    ・linebot
    GETリクエスト
    ・esp32
----------------<情報(識別子等)>---------------
  ライブラリ"Perser"：1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw
  LineBotトークン：
----------------<コメント>-----------------
  0時に実行されるシステムリセット関数
  定期実行のトリガー設定関数
  それによって呼び出される各種処理関数によって構成されている
  各種処理関数は実行時間カウントや実行ログのためにメイン処理関数を通してから実行

  //dev_curb　がついている部分は開発環境のための制限
*/

//環境変数
  //ID
    const c_id_gss = "";
    const c_id_mainacct = "";
    const c_id_discacct = "1";
    const c_id_wh_log_opr = "";//稼働
    const c_id_wh_log_exe = "";//実行
    const c_id_wh_ex_wh = "";//例外
    const c_id_linebot_token = "";
    const c_id_linebot_token_pet = "";
    const c_id_lineacct_main = "";
  //リスト
    const c_list_func = //トリガー名と実行間隔/時刻のペア
    [
      [//定期
        ["f_bt_cache",[,,,3,,,]],
        ["f_bt_mail",[,,,,10,,]],
        ["f_bt_rss",[,,,1,,,]],
        ["f_bt_weather",[,,,3,,,]],
        ["f_bt_train",[,,,1,,,]],
        ["f_bt_sukasuka",[,,,3,,,]]
      ],
      [//定時
        ["f_bt_schedule",[,,,18,,,]],
        ["f_bt_pet",[,,,20,,,]],
        ["f_bt_train_rs",[,,,4,,,]]
      ]
    ];
  //設定
    const c_limit_runtime = 80*60*1000;
    const c_limit_mailbody = 200;

//*開発用関数
  function f_system_boot(){
    f_sh_ps_set("firstboot","1");//1を渡した場合は起動時用の設定を行う
    f_sh_trigger_set("f_bt_surveillance",f_sh_date(new Date,[,,1,,,,],[,,,0,0,0,0]))
  };

  function f_dv_ps_del(){
    Logger.log(PropertiesService.getScriptProperties().getProperties())
    PropertiesService.getScriptProperties().deleteAllProperties()
    Logger.log(PropertiesService.getScriptProperties().getProperties())
  };

//*共有関数
  //*Discord
    //関数を組み合わせてメッセージを作成しsendで送信

    function f_sh_disc_send(l_hook_url,l_message){
      const c_payload = {
        "method": "post",
        "headers": {"Content-type": "application/json"},
        "muteHttpExceptions": true,
        "payload": JSON.stringify(l_message)
      };

      //URL指定に失敗した場合に送信予定だった内容が消えるのを防止
      if(l_hook_url == "" || l_hook_url == null || l_hook_url.substr(0,33) != "https://discord.com/api/webhooks/"){
        l_hook_url = c_id_wh_ex_wh;
      };

      //レート制限対策
      while(true){
        let l_response = "";
        try{
          l_response = UrlFetchApp.fetch(l_hook_url, c_payload);
          break;
        }catch(e){
          if(e.message.slice(56) == "Request failed for https://discord.com returned code 429."){
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
    
  //*Date
    //※操作しない部分は0ではなくnull
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

  //*GSS
    function f_sh_gss_get(l_sheet_name,l_start_row,l_start_column,l_get_row,l_get_column){
      //範囲指定失敗によるエラーを回避
      const c_ss = SpreadsheetApp.openById(c_id_gss).getSheetByName(l_sheet_name);
      if(c_ss.getLastRow() == 0){
        return null;
      };
      if(l_get_row <= 0 || l_get_column <= 0){
        return null;
      };

      //number(直接数値指定)かstring("MAX"が望ましい)で分岐
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

  //*Properties
    function f_sh_ps_set(l_key,l_value){
      PropertiesService.getScriptProperties().setProperty(l_key,l_value);
    };

    function f_sh_ps_get(l_key){
      return PropertiesService.getScriptProperties().getProperty(l_key);
    };

  //*cache
    function f_sh_cache_set(l_key,l_value,l_sec){
      CacheService.getScriptCache().put(l_key,l_value,l_sec);
    };

    function f_sh_cache_del(l_key){
      CacheService.getScriptCache().remove(l_key);
    };

    function f_sh_cache_get(l_key){
      return CacheService.getScriptCache().get(l_key);
    };

  //*trigger
    function f_sh_trigger_set(l_func,l_time){
      ScriptApp.newTrigger(l_func).timeBased().at(l_time).create();
    };

    function f_sh_trigger_del(l_func) {
      //指定された関数を呼び出すトリガー(複数可)のみを削除
      const c_trigger = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_trigger.length; i++){
        if(c_trigger[i].getHandlerFunction() == l_func){
          ScriptApp.deleteTrigger(c_trigger[i]);
        };
      };
    };

  //*convert_month
    function f_sh_convert_month(l_month){
      //Date引数に合わせた-1はしてないので注意
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
  
  //line
    function f_sh_line_send(l_to,l_text){
      let l_token = "";
      let l_url = "";
      let l_payload = "";

      //事前の定義が必要
      switch (l_to){
        case "addmin":
          l_token = c_id_linebot_token;
          l_url = "push";
          l_payload = {
              to: c_id_lineacct_main,
              messages: [
                {
                  type: 'text',
                  text: l_text
                }
              ]
            };
          break;
        case "pet":
          l_token = c_id_linebot_token_pet;
          l_url = "broadcast";
          l_payload = {
              messages: [
                {
                  type: 'text',
                  text: l_text
                }
              ]
            };
          break;
        default:
          return;
          break;
      };

      UrlFetchApp.fetch(
        "https://api.line.me/v2/bot/message/" + l_url,
        {
          method: 'post',
          contentType: 'application/json',
          headers: {
            Authorization: 'Bearer ' + token
          },
          payload: JSON.stringify(l_payload)
        }
      );
    };

//*システム監視(毎日0時に実行)
    function f_bt_surveillance(){
      //起動かを判別して処理
      if(f_sh_ps_get("firstboot") == "1"){
        f_sh_ps_set("firstboot","0");

        //個別処理の起動時のリセット関数
        f_rs_sukasuka();
      }else{
        f_mp_systemcheck();
      };

      //トリガーリセット
      const c_triggers = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_triggers.length; i++){
        ScriptApp.deleteTrigger(c_triggers[i]);
      };

      //サブ垢の場合はトリガー関数と次回のシステム監視関数のみを設定して終了
      if(Session.getActiveUser().getEmail() != c_id_mainacct){
        ScriptApp.newTrigger("f_bt_surveillance").timeBased().at(f_sh_date(new Date,[,,1,,,,],[,,,0,0,0,0])).create();
        f_bt_trigger();
        return;
      };

      //1日間だけ保持するプロパティサービスをリセット
      f_sh_ps_set("stop",0);
      f_sh_ps_set("runtime",0);
      f_sh_ps_set("train","0");
      
      //DBのスケジュール表の自動更新
      const c_schedulelist = f_sh_gss_get("schedule",2,1,20,3);
      for(let i = 0; i < c_schedulelist.length; i++){
        const c_today = f_sh_date(f_sh_date(new Date,[,,,,,,],[,,,0,0,0,0]),[,,-1,,,,],[,,,,,,]);
        if(
              Number(c_schedulelist[i][0]) == Number(c_today.getFullYear())
            &&Number(c_schedulelist[i][1]-1) == Number(c_today.getMonth())
            &&Number(c_schedulelist[i][2]) == Number(c_today.getDate())
          ){
          const c_schedukesheet = SpreadsheetApp.openById(c_id_gss).getSheetByName("schedule");
          for(let k = 0; k < i+1; k++){
            c_schedukesheet.deleteRow(2);//最上段を削除
          };
          break;
        };
      };

      //トリガーを起動して終了
      ScriptApp.newTrigger("f_bt_surveillance").timeBased().at(f_sh_date(new Date,[,,1,,,,],[,,,0,0,0,0])).create();
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
          String(new Date().getMonth()+1)+"月"+String(new Date().getDate())+"日"+"のシステム稼働レポート",
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
        f_sh_ps_set("runtime","0");
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

//*基盤システム
  //*キャッシュ
    function f_bt_cache(){
      //MDシートに従ってキャッシュ格納
      //文字化の区切り文字　1次元配列→","　2次元配列→"<>
      const c_data = f_sh_gss_get("MD",2,1,"MAX","MAX");
      for(let i = 0; i < c_data.length; i++){
        if(c_data[i][0] == null || c_data[i][0] == ""){
          break;
        };
        let l_cachedata = [];
        const c_gssdata = f_sh_gss_get(c_data[i][1],c_data[i][2],c_data[i][3],"MAX","MAX");
        for(let k = 0; k < c_gssdata.length; k++){
          l_cachedata[k] = c_gssdata[k].join(",");
        }
        f_sh_cache_set("gss_" + c_data[i][0],l_cachedata.join("<>"),6*60*60);
      };
    };

    function f_sh_cache_gssget(l_key){
      //念の為
      if(f_sh_cache_get(l_key) == null){
        f_bt_cache();
      };
      const c_getdata = f_sh_cache_get(l_key).split("<>");
      let l_returnary = [];
      for(let i = 0; i < c_getdata.length; i++){
        l_returnary[i] = c_getdata[i].split(",");
      };
      return l_returnary;
    };

  //*トリガー
    function f_bt_trigger(){
      //用済みトリガー削除
      const c_triggers = ScriptApp.getProjectTriggers();
      for(let i = 0; i < c_triggers.length; i++){
        if(c_triggers[i].getHandlerFunction() != "f_bt_surveillance"){
          ScriptApp.deleteTrigger(c_triggers[i]);
        };
      };

      //時間補正
      const c_trigger_delay = 10;//10分間隔で呼び出す
      const c_time = new Date;
      let l_time_now = new Date;
      if(l_time_now.getMinutes() % c_trigger_delay != 0){
        l_time_now =
          f_sh_date(
            f_sh_date(
              c_time,[,,,,,,],[,,,,0,0,0]
            ),
            [,,,,Math.trunc(l_time_now.getMinutes()/c_trigger_delay)*c_trigger_delay,,],
            [,,,,,,]
          );
      }else{
        l_time_now = f_sh_date(c_time,[,,,,,,],[,,,,,0,0]);
      };
      const c_time_next =
        f_sh_date(
          f_sh_date(
            l_time_now,
            [,,,,c_trigger_delay,,],
            [,,,,,,]
          ),
          [,,,,,,],
          [,,,,,0,0]
        );

      let l_trigger_ary = [["f_bt_trigger",c_time_next]];
      //定期実行関数
      for(let i = 0; i < c_list_func[0].length; i++){
        let l_boottime = f_sh_date(new Date,[,,,,,,],[,,,0,0,0,0]);
        while(l_boottime.getDate() == l_time_now.getDate()){
          if(l_time_now <= l_boottime && l_boottime < c_time_next){//次回のトリガー関数実行時間のを呼び出すとトリガー削除が複雑化するため
            l_trigger_ary.push([c_list_func[0][i][0],l_boottime]);
          };
          l_boottime = f_sh_date(l_boottime,c_list_func[0][i][1],[,,,,,,]);
        };
      };
      //定時実行関数
      for(let i = 0; i < c_list_func[1].length; i++){
        const c_boottime = f_sh_date(f_sh_date(new Date,[,,,,,,],[,,,0,0,0,0]),c_list_func[1][i][1],[,,,,,,]);
        if(l_time_now <= c_boottime && c_boottime < c_time_next){
          l_trigger_ary.push([c_list_func[1][i][0],c_boottime]);
        };
      };
      //予定通知関数
      const c_plantrigger = f_trigger_plan(l_time_now,c_time_next);
      if(c_plantrigger != null){
        l_trigger_ary.push(c_plantrigger);
      };

      //トリガー数制限超過によるエラー落ち防止
      if(l_trigger_ary.length > 18){
        f_mp_main_log("i5system","トリガー数制限超過のためシステムを停止します");
        return;
      };

      //メインユーザーでなければmailとtriggerのみ設定して終了
      if(Session.getActiveUser().getEmail() != c_id_mainacct){
        for(let i = 0; i < l_trigger_ary.length; i++){
          if(l_trigger_ary[i][0] != null && (l_trigger_ary[i][0] == "f_bt_mail" || l_trigger_ary[i][0] == "f_bt_trigger")){
            if(l_trigger_ary[i][1] < new Date){//現在時刻が本来の実行時間を超えていた場合に次の分に実行
              l_trigger_ary[i][1] = f_sh_date(new Date,[,,,,1,,],[,,,,,,]);
            };
            f_sh_trigger_set(l_trigger_ary[i][0],l_trigger_ary[i][1]);
          };
        };
        return;
      };

      for(let i = 0; i < l_trigger_ary.length; i++){
        if(l_trigger_ary[i][0] != null){
          if(l_trigger_ary[i][1] < new Date){//現在時刻が本来の実行時間を超えていた場合に次の分に実行
            l_trigger_ary[i][1] = f_sh_date(new Date,[,,,,1,,],[,,,,,,]);
          };
          f_sh_trigger_set(l_trigger_ary[i][0],l_trigger_ary[i][1]);
        };
      };

      if((new Date).getHours() == 18 && (new Date).getMinutes() < 5) f_bt_schedule(); Logger.log("スケジュール実行")
    };

    function f_trigger_plan(l_time_now,l_time_next){
      const c_schedule = f_sh_gss_get("schedule",2,1,1,"MAX")[0];
      const c_plan = c_schedule.slice(19);
      for(let i = 0; i < c_plan.length; i++){
        if(String(c_plan[i]).slice(2,3) == ":"){//時間指定のない予定は除外
          const c_time_plan =
            f_sh_date(
              f_sh_date(
                l_time_now,
                [,,,,,,],
                [,,,0,0,0,0]
              ),
              [,,,String(c_plan[i]).slice(0,2),String(c_plan[i]).slice(3,5),,],
              [,,,,,,]
            );
          if(l_time_now <= c_time_plan && c_time_plan < l_time_next){
            f_sh_cache_set("plan",String(c_plan[i]).slice(5),6*60);
            return ["f_bt_plan",c_time_plan];
          };
        };
      };
      return null;
    };

//*メイン処理
  function f_sh_main(l_func,l_http){
    const c_time_boot = new Date;

    //実行時間超過間際の場合の処理
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
      //f_mp_main_log(l_func,"");
    }catch(e){
      //f_mp_main_log(l_func,e.message);
    };

    //メインユーザーの場合のみ実行時間に加算
    if(Session.getActiveUser().getEmail() == c_id_mainacct){
      const c_runtime = new Date - c_time_boot;
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
    const c_author = f_sh_disc_author("実行ユーザー：" + Session.getActiveUser().getEmail(),null,null);
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
      case "train":
        f_pr_train();
        break;
      case "train_rs":
        f_pr_train_rs();
        break;
      case "schedule":
        f_pr_schedule();
        break;
      case "sukasuka":
        f_pr_sukasuka();
        break;
      case "pet":
        f_pr_pet();
        break;
      case "weather":
        f_pr_weather();
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
  //*mail
    function f_bt_mail(){
      return//dev
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
      //送信アドレス別の処理分岐
      const c_from = Parser.data(l_mail.getFrom()).from("<").to(">").build();
      if(c_from == "no-reply@classroom.google.com"){
        f_mail_spe_classroom(l_mail);
        return;
      };

      //着信アドレス別のウェブフック設定
      const c_addresslist = f_sh_cache_gssget("gss_addresslist");
      let l_webhook = "";
      let l_mail_to = [l_mail.getTo()].concat(l_mail.getCc().split(",")).concat(l_mail.getBcc().split(","));
      for(let i = 0; i < c_addresslist[0].length; i++){
        for(let k = 0; k < l_mail_to.length; k++){
          if(l_mail_to[k].slice(-1) == ">"){//アドレスの前に名前が入っていた場合の対処
            l_mail_to[k] = Parser.data(l_mail_to[k]).from("<").to(">").build();
          }
          if(c_addresslist[0][i] == l_mail_to[k]){
            l_webhook = c_addresslist[1][i];
            break;
          };
        };
        if(l_webhook != ""){
          break;
        };
      };

      //送信用データ作成&送信
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
        f_sh_disc_field("クラス",c_body[3],false),
        f_sh_disc_field("投稿者",c_name,false),
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
      f_sh_disc_send(公開チャンネル_クラスルーム通知,c_message)
    };

  //*rss
    function f_bt_rss(){
      f_sh_main("rss");
    };

    function f_pr_rss(){
      const c_rsslist = f_sh_cache_gssget("gss_rsslist");

      //取得元別に分岐(XMLフォーマットが違うため)
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
            l_rssary = f_rss_nhk(c_rsstxt,new Date(f_sh_ps_get("rss_" + "nhk_" + String(i))));
            f_sh_ps_set("rss_" + "nhk_" + String(i),String(new Date));
            break;
          case "itmedia":
            l_rssary = f_rss_itmedia(c_rsstxt,new Date(f_sh_ps_get("rss_" + "itmedia_" + String(i))));
            f_sh_ps_set("rss_" + "itmedia_" + String(i),String(new Date));
            break;
          case "mynavi":
            l_rssary = f_rss_mynavi(c_rsstxt,new Date(f_sh_ps_get("rss_" + "mynavi_" + String(i))));
            f_sh_ps_set("rss_" + "mynavi_" + String(i),String(new Date));
            break;
        };

        //取得元ファイルをまとめて送信
        if(l_rssary != [] && l_rssary != null){
          for(let k = 0; k < l_rssary.length; k++){
            const c_embed = f_sh_disc_embed(
              l_rssary[k]["title"],
              l_rssary[k]["url"],
              l_rssary[k]["body"],
              null,
              l_rssary[k]["img"],
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

    function f_rss_dateconvert_A(l_date){
      //Fri, 19 Apr 2024 10:00:00 +0900　のフォーマット用
      return new Date(
        Number(l_date.substr(12,4)),//年
        f_sh_convert_month(l_date.substr(8,3))-1,//月
        Number(l_date.substr(5,2)),//日
        Number(l_date.substr(17,2)),//時
        Number(l_date.substr(20,2)),//分
        Number(l_date.substr(23,2)) //秒
      );
    };

    function f_rss_dateconvert_B(l_date){
      //2024-05-07T14:34:43+09:00　のフォーマット用
      return new Date(
        Number(l_date.substr(0,4)),//年
        Number(l_date.substr(5,2))-1,//月
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

  //*train
    function f_bt_train(){
      f_sh_main("train");
    };

    function f_pr_train(){
      if(f_sh_ps_get("train") == "1"){
        return;
      };

      //※データ取得の柔軟性がほぼ無い
      let l_data =
        Parser.data(
          Parser.data(UrlFetchApp.fetch("https://traininfo.jreast.co.jp/delay_certificate/").getContentText("utf-8"))
            .from("<div class=\"basicTable02 delayTable\">").to("<div class=\"basicTable02 delayTable\">").build()
        ).from("<td").to("</td>").iterate().slice(0,15);
      l_data = [l_data[1],l_data[6],l_data[11]];

      const c_time_now = new Date;
      for(let i = 0; i < 3; i++){
        if(l_data[i] == "><p class=\"in_p\">準備中</p>"){
          return;
        }else if(l_data[i] == ">-"){
          l_data[i] = "遅延なし";
        }else if(l_data[i].substr(8,5) == "delay"){
          l_data[i] = "https://traininfo.jreast.co.jp/delay_certificate/pop.aspx?D=" + c_time_now.getFullYear() + ("0"+String(c_time_now.getMonth()+1)).slice(-2) + ("0"+String(c_time_now.getDate())).slice(-2) + "&R=0" + String(i+1) + "&T=02";
        }else{
          l_data[i] = "不明";
        };
      };

      f_sh_disc_send(
        "",
        f_sh_disc_message(
          null,
          null,
          f_sh_disc_embed(
            "[" + String(c_time_now.getMonth()+1) + "月" + String(c_time_now.getDate()) + "日" + " " + " 7時〜10時]の遅延証明書",
            "https://traininfo.jreast.co.jp/delay_certificate/",
            null,
            null,
            null,
            c_time_now,
            null,
            null,
            [
              f_sh_disc_field(
                "東海道線",
                l_data[0],
                false
              ),
              f_sh_disc_field(
                "横須賀線",
                l_data[1],
                false
              ),
              f_sh_disc_field(
                "京浜東北線",
                l_data[2],
                false
              )
            ],
            null
          )
        )
      );
      f_sh_ps_set("train","1");
    };

  //train_rs
    function f_bt_train_rs(){
      f_sh_main("train_rs");
    };

    function f_pr_train_rs(){
      f_sh_ps_set("train","0");
    };

  //*schedule
    function f_bt_schedule(){
      f_sh_main("schedule");
    };

    function f_pr_schedule(){
      //return
      const c_schedule_info = f_sh_cache_gssget("gss_schedule");//必要な情報
      let l_schedule = f_sh_gss_get("schedule",3,1,7,"MAX");//実際の予定 今日を除外して呼び出し
      const c_homework = f_sh_gss_get("homework",1,1,"MAX","MAX");//課題リスト

      //データ整形
      for(let i = 0; i < 7; i++){//日数分
        for(let k = 0; k < l_schedule[i].length; k++){//横のデータ量分
          if(l_schedule[i][k] == "" || l_schedule[i][k] == null){
            l_schedule[i][k] = "-";
          };
          if(5 <= k <= 11){//時間割のみの処理
            l_schedule[i][k] = f_mp_classname(l_schedule[i][k],c_schedule_info.slice(2,9));
            //if(String(l_schedule[i][k]).slice(0,1) == "理"){
            //  l_schedule[i][k] = c_schedule_info[11][Number(l_schedule[i][k].substr(1,1))-1];
            //};
          };
        };
      };

      //1週間
      let l_field_ary = [];
      let LINE用_1週間 = "【1週間の時間割】\n"
      for(let i = 0; i < 7; i++){
        let l_school = "　学校無し\n";
        if(l_schedule[i][5] != "-"){
          l_school =
            "　"+"行事予定："+l_schedule[i][4]+"\n"
           +"　"+"時程："+l_schedule[i][3]+"\n"
           +"　"+"1:"+l_schedule[i][5]
           +"　"+"2:"+l_schedule[i][6]
           +"　"+"3:"+l_schedule[i][7]
           +"　"+"4:"+l_schedule[i][8]+"\n"
           +"　"+"5:"+l_schedule[i][9]
           +"　"+"6:"+l_schedule[i][10]
           +"　"+"7:"+l_schedule[i][11]+"\n"
        };
        LINE用_1週間 = LINE用_1週間 + l_schedule[i][2] + "日\n" + l_school
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
      f_sh_disc_send(公開チャンネル_予定,c_message);

      //２日分
      for(let i = 1; 0 <= i; i--){
        let l_field_ary = [];
        let l_school = "学校無し";

        //予定
        l_field_ary[0] = "-";
        for(let k = 19; k < l_schedule[i].length; k++){
          if(k == 19){
            l_field_ary[0] = (l_schedule[i][k] + "/n");
          }else{
            l_field_ary[0].concat(l_schedule[i][k] + "/n");
          };
        };
        //l_field_ary[0] = f_sh_disc_field("予定",l_field_ary[0],null);

        let LINE用 = "【明日("+ l_schedule[i][1] + "/" + l_schedule[i][2] + ")" + "の予定】\n"

        if(l_schedule[i][5] != "-"){
          l_school = "学校あり";
          l_field_ary[0] = f_sh_disc_field("行事予定",l_schedule[i][4]);
          if(l_schedule[i][4]!=null && l_schedule[i][4] != "-") LINE用 = LINE用 + "行事予定：" + l_schedule[i][4] + "\n"
          
          for(let k = 0; k < 7; k++){
            //教室
            let l_class = "-";
            for(let j = 0; j < c_schedule_info[9].length; j++){
              if(c_schedule_info[9][j] == l_schedule[i][k+5]){
                l_class = c_schedule_info[10][j];
                break;
              };
            };
            l_field_ary[1+k] = f_sh_disc_field(
              String(k+1)+"時限目",
              "科目:" + l_schedule[i][k+5] + " 教室:" + l_class + " 　メモ:" + l_schedule[i][k+5+7],
              null
            );
            if(l_schedule[i][k+5]!="-"){
              LINE用 = LINE用 + String(k+1) + "：" + l_schedule[i][k+5] + "\n"
              if(l_schedule[i][k+5+7]!=null && l_schedule[i][k+5+7] != "-") LINE用 = LINE用 + "　メモ：" + l_schedule[i][k+5+7] + "\n"
            }
          };
        }else{
          LINE用 = LINE用 + "学校無し"
        }

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
        if(i == 0){
          f_sh_disc_send(公開チャンネル_予定,c_message_2day);
          LINE送信(LINE用.slice(0,-1),LINE用_1週間.slice(0,-1))
        }
      };

      //課題
      if(c_homework != null){
        const c_embed_hw = f_sh_disc_embed(
          "課題",
          null,
          f_mp_gethomework(c_homework),
          null,
          null,
          null,
          null,
          null,
          null,
          null
        );
        const c_message_hw = f_sh_disc_message(null,null,c_embed_hw);
        f_sh_disc_send(c_schedule_info[1][2],c_message_hw);
      };
    };

    function LINE送信(引数A,引数B){
      if(PropertiesService.getScriptProperties().getProperty("LINE送信制限") == (new Date).getDate()) return
         PropertiesService.getScriptProperties().setProperty("LINE送信制限",    (new Date).getDate())

      const トークン = ""
      const 送信先 =
      UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push",
        {
          method: "post",
          headers:
            {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + トークン
            },
          payload: JSON.stringify(
            {
              to: 送信先,
              messages:
                [
                  {
                    type: "text",
                    text: 引数B
                  },
                  {
                    type: "text",
                    text: 引数A
                  }
                ]
            }
          )
        }
      )
    }

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
      for(let i = 0; i < l_homework.length; i++){
        l_return = l_return + "〜" + l_homework[i][0] + "月" + l_homework[i][1] + "日　" + l_homework[i][2] + "\n";
      };
      return l_return;
    };
  
  //pet
    function f_bt_pet(){
      f_sh_main("pet");
    };

    function f_pr_pet(){
      let l_data = f_sh_cache_get("pet").split("<!>");
      let l_data_wheel = "";
      let l_data_high = 0;
      let l_data_low = 100;
      for(let i = 0; i < l_data.length; i++){
        l_data[i] = l_data[i].split(",");
        l_data_wheel = l_data_wheel + l_data[i][0] + "\n";
        for(let j = 1; j < 3+1; j++){
          if(l_data_high < l_data[j]){
            l_data_high = l_data[j];
          };
          if(l_data[j] < l_data_low){
            l_data_low = l_data[j];
          };
        };
      };

      const c_time = new Date;

      const c_sheet = SpreadsheetApp.openById(c_id_gss).getSheetByName("petlog");
      const c_stratrow = c_sheet.getLastRow()+1;
      c_sheet.getRange(c_stratrow,1,1,1).setValues([[String(c_time.getDate()+1)+"月"+String(c_time.getDate())+"日"]]);
      c_sheet.getRange(c_stratrow,2,l_data.length,4).setValues(l_data);

      let l_text =
          "【定期レポート" + String(c_time.getMonth() + 1) + "月" + String(c_time.getDate()) + "日" + "】" + "\n"
        + "最高温度：" + String(l_data_high) + "\n"
        + "最低温度：" + String(l_data_low) + "\n"
        + "回し車(昨日の" + String(c_list_func[1][1][1][3]) + "時から30分ごと)" + "⤵" + "\n"
        + l_data_wheel;
      f_sh_line_send("pet",l_text);
    };

  //*weather
    function f_bt_weather(){
      f_sh_main("weather");
    };

    function f_pr_weather(){
      //メモ:Parser　iterate→配列　build→1つ
      const c_rss_dataary = Parser.data(UrlFetchApp.fetch("https://www.data.jma.go.jp/developer/xml/feed/regular.xml").getContentText("utf-8")).from("<entry>").to("</entry>").iterate();
      for(let i = 0; i < c_rss_dataary.length; i++){
        if(
            Parser.data(c_rss_dataary[i]).from("<updated>").to("</updated>").build() != f_sh_ps_get("weather_lastget")
          &&Parser.data(c_rss_dataary[i]).from("<title>").to("</title>").build() == "府県天気予報（Ｒ１）"
          &&Parser.data(c_rss_dataary[i]).from("<name>").to("</name>").build() == "横浜地方気象台"
        ){
          f_sh_ps_set("weather_lastget",Parser.data(c_rss_dataary[i]).from("<updated>").to("</updated>").build());
          const c_xml_dataary = Parser.data(UrlFetchApp.fetch(Parser.data(c_rss_dataary[i]).from("<id>").to("</id>").build()).getContentText("utf-8")).from("<TimeSeriesInfo>").to("</TimeSeriesInfo>").iterate();

          const c_area_3h_time = Parser.data(c_xml_dataary[3]).from("<DateTime>").to("</DateTime>").iterate();
          const c_area_3h_data_weather = Parser.data(c_xml_dataary[3]).from("<jmx_eb:Weather").to("</jmx_eb:Weather>").iterate();//[ refID="n" type="天気">]が残ってる & 後半は西部データ
          const c_area_3h_data_windspeed = Parser.data(c_xml_dataary[3]).from("<WindSpeedLevel").to("</WindSpeedLevel>").iterate();//[ description="毎秒１０から１４メートル" range="10 14" refID="1" type="風速階級">]が残ってる & 後半は西部データ

          const c_station_3h_time = Parser.data(c_xml_dataary[4]).from("<DateTime>").to("</DateTime>").iterate();
          const c_station_3h_data_temperate = Parser.data(c_xml_dataary[4]).from("<jmx_eb:Temperature").to("</jmx_eb:Temperature>").iterate();//[ description="２１度" refID="1" type="気温" unit="度">]が残ってる & 後半は小田原データ

          let l_datanum = 1;
          if(c_area_3h_time.length >= c_station_3h_time.length){
            l_datanum = c_station_3h_time.length;
          }else if(c_area_3h_time.length < c_station_3h_time.length){
            l_datanum = c_area_3h_time.length;
          };
          const c_lastget = f_sh_ps_get("weather_data_lastget");
          f_sh_ps_set("weather_data_lastget",String(c_area_3h_time[l_datanum-1]));//※配列長は最終要素のインデックス+1
          let l_messageary = [];
          let j = 0;
          for(let k = l_datanum; 0 < k; k--){
            if(c_area_3h_time[k-1] != c_lastget){
              const c_txt =
                  "天気  : " + ("　　　　" + c_area_3h_data_weather[k-1].substr(c_area_3h_data_weather[k-1].indexOf(">") + 1)).slice(-4) + "　　"
                + "気温  : " + ("  " + c_station_3h_data_temperate[k-1].substr(c_station_3h_data_temperate[k-1].indexOf(">") + 1)).slice(-2) + "度　　"
                + "風速  : " + ("  " + c_area_3h_data_windspeed[k-1].substr(c_area_3h_data_windspeed[k-1].indexOf(">") + 1)).slice(-2) + "級";
              const c_username = c_area_3h_time[k-1].substr(5,2) + "月" + c_area_3h_time[k-1].substr(8,2) + "日" + c_area_3h_time[k-1].substr(11,2) + "時";
              l_messageary[j] = f_sh_disc_message(c_txt,c_username,null);
            }else{
              break;
            };
            j++;
          };
          for(let k = l_messageary.length; 0 <= k; k--){//古い(＝XMLの上の方＝インデックスが大きい)ものから送信
            f_sh_disc_send("",l_messageary[k])
          };
          return;
        };
      };
    };

  //plan
    function f_bt_plan(){
      f_sh_main("plan");
    };
  
    function f_pr_plan(){
      const c_plan_name = f_sh_cache_get("plan");
      const c_webhook = c_schedule_info[1][3];
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

  //post
    function doPost(e){
      if(e.parameter["from"] == "linebot"){
        f_sh_main("linebot",e);
      };
    };

    //linebot
      function f_pr_linebot(e){
        try{
          f_pr_linebot_dev(e);
        }catch(er){
          SpreadsheetApp.openById(c_id_gss).getSheetByName("dev").getRange(1,1,1,2).setValues([[er.message,JSON.parse(e.postData.contents)["events"]]]);
        }
      };

      function f_pr_linebot_dev(e){
        return;
        //const c_events = JSON.parse(e.postData.contents)["events"];
        const c_message = "授業表示20240514";//dev
        const c_events = [{//dev
          timestamp:"1.715493005947E12", 
          source:{
            userId:"", 
            type:"user"
          }, 
          message:{
            quoteToken:"", 
            text:c_message, 
            id:"", 
            type:"text"
          }, 
          mode:"active", 
          webhookEventId:"", 
          type:"message", 
          deliveryContext:{
            isRedelivery:false
          }, 
          replyToken:""
        }]

        for(let i = 0; i < c_events.length; i++){
          if( c_events[i]["type"] == "message" && c_events[i]["message"]["type"] == "text"){
            let l_txt_send = "";
            //try{//dev_curb
              const c_text_get = c_events[i]["message"]["text"].split("\n");
              const c_cmd1 = c_text_get[0].substr(0,2);
              const c_cmd2 = c_text_get[0].substr(2,2);
              const c_cmd3 = c_text_get[0].substr(4);
              const c_cmd4 = c_text_get[1];
              switch(c_cmd1){
                case "制御":
                  switch(c_cmd2){
                    case "起動":
                      const c_triggers_boot = ScriptApp.getProjectTriggers();
                      let l_boot = 0;
                      for(let k = 0; k < c_triggers_boot.length; k++){
                        if(c_triggers_boot[k].getHandlerFunction() == "f_bt_surveillance"){
                          l_boot = 1;
                        };
                      };
                      if(l_boot == 0){
                        f_sh_ps_set("firstboot","1");
                        f_system_boot();
                        l_txt_send = "i5system起動";
                      }else{
                        l_txt_send = "既に起動しています";
                      };
                      break;
                    case "停止":
                      const c_triggers = ScriptApp.getProjectTriggers();
                      for(let i = 0; i < c_triggers.length; i++){
                        ScriptApp.deleteTrigger(c_triggers[i]);
                      };
                      l_txt_send = "i5system停止完了";
                      break;
                  };
                  break;
                case "課題":
                  let l_homework = [];
                  if(SpreadsheetApp.openById(c_id_gss).getSheetByName("homework").getLastRow() != null){
                    l_homework = f_sh_gss_get("homework",1,1,"MAX","MAX");
                  };
                  switch(c_cmd2){
                    case "表示":
                      if(l_homework[0][0] != null && l_homework[0][0] != ""){
                        for(let i = 0; i < l_homework.length; i++){
                          l_txt_send = l_txt_send + String(i) + "　" + "〜" + l_homework[i][0] + "月" + l_homework[i][1] + "日　" + l_homework[i][2] + "\n";
                        };
                      }else{
                        l_txt_send = "課題無し";
                      };
                      break;
                    case "追加":
                      if(l_homework != null){
                        l_homework[l_homework.length] = [c_cmd4.substr(0,2),c_cmd4.substr(2,2),c_cmd4.substr(4)];
                        l_txt_send = "追加完了";
                      /*
                        const c_time_now = new Date;
                        let l_time = new Date(c_time_now.getFullYear,Number(c_cmd4.substr(0,2)),Number(c_cmd4.substr(2,2)));
                        if(l_time < c_time_now){
                          l_time = f_sh_date(l_time,[1,,,,,,],[]);
                        };
                        for(let k = -1; k < l_homework.length; k ++){
                          let l_time_0 = null;
                          let l_time_1 = null;
                          if(k = -1){
                            l_time_0 = new Date(0,0,0,0,0,0,0);
                            l_time_1 = new Date(c_time_now.getFullYear,Number(l_homework[k+1][0]),Number(l_homework[k+1][1]));
                          }else if(k = l_homework.length-1){
                            l_time_0 = new Date(c_time_now.getFullYear,Number(l_homework[k][0]),Number(l_homework[k][1]));
                            l_time_1 = new Date(2038,0,0,0,0,0,0);
                          }else{
                            l_time_0 = new Date(c_time_now.getFullYear,Number(l_homework[k][0]),Number(l_homework[k][1]));
                            l_time_1 = new Date(c_time_now.getFullYear,Number(l_homework[k+1][0]),Number(l_homework[k+1][1]));
                          };
                          if(l_time_0 < l_time && l_time < l_time_1){
                            Array.prototype.splice.apply(l_homework,[k+1,0].concat([c_cmd4.substr(0,2),c_cmd4.substr(2,2),c_cmd4.substr(4)]));
                            l_txt_send = "追加完了";
                            break;
                          };
                        };
                      */
                      }else{
                        l_homework = [[c_cmd4.substr(0,2),c_cmd4.substr(2,2),c_cmd4.substr(4)]];
                        l_txt_send = "追加完了";
                      };
                      if(l_txt_send == ""){
                        l_txt_send = "追加失敗";
                      }else{
                        SpreadsheetApp.openById(c_id_gss).getSheetByName("homework").getRange(1,1,l_homework.length,l_homework[0].length).setValues(l_homework);
                        l_txt_send = "追加完了";
                      };
                      break;
                    case "削除":
                      if(f_sh_gss_get("homework",Number(c_cmd3)+1,1,1,1) != "" && f_sh_gss_get("homework",Number(c_cmd3)+1,1,1,1) != null){
                        l_homework.splice(Number(c_cmd3),1);
                        if(l_homework[0] != null && l_homework[0] != ""){
                          SpreadsheetApp.openById(c_id_gss).getSheetByName("homework").getRange(1,1,l_homework.length,3).setValues(l_homework);
                          SpreadsheetApp.openById(c_id_gss).getSheetByName("homework").getRange(l_homework.length + 1,1,1,3).clear();
                        }else{
                          SpreadsheetApp.openById(c_id_gss).getSheetByName("homework").getRange(1,1,l_homework.length,l_homework[0].length).deleteRow(1);
                        };
                        l_txt_send = "削除完了";
                      }else{
                        l_txt_send = "該当課題無し";
                      };
                      break;
                  };
                  break;
                case "予定":
                  let l_gssdata = f_sh_gss_get("schedule",1,1,"MAX","MAX");
                  let l_rownum = 0;
                  for(let k = 0; k < l_gssdata.length; k++){
                    if(l_gssdata[k][0] == c_cmd3.substr(0,4) && l_gssdata[k][1] == c_cmd3.substr(4,2) && l_gssdata[k][2] == c_cmd3.substr(6,2)){
                      l_rownum = k + 1;
                      l_gssdata = l_gssdata[k];
                      break;
                    };
                  };
                  if(l_rownum != 0){
                    switch(c_cmd2){
                      case "表示":
                        for(let k = 19; k < l_gssdata.length; k++){
                          if(l_gssdata[k] == null || l_gssdata[k] == ""){
                            break;
                          };
                          l_txt_send = l_txt_send + String(k-19) + "　" + l_gssdata[k] + "\n";
                        };
                        break;
                      case "追加":
                        l_gssdata = l_gssdata.concat(c_cmd4);
                        SpreadsheetApp.openById(c_id_gss).getSheetByName("schedule").getRange(l_rownum,1,1,l_gssdata.length).setValues([l_gssdata]);
                        l_txt_send = "追加完了";
                        break;
                      case "削除":
                        l_gssdata.splice(Number(c_cmd3.substr(8))+19,1);
                        SpreadsheetApp.openById(c_id_gss).getSheetByName("schedule").getRange(l_rownum,1,1,l_gssdata.length).setValues([l_gssdata]);
                        SpreadsheetApp.openById(c_id_gss).getSheetByName("schedule").getRange(l_rownum,l_gssdata.length + 1,1,1).clear();
                        l_txt_send = "削除完了";
                        break;
                    };
                  }else{
                    l_txt_send = "該当する日付無し";
                  };
                  break;
                case "授業":
                  let l_gssdata_2 = f_sh_gss_get("schedule",1,1,"MAX","MAX");
                  let l_rownum_2 = 0;
                  for(let k = 0; k < l_gssdata_2.length; k++){
                    if(l_gssdata_2[k][0] == c_cmd3.substr(0,4) && l_gssdata_2[k][1] == c_cmd3.substr(4,2) && l_gssdata_2[k][2] == c_cmd3.substr(6,2)){
                      l_rownum_2 = k + 1;
                      l_gssdata_2 = l_gssdata_2[k];
                      break;
                    };
                  };
                  if(l_rownum_2 != 0){
                    switch(c_cmd2){
                      case "表示":
                        for(let k = 12; k < 12 + 7; k++){
                          if(l_gssdata[k] == null || l_gssdata[k] == ""){
                            l_txt_send = "メモ無し";
                            break;
                          };
                          l_txt_send = l_txt_send + String(k-11) + "　" + l_gssdata[k] + "\n";
                        };
                        break;
                      case "追加":
                        l_gssdata_2[11+cmd3.substr(8)] = c_cmd4;
                        SpreadsheetApp.openById(c_id_gss).getSheetByName("schedule").getRange(l_rownum,1,1,l_gssdata.length).setValues(l_gssdata_2);
                        l_txt_send = "追加完了";
                        break;
                      case "削除":
                        l_gssdata_2[11+cmd3.substr(8)] = "";
                        SpreadsheetApp.openById(c_id_gss).getSheetByName("schedule").getRange(l_rownum,1,1,l_gssdata.length).setValues(l_gssdata_2);
                        l_txt_send = "削除完了";
                        break;
                    };
                  }else{
                    l_txt_send = "該当する日付無し";
                  };
                  break;
              };
            //}catch(e){
            //  l_txt_send = e.message;
            //};
            if(l_txt_send == ""){
              l_txt_send =
                  "<構文エラー>" + "\n"
                + "1行目→コマンド" + "\n"
                + "　制御起動" + "\n"
                + "　　　停止" + "\n"
                + "　課題表示" + "\n"
                + "　　　追加" + "\n"
                + "　　　削除n" + "\n"
                + "　予定表示日付" + "\n"
                + "　　　追加日付" + "\n"
                + "　　　削除日付n" + "\n"
                + "　授業表示日付" + "\n"
                + "　　　追加日付" + "\n"
                + "　　　削除日付n" + "\n"
                + "　 ※日付はYYYYMMDD" + "\n"
                + "2行目→内容(追加のみ)" + "\n"
                + "　課題　MMDD内容" + "\n"
                + "　予定　HH:MM内容" + "\n"
                + "　授業　内容" + "\n";
            };

            Logger.log(l_txt_send)
            //
            UrlFetchApp.fetch(
              "https://api.line.me/v2/bot/message/reply",
              {
                method: 'post',
                contentType: 'application/json',
                headers: {
                  Authorization: 'Bearer ' + c_id_linebot_token
                },
                payload: JSON.stringify(
                  {
                    replyToken: c_events[i]["replyToken"],
                    messages: [{ type: 'text', text:  l_txt_send }],
                  }
                )
              }
            );
            //
          };
        };
      };

  //get
    function doGet(e){
      if(e.parameter["from"] == "esp32"){
        f_sh_main("esp32",e);
      };
    };

    //esp32
      function f_pr_esp32(e){//定期データは<!>で1送信分、1送信分は,でデータ分岐
        return;
        let l_send = "";
        switch(e.parameter["type"]){
          case "report":
            const c_psdata = f_sh_ps_get("pet");
            const c_getdata = e.parameter["wheel"] +","+ e.parameter["tmp1"] +","+ e.parameter["tmp2"] +","+ e.parameter["tmp3"];
            if(c_psdata == null){
              f_sh_ps_set("pet",c_getdata);
            }else{
              f_sh_ps_set("pet",c_psdata + "<!>" + c_getdata);
            };
            return;
            break;
          case "stop":
            l_send = "ESP32停止";
            break;
          case "income":
            l_send = "来客あり";
            break;
          case "call":
            l_send = "呼び出し";
            break;
          case "tmp_high":
            f_sh_line_send("pet","室温上昇アラート("+e.parameter["tmp"]+"度)");
            return;
            break;
          case "tmp_low":
            f_sh_line_send("pet","室温低下アラート("+e.parameter["tmp"]+"度)");
            return;
            break;
        };
        f_sh_disc_send(
          //ウェブフック,
          f_sh_disc_message(
            "<@" + c_id_discacct + ">",
            null,
            f_sh_disc_embed(
              l_send,
              null,
              null,
              null,
              null,
              new Date,
              null,
              null,
              null,
              null
            )
          )
        );
      };
//
//fin.





















