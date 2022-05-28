"use strict";

var canvas;
var gl;


var bufferTri, bufferRect, bufferRect2,bufferRect3,triVertices, rectVertices,rect2Vertices,rect3Vertices;
var vPosition;
var transformationMatrix, transformationMatrixLoc;
var u_colorLocation, u_Color;


var positions = vec3(0, 0, 0);
var scale = vec3(1, 1, 1);

var theta = 0.0;
var thetaLoc;

var color = vec3(0.0, 0.0, 0.0);

//var direction=true;
var speed=0.5;

var rot_a=0.0;	

/*var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];*/


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

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Make the letters
    triVertices = [
        vec2(  -0.6,  -0.4 ), 
        vec2(  0.2,  -0.4 ),	
        vec2(  -0.2, 0.6 )	
    ];
	
	
	rectVertices = [
        vec2(  -0.29,  -0.07),	
        vec2(  -0.1,  -0.07),	            //red
        vec2(  -0.29,  0.4 ),	
        vec2(  -0.1,  0.4 )		
    ];

    rect2Vertices = [
        vec2(  0.253,  0.57 ),	
        vec2(  0.155,  0.72 ),				//blue
        vec2(  -0.15,  0.3 ),	
        vec2(  -0.25,  0.45 )		
    ];
	
	rect3Vertices = [
        vec2(  -0.57,  0.72 ), 
        vec2(  -0.68,  0.57 ),				//green 
        vec2(  -0.17,  0.44),			
        vec2(  -0.28,  0.3)
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
    bufferRect2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rect2Vertices), gl.STATIC_DRAW );
	
	// Load the data into the GPU
	bufferRect3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect3 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rect3Vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	u_colorLocation = gl.getUniformLocation(program, "u_Color");
	thetaLoc = gl.getUniformLocation(program, "theta");
	
    
	document.getElementById("inp_objX").oninput = function(event) {
        //TODO: fill here to adjust translation according to slider value
		 positions[0] = event.target.value;
    };
    document.getElementById("inp_objY").oninput = function(event) {
        //TODO: fill here to adjust translation according to slider value
		positions[1] = event.target.value;
    };
    document.getElementById("inp_obj_scale").oninput = function(event) {
        //TODO: fill here to adjust scale according to slider value
		scale[0] = event.target.value;
		scale[1] = event.target.value;
    };
    document.getElementById("inp_obj_rotation").oninput = function(event) {
        //TODO: fill here to adjust rotation according to slider value
		theta = event.target.value;
		
    };
    document.getElementById("inp_wing_speed").oninput = function(event) {
		//TODO: fill here to adjust wing scale according to slider value
		
		speed = event.target.value;
	    //alert(speed)
	};
	
	 document.getElementById("redSlider").oninput = function(event) {
        //TODO: fill here to adjust color according to slider value
		color[0]=event.target.value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        //TODO: fill here to adjust color according to slider value
		color[1]=event.target.value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
        //TODO: fill here to adjust color according to slider value
		color[2]=event.target.value;
    };

    render();

};



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

	
	transformationMatrix = mat4();
    transformationMatrix = mult(transformationMatrix, translate(positions[0], positions[1], positions[2]));
	
	transformationMatrix = mult(transformationMatrix,translate(-0.2048,0.302,0));
	transformationMatrix = mult(transformationMatrix, scalem(scale[0], scale[1], scale[2]));
	transformationMatrix = mult(transformationMatrix,translate(0.2048,-0.302,0));
	
	transformationMatrix = mult(transformationMatrix,translate(-0.2048,0.302,0));
	transformationMatrix = mult(transformationMatrix, rotateZ(theta));
	transformationMatrix = mult(transformationMatrix,translate(0.2048,-0.302,0));
	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation,color[0],color[1],color[2],1.0); 
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 3 );
	
	rot_a = rot_a + speed%2.13;
	 
	transformationMatrix=mult(transformationMatrix,translate(-0.206,0.394,0));
	transformationMatrix=mult(transformationMatrix,rotateZ(rot_a));
	transformationMatrix=mult(transformationMatrix,translate(0.206,-0.394,0));
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 1.0, 0.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	

	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect2 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 0.0, 0.0, 1.0, 1.0); 
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect3 );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.uniform4f(u_colorLocation, 0.0, 1.0, 0.0, 1.0)
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	setTimeout(
        function (){requestAnimFrame(render);}, 
    );
}
