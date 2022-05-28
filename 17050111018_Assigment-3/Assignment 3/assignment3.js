"use strict";

var canvas;
var gl;

var bufferTri, bufferRect, bufferSquare, triVertices, rectVertices, squareVertices;
var vPosition;
var transformationMatrix, transformationMatrixLoc;
var viewMatrix, viewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;

var up = vec3(0.0, 1.0, 0.0);
var at = vec3(0.0,0.0,0.0);
//var eye = vec3(0.0,1.0,3.0);
var eye = vec3(0.0,0.0,0.0);

var aspect = 1.0;	//değiştirme
var near = 1;
var far = 10.0;
var FOVY = 45.0; //önerilen
var cameraPosition=vec3(0.0,0.0,5);
var cameraTarget=vec3(0.0,0.0,0.0);
var position=vec3(0.0,0.0,0.0);
var rotation=vec3(0.0,0.0,0.0);
var scale = vec3(1.0, 1.0, 1.0);

var u_colorLocation, u_Color;
var color = vec3(0.0, 0.0, 0.0);

var speed=0.5;
var rot=0.0;	




window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	
	// x değerleri ters z değerleri aynı:1-7,8-12,9-11,2-6,3-5
	// z değerleri ters x değerleri aynı:6-8,5-9,4-10,3-11,2-12
	

	triVertices = [
		vec3( 0.0,		 0.1,	0.0),
        vec3(0.190,		-1.0,	0.0),//1
		vec3(0.17,		-1.0,	0.15),//2
		vec3(0.1,		-1.0,	0.24),//3
		vec3( 0.0,		-1.0,	0.27,),//4
		vec3(-0.1,		-1.0,	0.24),//5
		vec3(-0.17,		-1.0,	0.15),//6
		vec3(-0.190,	-1.0,	0.0),//7
		vec3(-0.17,		-1.0,	-0.15),//8
		vec3(-0.1,		-1.0,	-0.24),//9
		vec3( 0.0,		-1.0,	-0.27,),//10
		vec3(0.1,		-1.0,	-0.24),//11
		vec3(0.17,		-1.0,	-0.15),//12
		vec3(0.190,		-1.0,	0.0),//1
		
	];
	
	rectVertices = [
        
		vec3(-0.06,	 0.0,	0.15),
        vec3( 0.06,	 0.0,	0.15),
        vec3(-0.06,	 0.5,	0.15),
        vec3( 0.06,	 0.5,	0.15)
	];
	
	squareVertices= [
		vec3(-1.0,	-1.0,	-1.0),
		vec3( 1.0,	-1.0,	-1.0),
		vec3(-1.0,	-1.0,	 1.0),
		vec3( 1.0,	-1.0,	 1.0)
	
	];


	// Load the data into the GPU
	bufferTri = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triVertices), gl.STATIC_DRAW );
	
	
	// Load the data into the GPU
    bufferRect = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices), gl.STATIC_DRAW );
	
	
	// Load the data into the GPU
    bufferSquare = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(squareVertices), gl.STATIC_DRAW );
	
	
	// Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	u_colorLocation = gl.getUniformLocation(program,"u_color");
	
	document.getElementById("FOVY").oninput = function(event) {
		FOVY = event.target.value;
    };
	document.getElementById("inp_cameraPosition_X").oninput = function(event) {
		cameraPosition[0] = event.target.value;
    };
	document.getElementById("inp_cameraPosition_Y").oninput = function(event) {
		cameraPosition[1] = event.target.value;
    };
	document.getElementById("inp_cameraPosition_Z").oninput = function(event) {
		cameraPosition[2]= event.target.value;
    };
	document.getElementById("inp_cameraTarget_X").oninput = function(event) {
		cameraTarget[0] = event.target.value;
    };
	document.getElementById("inp_cameraTarget_Y").oninput = function(event) {
		cameraTarget[1]= event.target.value;
    };
	document.getElementById("inp_cameraTarget_Z").oninput = function(event) {
		cameraTarget[2] = event.target.value;
    };
	document.getElementById("inp_objX").oninput = function(event) {
		position[0] = event.target.value;
    };
    document.getElementById("inp_objY").oninput = function(event) {
		position[1] = event.target.value;
    };
	document.getElementById("inp_objZ").oninput = function(event) {
		position[2] = event.target.value;
    };
    document.getElementById("inp_obj_scale").oninput = function(event) {
		scale[0]=event.target.value;
		scale[1]=event.target.value;
		scale[2]=event.target.value;
    };
	document.getElementById("inp_obj_rotation_X").oninput = function(event) {
		rotation[0] = event.target.value;
    };
	document.getElementById("inp_obj_rotation_Y").oninput = function(event) {
		rotation[1] = event.target.value;
    };
    document.getElementById("inp_obj_rotation_Z").oninput = function(event) {
		rotation[2]= event.target.value;
    };
    document.getElementById("inp_wing_speed").oninput = function(event) {
        speed = event.target.value;
    };
	document.getElementById("redSlider").oninput = function(event) {
       color[0]=event.target.value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        color[1]=event.target.value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
       color[2]=event.target.value;
    };

    render();

};


