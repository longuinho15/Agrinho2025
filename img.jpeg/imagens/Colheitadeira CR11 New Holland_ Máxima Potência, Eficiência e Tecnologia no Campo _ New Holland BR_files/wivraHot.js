/* 
	
	Web Interactive Virtual Reality Animation Viewer
	
	wivra.js ver. 1.9.1
	
	(c) 2016 Altran 
	
	Author: Flavio Ficcadenti, Rev Roberto Scanavino
	
	Date: March 30th, 2016
	Last Rev: December, 22nd, 2016
	
	*/


/**
* Wivra Viewer Hot
*
* @class wivraViewerHot
* @constructor
*/

window.wivraViewerHot=function(wOpt){
	//'use strict';
		
	var imgStack=new Array();
	var btImgStack=new Array();
  	var wCanvas; 		
	var wContainer;
	var wCtx;
	var ready=false;

	
	/**
	 * default options
	 */
	
	var wdc = { 					// Wivra Default Config
			
		wDiv 			: wOpt.wDiv			|| "wivra",		// box id animation place
		
		path 			: wOpt.path			|| "",	        // path To folderName
		folderName 		: wOpt.folderName 	|| "",		// folder / modelName 
		
		preview			: wOpt.preview		|| "0_0.png", 	// a file in folder to preview
		
		width 			: wOpt.width		|| 554,			// image (canvas) pixel width
		height 			: wOpt.height		|| 375,			// image (canvas) pixel height
		
		bgColor 		: wOpt.bgColor		|| false,		// Hex or false for transparent
		
		h 				: ('h' in wOpt) ? wOpt.h : 32,			// radial view number - lamda
		v				: ('v' in wOpt) ? wOpt.v : 3,			// azimut view number - phi
		
		hCircle 		: wOpt.hCircle		|| true,		// true if horizzontally goes in circle
		vCircle 		: wOpt.vCircle		|| false,		// true if vertically goes in circle
		
		hSensitivity 	: wOpt.hSensitivity	|| 10,			// decrease to more horizzontal sensibility of pointer
		vSensitivity 	: wOpt.vSensitivity	|| 20,			// decrease to more vertical sensibility of pointer
		
		hStartId 		: wOpt.hStartId		||	25,			// horizzontal img Id of start/preview pic
		vStartId 		: wOpt.vStartId		||	0,			// vertical img Id of start/preview pic
		
		//zoom 			: wOpt.zoom 		|| true,	   	//zoom events active (true or False)
		zoom 			: ('zoom' in wOpt) ? wOpt.zoom : true,		//zoom events active (true or False)
		
		fluecy 			: wOpt.fluecy		|| 17.96,		// kinetic damping
			
		GUIButton 		: wOpt.GUIButton	|| false,		// activate event on buttons
		
		imageExtension 	: wOpt.imageExtension ||	"png", 	// file extension
		//showLoading : wOpt.showLoading	||	true
		
		revorder		: ('revorder' in wOpt) ? wOpt.revorder : false,	 // revers order image shift (from max to 0 if true)

		tutorialImg 	: wOpt.tutorialImg	||	"",			// tutorial Image
		
		imgHotspotOff   : wOpt.imgHotspotOff  || "",	// image hotspot off

		imgHotspotOn    : wOpt.imgHotspotOn  || "",	    // image hotspot on
		
	    offsImgHotspot  : ('offsImgHotspot' in wOpt) ? wOpt.offsImgHotspot : { x:-20, y:-20 },			// offset of ico hotspot image on & off
		
		imgHotspot360   : wOpt.imgHotspot360  || "",	    // image hotspot 360
		
		styleCursor		: wOpt.styleCursor	||	"",			// cursorStyle
		
		pathSource 		: wOpt.pathSource	|| "",	        // path To Source
		
		advanced 		: wOpt.advanced 	|| false  		// advanced info useful for development enviroment 
		
	}
	
//alert('zizzi');
	
	var animate =				// animation
		window.requestAnimationFrame||
		window.webkitRequestAnimationFrame||
		window.mozRequestAnimationFrame||
		window.oRequestAnimationFrame||
		window.msRequestAnimationFrame||
		function(callback){
			window.setTimeout(callback,1000/100)
		};
		

	var fCanvas=undefined;
	//var z	=undefined;
	//var J	=undefined;
	
	var tutorialImg;
	var primaImg;
	var blinkImg=1;
	var blinkInt;
	
	if(document.createElement("canvas").getContext){
		 
		wCanvas=document.createElement("canvas");

		wCanvas.id= "canv" + wdc.wDiv;
		
		wCanvas.width	=wdc.width;
		wCanvas.height	=wdc.height;
		
		wContainer=document.getElementById(wdc.wDiv);
		
		wContainer.innerHTML=""; // to put an image preview in case of error or latency
		wContainer.appendChild(wCanvas);
		
		wCanvas.setAttribute('style','border:1px solid green');
		wCanvas.setAttribute('oncontextmenu','return false;');
		
		wCtx=wCanvas.getContext("2d");
		
		var vendorPref=["Webkit","Moz","0","ms","Ms"];
		for(var i=0; i<vendorPref.length; i++){
			"undefined"!=typeof document.documentElement.style[vendorPref[i]+"Transform"] && (z="-"+vendorPref[i].toLowerCase()+"-",J=vendorPref[i]+"Transform");
		}
		
		setContainerStyle(z);
		
		setCanvasStyle(z);
		
		clearCanvas();
		
		img=previewImage(wCtx);
		
		setSession ('lambdaHot',wdc.vStartId);
		setSession ('phiHot',wdc.hStartId);
		
		onResizing();
		
	} else {
		
		alert("Your browser must support HTML5");
		
	}
	
	
	
	
	/**
	 * Positioning
	 * & resizing
	 */
	
	function setContainerStyle (z) {
		
		st= 'width:'+wdc.width+'px;';
		
		st+='height:'+wdc.height+'px;';
		
		st+='max-width:100%;';
		
		st+='max-heigth:100%;';

		st+='overflow: hidden;';
		
		st+=z+'user-select:none;';

		if (wdc.bgColor && /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(wdc.bgColor)) {
			//st+='background-color:'+ wdc.bgColor +';';
			st+='background-color:'+wdc.bgColor+';';
		} else {
			st+='background-color:transparent;';
		}
		
		wContainer.setAttribute('style',st);		
		
	}
	
	function setCanvasStyle (z) {

    	var w = wContainer.offsetWidth;

    	var h = wContainer.offsetHeight;

		st= 'width:100%;';

		st+='position:relative;';
		
		st+='left:'+(w/2)+'px;';
		st+='top:'+(h/2)+'px;';
		
		st+='margin-left:-'	+(w/2)+'px;';
		st+='margin-top:-'	+(h/2)+'px;';
		
		st+=z+'user-select:none;';
		
	//	alert(st);
		wCanvas.setAttribute('style',st);
	}

	function onResizing(){

		viewPortX=screen.availWidth;
		viewPortY=screen.availHeight;
		//alert(viewPortX);
		//alert(viewPortY);

		var wC = wContainer.offsetWidth;
    	var hC = wContainer.offsetHeight;
		
		
		if (viewPortY<=wdc.height) { // for landscape mobile
			//alert(111)
	    	var hW = viewPortY;
	    	var wW = (wdc.width/wdc.height)*viewPortY;
	    	
		} else { 
			//alert( wContainer.offsetWidth);
    	    //alert( wContainer.offsetHeight);
		
			var wW = wC;
			if (wC > viewPortX) 
			     wW= viewPortX;
	    	var hW = (wdc.height/wdc.width)*wW;
		}
				
    	//alert(wW);
		//alert(hW);

		
    	var wCa=wCanvas.style.width=wW+'px';
    	var hCa=wCanvas.style.height=hW+'px';
    	
    	
		if (viewPortY<=wdc.height) { // for landscape mobile

	    	wCanvas.style.left	= wC/2 + 'px';
	    	wCanvas.style.top	= '0px';
			mL= -(wW)/2;
			mT= 0;
	    	
		} else { 
		    if (wC > viewPortX) 
			{
				wCanvas.style.left	= '0px';
				wCanvas.style.top	= hW/2 + 'px';
				mL= 0;
				mT= -(hW)/2;
			}
			else
			{
				wCanvas.style.left	= wW/2 + 'px';
				wCanvas.style.top	= hW/2 + 'px';
				mL= -(wW)/2;
				mT= -(hW)/2;
			}
    	}
				
    	wCanvas.style.marginLeft=mL+'px';
    	wCanvas.style.marginTop	=mT+'px';

    	if(wdc.advanced) if(document.getElementById("wheel")) document.getElementById("wheel").innerHTML = 'Resized';
	}

	/**
	 * set preview image in wContainer div
	 */
	
	function previewImage(wCtx) {
		
		primaImg = new Image(wdc.width, wdc.height);
		
		primaImg.src = wdc.path+'/'+ wdc.folderName + '/' +wdc.vStartId + '_' + wdc.hStartId + '.' + wdc.imageExtension;
		primaImg.setAttribute('id','wPreview');
				
		primaImg.onload=function(){
			wCtx.drawImage(primaImg,0,0);
		}
		
		tutorialImg = new Image(516,295);
		
		tutorialImg.src = wdc.tutorialImg;
		tutorialImg.setAttribute('id','wTutorial');
		
		tutorialImg.onload=function(){
	//		wCtx.scale(1.10, 1.10);		
			wCtx.drawImage(tutorialImg,0,0);
	//		wCtx.scale(0.90, 0.90);		
		}
		
		blinkInt = setInterval(function(){ 
			if(blinkImg==1)
				wCtx.drawImage(primaImg,0,0);
			else
				wCtx.drawImage(tutorialImg,0,0);
			blinkImg = -blinkImg;	
				}, 500);
		
		preLoad();
		
		//alert('caricata');
		return true;
	}
	
	
	
	
	
	/**
	 * preload image
	 */
	
	
	function preLoad() {
	
		function statoLoad(){
				
					loadingPerCent=parseInt((counter++/(wdc.h*wdc.v))*100);
						
					if(wdc.advanced)cp.innerHTML = '<p>' + loadingPerCent + '% counter' + counter + ' tot:' + (wdc.h*wdc.v);
				

					if (counter >= (wdc.h*wdc.v) ) {
						
						ready=true;
						if(wdc.advanced) cp.innerHTML = 'Ready';
						
	//					wContainer.removeChild(loadignIco);
						
						//setTimeout(function(){allLoading.removeChild(lIco)}, 100);

						document.getElementById(wdc.wDiv).style.cursor = wdc.styleCursor;
						
						//setTimeout(function(){allLoading.innerHTML='&nbsp;'},2000);
						setTimeout(function(){clearInterval(blinkInt);},1000);
						
						
						// again preview imga
					}
				}
				

		imgStack=new Array(wdc.v);
		
		var counter=1;
		
		var cp		= document.getElementById('centerProgress');
		
		var allLoading=document.getElementById('allLoading');
		
		var lIco	=document.getElementById('loadingIco');
		
		//loadignIco=document.createElement("img");
		
		//loadignIco.setAttribute('src', wdc.path + '/'+'src/img/rolling.svg');
		
		//loadignIco.setAttribute("style","margin-left:-1000px;margin-top:-250px;");
		
		var loadingPerCent=0;
		
		//wContainer.appendChild(loadignIco);
		
		for (var j=0; j<wdc.v; j++){
			
			imgStack[j]=new Array(wdc.h);
			
			for (var i=0; i<wdc.h; i++){
	
				imgStack[j][i] = new Image(wdc.width, wdc.height);
				imgStack[j][i].j = j;
				imgStack[j][i].i = i;
	
				imgStack[j][i].src = wdc.path + '/'+ wdc.folderName+'/'+j+'_'+i + '.' + wdc.imageExtension;
				
				imgStack[j][i].onerror=function(){
				    //alert(i);
					//alert(this.src);
					statoLoad();
				}
				
				// Show percent preload
				imgStack[j][i].onload=statoLoad;
				
			}
		}
		
		btImgStack=new Array(3);
		
		btImgStack[0]=new Image(40, 40);
		btImgStack[0].src = wdc.imgHotspotOff;
		btImgStack[1]=new Image(40, 40);
		btImgStack[1].src = wdc.imgHotspotOn;
		btImgStack[2]=new Image(35, 35);
		btImgStack[2].src = wdc.imgHotspot360;
		
	}
	
	
	
	/**
	 * lambda vertical coordinate
	 * phi horizzontal coordinate
	 */
	
	

	
	/**
	 * SHOW IT
	 */
	
	function showIt(lambda1, phi1){
		
		try {
			imageIt=imgStack[lambda1][phi1];
		}
		catch(err) {
			alert('image ' + lambda1 + ' ' + phi1 + err.message);		
		}

try {
		
		clearCanvas();

		wCtx.drawImage(imageIt,0,0);
		
		setSession ('lambdaHot',lambda1);

		setSession ('phiHot',phi1);
		
		for (var i = 0; i < hotSpot.length; i++) {
			if( hotSpot[i].phi1 <= phi1 && phi1 <= hotSpot[i].phi2 &&
				hotSpot[i].lambda1 <= lambda1 && lambda1 <= hotSpot[i].lambda2) {
					if(hotSpot[i].action.type=='panorama') 
					{
						wCtx.drawImage(btImgStack[2],Math.max(hotSpot[i].x + wdc.offsImgHotspot.x,0),Math.max(hotSpot[i].y+wdc.offsImgHotspot.y,0));
					}
					else
					{					
						wCtx.drawImage(btImgStack[0],Math.max(hotSpot[i].x + wdc.offsImgHotspot.x,0),Math.max(hotSpot[i].y + wdc.offsImgHotspot.y,0));
					}
//					var centerX = hotSpot[i].x;
//					var centerY = hotSpot[i].y;
//					wCtx.beginPath();
//					wCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
//					wCtx.lineWidth = 5;
//					wCtx.strokeStyle = '#FFFF00';
//					wCtx.stroke();
			}
		}
	}
	catch(err) {
		alert('ShowIt' + err.message);		
	}
		

	}
	
	/**
	 * session values set and get
	 * 
	 * @param key
	 * @param value
	 * @returns {Boolean}
	 */
	
	function setSession (key,value) {
		
		if(typeof(Storage) !== "undefined") {
			
			sessionStorage.setItem(key,Number(value));
			
			return true;
			
			} else {
	    	
	        alert( "Your browser does not support web storage ... ");
	    
	    }
		
	}
	
	/**
	 * Get session value by name
	 * @param key
	 * @returns
	 */
	
	function getSession (key) {
		
		if(value = sessionStorage.getItem(key))return Number(value);
		
		else return false;
		
	}
	
	
	/**
	 * Clear Canvas function
	 */
	
	function clearCanvas(){
		//alert('clear');
		
		if (wdc.bgColor && /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(wdc.bgColor)) {
			//wCtx.beginPath();
			wCtx.rect(0, 0, wdc.width, wdc.height);
			wCtx.fillStyle=wdc.bgColor;
			wCtx.fill();
		} else {
			wCtx.clearRect(
				0,0,
				wdc.width,
				wdc.height);
		}
	}
	
	
	/**
	 * FULL SCREEN
	 */
	
	
	function fullScreen () {
		
		var elem = wContainer; 
		
		if (elem.requestFullscreen) {
		  elem.requestFullscreen();
		} else if (elem.msRequestFullscreen) {
		  elem.msRequestFullscreen();
		} else if (elem.mozRequestFullScreen) {
		  elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
		  elem.webkitRequestFullscreen();
		}
		
		addExitFullScreenButton();
		
	}
	
	function addExitFullScreenButton() {
			
		ico=document.createElement("i");
		ico.setAttribute('class','fa fa-compress');
		
		b=document.createElement("button");
		b.setAttribute('title','Exit Full Screen');
		b.setAttribute('id','exitFullScreen');
		
		st="position:absolute;";
		st+="margin: 30px;";
		st+="top: 30px; left: 30px;";
		st+="z-index: 1000";
		
		b.setAttribute("style",st);

		onResizing();
		
		b.appendChild(ico);
		
		wContainer.appendChild(b);
		
		b.addEventListener('click', closeFullscreen, false);
		
	}
	
	function removeExitFullScreenButton() {
		var elem=document.getElementById('exitFullScreen');
		elem.removeEventListener('click', closeFullscreen)<
		wContainer.removeChild(elem);
	}
	
	function  closeFullscreen()  {
		  if(document.exitFullscreen)  {
		    document.exitFullscreen();
		  }  else  if(document.mozCancelFullScreen)  {
		    document.mozCancelFullScreen();
		  }  else  if(document.webkitExitFullscreen)  {
		    document.webkitExitFullscreen();
		  }
		  
		  removeExitFullScreenButton();
		}

	

	
	
	
	/**
	 * MOVEMENTS
	 * 
	 * 
	 * 
	 * lambda 	= longitude, meridian values, identifier, the perspective moving horizontally;
	 * phi 		= latitude, parallel values, azimut, the perspective rising vertically;
	 * 
	 */
	

	function rightleft(p) { 
	
			
		if( ! ready) return;	
		var img = document.getElementById("wivraico");
		if(img)
			img.style.visibility = 'hidden';
	
		lambda=getSession ('lambdaHot');
		phi=getSession ('phiHot');

	    if(p=='l') {

			phi-=1;
			
			if (phi<0) {
				if(wdc.hCircle)
					phi=(wdc.h-1); // back to last
				else
					phi=0;
			} 		
		}
        else
		{
		
			phi+=1;
			
			if (phi>(wdc.h-1)) {
				if(wdc.hCircle)
					phi=0; // back to beginning
				else
					phi=wdc.h-1;
				
			}
		}

		if(wdc.advanced) if(document.getElementById("h")) document.getElementById("h").innerHTML = phi;
		  
		showIt(lambda,phi);
	
	}

	/**
	 * RIGHT
	 */
	
	function right () { 
		rightleft( wdc.revorder ? 'l' : 'r');		
	}
	
	/**
	 * LEFT
	 */
	
	function left () {
		rightleft( wdc.revorder ? 'r' : 'l');		
	}
	
	/**
	 * UP
	 */
	
	function up () {

		lambda=getSession ('lambdaHot');
		phi=getSession ('phiHot');

		lambda+=1;
		
		if (lambda>(wdc.v-1)) {
			if(wdc.vCircle)
				lambda=0; // back to beginning
			else
				lambda=wdc.v-1;
		}

		if(wdc.advanced) document.getElementById("v").innerHTML = lambda;
		  
		showIt(lambda,phi);
		
	}
	
	/**
	 * DOWN
	 */
	
	function down () {
		
		lambda=getSession ('lambdaHot');
		phi=getSession ('phiHot');

		lambda-=1;
		
		if (lambda<0) {

			if(wdc.vCircle)
				lambda=wdc.v-1; // back to last
			else
				lambda=0;
		}
		
		if(wdc.advanced) if(document.getElementById("v")) document.getElementById("v").innerHTML = lambda;
		  
		showIt(lambda,phi);
		
	}
	

	
	
	
	
	/**
	 * INTERACTION COMMANDS
	 * 
	 * - MOUSE FUNCTIONS
	 * - TOUCH FUNCTIONS
	 * - POINTER FUNCTIONS
	 * - ZOOMING FUNCTIONS
	 */
	
	
	
	
	/**
	 * MOUSE FUNCTIONS
	 */

	var pointerActive = false;

	var toSlowDown = false;
	
	var pPoints=[];
	
	
	/**
	 * Event handler for mouse move. 
	 * 
	 * @param {Event} e - mouse move.
	 */
	 
	function onDblClick(e){
		var vel = document.getElementById(wdc.wDiv);
		var velRect = vel.getBoundingClientRect();
		var xr = e.clientX-velRect.left;
		var yr = e.clientY-velRect.top;
		if(statusdiv) {
			statusdiv.innerHTML = ' xr: ' + xr;
			statusdiv.innerHTML += ' yr: ' + yr;
		}
	}
	
	 
	function onClick(e){
//		overlay(); 
/*
		var touchobj = e;
		var startx = parseInt(touchobj.clientX);
		var starty = parseInt(touchobj.clientY);

		
		var vel = document.getElementById("wivra");
		
		var velRect = vel.getBoundingClientRect();

	
		var xr = startx - velRect.left;
		var yr = starty - velRect.top;

		statusdiv.innerHTML = 'PageX: ' + e.pageX;
		statusdiv.innerHTML += ' PageY: ' + e.pageY;
		statusdiv.innerHTML += ' clientX: ' + e.clientX;
		statusdiv.innerHTML += ' clientY: ' + e.clientY;
		statusdiv.innerHTML += ' xr: ' + xr;
		statusdiv.innerHTML += ' yr: ' + yr;
		statusdiv.innerHTML += ' startx: ' + startx;
		statusdiv.innerHTML += ' starty: ' + starty;
		*/
		
	
	
//		var vel = document.getElementById ( "canv" + wdc.wDiv	);
	
//        var xr=( (e.clientX-wCanvas.offsetLeft) *  wCanvas.width /  parseFloat(wCanvas.style.width));
//		var yr=( (e.clientY-wCanvas.offsetTop) *  wCanvas.height /  parseFloat(wCanvas.style.height));
	
        var xr=( (e.pageX-getOffset(wCanvas).left) *  wCanvas.width /  parseFloat(wCanvas.style.width));
		var yr=( (e.pageY-getOffset(wCanvas).top) *  wCanvas.height /  parseFloat(wCanvas.style.height));
		
		
		var statusdiv = document.getElementById("statusdiv"	);
		if(statusdiv) 
		{
			var centerX = 10;
			var centerY = 10;
			wCtx.beginPath();
			wCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
			wCtx.lineWidth = 5;
			wCtx.strokeStyle = '#FFFF00';
			wCtx.stroke();
			
			var centerX = 400;
			var centerY = 200;
			wCtx.beginPath();
			wCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
			wCtx.lineWidth = 5;
			wCtx.strokeStyle = '#0FFF00';
			wCtx.stroke();
			
			var centerX = 800;
			var centerY = 300;
			wCtx.beginPath();
			wCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
			wCtx.lineWidth = 5;
			wCtx.strokeStyle = '#0FFFF0';
			wCtx.stroke();
			
			statusdiv.innerHTML = 'cheight:' + wCanvas.height +
								 ' cWidth: ' + wCanvas.width +
								 ' offLeft ' + wCanvas.offsetLeft +
								 ' offtop  ' +  wCanvas.offsetTop +
								 ' goffLeft ' + getOffset(wCanvas).left +
								 ' goffTop ' + getOffset(wCanvas).top +
								 ' stile.height: ' + wCanvas.style.height +
								 ' stile.width: '  + wCanvas.style.width +
								 ' clientX:' + e.clientX +
								 ' clientY:' + e.clientY +
 								 ' screenX:' + e.screenX +
								 ' screenY:' + e.screenY +
								 ' pageX:' + e.pageX +
								 ' pageY:' + e.pageY +
								 ' xr: ' + xr+
								 ' yr: ' + yr +
								 ' xrc: ' + ( (e.clientX-wCanvas.offsetLeft) *  wCanvas.width /  parseFloat(wCanvas.style.width))+
								 ' yrc: ' + ( (e.clientY-wCanvas.offsetTop) *  wCanvas.height /  parseFloat(wCanvas.style.height));
		}

	

/*	
		statusdiv.innerHTML = ' clientX: ' + e.clientX;
		statusdiv.innerHTML += ' clientY: ' + e.clientY;
		statusdiv.innerHTML += ' screenX: ' + e.screenX;
		statusdiv.innerHTML += ' screenY: ' + e.screenY;
		statusdiv.innerHTML += ' pageX: ' + e.pageX;
		statusdiv.innerHTML += ' pageY: ' + e.pageY;
		statusdiv.innerHTML += ' velRect.left: ' + velRect.left;
		statusdiv.innerHTML += ' velRect.top: ' + velRect.top;
		statusdiv.innerHTML += ' X: ' + (e.clientX-velRect.left);
		statusdiv.innerHTML += ' Y: ' + (e.clientY-velRect.top);
*/	
		
		var lambda1=getSession ('lambdaHot');
		var phi1=getSession ('phiHot');
				
		// loop on HotSpot
		for (var i = 0; i < hotSpot.length; i++) {
			if( hotSpot[i].phi1 <= phi1 && phi1 <= hotSpot[i].phi2 &&
				hotSpot[i].lambda1 <= lambda1 && lambda1 <= hotSpot[i].lambda2) {
	
/*	
				statusdiv.innerHTML += ' hotSpot[i].x: ' + hotSpot[i].x;
				statusdiv.innerHTML += ' hotSpot[i].y: ' + hotSpot[i].y;
				statusdiv.innerHTML += ' hotSpot[i].r: ' + hotSpot[i].r;
*/				

/*
		alert(e.clientX);
		alert(velRect.left);
		alert( e.clientY);
		alert(velRect.top);

			alert(xr);	
			alert(yr);	
*/
				if( hotSpot[i].x - hotSpot[i].r  <= xr &&  xr <= hotSpot[i].x + hotSpot[i].r &&
					hotSpot[i].y - hotSpot[i].r  <= yr &&  yr <= hotSpot[i].y + hotSpot[i].r ) {
	
	
/*	
var centerX = xr;
var centerY = yr;
wCtx.beginPath();
wCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
wCtx.lineWidth = 5;
wCtx.strokeStyle = '#FFFF00';
wCtx.stroke();	

var centerX =hotSpot[i].x;;
var centerY = hotSpot[i].y;
wCtx.beginPath();
wCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
wCtx.lineWidth = 5;
wCtx.strokeStyle = '#FF0F00';
wCtx.stroke();	
*/
					//<img src="./archive/model001/test1.jpg" class="element">
					if(hotSpot[i].name=='test') {

/*					
					alert('xx');
var html = `
<br /><br />
<div  class="hsParentDisable" >
    <div  class="hsDivImg" >
        <span id='closeHsBut' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;'>x</span>
    <img src ="http://placehold.it/116x116" alt="some description"/> 
    <h3>the title will go here</h3>
        <h4> www.myurlwill.com </h4>
    <p class="text">
        this is a short description yada yada peanuts etc this is a short description yada yada peanuts etc this is a short description yada yada peanuts etc this is a short description yada yada peanuts etcthis is a short description yada yada peanuts etc 
    </p>
</div>
</div>
`;


var html1 = `
<br /><br />
<div  class="hsParentDisable" >
    <div  class="hsDivImg" >
        <span id='closeHsBut' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;'>x</span>
    <h3>the title will go here</h3>
    <h4> www.myurlwill.com </h4>
    <p class="text">
        this is a short description yada yada peanuts etc this is a short description yada yada peanuts etc this is a short description yada yada peanuts etc this is a short description yada yada peanuts etcthis is a short description yada yada peanuts etc 
    </p>
</div>
</div>
`;
						var iDiv = document.createElement('div');
						iDiv.id = 'block';
						iDiv.innerHTML = html1;
						document.getElementsByTagName('body')[0].appendChild(iDiv);
*/						
					/*
						alert('xx');
						//document.getElementById('overlayelem').innerHTML = '<img src="' + hotSpot[i].action.urlimg + '" style="overflow: hidden;max-width:100%; max-height:100%;">';
						var iDiv = document.createElement('div');
						iDiv.id = 'block';
						iDiv.className = 'hotSpotDivImg';
						document.getElementsByTagName('body')[0].appendChild(iDiv);

						//iDiv.innerHTML = "I'm the first div";

						// Now create and append to iDiv
						var innerDiv = document.createElement('div');
						innerDiv.className = 'hotSpotDivImg1';

						// The variable iDiv is still good... Just append to it.
						iDiv.appendChild(innerDiv);
						//innerDiv.innerHTML = '<div><img src="./archive/T5/hotspotimg/T5_120_Tier4B_15_G_028.png" style="overflow: hidden;max-width:100%; max-height:100%;"></div>';
						innerDiv.innerHTML = '<p>prova prova prova prova prova prjfkejfejwriorjiorjgoirgjgiergji provaprovaprovaprova prova roby</p>';
						return;
						*/
					}

					if(hotSpot[i].action.type=='imgtxt' || hotSpot[i].action.type=='img') {
					
							var pstyle1= "";
							var pstyle2= "";
												
							var imgX = new Image();
							imgX.onload = function(){
	 
							var mW = imgX.width + 68;
							var mH = imgX.height + 68;
							var iW = imgX.width;
							var iH = imgX.height;
							var mL = -mW/2;
							var mT = -mH/2;
							
							if(mW > screen.availWidth)
							{
								var fc= screen.availWidth/mW;
								mW = fc * mW;
								mH = fc * mH;
								iW = mW - 68;
								iH = mH - 68;
								mL = -mW/2;
								mT = -mH/2;
								
							}
							
							if(mW > 698)
							{
								var fc= 698/mW;
								mW = fc * mW;
								mH = fc * mH;
								iW = fc * iW;
								iH = fc * iH;
								mL = -mW/2;
								mT = -mH/2;
							}
							
							if(mH > screen.availHeight)
							{
								var fc= screen.availHeight/mH;
								mW = fc * mW;
								mH = fc * mH;
								iW = mW - 68;
								iH = mH - 68;
								mL = -mW/2;
								mT = -mH/2;
							}
							
							var html = '<br /><br /><div class="hsParentDisable" ><div  class=' + (hotSpot[i].action.type=='imgtxt' ? '"hsDivImgTxt"' : '"hsDivImg"');
							html += 'style="';
							html += 'width:'+mW+'px;' + 'height:'+mH+'px;' + 'margin-top:'+ mT + 'px;' + 'margin-left:'+mL + 'px;';
							if('pstyle' in hotSpot[i].action) 
								html +=  hotSpot[i].action.pstyle ;
							html += '"';

							pstyle2 += 'width:'+iW+'px;' + 'height:'+iH+'px;';

								
							html += '><span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>';
						//	html += '<img src="' + hotSpot[i].action.urlimg + '" >';
							html += '<div style="float: left;"><img src="' + wdc.path + hotSpot[i].action.urlimg + '" style="'+pstyle2+'"></div>';
							if(hotSpot[i].action.type=='imgtxt') {
								html += '<div style="float: left;">'
								html += hotSpot[i].action.text;
								html += '</div>';
							}
							html += '</div></div>';
							var iDiv = document.createElement('div');
							iDiv.id = 'hsblock';
							document.getElementsByTagName('body')[0].appendChild(iDiv);
							iDiv.innerHTML = html;
							
						}
						imgX.src =  wdc.path + hotSpot[i].action.urlimg ;						
						
						
					}
					
					if(hotSpot[i].action.type=='text') {
						var fc=1;
					
						if(500 > screen.availWidth)
						{
							fc= Math.round(100*screen.availWidth/500)/100;							
						}
							
						var html = '<br /><br /><div class="hsParentDisable" ><div  class="hsDivTxt"';
						html += 'style="transform: scale(' + fc + ')';
							
						if('pstyle' in hotSpot[i].action) 
							html += hotSpot[i].action.pstyle;
						html += '"';
					  
						html += '><span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>'
						html += hotSpot[i].action.text;
						html += '</div></div>';
						var iDiv = document.createElement('div');
						iDiv.id = 'hsblock';
						document.getElementsByTagName('body')[0].appendChild(iDiv);
						iDiv.innerHTML = html;
						
			/*
						
						
						document.getElementById('overlayelem').innerHTML = '<div class="text">' + hotSpot[i].action.text + '</div>';
						document.getElementById('overlayelem').style.minHeight ='100px';	
						document.getElementById('overlaybox').style.minHeight ='100px';	
						overlay();
						//document.getElementById('overlaybox').style.maxWidth = "100px";
				*/
						
					}			
					if(hotSpot[i].action.type=='video') {
						var fc=1;
					
						if(540 > screen.availWidth)
						{
							fc= Math.round(100*screen.availWidth/540)/100;							
						}
							
						var html = '<br /><br /><div class="hsParentDisable" ><div  class="hsDivVid"';
						html += 'style="transform: scale(' + fc + ')';
							
						if('pstyle' in hotSpot[i].action) 
							html += hotSpot[i].action.pstyle;
						html += '"';
					  
						html += '><span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>';
						html += '<video controls autoplay width="480" height="270"  controls ><source src="' + wdc.path +
										hotSpot[i].action.urlvideo + '" type="video/mp4" ></video>';
			//			html += '<iframe width="480" height="270" frameborder="0" src="' +
			//							hotSpot[i].action.urlvideo + '" webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>';										
						html += '</div></div>';
						var iDiv = document.createElement('div');
						iDiv.id = 'hsblock';
						document.getElementsByTagName('body')[0].appendChild(iDiv);
						iDiv.innerHTML = html;
					   /*
						document.getElementById('overlayelem').innerHTML = '<div style=""><video width="480" height="270"  controls ><source src="' +
										hotSpot[i].action.urlvideo + '" type="video/mp4"></video></div>';
						//document.getElementById('overlayelem').style.minHeight ='100px';	
						//document.getElementById('overlayelem').style.Width ='480px';	
						//document.getElementById('overlaybox').style.Width ='480px';	
						//document.getElementById('overlay').style.Width ='480px';	
						document.getElementById('overlayelem').style.minHeight ='100px';
						overlay();				
						//document.getElementById('div_register').style.width='500px';
					  */
					}
					if(hotSpot[i].action.type=='videotxt') {

						var fc=1;
					
						if(540 > screen.availWidth)
						{
							fc= Math.round(100*screen.availWidth/540)/100;							
						}
							
						var html = '<br /><br /><div class="hsParentDisable" ><div  class="hsDivVidTxt"';
						html += 'style="transform: scale(' + fc + ')';
							
						if('pstyle' in hotSpot[i].action) 
							html += hotSpot[i].action.pstyle;
						html += '"';
								
						html += '><span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>'
						html += '<div style="float: left;"><video controls autoplay width="480" height="270"  controls ><source src="' + wdc.path +
										hotSpot[i].action.urlvideo + '" type="video/mp4" ></video></div>';
						html += '<div style="float: left;">'
						html += hotSpot[i].action.text;
						html += '</div>';
						html += '</div></div>';
						var iDiv = document.createElement('div');
						iDiv.id = 'hsblock';
						document.getElementsByTagName('body')[0].appendChild(iDiv);
						iDiv.innerHTML = html;
					/*
						document.getElementById('overlayelem').innerHTML = '<div style="float: left;"><video width="480" height="270"  controls ><source src="' +
										hotSpot[i].action.urlvideo + '" type="video/mp4"></video></div><div class="text" style="float: left;margin: 2%;">' + hotSpot[i].action.text + '</div>';
						document.getElementById('overlayelem').style.minHeight ='100px';	
						overlay();				
						//document.getElementById('div_register').style.width='500px';
					*/						
					}
					if(hotSpot[i].action.type=='youtube') {
						var html = '<br /><br /><div class="hsParentDisable" ><div  class="hsDivYouTube"';
						if('pstyle' in hotSpot[i].action) 
							html += 'style="' + hotSpot[i].action.pstyle + '"';
						html += '><span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>'
						html += '<iframe src="' +
										hotSpot[i].action.urlyoutube + '"  allowfullscreen></iframe>';
						html += '</div></div>';
						var iDiv = document.createElement('div');
						iDiv.id = 'hsblock';
						document.getElementsByTagName('body')[0].appendChild(iDiv);
						iDiv.innerHTML = html;
					
					/*
						document.getElementById('overlayelem').innerHTML = '<iframe width="768" height="360" src="' +
										hotSpot[i].action.urlyoutube + '" frameborder="0" allowfullscreen></iframe>';
						document.getElementById('overlayelem').style.minHeight ='400px';	
						overlay();
					*/
						//document.getElementById('div_register').style.width='500px';										
					}
					if(hotSpot[i].action.type=='panorama') {
					
					/*
						document.getElementById('overlayelem').innerHTML = '<iframe id="mypanorama" width="480" height="400"  style="border-style:none;visibility:visible"  src="pannellum.html?panorama=' +
						 hotSpot[i].action.urlimg + '&autoLoad=true" ></iframe>';
						document.getElementById('overlayelem').style.minHeight ='400px';	
						overlay();
						//document.getElementById('div_register').style.width='500px';		
					*/
						var fc=1;
					    var mxW = screen.availWidth;
						var mxH = screen.availHeight;

						if(mxW < 540 || mxH < 460)
						{
							fc= Math.min( Math.round(100*mxW/540)/100,	Math.round(100*mxH/460)/100);						
						}
						
						
						var html = '<br /><br /><div class="hsParentDisable" ><div  class="hsDivPan" id="hsframepanorama" ';
						html += 'style="transform: scale(' + fc + ')';
							
						if('pstyle' in hotSpot[i].action) 
							html += hotSpot[i].action.pstyle;
						html += '"';
					
						html += '><span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>';
						html +=  '<iframe id="mypanorama" allowfullscreen src="'+ wdc.pathSource + 'pannellum.html?panorama=' + 
						hotSpot[i].action.urlimg + '&autoLoad=true" ></iframe>';
//						html +=  '<iframe id="mypanorama"  src="testx.html" ></iframe>';
						//alert('zz');
						//html += '<script>alert("x");</script>';
						html += '</div></div>';
						
						var iDiv = document.createElement('div');
						iDiv.id = 'hsblock';
						iDiv.innerHTML = html;
						document.getElementsByTagName('body')[0].appendChild(iDiv);

/*						
						var pDiv = document.createElement('div');
						pDiv.id = 'hsparent';
						pDiv.className = 'hsParentDisable';
						iDiv.appendChild(pDiv);
						
						var mDiv = document.createElement('div');
						mDiv.id = 'hsmain';
						mDiv.className = 'hsframepanorama';
						if('pstyle' in hotSpot[i].action) 
							mDiv.style.cssText=hotSpot[i].action.pstyle;
						mDiv.innerHTML = '<span id="closeHsBut" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>';							
						pDiv.appendChild(mDiv);
						
						var iFrame = document.createElement('iframe');
						iFrame.id = 'mypanorama';
						iFrame.src = 'testx.html';
						
						if (navigator.userAgent.indexOf("MSIE") > -1 && !window.opera){
							iFrame.onreadystatechange = function(){
								if (iFrame.readyState == "complete"){
									alert("Local iframe is now loaded.");
								}
							};
						} else {
							iFrame.onload = function(){
								alert("Local iframe is now loaded.");
							};
						}
						
						mDiv.appendChild(iFrame);
						//iDiv.innerHTML = html;
*/					
					}
			
			//		overlay();
					break;
				}
			}
		}		
		
		
		
		//var prevImg = new Image(30, 30);
		
		//prevImg.src = wdc.path+'/'+ wdc.folderName + '/P_rosso.GIF';
		//prevImg.setAttribute('id','wPreview');
		
		
		//prevImg.onload=function(){
		//	wCtx.drawImage(prevImg,30,30);
		//}
		
		
		
	}
	 
	 
	function onMouseDown(e){
		
		var touchobj = e;
		
		pointerActive = true;
		toSlowDown = false;
		
		
		startx = parseInt(touchobj.clientX);

		starty = parseInt(touchobj.clientY);
		
		pPoints=[];
		plottingPoint(startx,starty);
		
		
		if(wdc.advanced) if(statusdiv) statusdiv.innerHTML = 'Status: mousedown ClientX: ' + startx + 'px ClientY: ' + starty + 'px';
		e.preventDefault();
		
	}
	
	
	/**
	 * Event handler for mouse move. 
	 * 
	 * @param {Event} e - mouse move.
	 */

	function onMouseMove(e){
		
		if (pointerActive){
			var touchobj = e;
			var posx = parseInt(touchobj.clientX);
			var posy = parseInt(touchobj.clientY);
			var distx = posx - startx;
			var disty = posy - starty;
			
			plottingPoint(posx,posy);

			blockX=wdc.hSensitivity;
			blockY=wdc.vSensitivity;
			
			//RIGHT 
			hBlock=Math.floor(distx/blockX);
			
			if(hBlock>0){
				startx=posx;
				right();
			}
			
			// LEFT 
			if(hBlock+1<0){
				startx=posx;
				left();
			}
			
			// UP 
			vBlock=Math.floor(disty/blockY);
			
			if(vBlock>0){
				nBlockUp=vBlock;
				starty=posy;
				up();
			}
			

			// DOWN 
			if(vBlock+1<0){
				nBlockDown=vBlock;
				starty=posy;
				down();
			}
			

			if(wdc.advanced) if(statusdiv) statusdiv.innerHTML =	'Status: mousedown ClientX: ' + startx +'+('+distx+')px ClientY: ' + starty +'+('+disty+')px';
			
			e.preventDefault();
		}
		else
		{
		
			/*
			var vel = document.getElementById("canv" + wdc.wDiv	);
			
			var velRect = vel.getBoundingClientRect();
			var xr = e.clientX-velRect.left;
			var yr = e.clientY-velRect.top;
		    */
			
//			var xr=( (e.clientX-wCanvas.offsetLeft) *  wCanvas.width /  parseFloat(wCanvas.style.width));
//			var yr=( (e.clientY-wCanvas.offsetTop) *  wCanvas.height /  parseFloat(wCanvas.style.height));

			var xr=( (e.pageX-getOffset(wCanvas).left) *  wCanvas.width /  parseFloat(wCanvas.style.width));
			var yr=( (e.pageY-getOffset(wCanvas).top) *  wCanvas.height /  parseFloat(wCanvas.style.height));
			
			var lambda1=getSession ('lambdaHot');
			var phi1=getSession ('phiHot');
				
			// loop on HotSpot
			for (var i = 0; i < hotSpot.length; i++) {
				if( hotSpot[i].phi1 <= phi1 && phi1 <= hotSpot[i].phi2 &&
					hotSpot[i].lambda1 <= lambda1 && lambda1 <= hotSpot[i].lambda2) {
	
					if( hotSpot[i].x - hotSpot[i].r + wdc.offsImgHotspot.x  <= xr &&  xr <= hotSpot[i].x + hotSpot[i].r + wdc.offsImgHotspot.x &&
						hotSpot[i].y - hotSpot[i].r + wdc.offsImgHotspot.y  <= yr &&  yr <= hotSpot[i].y + hotSpot[i].r + wdc.offsImgHotspot.y  ) {
						
						if(hotSpot[i].action.type=='panorama') 
						{
							wCtx.drawImage(btImgStack[2],Math.max(hotSpot[i].x + wdc.offsImgHotspot.x,0),Math.max(hotSpot[i].y + wdc.offsImgHotspot.y,0));
						}
						else
						{							
							wCtx.drawImage(btImgStack[1],Math.max(hotSpot[i].x+ wdc.offsImgHotspot.x,0),Math.max(hotSpot[i].y+ wdc.offsImgHotspot.y,0));
						}
						
					}
					else
					{
						if(hotSpot[i].action.type=='panorama') 
						{							
							wCtx.drawImage(btImgStack[2],Math.max(hotSpot[i].x+ wdc.offsImgHotspot.x,0),Math.max(hotSpot[i].y+ wdc.offsImgHotspot.y,0));
						}
						else
						{							
							wCtx.drawImage(btImgStack[0],Math.max(hotSpot[i].x+ wdc.offsImgHotspot.x,0),Math.max(hotSpot[i].y+ wdc.offsImgHotspot.y,0));
						}
					}
				}
			}
		}
		
		
	}

	
	/**
	 * Event handler for mouse up. 
	 * 
	 * @param {Event} e - mouse event.
	 */
	
	var x;

	function onMouseOver(e){

		//document.body.style.cursor = 'pointer';
//		document.body.style.cursor = 'e-resize';
		// alert('sopra');
	}

	function onMouseOut(e){

	//	document.body.style.cursor = 'default';
		onMouseUp(e);
	}
	
	function onMouseUp(e){

		if (pointerActive){
			
			var touchobj = e;
			
			pointerActive = false;
					
			plottingPoint(touchobj.clientX, touchobj.clientY);
			
			if(wdc.advanced) if(statusdiv) statusdiv.innerHTML = 'Status: mouseup<br /> Resting x coordinate: ' + touchobj.clientX + 'px';
			
			e.preventDefault();
			
			goKin();
		
		}
	}
	

	
	/**
	 * TOUCH FUNCTION
	 */

	
	var startx=0,starty=0;
	
	function onTouchStart(e){
		e.preventDefault();
		var touchobj = e.changedTouches[0];
		
		pointerActive = true;
		toSlowDown = false;
		
		startx = parseInt(touchobj.clientX);

		starty = parseInt(touchobj.clientY);
		
		pPoints=[];
		plottingPoint(startx,starty);
		
		//if(wdc.advanced) statusdiv.innerHTML = 'Status: touchStart<br /> ClientX: ' + startx + 'px<br /> ClientY: ' + starty + 'px<br />';
		
		//e.clientX = e.touches[0].clientX;
        //e.clientY = e.touches[0].clientY;
		
		
		//var touch = event.touches[0];
		//var x = touch.pageX;
		//var y = touch.pageY;
		/*
		// or taking offset into consideration
		var x_2 = touch.pageX - canvas.offsetLeft;
		var y_2 = touch.pageY - canvas.offsetTop;
		*/
		
		//var x_2 = touch.pageX + wCanvas.offsetLeft;
		//var y_2 = touch.pageY + wCanvas.offsetTop;
		
		//e.clientX = touchobj.clientX;
        //e.clientY = getOffset(wCanvas).left;
		//e.clientX = x;
		//e.clientY = y;
		
		//e.clientY = touchobj.clientX - wCanvas.clientLeft - wCanvas.scrollLeft;
		
		
		//e.clientX = e.pageX;
        //e.clientY = e.pageY; 
		
		e.clientX = touchobj.clientX;
        e.clientY = touchobj.clientY;
		
		e.pageX = touchobj.pageX;
        e.pageY = touchobj.pageY;
		
		onClick(e);
		
		
		
	}
	

	/**
	 * Event handler for touch starts 
	 * 
	 * @param e {Event}
	 */
	function onTouchMove(e){
		
		e.preventDefault();
		
		if (pointerActive){

			var touchobj = e.changedTouches[0];
			
			var posx = parseInt(touchobj.clientX);
			var posy = parseInt(touchobj.clientY);
			
			var distx = posx - startx;
			var disty = posy - starty;
			
			plottingPoint(posx,posy);
			

			blockX=wdc.hSensitivity;
			blockY=wdc.vSensitivity;
			
			//RIGHT 
			hBlock=Math.floor(distx/blockX);

			if((hBlock>0)){

				for(var q=1; q<hBlock; q++){
					
					startx=posx;

					animate(right);
					//right();
				}
			}
			
			// LEFT 
			if((hBlock+1<0)){

					startx=posx;
					
					animate(left);
					//left();
			}
			
			// UP 
			vBlock=Math.floor(disty/blockY);
			
			if(vBlock>0){
				
				starty=posy;
				
				up();
			}
			
	
			// DOWN 
			if(vBlock+1<0 ){
				
				starty=posy;
				
				down();
				
			}
			
	
			if(wdc.advanced) statusdiv.innerHTML =	'Status: touchMove<br /> ClientX: ' + startx +'+('+distx+')px<br /> ClientY: ' + starty +'+('+disty+')px<br />';
		}
		
	}
	
	
	/**
	 * Event handler for touch-end 
	 * 
	 * @param e {Event}
	 */
	
	function onTouchEnd(e){
		
		e.preventDefault();
		
		if (pointerActive){
			
			pointerActive = false;
			
			var touchobj = e.changedTouches[0];
	
			var posx = parseInt(touchobj.clientX);
			
			var posy = parseInt(touchobj.clientY);
			
			plottingPoint(posx, posy);
			
			if(wdc.advanced) statusdiv.innerHTML = 'Status: touchEnd<br /> ClientXf: ' + posx + 'px<br /> ClientY: ' + posy + 'px<br />';
	      		
			goKin();
		}
	}
	
	
	
	function onTouchCancel(e){
		//...
	}
	
	
	
	
	

	/**
	 * POINTERS FUNCTIONS
	 */

	
	var startx, starty;
	
	
	/**
	 * Event handler for touch starts in IE / Edge.
	 * @private
	 * @param {PointerEvent} event - Document pointer down event.
	 */

	function onPointerDown(e){
		
	    if (e.pointerType == 'touch') {
	    	
	    	var touchobj = e;
	    	
			pointerActive = true;
			toSlowDown = false;
			
			startx = parseInt(touchobj.clientX);

			starty = parseInt(touchobj.clientY);

			pPoints=[];
			plottingPoint(startx,starty);
			
			if(wdc.advanced) statusdiv.innerHTML = 'Status: PointerDown<br /> ClientX: ' + touchobj.clientX + 'px<br /> ClientY: ' + touchobj.clientY + 'px<br />';
			
	        event.preventDefault();
	    }
	}
	
	/**
	 * Event handler for touch moves in IE / Edge.
	 * @private
	 * @param {PointerEvent} event - Document pointer move event.
	 */
	
	function onPointerMove(e) {
		
	    if (e.pointerType == 'touch' && pointerActive) {
	    	
	    	var touchobj = e;
	    			
	    	var posx = parseInt(touchobj.clientX);
	    	var posy = parseInt(touchobj.clientY);
	    			
	    	var distx = posx - startx;
	    	var disty = posy - starty;
	    			
	    	plottingPoint(posx,posy);
	    	

			blockX=wdc.hSensitivity/2;
			blockY=wdc.vSensitivity/2;
	    			
	    	//RIGHT 
	    	hBlock=Math.floor(distx/blockX);
	    			
	    	if((hBlock>0)){
	    		startx=posx;
	    		animate(right());
	    		//right()
	    	}
	    			
	    	// LEFT 
	    	if((hBlock+1<0)){
	    		startx=posx;
	    		//animate(left());
	    		left();
	    	}
	    			
	    	// UP 
	    	vBlock=Math.floor(disty/blockY);
	    			
	    	if((vBlock>0) /* &&  (nBlockRight<vBlock)*/){
	    		nBlockUp=vBlock;
	    		starty=posy;
	    		//animate(up());
	    		up();
	    	}
	    			
	    	// DOWN 
	    	if((vBlock+1<0)  /*&&  (nBlockDown>vBlock)*/){
	    		nBlockDown=vBlock;
	    		starty=posy;
	    		//animate(down());
	    		down();
	    	}
	    	

	    	if(wdc.advanced) statusdiv.innerHTML =	'Status: pointerMove<br /> ClientX: ' + startx +'+('+distx+')px<br /> ClientY: ' + starty +'+('+disty+')px<br />';
	    			
	    	e.preventDefault();
	    			
	    }
	}
	
	
	
	/**
	 * Event handler for touch ends in IE / Edge.
	 * @private
	 * @param {PointerEvent} event - Document pointer up event.
	 */
	function onPointerUp(e) {
		
	    if (e.pointerType == 'touch' && pointerActive) {

			var touchobj = e;
			
			pointerActive = false;
			
			plottingPoint(touchobj.clientX, touchobj.clientY);
			
			if(wdc.advanced) statusdiv.innerHTML = 'Status: pointerUp<br /> ClientX: ' + touchobj.clientX + 'px<br /> ClientY: ' + touchobj.clientY+'<br />';
			
	        e.preventDefault();
        
	        goKin();

	    }
	}
	
	
	

	/**
	 * ZOOMING FUNCTIONS
	 */
	
	

	/**
	 * Event handler for mouse wheel. Changes zoom.
	 * 
	 * @param {WheelEvent} event - Document mouse wheel event.
	 */
	function onMouseWheel(e) {
		
	    e.preventDefault();
	    
	    if (e.wheelDeltaY) {
	    	
	    	var wC = wContainer.offsetWidth;
		    var hC = wContainer.offsetHeight;

		    var wCa = wCanvas.offsetWidth;
		    var hCa = wCanvas.offsetHeight;
		    	
		    var wW = wCa - (wCa * e.wheelDeltaY * 0.0005);
		    var hW = hCa - (hCa * e.wheelDeltaY * 0.0005);
		    	
		    wCanvas.style.width=wW+'px';
		    wCanvas.style.height=hW+'px';
		    	
		    wCanvas.style.left=wC/2+'px';
		    wCanvas.style.top=hC/2+'px';
		    	
			mL= -(wW)/2;
			mT= -(hW)/2;
				
		    wCanvas.style.marginLeft=mL+'px';
		    wCanvas.style.marginTop	=mT+'px';
		    	
		    if(wdc.advanced) document.getElementById("wheel").innerHTML = e.wheelDeltaY;
	    	
	    	
	    } else if (e.wheelDelta) {
	    	
	        var wC = wContainer.offsetWidth;
	    	var hC = wContainer.offsetHeight;

	    	var wCa = wCanvas.offsetWidth;
	    	var hCa = wCanvas.offsetHeight;
	    	
	    	var wW = wCa - (wCa * e.wheelDelta * 0.0005);
	    	var hW = hCa - (hCa * e.wheelDelta * 0.0005);
	    	
	    	wCanvas.style.width=wW+'px';
	    	wCanvas.style.height=hW+'px';
	    	
	    	wCanvas.style.left=wC/2+'px';
	    	wCanvas.style.top=hC/2+'px';
	    	
			mL= -(wW)/2;
			mT= -(hW)/2;
			
	    	wCanvas.style.marginLeft=mL+'px';
	    	wCanvas.style.marginTop	=mT+'px';
	    	
	    	if(wdc.advanced) document.getElementById("wheel").innerHTML = e.wheelDelta;
	    	
	    	
	    } else if (e.detail) {
	    	
	    	var wC = wContainer.offsetWidth;
	    	var hC = wContainer.offsetHeight;

	    	var wCa = wCanvas.offsetWidth;
	    	var hCa = wCanvas.offsetHeight;
	    	
	    	var wW = wCa - (wCa * e.detail * 0.05);
	    	var hW = hCa - (hCa * e.detail * 0.05);
	    	
	    	wCanvas.style.width=wW+'px';
	    	wCanvas.style.height=hW+'px';
	    	
	    	wCanvas.style.left=wC/2+'px';
	    	wCanvas.style.top=hC/2+'px';
	    	
			mL= -(wW)/2;
			mT= -(hW)/2;
			
	    	wCanvas.style.marginLeft=mL+'px';
	    	wCanvas.style.marginTop	=mT+'px';
	    	
	    	if(wdc.advanced) document.getElementById("wheel").innerHTML = e.detail;
	    	
	    }
	    

	}
	
	/**
	 * Zoom In
	 * 
	 * @param {WheelEvent} .
	 */
	
	function zoomIn(){
		
		var wC = wContainer.offsetWidth;
    	var hC = wContainer.offsetHeight;

    	var wCa = wCanvas.offsetWidth;
    	var hCa = wCanvas.offsetHeight;
    	
    	var wW = wCa - (wCa * -0.05);
    	var hW = hCa - (hCa * -0.05);
    	
    	wCanvas.style.width=wW+'px';
    	wCanvas.style.height=hW+'px';
    	
    	wCanvas.style.left=wC/2+'px';
    	wCanvas.style.top=hC/2+'px';
    	
		mL= -(wW)/2;
		mT= -(hW)/2;
		
    	wCanvas.style.marginLeft=mL+'px';
    	wCanvas.style.marginTop	=mT+'px';
    	

    	if(wdc.advanced) document.getElementById("wheel").innerHTML = 'Zin';
	}
	
	/**
	 * Zoom Out
	 * 
	 * @param {WheelEvent} .
	 */
	
	function zoomOut(){

		var wC = wContainer.offsetWidth;
    	var hC = wContainer.offsetHeight;

    	var wCa = wCanvas.offsetWidth;
    	var hCa = wCanvas.offsetHeight;
    	
    	var wW = wCa - (wCa * 0.05);
    	var hW = hCa - (hCa * 0.05);
    	
    	wCanvas.style.width=wW+'px';
    	wCanvas.style.height=hW+'px';
    	
    	wCanvas.style.left=wC/2+'px';
    	wCanvas.style.top=hC/2+'px';
    	
		mL= -(wW)/2;
		mT= -(hW)/2;
		
    	wCanvas.style.marginLeft=mL+'px';
    	wCanvas.style.marginTop	=mT+'px';
    	
    	//---
    	if(wdc.advanced) document.getElementById("wheel").innerHTML = 'Zout';
    	
	}
	
	
	/**
	 * PLOTTING INTERACTION FUNCTIONS
	 */
	
	
	/**
	 * Records movement for the last 100ms
	 * @param {number} x
	 * @param {number} y 
	 */
	
	function plottingPoint(x, y) {
			
		var time = Date.now();
				
		while (pPoints.length > 0) {
				
			if (time - pPoints[0].time <= 100) {
				break;
			}
			pPoints.shift();
		}

		pPoints.push({ x: x, y: y, time: time });
	}
	
	
	/**
	* Stops movement tracking, starts animation
	*/
	
	function goKin(){
		
		var firstPoint 	= pPoints[0];
		var lastPoint 	= pPoints[pPoints.length - 1];

		var xOffset = lastPoint.x - firstPoint.x;
		var yOffset = lastPoint.y - firstPoint.y;
		
		var timeOffset = lastPoint.time - firstPoint.time;

		var D = timeOffset / 15 / 1; // 1 x intensity as multiplier

		decVelX = xOffset / D || 0; // prevent NaN
		
		decVelY = yOffset / D || 0;


		if (Math.abs(decVelX) > 1 || Math.abs(decVelY) > 1 ) {
			
			toSlowDown = true;
			
			times=0;
			
			notEveryTime=0;
			
			cX=7/(Math.abs(decVelX)); // launch velocity control
			
			cY=7/(Math.abs(decVelY));
			
			animate(stepAnim);
			
		}
		
	}
	
	
	
	
	var times=0;
	var notEveryTime=0;
	
	
	/**
	 * Animates values slowing down
	 */
	

	
	function stepAnim() {
		
		if (!toSlowDown) {
			return;
		}
		
		decVelX *= wdc.fluecy;
		decVelY *= wdc.fluecy;



		if (Math.abs(decVelX) > 0.3 || Math.abs(decVelY) > 0.3 ) {

			if (--notEveryTime > 0) { 
				animate(stepAnim);
				return ; 
			}
			
			if(decVelX<=0){
				left();
			} else {
				right();
			}
			++times;

			notEveryTime=0.003*times*times+cX; // slowdown
			
			animate(stepAnim);
				
		} else {
			
			toSlowDown = false;
			
		}
	}

	
	function inertiaLeft(  ){ // launch button
		times=0;
		toSlowDown = true;
		decVelX=100;

		decVelY=0;
		
		cX=11/(Math.abs(decVelX));
		
		animate(stepAnim);
		
	}
	
	

	/**
	 * provisional (!)
	 */
	
	function pressLeft(){
		x=window.setInterval(function(){
				//PlaySound();
				left();
			},120);
	}

	function releaseLeft(){
		window.clearInterval(x);
		//PlaySound2();
		//setTimeout(PlaySound2,800);
	}


	
	
	
	/**
	*
	* EVENT LISTENERS
	*
	**/
	
	
	var listenersAdded = false;

	/*
	 * to show pointer movement
	 */ 
	var statusdiv = document.getElementById('statusdiv');



	// Only add event listeners once
	if (!listenersAdded) {
		
	    listenersAdded = true;

	    //wCanvas.addEventListener('mouseenter', onMouseDown, false);


	    // MOUSE

	    wCanvas.addEventListener('mouseover', 	onMouseOver, false);
	    wCanvas.addEventListener('mousedown', 	onMouseDown, false);
	    wCanvas.addEventListener('mousemove', 	onMouseMove, false);
	    wCanvas.addEventListener('mouseup', 	onMouseUp, false);
	    
	    wCanvas.addEventListener('mouseleave', 	onMouseUp, false); //************<<<
	    wCanvas.addEventListener('mouseout', 	onMouseOut, false);  // to mouse leave on safari
	    if (wdc.zoom){
		    wCanvas.addEventListener('mousewheel', 	onMouseWheel, false);
		    wCanvas.addEventListener('DOMMouseScroll',onMouseWheel, false);
	    }
		//POINTER
	    
		wCanvas.addEventListener('pointerdown', onPointerDown, false);
		wCanvas.addEventListener('pointermove', onPointerMove, false);
		wCanvas.addEventListener('pointerup', 	onPointerUp, false);
		
	    //TOUCH
		
	    wCanvas.addEventListener('touchstart', 	onTouchStart, false);
	    wCanvas.addEventListener('touchmove', 	onTouchMove, false);
	    wCanvas.addEventListener('touchend', 	onTouchEnd, false);
	    wCanvas.addEventListener('touchcancel', onTouchEnd, false);

	    window.addEventListener('resize', onResizing, false);
	    

	    wCanvas.addEventListener('touchcancel', onTouchEnd, false);
		
		wCanvas.addEventListener('dblclick', onDblClick,false);
		wCanvas.addEventListener('click', onClick,false);
	    
	    // BUTTONS
	    if (wdc.GUIButton){
		    document.getElementById('iner').addEventListener('click', inertiaLeft, false);
		    
		    
		    document.getElementById('rxBut').addEventListener('click', right, false);
		    document.getElementById('lxBut').addEventListener('click', left, false);
		    document.getElementById('upBut').addEventListener('click', up, false);
		    document.getElementById('dxBut').addEventListener('click', down, false);
  
		    
		    if (wdc.zoom){
			    document.getElementById('zIn').addEventListener('mousedown', zoomIn, false);
			    document.getElementById('zIn').addEventListener('touchstart', zoomIn, false);
			    
			    document.getElementById('zOt').addEventListener('mousedown', zoomOut, false);
			    document.getElementById('zOt').addEventListener('touchstart', zoomOut, false);
		    }
	
		    document.getElementById('fScreen').addEventListener('mousedown', fullScreen, false);
		    document.getElementById('fScreen').addEventListener('touchstart', fullScreen, false);
	    }


	    // Deal with MS pointer events !
	    if (window.navigator.pointerEnabled) {
	    	wCanvas.style.touchAction = 'none';
	    }


	}
	
	function getOffset(obj) {
	
		  var offsetLeft = 0;
		  var offsetTop = 0;
		  do {
			if (!isNaN(obj.offsetLeft)) {
			  offsetLeft += obj.offsetLeft;// - obj.scrollLeft;
			}
			if (!isNaN(obj.offsetTop)) {
			  offsetTop += obj.offsetTop; // - obj.scrollTop;
			}   
		  } while(obj = obj.offsetParent );
		  return {left: offsetLeft, top: offsetTop};
		
    }
	
};
	