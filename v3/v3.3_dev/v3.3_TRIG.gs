function TRIG  ( ){       EXE.sysCall({func:[`TRIG`                 ]       })}
function doPost(e){       EXE.sysCall({func:[`HTTP`,e.parameter.from],data:e})}
function doGet (e){return EXE.sysCall({func:[`HTTP`,e.parameter.from],data:e})}