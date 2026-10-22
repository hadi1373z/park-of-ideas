export const PARK_RADIUS=235;
export function boundedPoint(x,z,radius=PARK_RADIUS){if(!Number.isFinite(x)||!Number.isFinite(z))return null;const length=Math.hypot(x,z),k=length>radius?radius/length:1;return{x:x*k,z:z*k};}
export function moveVisitor(player,strafe,forward,dt,speed=16){const length=Math.hypot(strafe,forward);if(!length||!Number.isFinite(dt)||dt<=0)return player;const step=Math.min(dt,.06)*speed/Math.max(1,length),s=Math.sin(player.yaw),c=Math.cos(player.yaw),p=boundedPoint(player.x+(strafe*c-forward*s)*step,player.z+(-strafe*s-forward*c)*step);return p?{...player,...p}:player;}
