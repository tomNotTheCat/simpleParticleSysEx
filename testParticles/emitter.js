//Emitter
function Emitter(max,config){
	config={
		forever:config.forever||false,
		xshaking:config.xshaking||null,
		yshaking:config.yshaking||null,
		regen:config.regen||null,
		gravity:config.gravity||[0,0],
		drag:config.drag||[0,0],
		pierce:config.pierce||true,
		radicalStrength:config.radicalStrength||null,
		center:config.center||[0,0],
		bounce:config.bounce||false,
		image:config.image||null,
	};
	if(config.bounce&&config.pierce)throw Error('config. pierce and bounce can not co-exist, exit.\n--Emitter constructor');
	if(config.forever&&config.regen)throw Error('config. regen and forever can not co-exist, exit.\n--Emitter constructor');
	this.config=config;
	this.max=max;
	this.lastIndex=-1;
	this.pool={
		pos:{
			buffer:new Float32Array(this.max*2),
			x: null,
			y: null
		},
		vec:{
			buffer:new Float32Array(this.max*2),
			x: null,
			y: null
		},
		life: null,
		size:null,
		color: {
			buffer:null,
			r:null,
			g:null,
			b:null
			},
		alpha:null,
		delta:{
			size:null,
			color:{
				buffer:null,
				r:null,
				g:null,
				b:null
			},
			alpha:null
		}
	};
	this.pool.pos.x=this.pool.pos.buffer.subarray(0,this.max);
	this.pool.pos.y=this.pool.pos.buffer.subarray(this.max,this.max*2);
	this.pool.vec.x=this.pool.vec.buffer.subarray(0,this.max);
	this.pool.vec.y=this.pool.vec.buffer.subarray(this.max,this.max*2);
	this.regenInit=null;
	this.customDraw=null;
	this.customUpdate=null;
};

