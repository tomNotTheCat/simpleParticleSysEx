//working in progress

function fluidEmitter(max, config){
	Emitter2.call(this,max,config);
};
fluidEmitter.prototype={
generate:function(init,total=this.max){
	if(total>this.max-this.lastIndex+1) total=this.max-this.lastIndex+1;
	//formalize
	init={
	x:init.x||0,
	y:init.y||0,
	size:init.size||5,
	color:init.color||[255,255,255],
	alpha:init.alpha||1,
	angle:init.angle||[0,360],
	speed:init.speed||0
	};
	//get pool and pointers
	const cfg=this.config;
	const pool=this.pool;
	const start=this.lastIndex+1;
	const end=start+total;
	//change init. x y from relative to Emitter center to relative to canvas
	if(Number.isFinite(init.x)){init.x+=cfg.center[0];
	}else{
		init.x[0]+=cfg.center[0];
		init.x[1]+=cfg.center[0];
	}
	if(Number.isFinite(init.y)){init.y+=cfg.center[1];
	}else{
		init.y[0]+=cfg.center[1];
		init.y[1]+=cfg.center[1];
	}
	//check init.endColor/size/alpha
	if(!init.endColor)init.endColor=init.color;
	if(!init.endAlpha)init.endAlpha=init.alpha;
	if(!init.endSize)init.endSize=init.size;
	//set up pos x,y
	fillOrLinearOrRandom(init.x,pool.pos.x,init.spread?.x,start,end);
	fillOrLinearOrRandom(init.y,pool.pos.y,init.spread?.y,start,end);	
	//vec x,y
	angleAndSpdToVec(init.angle,init.speed,pool.vec,start,end);
	//life, size, and color
	pool.life=init.life;
	pool.size=init.size;
	pool.color.r=init.color[0];
	pool.color.g=init.color[1];
	pool.color.b=init.color[2];
	pool.alpha=init.alpha;
	//delta --
	const delta=pool.delta;
		//size
	if(init.endSize===init.size){delta.size=0;}
	else{delta.size=(initsize-init.endSize)/init.life;}
		//color
	if(init.endColor===init.color){
		delta.color.r=0;
		delta.color.g=0;
		delta.color.b=0;
	}else{
		delta.color.r=(init.endColor[0]-init.color[0])/init.life;
		delta.color.g=(init.endColor[1]-init.color[1])/init.life;
		delta.color.b=(init.endColor[2]-init.color[2])/init.life;
	}
		//alpha
	if(init.endAlpha===init.alpha){delta.alpha.fill(0,start,end);}
	else{findDelta(init.endAlpha,init.alpha,delta.alpha,pool.alpha,init.spread?.alpha,start,end,pool.life);}
	//pointer
	if(cfg.regen)this.regenInit=init;
	this.lastIndex += total;
},

update: function(dt){

}

}