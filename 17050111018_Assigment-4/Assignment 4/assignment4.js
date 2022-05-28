"use strict";

var canvas;
var gl;

var bufferRect, bufferSquare,  rectVertices, squareVertices;
var bufferRectNormal, bufferSquareNormal, rectNormal, squareNormal;
var coneVertices = [];
var coneNormals = [];
var bufferCone,bufferConeN;
var vPosition,vNormal;
var transformationMatrix, transformationMatrixLoc;
var viewMatrix, viewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;
var projectionMatrix, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;

var up = vec3(0.0, 1.0, 0.0);
var at = vec3(0.0,0.0,0.0);
var eye = vec3(0.0,0.0,0.0);

var aspect = 1.0;	
var near = 1;
var far = 10.0;
var FOVY = 75.0; 
var cameraPosition=vec3(0.0,0.0,5);
var cameraTarget=vec3(0.0,0.0,0.0);
var position=vec3(0.0,0.0,0.0);
var rotation=vec3(0.0,0.0,0.0);	
var scale = vec3(1.0, 1.0, 1.0);

var u_colorLocation, u_Color;
var color = vec3(0.4,0.4,0.8);

var speed=0.5;
var rot=0.0;	

var slices=12; 


var lightPosition = vec4(6.0, 6.0, 6.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );;

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 1.0, 1.0 );
var materialShininess = 1.4;

