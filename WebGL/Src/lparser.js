var canvas;
var gl;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0.0, 0.0, 0.0 ];
var trans = [ 0.0, 0.0, 0.0 ];

var thetaLoc;
var transLoc;

var near = 0.1;
var far = 1000.0;
var radius = 10.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelViewLoc, projectionLoc;

var objects = [];

var grid_height = 500.0;
var grid_width = 500.0;
var grid_disc = 1.0;
var num_h = grid_height / grid_disc;
var num_w = grid_width / grid_disc;
var num_plane_vertices = (grid_width * grid_height) / grid_disc;

var eye;
var view;
const at = vec3(grid_width/2, grid_width/2, grid_width/2);
const up = vec3(0.0, 1.0, 0.0);

var sphere1;
var cylinder1;

var ground_plane_positions = [];
var ground_plane_vertices = [];
var ground_plane_colors = [];

// interpreter vars
var len = 0;
var iter = 0;
var x_angle = 0;
var y_angle = 0;
var z_angle = 0;
var rep_map = {};
var rhs_map = {};
var stochastic_map = {};
var cur_string = "";
var tot_string = "";
var cmd_string = "";
var spec_symbols = ["+", "-", "&", "^", "\\", "/", "|", "[", "]"];
var current_transform;

// interpretation data structures
var matrix_stack = [];
var taper_stack = [];
var random_height = 150;
var taper = 1;

function height_sum(left, right, top, bottom) {
	return (ground_plane_positions[left][bottom][1] + 
			ground_plane_positions[right][bottom][1] + 
			ground_plane_positions[left][top][1] + 
			ground_plane_positions[right][top][1]) * 0.25;
}

function diamond_square(left, right, top, bottom, base) {
	var center_x = Math.floor((right + left)/2);
	var center_y = Math.floor((top + bottom)/2);

	var avg = height_sum(left, right, top, bottom);
	ground_plane_positions[center_x][center_y][1] = avg + ((Math.random() - 0.5) * base * 2.0);

	ground_plane_positions[left][center_y][1] = (ground_plane_positions[center_x][center_y][1] +
												 ground_plane_positions[left][bottom][1] +
												 ground_plane_positions[left][top][1])/3 + ((Math.random() - 0.5) * base);


	ground_plane_positions[right][center_y][1] = (ground_plane_positions[center_x][center_y][1] +
												  ground_plane_positions[right][bottom][1] +
												  ground_plane_positions[right][top][1])/3 + ((Math.random() - 0.5) * base);

	ground_plane_positions[center_x][bottom][1] = (ground_plane_positions[center_x][center_y][1] +
												  ground_plane_positions[left][bottom][1] +
												  ground_plane_positions[right][bottom][1])/3 + ((Math.random() - 0.5) * base);

	ground_plane_positions[center_x][top][1] = (ground_plane_positions[center_x][center_y][1] +
												ground_plane_positions[left][top][1] +
												ground_plane_positions[right][top][1])/3 + ((Math.random() - 0.5) * base);

	if ((right - left) > 2)
	{
		base = Math.floor(base) * Math.pow(2.0, -0.75);

		diamond_square(left, center_x, center_y, bottom, base);
		diamond_square(center_x, right, center_y, bottom, base);
		diamond_square(left, center_x, top, center_y, base);
		diamond_square(center_x, right, top, center_y, base);
	}
}

// for ground plane, with height = z, width = x
function ground_plane() {
    // calculate ground positions and store them in a plane
    for (var i = -grid_height * 0.5; i < grid_height * 0.5; i+=grid_disc) {
        var pos_arr = [];
        for (var j = -grid_width * 0.5; j < grid_width * 0.5; j+=grid_disc) {

            var height = 0;; // randomize later or f(x,z)
            var pos = vec4(j, height, i, 1.0);
            pos_arr.push(pos);
        }
        ground_plane_positions.push(pos_arr);
    }

    //diamond-square algorithm for terrain
    random_height *= Math.random();
    ground_plane_positions[0][0][1] = random_height;
    ground_plane_positions[0][num_h-1][1] = random_height;
    ground_plane_positions[num_w-1][0][1] = random_height;
    ground_plane_positions[num_w-1][num_h-1][1] = random_height;
    diamond_square(0, num_w-1, 0, num_h-1, random_height);


    // generate triangle strip vertices from the ground positions
    for (var i = 0; i < ground_plane_positions.length-1; ++i) { //generate triangle fan vertices
        var pos_arr_len = ground_plane_positions[i].length;
        for (var j = 0; j < pos_arr_len - 1; ++j) {
            ground_plane_vertices.push(ground_plane_positions[i][j+1]);
            ground_plane_vertices.push(ground_plane_positions[i][j]);
            ground_plane_vertices.push(ground_plane_positions[i+1][j+1]);

            ground_plane_vertices.push(ground_plane_positions[i][j]);
            ground_plane_vertices.push(ground_plane_positions[i+1][j+1]);
            ground_plane_vertices.push(ground_plane_positions[i+1][j]);

            ground_plane_colors.push(vec4(0.5, 0.9, 0.2, 1.0));
            ground_plane_colors.push(vec4(0.5, 0.9, 0.2, 1.0));
            ground_plane_colors.push(vec4(0.5, 0.9, 0.2, 1.0));
            ground_plane_colors.push(vec4(0.9, 0.5, 0.2, 1.0));
            ground_plane_colors.push(vec4(0.9, 0.5, 0.2, 1.0));
            ground_plane_colors.push(vec4(0.9, 0.5, 0.2, 1.0));
        }
    }
}