function transformation(){
	
	transformationMatrix = mat4();
	transformationMatrix = mult(transformationMatrix, translate(position[0],position[1],position[2]));
	
	transformationMatrix = mult(transformationMatrix, rotateZ(rotation[2]));
	transformationMatrix = mult(transformationMatrix, rotateY(rotation[1]));
	transformationMatrix = mult(transformationMatrix, rotateX(rotation[0]));
	transformationMatrix = mult(transformationMatrix, scalem(scale[0],scale[1],scale[2])); 
}



function render() {
	

    gl.clear( gl.COLOR_BUFFER_BIT );
	
	eye = vec3(cameraPosition[0],cameraPosition[1],cameraPosition[2]);
	at = vec3(cameraTarget[0],cameraTarget[1],cameraTarget[2]);
	
	viewMatrix = lookAt(eye, at, up);
	projectionMatrix = perspective(FOVY, aspect, near, far);
	
	gl.uniformMatrix4fv( viewMatrixLoc, false, flatten(viewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	transformationMatrix = mat4();	
	
	//body cone
	transformation();
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation,color[0],color[1],color[2], 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 14 ); 
	
	
	//small cone 
	transformation();
	transformationMatrix = mult(transformationMatrix, translate(0,0.0,0.2));
	transformationMatrix = mult(transformationMatrix, scalem(0.1,0.1,0.2));
	transformationMatrix = mult(transformationMatrix, rotateX(90));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation,color[0],color[1],color[2], 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 14 );
	
	
	rot = rot+ speed%2.13;
	
	//wings
	
	transformation();
	transformationMatrix = mult(transformationMatrix, translate(0,0,0.05));
	transformationMatrix = mult(transformationMatrix, rotateZ(rot));
	transformationMatrix = mult(transformationMatrix, rotateY(10));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 1.0, 0.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	
	transformation();
	transformationMatrix = mult(transformationMatrix, translate(0,0,0.05)); 
	transformationMatrix = mult(transformationMatrix, rotateZ(120));
	transformationMatrix = mult(transformationMatrix, rotateZ(rot));	
	transformationMatrix = mult(transformationMatrix, rotateY(10));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 0.0, 0.0, 1.0, 1.0);
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	

	transformation();
	transformationMatrix = mult(transformationMatrix, translate(0,0,0.05));	
	transformationMatrix = mult(transformationMatrix, rotateZ(240));	
	transformationMatrix = mult(transformationMatrix, rotateZ(rot));
	transformationMatrix = mult(transformationMatrix, rotateY(10));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 0.0, 1.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	
	//square
	transformationMatrix = mat4();
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 0.3, 0.2, 0.0, 1.0);
    gl.drawArrays( gl.TRIANGLE_STRIP, 0,4);
	
	
	
	setTimeout(
        function (){requestAnimFrame(render);}, 
    );
}
