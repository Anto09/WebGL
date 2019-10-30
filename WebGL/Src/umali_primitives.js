function Primitive(NumVertices, vertices, vertexColors) 
{
	this.NumVertices = NumVertices;
	this.pointsArray = [];
	this.colorsArray = [];
	this.vertices = vertices;
	this.vertexColors = vertexColors;
	this.t_trans = mat4();
	this.t_rot = mat4();
	this.t_scale = mat4();

	// methods
	this.translatePrimitive = translatePrimitive;
	this.rotatePrimitive = rotatePrimitive;
	this.scalePrimitive = scalePrimitive;
	this.renderPrimitive = renderPrimitive;
}


function translatePrimitive(x, y, z)
{
	this.t_trans = translate(x,y,z);
	var idx = 0;
	for (var pA in this.vertices)
	{
		var ver_mat = translate(this.vertices[pA][0],this.vertices[pA][1],this.vertices[pA][2]);
		var result 	= mult(this.t_trans, ver_mat);
		var trans_vec = vec4(result[0][3] , result[1][3],  result[2][3], 1.0);
		this.vertices[pA] = trans_vec;
	}

}

function rotatePrimitive(axis, angle)
{
	this.t_rot = rotate(axis, angle);
}

function scalePrimitive(x, y, z)
{
	this.t_scale = scalem(x, y, z);
}
function renderPrimitive(program, start) //fix to take into account multiple data
{
 	// Load the data into the GPU	
    var thisuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, thisuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

	// Load the data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

var scene_graph = 
{
	primitives : [],
	'addPrimitive' : function(primitive)
	{
		this.primitives.push(primitive);
	},
	'render' : function(program)
	{
		var idx = 0;
		for (var pA in this.primitives)
		{
			this.primitives[pA].base.renderPrimitive(program, idx);
			idx++;
		}
	}
};