function handle_rep(rep_string) {
	var rep_arr = rep_string.split(",");
	rep_map[rep_arr[0]] = rep_arr[1];
}

function handle_rot(rot_string) {
	var rot_arr = rot_string.split(" ");
	x_angle = parseFloat(rot_arr[1]);
	y_angle = parseFloat(rot_arr[2]);
	z_angle = parseFloat(rot_arr[3]);
	console.log(x_angle, y_angle, z_angle);
}

function handle_rhs(rhs_string) {
	var rhs_arr = rhs_string.split(" ");

	if (rhs_string.indexOf("(") > -1) {
		var par_split = rhs_arr[0].split("(");

		if (rhs_map[par_split[0]] == undefined)
			rhs_map[par_split[0]] = [];
		rhs_map[par_split[0]].push(rhs_arr[1]);
		var stochastic_val = 0;
		for (var key in stochastic_map) {
			if (key == rhs_arr[1])
				break;
			stochastic_val += stochastic_map[key];
		}
		stochastic_map[rhs_arr[1]] = stochastic_val + parseFloat(par_split[1].substring(0, par_split[1].length - 2));
	}
	else{
		if (rhs_map[par_split[0]] == undefined)
			rhs_map[par_split[0]] = [];
		rhs_map[rhs_arr[0].substring(0, rhs_arr.length-1)].push(rhs_arr[1]);
		stochastic_map[rhs_arr[1]] = 1.0;
	}

}

function taper_cylinder() {
	taper = Math.max(taper - 0.001, 0);
	cylinder1.set_radii(cylinder1.top_rad * taper);
	sphere1.set_radius(cylinder1.top_rad);
}

// form the l-system string using recursion
function form_lSystem(string, curr_iter) {
	// curr_iter++;
	if (string == undefined) 
		return;
	if (curr_iter == iter)
		tot_string = tot_string.concat(string);
	else {
		for (var i = 0; i < string.length; ++i) {
			if (string[i] != undefined) {
				if (spec_symbols.indexOf(string[i]) != -1)
					tot_string = tot_string.concat(string[i]);
				else {
					var rand_val = Math.random();
					var rand_idx = 0;

					while(stochastic_map[rhs_map[string[i]][rand_idx]] < rand_val) {
						rand_idx++;
					}

					var rep_string = rhs_map[string[i]][rand_idx];
					form_lSystem(rep_string, curr_iter + 1);
				}
		}
		}
	}
}

// perform replacement rules
function finalize_lString() {
	console.log("stochastic_map", stochastic_map);
	for (var i = 0; i < tot_string.length; ++i) {
		if (spec_symbols.indexOf(tot_string[i]) != -1)
			cmd_string = cmd_string.concat(tot_string[i]);
		else {
			if (rep_map[tot_string[i]] != undefined)
				cmd_string = cmd_string.concat(rep_map[tot_string[i]]);
			else
				cmd_string = cmd_string.concat("F");
		}
	}
}

// start parsing the commands
function lparser(file) {
	var arr = file.split("\n");
	for (var i = 0; i < arr.length; ++i) {
		if (arr[i][0] != "#") {
			var sub_arr = arr[i].split(" ");
			var cmd = sub_arr[0]

			switch(cmd) {
				case "len:":
					len = parseFloat(sub_arr[1]);
					break;
				case "iter:":
					iter = parseFloat(sub_arr[1]);
					break;
				case "rot:":
					var col_arr = arr[i].split(":");
					handle_rot(col_arr[1]);
					break;
				case "rep:":
					handle_rep(sub_arr[1]);
					break;
				case "start:":
					cur_string = sub_arr[1];
					break;
				default:
					handle_rhs(arr[i]);
					break;
			}
		}
	}
	form_lSystem(cur_string, 0);
	finalize_lString();

	current_transform = rotate(-90, vec3(1.0, 0.0, 0.0));
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	interpret_l_string();

    gl.uniformMatrix4fv( modelViewLoc, false, flatten( mvMatrix ) );
    gl.uniformMatrix4fv( projectionLoc, false, flatten( pMatrix ) );
    gl.drawArrays(gl.TRIANGLE_STRIP, objects[objects.length-1].get_end_idx(), ground_plane_vertices.length);
}