var rectVertices1,squareVertices1;


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
	
	var ambientProduct = mult(lightAmbient, materialAmbient);
	var diffuseProduct = mult(lightDiffuse, materialDiffuse); 
	var specularProduct = mult(lightSpecular, materialSpecular); 
	

	//cone
	//slices=12
	var i=0;
	
	while(i<=slices)
	{
        var angle = 2*i*Math.PI/slices;
        coneVertices.push(vec4( 0,1,0,1 ));
        coneNormals.push(normalize(vec4( Math.sin(angle),1, Math.cos(angle),0)));
        coneVertices.push(vec4( Math.sin(angle),0,Math.cos(angle),1 ) );
        coneNormals.push(normalize(vec4( Math.sin(angle),1, Math.cos(angle),0)));
		i++
    };
	
	//wings

	rectVertices = [
        vec4(-0.06,	 0.0,	0.15,	1.0),
        vec4( 0.06,	 0.0,	0.15,	1.0),
        vec4(-0.06,	 0.5,	0.15,	1.0),
        vec4( 0.06,	 0.5,	0.15,	1.0)
	];
	
	
	rectNormal = [
        vec4( 0.0,	 0.0,	1.0,	0.0),
        vec4( 0.0,	 0.0,	1.0,	0.0),
        vec4( 0.0,	 0.0,	1.0,	0.0),
        vec4( 0.0,	 0.0,	1.0,	0.0)
	];
	

	//square
	squareVertices= [
		vec4(-1.0,	-1.0,	-1.0,	1.0),
		vec4( 1.0,	-1.0,	-1.0,	1.0),
		vec4(-1.0,	-1.0,	 1.0,	1.0),
		vec4( 1.0,	-1.0,	 1.0,	1.0)
	
	];
	
	

	squareNormal= [
		vec4(  0.0,  1.0, 0.0, 0.0 ),
        vec4(  0.0,  1.0, 0.0, 0.0 ),
        vec4(  0.0,  1.0, 0.0, 0.0 ),
        vec4(  0.0,  1.0, 0.0, 0.0 )
	
	];
	
	
	// Load the data into the GPU
    bufferRect = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices), gl.STATIC_DRAW );
	
	// Load the data into the GPU 
    bufferRectNormal= gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER,  bufferRectNormal);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectNormal), gl.STATIC_DRAW );
	
	
	// Load the data into the GPU
    bufferSquare = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(squareVertices), gl.STATIC_DRAW );
	
	// Load the data into the GPU
    bufferSquareNormal = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquareNormal);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(squareNormal), gl.STATIC_DRAW );
	
	// Load the data into the GPU 
    bufferCone = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coneVertices), gl.STATIC_DRAW );
	
	// Load the data into the GPU 
    bufferConeN = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferConeN);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coneNormals), gl.STATIC_DRAW );
	
	// Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//Associate out shader variables with our data buffer                                        
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

	viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	u_colorLocation = gl.getUniformLocation(program,"uColor");

	gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition));
	gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);
	
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

	document.getElementById("lightPosXSlider").oninput = function(event) {
        lightPosition[0] = event.target.value;
        gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    };
    document.getElementById("lightPosYSlider").oninput = function(event) {
        lightPosition[1] = event.target.value;
        gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    };
    document.getElementById("lightPosZSlider").oninput = function(event) {
        lightPosition[2] = event.target.value;
        gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    };
	
	document.getElementById("Shininess").oninput = function(event) {
        materialShininess = event.target.value;
		/*var clr="Shininess";
		console.log(clr);
		console.log(materialShininess);*/
		gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);
		
    };
	
	document.getElementById("materialAmbient_X").oninput = function(event) {
        materialAmbient[0] = event.target.value;
		ambientProduct = mult(lightAmbient, materialAmbient);
		gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct));
	};
	
	document.getElementById("materialAmbient_Y").oninput = function(event) {
        materialAmbient[1] = event.target.value;
		ambientProduct = mult(lightAmbient, materialAmbient);
		gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct));
    };
	
	document.getElementById("materialAmbient_Z").oninput = function(event) {
       
	/*	var str = "Before"; 
		console.log(str);
		console.log(materialAmbient);
		
		str = "After"; 
		console.log(str);
		console.log(materialAmbient);
		ambientProduct = mult(lightAmbient, materialAmbient);
		
		str = "Second ambientProduct"; 
		console.log(str);
		console.log(ambientProduct);*/
		
		materialAmbient[2] = event.target.value;
		ambientProduct = mult(lightAmbient, materialAmbient);
		gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct));
    };
	
	
	document.getElementById("materialDiffuse_X").oninput = function(event) {
        materialDiffuse[0] = event.target.value;
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct));
	};
	
	document.getElementById("materialDiffuse_Y").oninput = function(event) {
        materialDiffuse[1] = event.target.value;
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct));
    };
	
	document.getElementById("materialDiffuse_Z").oninput = function(event) {
        materialDiffuse[2] = event.target.value;
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct));
    };
	
	
	document.getElementById("materialSpecular_X").oninput = function(event) {
		materialSpecular[0] = event.target.value;
		specularProduct = mult(lightSpecular, materialSpecular);
		gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct));
	};
	
	document.getElementById("materialSpecular_Y").oninput = function(event) {
        materialSpecular[1] = event.target.value;
		specularProduct = mult(lightSpecular, materialSpecular);
		gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct));
    };
	
	document.getElementById("materialSpecular_Z").oninput = function(event) {
        materialSpecular[2] = event.target.value;
		specularProduct = mult(lightSpecular, materialSpecular);
		gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct));
    };
	
	document.getElementById("redSlider").oninput = function(event) {
       color[0]=event.target.value;
	   
	   /*var clr="color";
	   console.log(clr);
	   console.log(color);*/
	  
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
	
	normalMatrix = [
        vec3(viewMatrix[0][0], viewMatrix[0][1], viewMatrix[0][2]),
        vec3(viewMatrix[1][0], viewMatrix[1][1], viewMatrix[1][2]),
        vec3(viewMatrix[2][0], viewMatrix[2][1], viewMatrix[2][2])
    ];
	
	//body
	transformation();
	normalMatrix=inverse3(normalMatrix);
    normalMatrix=transpose(normalMatrix);
	transformationMatrix = mult(transformationMatrix, translate(0,-1.48,0.18));
	transformationMatrix = mult(transformationMatrix, scalem(0.6,1.8,0.6));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferConeN );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation,color[0],color[1],color[2], 1.0);
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, slices*2+2 );
	
	//noise
	transformation();
	normalMatrix=inverse3(normalMatrix);
    normalMatrix=transpose(normalMatrix);
	transformationMatrix = mult(transformationMatrix, translate(0,-0.08,0.25));
	transformationMatrix = mult(transformationMatrix, scalem(0.05,0.1,0.5));
	transformationMatrix = mult(transformationMatrix, rotateX(90));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferCone );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferConeN );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation,color[0],color[1],color[2], 1.0);
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, slices*2+2 );
	
	
	rot = rot+ (speed%2.13);
	
	//wings
	
	transformation();
	normalMatrix=inverse3(normalMatrix);
    normalMatrix=transpose(normalMatrix);
	transformationMatrix = mult(transformationMatrix, translate(0,-0.08,0.4));
	transformationMatrix = mult(transformationMatrix, scalem(2,2,2));
	transformationMatrix = mult(transformationMatrix, rotateZ(rot));
	transformationMatrix = mult(transformationMatrix, rotateY(10));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.bindBuffer(gl.ARRAY_BUFFER,bufferRectNormal)
	gl.vertexAttribPointer(vNormal,4,gl.FLOAT,false,0, 0);
	gl.uniform4f(u_colorLocation, 1.0, 0.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	
	transformation();
	normalMatrix=inverse3(normalMatrix);
    normalMatrix=transpose(normalMatrix);
	transformationMatrix = mult(transformationMatrix, translate(0,-0.08,0.4));
	transformationMatrix = mult(transformationMatrix, scalem(2,2,2));
	transformationMatrix = mult(transformationMatrix, rotateZ(120));
	transformationMatrix = mult(transformationMatrix, rotateZ(rot));	
	transformationMatrix = mult(transformationMatrix, rotateY(10));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.bindBuffer(gl.ARRAY_BUFFER,bufferRectNormal)
	gl.vertexAttribPointer(vNormal,4,gl.FLOAT,false,0, 0);
	gl.uniform4f(u_colorLocation, 1.0, 0.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	

	transformation();
	normalMatrix=inverse3(normalMatrix);
    normalMatrix=transpose(normalMatrix);
	transformationMatrix = mult(transformationMatrix, translate(0,-0.08,0.4));	
	transformationMatrix = mult(transformationMatrix, scalem(2,2,2));
	transformationMatrix = mult(transformationMatrix, rotateZ(240));	
	transformationMatrix = mult(transformationMatrix, rotateZ(rot));
	transformationMatrix = mult(transformationMatrix, rotateY(10));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.bindBuffer(gl.ARRAY_BUFFER,bufferRectNormal)
	gl.vertexAttribPointer(vNormal,4,gl.FLOAT,false,0, 0);
	gl.uniform4f(u_colorLocation, 1.0, 0.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	/*
	//transformation();
	
	//transformationMatrix = mat4(); */
	
	transformationMatrix = mat4();		
	
	//square
	normalMatrix=inverse3(normalMatrix);
    normalMatrix=transpose(normalMatrix);
	transformationMatrix = mult(transformationMatrix, scalem(1.5,1.5,1.5));	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 ); 
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquareNormal);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );                             
    gl.uniform4f(u_colorLocation, 0.3,0.9,0, 1.0);
	gl.drawArrays( gl.TRIANGLE_STRIP, 0,4);
	
	
	
	setTimeout(
        function (){requestAnimFrame(render);}, 
    );
}
