//main
//Emitters
const myEmitters=[]; //array to hold emmitter to render and update

let config={
	xshaking:20,
	regen:3,
	center:[200,200]
};
let init={
	x:[-25,25],
	y:[-20,0],
	life:[3*1000,6*1000],
	size:[3,6],
	endSize:4,
	color:[255,0,0],
	endColor:[255,200,0],
	alpha:1,
	endAlpha:0,
	angle:[80,100],
	speed:[10,20]
};

let fire= new Emitter(25,config);
fire.createPool();
fire.generate(init);

config={
	forever:true,
};
init={
	x:[0,canvas.width],
	y:[-500,0],
	life:1,
	size:2,
	color:[0,0,100],
	endColor:null,
	alpha:1,
	angle:[235,270],
	speed:100
};

rain= new Emitter(100,config);
rain.createPool();
rain.generate(init);
rain.customUpdate=function(){
	const pos=this.pool.pos;
	for(let i=0;i<this.lastIndex;i++){
	if(pos.y[i]>canvas.height){
		pos.y[i]=0;
		pos.x[i]=rand()*canvas.width*1.1;
	}
	}
};

config={
	gravity:[0,150],
	drag:[0,0],
	center:[25,250],
	regen:10
};
init={
	x:0,
	y:[-5,0],
	life:[2*1000,3*1000],
	size:[1,3],
	color:[255,0,0],
	endColor:null,
	alpha:1,
	endAlpha:null,
	angle:[40,60],
	speed:[80,120]
};

let blood=new Emitter(50,config);
blood.createPool();
blood.generate(init,50);

let stars=new Emitter(20,
{
	forever:true,
	center:[100,100],
	radicalStrength:2
});
stars.createPool();
stars.generate({
	x:-25,
	y:0,
	life:5000,
	size:5,
	color:[100,150,255],
	endColor:null,
	alpha:1,
	endAlpha:null,
	angle:45,
	speed:25
},1);
stars.generate({
	x:-50,
	y:0,
	life:5000,
	size:5,
	color:[100,150,255],
	endColor:null,
	alpha:1,
	endAlpha:null,
	angle:90,
	speed:50
},1);

myEmitters.push(fire,rain,blood,stars);

requestAnimationFrame(draw);
