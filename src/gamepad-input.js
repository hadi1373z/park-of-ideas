/* Standard browser gamepad layout. Button labels vary by controller mode. */
(()=>{'use strict';
window.createCityGamepad=function(getPads=()=>navigator.getGamepads?.()||[]){
 let previous=[],activeIndex=null,neutral=[];
 const axis=value=>{value=Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;return Math.abs(value)<=.18?0:Math.sign(value)*Math.min(1,(Math.abs(value)-.18)/.82);};
 const readAxis=(pad,i)=>{const value=Number.isFinite(pad.axes[i])?pad.axes[i]:0,center=neutral[i]||0,delta=value-center,range=delta>=0?1-center:1+center;return axis(delta/Math.max(.05,range));};
 return {calibrate(){const pad=Array.from(getPads()).find(p=>p?.connected&&p.index===activeIndex);if(!pad)return false;neutral=pad.axes.map(v=>Number.isFinite(v)?v:0);return true;},poll(blocked=false){
  const pads=Array.from(getPads()),active=pads.find(p=>p?.connected&&p.index===activeIndex),pad=active||pads.find(p=>p?.connected);
  if(!pad){previous=[];activeIndex=null;neutral=[];return {connected:false,forward:0,strafe:0,lookX:0,lookY:0,sprint:false,interact:false,start:false,confirm:false,back:false,menu:false,fast:false,light:false,music:false,next:false,previous:false,scroll:0,uiX:0,uiY:0};}
  if(activeIndex!==pad.index){previous=pad.buttons.map(b=>!!b.pressed);activeIndex=pad.index;neutral=[];}
  const buttons=pad.buttons.map(b=>!!b.pressed),edge=i=>!!buttons[i]&&!previous[i];
  const result={connected:true,forward:blocked?0:-readAxis(pad,1),strafe:blocked?0:readAxis(pad,0),lookX:blocked?0:readAxis(pad,2),lookY:blocked?0:readAxis(pad,3),sprint:!blocked&&!!buttons[10],interact:!blocked&&edge(0),start:!blocked&&edge(9),music:edge(7),confirm:edge(0),back:edge(1),menu:edge(9),fast:!blocked&&edge(3),light:!blocked&&edge(2),next:edge(13)||edge(15),previous:edge(12)||edge(14),scroll:edge(5)?1:edge(4)?-1:0,uiX:readAxis(pad,0),uiY:readAxis(pad,1)};
  previous=buttons;return result;
 }};
};
})();
