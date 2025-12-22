//util
let seed= Math.floor(Math.random()*(1000000-100000)+100000);
console.log('seed:');
console.log(seed);
function rand(){
	seed ^= seed<<13;
	seed ^= seed>>17;
	seed ^= seed<<5;
	return (seed >>>0) /4294967296;
};
function randomArrInRange(arr,min,max, start, end){
	for(let i=start;i<end;i++){
		arr[i]=rand()*(max-min)+min;
	}
};
function linearArrInRange(arr,min,max,start,end){
	const slope=(max-min)/(end-start);
	for(let i=start;i<end;i++){
		arr[i]=min;
		min+=slope;
	}
};
function fillOrLinearOrRandom(numOrArr,targetArr,spread,start,end){
	if(Number.isFinite(numOrArr)){targetArr.fill(numOrArr,start,end);}
	else if(spread==='linear'){linearArrInRange(targetArr,numOrArr[0],numOrArr[1],start,end);}
	else{randomArrInRange(targetArr,numOrArr[0],numOrArr[1],start,end);}
};
function returnEnd(numOrArr,spread,start,end){
	if(Number.isFinite(numOrArr)){return numOrArr;}
	const endArr=[];
	if(spread==='linear'){
		linearArrInRange(endArr,numOrArr[0],numOrArr[1],start,end);
		return endArr;
	}else{
		randomArrInRange(endArr,numOrArr[0],numOrArr[1],start,end);
		return endArr;
	}
};
function findDelta(endNumOrArr,initNumOrArr,targetArr,poolArr,spread,start,end,life){
	const endValue= returnEnd(endNumOrArr,spread,start-start,end-start);
	if(Number.isFinite(endValue)){
		if(Number.isFinite(initNumOrArr)){
			for(let i=start;i<end;i++){
				targetArr[i]=(endValue-initNumOrArr)/(life[i]/1000);
			}
			return;
		}else{
			for(let i=start;i<end;i++){
				targetArr[i]=(endValue-poolArr[i])/(life[i]/1000);
			}
			return;
		}
	}else{
		for(let i=start;i<end;i++){
			targetArr[i]=(endValue[i-start] - poolArr[i])/(life[i]/1000);
		}
		return;
	}
};
function angleAndSpdToVec(angle,speed, vec,start,end){
	if(Number.isFinite(angle)&&Number.isFinite(speed)){
		const angleInRadians=angle*Math.PI/180;
		vec.x.fill(speed*Math.cos(angleInRadians),start,end);
		vec.y.fill(speed*Math.sin(-angleInRadians),start,end);
	}else{
		const total=end-start;
		let spdArr=null;
		let angleArr=null;
		let vx;
		let vy;
		if(Array.isArray(speed)){
			spdArr=Array(total);
			randomArrInRange(spdArr,speed[0],speed[1],0,total);
		}
		if(Array.isArray(angle)){
			angleArr=Array(total);
			randomArrInRange(angleArr,angle[0],angle[1],0,total);
		}
		for(let i=start;i<end;i++){
			const angleInRadians= (angleArr?.[i-start] ?? angle)*Math.PI/180;
			vx=(spdArr?.[i-start] || speed)*Math.cos(angleInRadians);
			vy=(spdArr?.[i-start] || speed)*Math.sin(angleInRadians);
			vec.x[i]=vx;
			vec.y[i]=-vy;
		}
	}
};