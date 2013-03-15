
module.exports = function(endfun,thisRoot){
 var callback=endfun;
 var number=0;
 var rwalked=false;
 this.kill = function(){
  if(rwalked)return;
  rwalked=true;
  callback.apply(thisRoot,[]);
 };
 this.call = function (cfun,thsObj){
  var curcb=cfun;
  var walked=false;
  ++number;
  return function(){
   curcb.apply(thsObj,arguments);
   if(walked)return;
   --number;
   walked=true;
   if(rwalked)return;
   if(number<=0){
	rwalked=true;
	callback.apply(thisRoot,[]);
   }
  };
 };
};
