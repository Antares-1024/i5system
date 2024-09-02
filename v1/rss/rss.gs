//環境変数
const id_xls_rss = ""; //rss情報を記述したファイルのID

function main(){
  func_get_rss(1);
}

function func_get_rss(rss_row) { //RSSの設定情報を取得
  const rss_spreadsheet = SpreadsheetApp.openById(id_xls_rss); //ファイル指定(URLの最後のID)
  const rss_sheet = rss_spreadsheet.getSheets()[0]; //シート指定(左から数えたシート番号)
  const rss_data = rss_sheet.getRange(rss_row,1,1,2).getValues(); //データ取得(開始行、開始列、取得行数、取得列数)
  const rss_info = []; //reurn用配列
  const rss_obj = {};
  rss_obj["name"] = rss_data[0][0];
  rss_obj["link"] = rss_data[0][1];
  rss_info.push(rss_obj);
  return rss_info; //return
}