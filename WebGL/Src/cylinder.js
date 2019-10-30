function cylinder()
{
	this.num_vertices = 100.0; //100 per top circle
	this.top_rad = 0.15;
	this.bot_rad = 0.15;
	this.height = 2.0;

	this.top_points = [];
	this.bot_points = [];
	this.vertices = [];
	this.colors = [];

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

	this.generate = generate_cyl;
	this.render = render_cyl;
	this.trans_cyl = trans_cyl;
	this.rot_cyl = rot_cyl;
	this.scale_cyl = scale_cyl;
	this.transform_cyl = transform_cyl;
	this.get_end_idx = get_end_idx_cyl;
	this.set_radii = set_radii;
}

function generate_cyl()
{
	this.vertices = [];
	this.colors = [];

	var top_center = vec4(0.0, 0.0, this.height * 0.5, 1.0);
	var bot_center = vec4(0.0, 0.0, -this.height * 0.5, 1.0);

	var angle = 2.0 * Math.PI / this.num_vertices;
	for  (var i = 0.0; i <= this.num_vertices; ++i) {
		var top = vec4(this.top_rad * Math.cos(angle * i), this.top_rad * Math.sin(angle * i), this.height * 0.5, 1.0);
		var bot = vec4(this.bot_rad * Math.cos(angle * i), this.bot_rad * Math.sin(angle * i), -this.height * 0.5, 1.0);

		this.top_points.push(top);
		this.bot_points.push(bot);
		if (i != 0.0) {
			var prev_top = this.top_points[i-1];
			var prev_bot = this.bot_points[i-1];

			this.vertices.push(prev_top);
			this.vertices.push(top_center);
			this.vertices.push(top);
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));

			this.vertices.push(prev_bot);
			this.vertices.push(bot_center);
			this.vertices.push(bot);
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));

			this.vertices.push(prev_bot);
			this.vertices.push(prev_top);
			this.vertices.push(bot);
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));

			this.vertices.push(prev_top);
			this.vertices.push(bot);
			this.vertices.push(top);
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
			this.colors.push(vec4(0.0, 0.0, 1.0, 1.0));
		}
	}
}

function get_end_idx_cyl()
{
	return this.start_idx + this.vertices.length;
}

function trans_cyl(x, y, z)
{
	// this.trans_mat = mult(this.trans_mat, translate(x, y, z));
	this.trans_mat = translate(x, y, z);
}

function rot_cyl(angle, axis) {
	// this.rot_mat = mult(this.rot_mat, rotate(angle, axis));
	this.rot_mat = rotate(angle, axis);
}

function scale_cyl(x, y, z) {
	// this.scale_mat = mult(this.scale_mat, scalem(x, y, z));
	this.scale_mat = scalem(x, y, z);
}

function transform_cyl(trans_mat) {
	this.modelView_mat = trans_mat;
}

function set_radii(rad) {
	this.scale_mat = scalem(this.top_rad * rad, this.top_rad * rad, 1);
}

function render_cyl()
{
	var mv_mat = mult(this.modelView_mat, this.trans_mat);
	mv_mat = mult(mv_mat, this.rot_mat);	
	mv_mat = mult(mv_mat, this.scale_mat);
    gl.uniformMatrix4fv( this.modelViewLoc, false, flatten( mv_mat ) );
    gl.uniformMatrix4fv( this.projectionLoc, false, flatten( this.projection_mat ) );

    gl.drawArrays(gl.TRIANGLES, this.start_idx, this.vertices.length);
}