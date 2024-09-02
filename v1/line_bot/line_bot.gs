function main() {
  
};

function doPost(e){
  const json = JSON.parse(e.postData.contents);


  replyToken= json.events[0].replyToken;
  if (typeof replyToken === 'undefined') {
    return;
  }
};


//以下コピペ▽
