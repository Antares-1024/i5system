const GSSシートリスト =
  {
    "シートID": "",
    "その他":   "その他"
  }

function doPost(e){
  const イベント配列 = JSON.parse(e.postData.contents).events
  if(!イベント配列) return
  for(let i = 0; i < イベント配列.length; i++){
    if(イベント配列[i].type=="message"&&イベント配列[i].message.type=="text"){
      let ユーザー名 = イベント配列[i].source.userId
      if(ユーザーリスト[ユーザー名]) ユーザー名 = ユーザーリスト[ユーザー名]
      let グループID = ""
      if(イベント配列[i].source.groupId) グループID = イベント配列[i].source.groupId
      let シート = GSSシートリスト.その他
      if(グループリスト[グループID]) シート = グループリスト[グループID]; グループID = ""
      SpreadsheetApp.openById(GSSシートリスト.シートID).getSheetByName(シート).appendRow([
        new Date,
        ユーザー名,
        イベント配列[i].message.text,
        グループID
      ])
    }
  }
}

















