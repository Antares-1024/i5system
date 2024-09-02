//i5system 起動用スクリプト
"use strict";

const cradle   =( )=>{       EXE.sysCall({func:`cradle`         ,       })};
const timeTrig =( )=>{       EXE.sysCall({func:`timeTrig`       ,       })};
const doPost   =(e)=>{return EXE.sysCall({func:e.parameter?.from, data:e})};
const doGet    =(e)=>{return EXE.sysCall({func:e.parameter?.from, data:e})};