Emitter.prototype={
	
createPool:function(){
	const pool=this.pool;
	pool.life=new Uint16Array(this.max);
	pool.size=new Float16Array(this.max);
	pool.alpha=new Uint16Array(this.max);
	pool.color.buffer=new Uint16Array(this.max*3);
	pool.color.r=pool.color.buffer.subarray(0,this.max);
	pool.color.g=pool.color.buffer.subarray(this.max,this.max*2);
	pool.color.b=pool.color.buffer.subarray(this.max*2,this.max*3);
	const delta=pool.delta;
	delta.size=new Float16Array(this.max);
	delta.alpha=new Float16Array(this.max);
	delta.color.buffer=new Uint16Array(this.max*3);
	delta.color.r=delta.color.buffer.subarray(0,this.max);
	delta.color.g=delta.color.buffer.subarray(this.max,this.max*2);
	delta.color.b=delta.color.buffer.subarray(this.max*2,this.max*3);	
},
restart:function(){
	const pool=this.pool;
	const max=this.max;
	pool.pos.buffer.fill(0,0,max);
	pool.vec.buffer.fill(0,0,max);
	pool.life.fill(0,0,max);
	pool.size.fill(0,0,max);
	pool.alpha.fill(0,0,max);
	pool.color.buffer.fill(0,0,max);
	pool.delta.size.fill(0,0,max);
	pool.delta.alpha.fill(0,0,max);
	pool.delta.color.buffer.fill(0,0,max);
},
	
generate:function(init,total=this.max){
	//check if init.life is lower than 65,535
	if(Number.isFinite(init.life)){
		if(init.life>65535)throw Error("init life can not exceed 65,535 ms because internal Uint16Array,\nexit.\n--Emitter.generate\nif need longer life, change the constructor or manually assign a larger array.\n");
	}else{
		if(init.life[0]>65535||init.life[1]>65535)throw Error("init life can not exceed 65,535 ms because internal Uint16Array,\nexit.\n--Emitter.generate\nif need longer life, change the constructor or manually assign a larger array.\n");
	}	
	//lower exceeding total to max
	if((total+this.lastIndex+1)>this.max)total=this.max-this.lastIndex-1;
	//get pool and pointers
	const cfg=this.config;
	const pool=this.pool;
	const start=this.lastIndex+1;
	const end=start+total;
	if(this.regenInit!==init){
	//formalize initializer
	init={
	x:init.x||0,
	y:init.y||0,
	life:init.life||1000,
	size:init.size||5,
	endSize:init.size||null,
	color:init.color||[255,255,255],
	endColor:init.endColor||null,
	alpha:init.alpha||1,
	endAlpha:init.alpha||null,
	angle:init.angle||[0,360],
	speed:init.speed||0
	};
	//change init. x y from relative to Emitter center to relative to canvas	
	if(Number.isFinite(init.x)){
		init.x+=cfg.center[0];
	}else{
		init.x[0]+=cfg.center[0];
		init.x[1]+=cfg.center[0];
	}
	if(Number.isFinite(init.y)){
		init.y+=cfg.center[1];
	}else{
		init.y[0]+=cfg.center[1];
		init.y[1]+=cfg.center[1];
	}
	// multiply int.color rgb by 256 and alpha by 256 -1 for easier store, and delta too.
	for(let i=0;i<init.color.length;i++){
		if(Number.isFinite(init.color[0])){
			init.color[i]*=256;
		}else{
			init.color[i][0]*=256;
			init.color[i][1]*=256;
		}
	}
	if(Number.isFinite(init.alpha)){
		if(init.alpha!==0)init.alpha= init.alpha*65536-1;
	}else{
		if(init.alpha[0]!==0)init.alpha[0]=init.alpha[0]*65536-1;
		if(init.alpha[0]!==0)init.alpha[1]=init.alpha[1]*65536-1;
	}
	if(init.endColor){
		for(let i=0;i<init.color.length;i++){
		if(Number.isFinite(init.color[0])){
			if(init.endColor!==0)init.endColor[i]*=256;
		}else{
			if(init.endColor[0]!==0)init.endColor[i][0]*=256;
			if(init.endColor[1]!==0)init.endColor[i][1]*=256;
		}
		}
	}else{init.endColor=init.color;}
	if(Number.isFinite(init.endAlpha)){
		if(init.endAlpha!==0)init.endAlpha= init.endAlpha*65536-1;
	}else if(Array.isArray(init.endAlpha)){
		if(init.endAlpha[0]!==0)init.endAlpha[0]=init.endAlpha[0]*65536-1;
		if(init.endAlpha[0]!==0)init.endAlpha[1]=init.endAlpha[1]*65536-1;
	}else{init.endAlpha=init.alpha;}
	if(!init.endSize)init.endSize=init.size;
	if(cfg.regen) this.regenInit= init;
	}
	//set up pos x,y, size, life, color, and alpha
	fillOrLinearOrRandom(init.x,pool.pos.x,init.spread?.x,start,end);
	fillOrLinearOrRandom(init.y,pool.pos.y,init.spread?.y,start,end);	
	fillOrLinearOrRandom(init.size,pool.size,init.spread?.size,start,end);
	fillOrLinearOrRandom(init.life,pool.life,init.spread?.life,start,end);
	fillOrLinearOrRandom(init.color[0],pool.color.r,init.spread?.color,start,end);
	fillOrLinearOrRandom(init.color[1],pool.color.g,init.spread?.color,start,end);
	fillOrLinearOrRandom(init.color[2],pool.color.b,init.spread?.color,start,end);
	fillOrLinearOrRandom(init.alpha,pool.alpha,init.spread?.alpha,start,end);
	//vec x,y
	angleAndSpdToVec(init.angle,init.speed,pool.vec,start,end);
	//delta --
	const delta=pool.delta;
		//size
	if(init.endSize===init.size){delta.size.fill(0,start,end);}
	else{findDelta(init.endSize,init.size,delta.size,pool.size,init.spread?.endSize,start,end,pool.life);}
		//color
	if(init.endColor===init.color){
		delta.color.r.fill(0,start,end);
		delta.color.g.fill(0,start,end);
		delta.color.b.fill(0,start,end);
	}else{
		findDelta(init.endColor[0],init.color[0],delta.color.r,pool.color.r,init.spread?.color,start,end,pool.life);
		findDelta(init.endColor[1],init.color[1],delta.color.g,pool.color.g,init.spread?.color,start,end,pool.life);
		findDelta(init.endColor[2],init.color[2],delta.color.b,pool.color.b,init.spread?.color,start,end,pool.life);
	}
		//alpha
	if(init.endAlpha===init.alpha){delta.alpha.fill(0,start,end);}
	else{findDelta(init.endAlpha,init.alpha,delta.alpha,pool.alpha,init.spread?.alpha,start,end,pool.life);}
	//pointer
	if(cfg.regen)this.regenInit=init;
	this.lastIndex += total;
},

update: function(dt){
	const cfg=this.config;
	const pool=this.pool;
	let {pos,vec,life,size,color,alpha,delta}= pool;
	const dtSec=dt/1000;
	for(let i=0;i<this.lastIndex+1;i++){
		//life
		if(!cfg.forever){
			if(life[i]<dt){
				this.returnToPool(i);
				i--;
				if(cfg.regen){
					if((this.max-this.lastIndex)>cfg.regen){
						this.generate(this.regenInit,cfg.regen);
					}
				}
				continue;
			}
			life[i]-=dt;
		}
		//vec and pos
		//circular
		if(cfg.radicalStrength){
			let dx=cfg.center[0]-pos.x[i];
			let dy=cfg.center[1]-pos.y[i];
			vec.x[i]+=dx*dtSec*cfg.radicalStrength;
			vec.y[i]+=dy*dtSec*cfg.radicalStrength;
			
			pos.x[i]+=vec.x[i]*dtSec*cfg.radicalStrength;
			pos.y[i]+=vec.y[i]*dtSec*cfg.radicalStrength;
		}else{
		//gravity and drag
		vec.x[i]+=cfg.gravity[0]*dtSec;
		vec.x[i]*=(1-cfg.drag[0]*dtSec);
		vec.y[i]+=cfg.gravity[1]*dtSec;
		vec.y[i]*=(1-cfg.drag[1]*dtSec);
		pos.x[i]+=vec.x[i]*dtSec;
		pos.y[i]+=vec.y[i]*dtSec;
		}
		//size		
		size[i]+=delta.size[i]*dtSec;
		//color
		color.r[i]+=delta.color.r[i]*dtSec;
		color.g[i]+=delta.color.g[i]*dtSec;
		color.b[i]+=delta.color.b[i]*dtSec;
		//alpha
		pool.alpha[i]+=delta.alpha[i]*dtSec;
		//other config conditions
		if(cfg.xshaking){
			if(rand()*100<cfg.xshaking)pos.x[i]+=rand()*2-1;
		}
		if(cfg.yshaking){
			if(rand()*100<cfg.yshaking)pos.y[i]+=rand()*2-1;
		}
		
	/*
		pierce:config.pierce||true,
		bounce:config.bounce||false,
	*/	
		if(this.customUpdate) this.customUpdate();
	}
	
},

returnToPool: function(i){
	const {pos,vec,life,size,color,alpha,delta}= this.pool;
	
	pos.x[i]=pos.x[this.lastIndex];
	pos.y[i]=pos.y[this.lastIndex];
	vec.x[i]=vec.x[this.lastIndex];
	vec.y[i]=vec.y[this.lastIndex];
	life[i]=life[this.lastIndex];
	life[this.lastIndex]=0;
	size[i]=size[this.lastIndex];
	delta.size[i]=delta.size[this.lastIndex];
	alpha[i]=alpha[this.lastIndex];
	delta.alpha[i]=delta.alpha[this.lastIndex];
	color.r[i]=color.r[this.lastIndex];
	color.g[i]=color.g[this.lastIndex];
	color.b[i]=color.b[this.lastIndex];	
	delta.color.r[i]=delta.color.r[this.lastIndex];
	delta.color.g[i]=delta.color.g[this.lastIndex];
	delta.color.b[i]=delta.color.b[this.lastIndex];
	
	this.lastIndex--;
	if(this.lastIndex<0) console.log('Emitter: all particles died');
	return;
},
destroy:function(){
	this.config=null;
	this.max=null;
	this.lastIndex=null;
	this.pool.pos=null;
	this.pool.color=null;	
	this.pool.delta=null
	this.pool=null;
	this.regenInit=null;
	this.customDraw=null;
}
	
};