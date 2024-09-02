const id_xls_address = "";//アドレス帳のID
const id_xls_buffer = "";//バッファのID

const mail_get_limit = 10;

//20件の処理でも30秒くらいで処理が終わる(しかもそのうちの10秒は429エラー回避用)ため10分ごとの実行でも大丈夫
//今度は40秒かかった　30分ごとくらいが安牌？

function mein(){
  const user = func_user();
  const num = func_mail_to_xls(user);
  if (num != 0){
    func_xls_to_disc(user,num);
    Logger.log("新規メールあり Discordに送信済")
    return;
  }
  Logger.log("新規メール無し バッファを参照して終了")
  return;
};

function func_user(){
  const myaccount_spreadsheet = SpreadsheetApp.openById(id_xls_address); //アドレスファイル指定
  const myaccount_sheet = myaccount_spreadsheet.getSheetByName("myaccount"); //メルアドシート指定
  const user = Session.getActiveUser().getEmail();
  let i = 0;
  while(true){
    const address = myaccount_sheet.getRange(i+1,1,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
    if(user == address[0][0]){
      k = myaccount_sheet.getRange(i+1,2,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
      return k[0][0];
    }
    i++;
  }
};

function func_mail_to_xls(user){
  const buffer_spreadsheet = SpreadsheetApp.openById(id_xls_buffer); //バッファファイル指定
  const buffer_sheet = buffer_spreadsheet.getSheetByName(user); //バッファシート指定(ユーザー名)
  const last_get = buffer_sheet.getRange(1,3,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
  const address_spreadsheet = SpreadsheetApp.openById(id_xls_address); //アドレスファイル指定
  const address_sheet = address_spreadsheet.getSheetByName(user); //アドレスシート指定(ユーザー名)
  const address_num = address_sheet.getLastRow(); //登録アドレス数取得
  let loop_ctr = 0;
  while (true) {//前回と被るまで繰り返し取得
    mail = {}
    func_get_mail(loop_ctr,1,1,1,0,1,0,1);
    const k = endsWith(last_get[0][0], mail["Id"]);
    if(k == true ){
      break;
    }
    if(loop_ctr == 0){
      buffer_sheet.clear();//1回目で被らなければバッファリセット
    }
    let address = 0;
    for(i = 0; i < address_num; i++){ //照合すべきアドレス数だけループ
      address = func_mail_from(i,address_sheet);
      if (address != 0){
        break;
      };
    };
    func_buf(buffer_sheet,address_sheet,address);
    if(loop_ctr == mail_get_limit-1){
      break;
    };
    loop_ctr++;
  }
  return loop_ctr;
};

let mail = {};

//メール取得部▽
function func_get_mail(arg,a0,a1,a2,a3,a4,a5,a6){ //Id、Date、From、To、Subject、Body、PlainBody
  const mail_threads = GmailApp.getInboxThreads(arg,1); //1スレッド取得
  const threads = GmailApp.getMessagesForThreads(mail_threads); //実体を取得
  func_get_cont(threads[0][0],a0,a1,a2,a3,a4,a5,a6);
};

function func_get_cont(arg,a0,a1,a2,a3,a4,a5,a6){
  for (i = 0; i < 7; i++){
    let k = func_get_cont_onoff(i,a0,a1,a2,a3,a4,a5,a6);
    if (k == 1) {
      func_get_cont_get(i,arg);
    };
  };
};

function func_get_cont_onoff(i,a0,a1,a2,a3,a4,a5,a6){
  switch (i){
    case 0:
      return a0;
      break;
    case 1:
      return a1;
      break;
    case 2:
      return a2;
      break;
    case 3:
      return a3;
      break;
    case 4:
      return a4;
      break;
    case 5:
      return a5;
      break;
    case 6:
      return a6;
      break;
  };
};

function func_get_cont_get(i,arg){
  switch (i){
    case 0:
      mail["Id"] = arg.getId(); //0 メールID
      break;
    case 1:
      mail["Date"] = arg.getDate(); //1 受信日時
      break;
    case 2:
      mail["From"] = arg.getFrom(); //2 送信者名
      break;
    case 3:
      mail["To"] = arg.getTo(); //3 受信者名
      break;
    case 4:
      mail["Subject"] = arg.getSubject(); //4 件名
      break;
    case 5:
      mail["Body"] = arg.getBody(); //5 HTML形式の本文
      break;
    case 6:
      mail["PlainBody"] = arg.getPlainBody(); //6 プレーンテキストの本文
      break;
  };
};
//メール取得部△

//メール処理部▽
function func_mail_from(i,address_sheet){
  address = address_sheet.getRange(i+2,2,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
  const k = endsWith(mail["From"],address[0][0]);
  if (k == true){
    const ret = address_sheet.getRange(i+2,1,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
    return ret[0][0];
  } else {
    return 0;
  };
};

function func_buf(buffer_sheet,address_sheet,address){
  let webhook = 0;
  if (address == 0){
    address = mail["From"];
    const onetime = address_sheet.getRange(1,3,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
    webhook = onetime[0][0];
  } else {
    let i = 0;
    while(true){
      k = address_sheet.getRange(i+2,1,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
      if(address == k[0][0]){
        address = "defined";
        const onetime = address_sheet.getRange(i+2,3,1,1).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
        webhook = onetime[0][0];
        break;
      };
      i++;
    };
  };
  const url = "https://mail.google.com/mail/u/0/#inbox/" + mail["Id"];
  const onetime = mail["PlainBody"];
  const txt = onetime.substring(0,200);
  const arr = [address,mail["Date"],url,mail["Subject"],webhook,txt];//From,Date,URL(Id),Subject
  buffer_sheet.appendRow(arr);
};
//メール処理部△

//ウェブフック送信部▽
function func_xls_to_disc(user,num){
  //numのカウントは1スタート
  const buffer_spreadsheet = SpreadsheetApp.openById(id_xls_buffer); //バッファファイル指定
  const buffer_sheet = buffer_spreadsheet.getSheetByName(user); //バッファシート指定(ユーザー名)
  const xls_get = buffer_sheet.getRange(1,1,num+1,6).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
  for(i = num; i != 0; i--){
    const var_from = xls_get[i-1][0]; //送信者
    const var_date = xls_get[i-1][1]; //受信時間
    const var_url = xls_get[i-1][2]; //URL
    const var_subject = xls_get[i-1][3]; //件名
    const var_webhook = xls_get[i-1][4]; //ウェブフック
    const var_txt = xls_get[i-1][5]; //本文
    let content = "ㅤ\n"
    content = content + var_subject + "\n"; //件名
    if(var_from != "defined"){
      content = content + var_from + "\n"; //送信者名が必要なら送信者名
    }
    content = content + func_date(var_date) + "\n" //受信時間
    content = content + var_txt + "\n" //本文
    content = content + var_url + "\n" //URL
    content = content + "ㅤ\n";
    const payload = {
      username: "bot",
      content: content,
    };
    UrlFetchApp.fetch(var_webhook, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    });
    Utilities.sleep(500);
  };
};

function func_date(arg){
  arg = String(arg);
  const year = arg.substr(11,4);
  const month = func_month(arg.substr(4,3));
  const day = arg.substr(8,2);;
  const hour = arg.substr(16,2);
  const min = arg.substr(19,2);
  return hour + "時" + min + "分" + " " + year + "年" + month + "月" + day + "日";
};

function func_month(arg){
  switch (arg){
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
}
//ウェブフック送信部△

//コピペ▽
function startsWith(target, pattern) { //前方一致
  return target.indexOf(pattern) === 0; 
};

function endsWith(target, pattern) { //後方一致
  return ((target.lastIndexOf(pattern) + pattern.length) === target.length)
         && (pattern.length <= target.length);
};
//コピペ△
