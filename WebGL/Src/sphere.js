function sphere()
{
	this.va = vec4(0.0, 0.0, -1.0,1);
	this.vb = vec4(0.0, 0.942809, 0.333333, 1);
	this.vc = vec4(-0.816497, -0.471405, 0.333333, 1);
	this.vd = vec4(0.816497, -0.471405, 0.333333,1);

	this.subdivs = 3;

	this.vertices = [];
	this.colors = [];
	this.normals = [];
	this.num_vertices = 0;
	this.rad = 1;

	this.start_idx = 0;

	this.trans_mat = mat4(
        vec4( 1.0, 0.0, 0.0, 0.0 ),
        vec4( 0.0, 1.0, 0.0, 0.0 ),
        vec4( 0.0, 0.0, 1.0, 0.0 ),
        vec4( 0.0, 0.0, 0.0, 1.0 )
    );
	this.rot_mat = mat4(
        vec4( 1.0, 0.0, 0.0, 0.0 ),
        vec4( 0.0, 1.0, 0.0, 0.0 ),
        vec4( 0.0, 0.0, 1.0, 0.0 ),
        vec4( 0.0, 0.0, 0.0, 1.0 )
    );
    this.scale_mat = mat4(
        vec4( 1.0, 0.0, 0.0, 0.0 ),
        vec4( 0.0, 1.0, 0.0, 0.0 ),
        vec4( 0.0, 0.0, 1.0, 0.0 ),
        vec4( 0.0, 0.0, 0.0, 1.0 )
    );
	this.modelView_mat = [];
	this.projection_mat = [];

	this.modelViewLoc;	// start with lookat -> always feed this default lookAt
	this.projectionLoc;
	this.vPosition = vec4(0.0, 0.0, 0.0, 1.0);

	this.vertex_colors = [[0.0, 0.0, 1.0, 1.0]];

	this.triangle = triangle;
	this.divideTriangle = divideTriangle;
	this.tetrahedron = tetrahedron;
	this.generate = generate_sph;
	this.render = render_sph;
	this.trans_sph = trans_sph;
	this.rot_sph = rot_sph;
	this.scale_sph = scale_sph;
	this.transform_sph = transform_sph;
	this.get_end_idx = get_end_idx_sph;
	this.set_radius = set_radius;
}

function triangle(a, b, c) {
	this.vertices.push(a);
	this.vertices.push(b);
	this.vertices.push(c);

	this.colors.push(vec4(0.0, 1.0, 0.0, 1.0));
	this.colors.push(vec4(0.0, 1.0, 0.0, 1.0));
	this.colors.push(vec4(0.0, 1.0, 0.0, 1.0));

 	this.num_vertices += 3;
}

function divideTriangle(a, b, c, count) {
	this.triangle = triangle;
    if ( count > 0 ) {
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        this.divideTriangle( a, ab, ac, count - 1 );
        this.divideTriangle( ab, b, bc, count - 1 );
        this.divideTriangle( bc, c, ac, count - 1 );
        this.divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        this.triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
	this.divideTriangle = divideTriangle;
    this.divideTriangle(a, b, c, n);
    this.divideTriangle(d, c, b, n);
    this.divideTriangle(a, d, b, n);
    this.divideTriangle(a, c, d, n);
}

function generate_sph() {
	this.tetrahedron = tetrahedron;
	this.tetrahedron(this.va, this.vb, this.vc, this.vd, this.subdivs);
}


function get_end_idx_sph()
{
	return this.start_idx + this.vertices.length;
}

function trans_sph(x, y, z)
{
	// this.trans_mat = mult(this.trans_mat, translate(x, y, z));
	this.trans_mat = translate(x, y, z);
}

function rot_sph(angle, axis) {
	// this.rot_mat = mult(this.rot_mat, rotate(angle, axis));
	this.rot_mat = rotate(angle, axis);
}

function scale_sph(x, y, z) {
	// this.scale_mat = mult(this.scale_mat, scalem(x, y, z));
	this.scale_mat = scalem(x, y, z);
}

function transform_sph(trans_mat) {
	this.modelView_mat = trans_mat;
}

function set_radius(radius){
	this.scale_mat = scalem(radius, radius, 1);
}	

function render_sph()
{
	var mv_mat = mult(this.modelView_mat, this.trans_mat);
	mv_mat = mult(mv_mat, this.rot_mat);
	mv_mat = mult(mv_mat, this.scale_mat);
    gl.uniformMatrix4fv( this.modelViewLoc, false, flatten( mv_mat ) );
    gl.uniformMatrix4fv( this.projectionLoc, false, flatten( this.projection_mat ) );

    for( var i=0; i<this.num_vertices; i+=3) {
        gl.drawArrays( gl.TRIANGLES, this.start_idx + i, 3 );
    }
}