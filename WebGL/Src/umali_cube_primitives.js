function CubePrimitive()
{
	this.NumVertices = 36;
	this.vertices = [vec4(-1.0, -1.0,  1.0, 1.0),
					vec4(-1.0,  1.0,  1.0, 1.0),
					vec4(1.0,  1.0,  1.0, 1.0),
					vec4(1.0, -1.0,  1.0, 1.0),
					vec4(-1.0, -1.0, -1.0, 1.0),
					vec4(-1.0,  1.0, -1.0, 1.0),
					vec4(1.0,  1.0, -1.0, 1.0),
					vec4(1.0, -1.0, -1.0, 1.0) 
					];
	this.vertexColors = [vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
						vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
						vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
						vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
						vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
						vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
						vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
						vec4( 1.0, 1.0, 1.0, 1.0 ),  // white\
					];
	this.base = new Primitive(this.NumVertices, this.vertices, this.vertexColors);

	// methods
	this.quad = quad;
	this.colorCube = colorCube;
	this.translate = this.base.translatePrimitive;
	this.rotate = this.base.rotatePrimitive;
	this.scale = this.base.scalePrimitive;
}

function quad(a, b, c, d) {
	this.base.pointsArray.push(this.base.vertices[a]);
	this.base.colorsArray.push(this.base.vertexColors[a]);
	this.base.pointsArray.push(this.base.vertices[b]);
	this.base.colorsArray.push(this.base.vertexColors[a]);
	this.base.pointsArray.push(this.base.vertices[c]);
	this.base.colorsArray.push(this.base.vertexColors[a]);
	this.base.pointsArray.push(this.base.vertices[a]);
	this.base.colorsArray.push(this.base.vertexColors[a]);
	this.base.pointsArray.push(this.base.vertices[c]);
	this.base.colorsArray.push(this.base.vertexColors[a]);
	this.base.pointsArray.push(this.base.vertices[d]);
	this.base.colorsArray.push(this.base.vertexColors[a]);
}
function colorCube()
{
    this.quad(1, 0, 3, 2 );
    this.quad(2, 3, 7, 6 );
    this.quad(3, 0, 4, 7 );
    this.quad(6, 5, 1, 2 );
    this.quad(4, 5, 6, 7 );
    this.quad(5, 4, 0, 1 );
}