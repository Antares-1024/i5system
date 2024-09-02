function doPost(e){
  return Execute.boot_外部({関数:["外部処理","HTTP処理",e.parameter.from],データ:e})
}
function doGet(e){
  return Execute.boot_外部({関数:["外部処理","HTTP処理",e.parameter.from],データ:e})
}