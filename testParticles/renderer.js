//Renderer
const Renderer={
render:function(emitter){
	if(emitter.customDraw){emitter.customDraw();}
	else{this.drawSquare(emitter);}	
},
drawSquare:function(emitter){
	const pool=emitter.pool;
	const {pos,size,color,alpha} =pool;
	for(let i=0;i<emitter.lastIndex+1;i++){
		ctx.fillStyle=`rgba(${color.r[i]/256},${color.g[i]/256},${color.b[i]/256},${alpha[i]+1/65536})`;
		ctx.fillRect(pos.x[i],pos.y[i],size[i],size[i]);
	}
	ctx.fillStyle='red';
	ctx.fillRect(5,5,5,5);
	ctx.fillRect(100-2.5,100-2.5,5,5);
	ctx.beginPath();
	ctx.arc(100,100,50,0,2*Math.PI,false);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(100,100,25,0,2*Math.PI,false);
	ctx.stroke();
	ctx.closePath();
}

};