function draw_cylinder(next_frame) {
	cur_pos = vec3(current_transform[0][3], current_transform[1][3], current_transform[2][3]);
	next_pos = vec3(next_frame[0][3], next_frame[1][3], next_frame[2][3]);

    var sum_vec = add(next_pos, cur_pos);
    var diff_vec = subtract(next_pos, cur_pos);

    // cylidner translation (half of the distance from cur to next points)
    var trans = vec3(sum_vec[0] * 0.5, sum_vec[1] * 0.5, sum_vec[2] * 0.5);
    var cyl_transform = next_frame;
    cyl_transform[0][3] = trans[0];
    cyl_transform[1][3] = trans[1];
    cyl_transform[2][3] = trans[2];

    cylinder1.transform_cyl(mult(mvMatrix, cyl_transform));
    cylinder1.render();
}

function draw_sphere() {
	sphere1.transform_sph(mult(mvMatrix, current_transform));
    sphere1.render();
}

function interpret_l_string() {
	for (var i = 0; i < cmd_string.length; ++i) {
		switch(cmd_string[i]) {
			case "F":
				taper_cylinder();
				var next_transform = mult(current_transform, translate(0, 0, len));
				draw_cylinder(next_transform);
				current_transform = next_transform;
				draw_sphere();
				break;
			case "f":
				current_transform = mult(current_transform, tranlate(0, 0, len));
				break;
			case "+":
				current_transform = mult(current_transform, rotate(x_angle, vec3(1.0, 0.0, 0.0)));
				break;
			case "-":
				current_transform = mult(current_transform, rotate(-x_angle, vec3(1.0, 0.0, 0.0)));
				break;
			case "\\":
				current_transform = mult(current_transform, rotate(z_angle, vec3(0.0, 0.0, 1.0)));
				break;
			case "/":
				current_transform = mult(current_transform, rotate(z_angle, vec3(0.0, 0.0, 1.0)));
				break;
			case "&":
				current_transform = mult(current_transform, rotate(y_angle, vec3(0.0, 1.0, 0.0)));
				break;
			case "^":
				current_transform = mult(current_transform, rotate(-y_angle, vec3(0.0, 1.0, 0.0)));
				break;
			case "|":
				current_transform = mult(current_transform, rotate(180.0, vec3(0.0, 1.0, 0.0)));
				break;
			case "[":
				matrix_stack.push(current_transform);
				taper_stack.push(taper);
				break;
			case "]":
				current_transform = matrix_stack.pop();
				taper = taper_stack.pop();
				break;
		}
	}
}

// function to read the file
function read_file(fileInput)  {
	console.log("read_file", fileInput);
	var fileDisplayArea = document.getElementById('fileDisplayArea');

	var file = fileInput.files[0];
	var textType = /text.*/;

	if (file.type.match(textType)) {
		var reader = new FileReader();

		reader.onload = function(e) {
			lparser(reader.result);
			var f_string = "";
			for (var i = 0; i < cmd_string.length; ++i) {
				if ((i+1) % 50 == 0) {
					f_string = f_string.concat("\n");
				}
				f_string = f_string.concat(cmd_string[i]);
			}
			fileDisplayArea.innerText = f_string;
		}

		reader.readAsText(file);	
	} else {
		fileDisplayArea.innerText = "File not supported!";
	}
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// create cubes here?

	gl.viewport(0, 0, canvas.width, canvas.height);
	aspect = canvas.width/canvas.height;
	gl.clearColor(0.3, 0.03, 0.05, 0.3);
	gl.enable(gl.DEPTH_TEST);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
    modelViewLoc = gl.getUniformLocation( program, "modelView" );
    projectionLoc = gl.getUniformLocation( program, "projection" );

    sphere1 = new sphere();
    sphere1.generate();
    sphere1.modelViewLoc = modelViewLoc;
    sphere1.scale_sph(0.15, 0.15, 0.15); //scale to radius of cylinders
    objects.push(sphere1);

    cylinder1 = new cylinder();
    cylinder1.generate();
    cylinder1.modelViewLoc = modelViewLoc;
    cylinder1.start_idx = sphere1.get_end_idx();
    objects.push(cylinder1);

    ground_plane();

    // concatenate points
    for (var o = 0; o < objects.length; ++o) {
	    colors = colors.concat(objects[o].colors);
	    points = points.concat(objects[o].vertices);
	}
    colors = colors.concat(ground_plane_colors);
    points = points.concat(ground_plane_vertices);

    // create buffers
 	var cBuffer = gl.createBuffer( );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //render -> call each of the individual objects' render methods 
    //			after assigning their respective MV-Projection matrices
    //			camera is looking down directly at the x-z plane
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    eye = vec3(-grid_width/2, grid_height, grid_width/2);

    mvMatrix = lookAt( eye, at , up );
    var transMat = translate(grid_width, 0.0, grid_width/2 );
    mvMatrix = mult( mvMatrix, transMat );
    pMatrix = perspective( fovy, aspect, near, far );

    gl.uniformMatrix4fv( modelViewLoc, false, flatten( mvMatrix ) );
    gl.uniformMatrix4fv( projectionLoc, false, flatten( pMatrix ) );
}