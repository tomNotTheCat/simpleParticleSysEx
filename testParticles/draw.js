//get html canvas
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
//drawLoop parameters
let pause=false;
let fps=30;
let msPerFrame=1000/fps;
//draw function
function draw(t,lt=t){
	let dt=t-lt;
	if(dt>1000)dt=50; //resolve to 50dt if user leave the tab after a while then come back.
	if(dt>msPerFrame&&pause==false){
		lt=t-(dt % msPerFrame);
		ctx.reset();
		ctx.save();

		for(let i=0;i<myEmitters.length;i++){
		Renderer.render(myEmitters[i]);
		myEmitters[i].update(dt);
		}

		requestAnimationFrame((t)=>{draw(t,lt)});		
	}else{requestAnimationFrame((t)=>{draw(t,lt)});}
};
