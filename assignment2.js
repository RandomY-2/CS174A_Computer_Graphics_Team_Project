import { defs, tiny } from "./examples/common.js";

import { Body } from "./examples/collisions-demo.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Shader,
} = tiny;

class Stilt extends Shape {
  constructor() {
    super("position", "normal");
    // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
    // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
    this.arrays.position = Vector3.cast(
      [-1, -20, -1],
      [1, -20, -1],
      [-1, -20, 1],
      [1, -20, 1],
      [1, 20, -1],
      [-1, 20, -1],
      [1, 20, 1],
      [-1, 20, 1],
      [-1, -20, -1],
      [-1, -20, 1],
      [-1, 20, -1],
      [-1, 20, 1],
      [1, -20, 1],
      [1, -20, -1],
      [1, 20, 1],
      [1, 20, -1],
      [-1, -20, 1],
      [1, -20, 1],
      [-1, 20, 1],
      [1, 20, 1],
      [1, -20, -1],
      [-1, -20, -1],
      [1, 20, -1],
      [-1, 20, -1]
    );
    this.arrays.normal = Vector3.cast(
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1]
    );
    // Arrange the vertices into a square shape in texture space too:
    this.indices.push(
      0,
      1,
      2,
      1,
      3,
      2,
      4,
      5,
      6,
      5,
      7,
      6,
      8,
      9,
      20,
      9,
      11,
      20,
      12,
      13,
      14,
      13,
      15,
      14,
      16,
      17,
      18,
      17,
      19,
      18,
      20,
      21,
      22,
      21,
      23,
      22
    );
  }
}

class Base_Scene extends Scene {
  /**
   *  **Base_scene** is a Scene that can be added to any display canvas.
   *  Setup the shapes, materials, camera, and lighting here.
   */
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    this.stilt_touch_ground = false;
    this.left_stilt_touch_ground = false;
    this.right_stilt_touch_ground = false;

    this.outline = false;
    this.hover = this.swarm = false;
    this.left_lift = this.right_lift = false;
    this.left_rotate_forward = this.right_rotate_forward = false;
    this.left_rotate_backward = this.right_rotate_backward = false;
    this.lean_backward = this.lean_forward = false;
    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      stilt: new Stilt(),
      sphere_4: new defs.Subdivision_Sphere(4),
    };

    // *** Materials
    this.materials = {
      plastic: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),

      sun_material: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.6,
        color: hex_color("#992828"),
      }),
    };
    // The white material and basic shader are used for drawing the outline.
    this.white = new Material(new defs.Basic_Shader());

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 10, 20),
      vec3(0, 0, 0),
      vec3(0, 1, 0)
    );
  }

  draw_sun(context, program_state) {
    const scale_factor = 5;
    const sun_color = color(1, 1, 1, 1);

    const sun_model_transform = Mat4.translation(-50, 30, 30).times(
      Mat4.scale(scale_factor, scale_factor, scale_factor).times(
        Mat4.identity()
      )
    );

    const light_position = vec4(-50, 50, 50, 1);
    program_state.lights = [new Light(light_position, sun_color, 1000 ** 50)];

    this.shapes.sphere_4.draw(
      context,
      program_state,
      sun_model_transform,
      this.materials.sun_material.override({
        color: sun_color,
      })
    );
  }

  display(context, program_state) {
    // display():  Called once per frame of animation. Here, the base class's display only does
    // some initial setup.

    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(Mat4.translation(5, -20, -30));
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    // *** Lights: *** Values of vector or point lights.
    this.draw_sun(context, program_state);
    // const light_position = vec4(0, 5, 5, 1);
    // program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
  }
}

export class Assignment2 extends Base_Scene {
  constructor() {
    super();
    this.left_stilt_time = new Date().getTime() / 1000;
    this.right_stilt_time = new Date().getTime() / 1000;
    this.rotate_time = new Date().getTime() / 1000;
    this.lean_time = new Date().getTime() / 1000;
    this.lean_angle = 0;

    this.left_stilt_model = Mat4.identity();
    this.right_stilt_model = Mat4.translation(-20, 0, 0).times(Mat4.identity());
    this.lean = Mat4.identity();
    this.gravity = 0;

    this.stilt_max_height = 5;
    this.keyboard_color = "#6E6460";

    this.x_displacement = 0;
    this.z_displacement = 0;
  }
  /**
   * This Scene object can be added to any display canvas.
   * We isolate that code so it can be experimented with on its own.
   * This gives you a very small code sandbox for editing a simple scene, and for
   * experimenting with matrix transformations.
   */
  set_colors() {
    // TODO:  Create a class member variable to store your cube's colors.
    // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
    // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
    this.cube_colors = [];
    for (let i = 0; i <= 7; i++) {
      this.cube_colors.push(
        color(Math.random(), Math.random(), Math.random(), 1.0)
      );
    }
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      "Lift Left",
      ["v"],
      () => {
        this.left_lift = true;
        this.left_stilt_time = new Date().getTime() / 1000;
      },
      this.keyboard_color,
      () => {
        this.left_lift = false;
        this.left_stilt_time = new Date().getTime() / 1000;
      }
    );
    this.key_triggered_button(
      "Lift Right",
      ["n"],
      () => {
        this.right_lift = true;
        this.right_stilt_time = new Date().getTime() / 1000;
      },
      this.keyboard_color,
      () => {
        this.right_lift = false;
        this.right_stilt_time = new Date().getTime() / 1000;
      }
    );
    this.key_triggered_button(
      "Rotate Forward",
      ["g"],
      () => {
        this.left_rotate_forward = true;
        this.right_rotate_forward = true;
        this.rotate_time = new Date().getTime() / 1000;
      },
      this.keyboard_color,
      () => {
        this.left_rotate_forward = false;
        this.right_rotate_forward = false;
      }
    );
    this.key_triggered_button(
      "Rotate Backward",
      ["b"],
      () => {
        this.left_rotate_backward = true;
        this.right_rotate_backward = true;
        this.rotate_time = new Date().getTime() / 1000;
      },
      this.keyboard_color,
      () => {
        this.left_rotate_backward = false;
        this.right_rotate_backward = false;
      }
    );
    this.key_triggered_button(
      "Lean Backward",
      ["k"],
      () => {
        this.lean_backward = true;
        this.lean_backward = true;
        this.lean_time = new Date().getTime() / 1000;
      },
      this.keyboard_color,
      () => {
        this.lean_backward = false;
        this.lean_backward = false;
      }
    );
    this.key_triggered_button(
      "Lean Forward",
      ["i"],
      () => {
        this.lean_forward = true;
        this.lean_forward = true;
        this.lean_time = new Date().getTime() / 1000;
      },
      this.keyboard_color,
      () => {
        this.lean_forward = false;
        this.lean_forward = false;
      }
    );
  }

  draw_box(
    context,
    program_state,
    model_transform
    // cube_color
  ) {
    // TODO:  Helper function for requirement 3 (see hint).
    //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
    // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc.
    this.shapes.stilt.draw(
      context,
      program_state,
      model_transform,
      this.materials.plastic.override({ color: this.white })
    );
    return model_transform;
  }

  draw_character_head(context, program_state, model_transform, color) {
    this.shapes.sphere_4.draw(context, program_state, model_transform, color);
    return model_transform;
  }

  draw_character_body(context, program_state, model_transform, color) {
    this.shapes.stilt.draw(context, program_state, model_transform, color);
    return model_transform;
  }

  display(context, program_state) {
    super.display(context, program_state);
    const blue = hex_color("#1a9ffa");
    const salmon = hex_color("FFA07A");
    const grey = hex_color("888888");
    let t = new Date().getTime() / 1000;

    let max_rotation_angle = 0.25 * Math.PI;
    let stilt_rotation_angle = max_rotation_angle / 5;

    let ground_model = Mat4.translation(0, -40, -50).times(
      Mat4.scale(100, 0.01, 100)
    );

    let character_body_transform = Mat4.translation(-10, 5, 0)
    .times(Mat4.scale(5, 0.3, 5))
    .times(Mat4.identity());

    let left_leg_z = this.left_stilt_model[2][3];
    let left_foot_z = left_leg_z - 20 * this.left_stilt_model[2][1];
    let right_leg_z = this.right_stilt_model[2][3];
    let right_foot_z = right_leg_z - 20 * this.right_stilt_model[2][1];
    let left_leg_y = this.left_stilt_model[1][3];
    let left_foot_y =
      left_leg_y -
      20 * this.left_stilt_model[1][1] +
      this.gravity;
    let right_leg_y = this.right_stilt_model[1][3];
    let right_foot_y =
      right_leg_y -
      20 * this.right_stilt_model[1][1] +
      this.gravity;

    let front_z =
      left_foot_z >= right_foot_z && left_foot_y == 0
        ? left_foot_z
        : right_foot_z;
    let front_y =
      left_foot_z >= right_foot_z && left_foot_y == 0
        ? left_foot_y
        : right_foot_y;

    let back_z =
      left_foot_z <= right_foot_z && left_foot_y == 0
        ? left_foot_z
        : right_foot_z;
    let back_y =
      left_foot_z <= right_foot_z && left_foot_y == 0
        ? left_foot_y
        : right_foot_y;

    this.left_stilt_bottom = this.lean
      .times(this.left_stilt_model.times(vec4(0, -20, 0, 1)))
      .plus(vec4(0, this.gravity, 0, 0));

    this.right_stilt_bottom = this.lean
      .times(this.right_stilt_model.times(vec4(0, -20, 0, 1)))
      .plus(vec4(0, this.gravity, 0, 0));


    this.left_stilt_bottom[1] = Math.max(-40, this.left_stilt_bottom[1]);
    this.right_stilt_bottom[1] = Math.max(-40, this.right_stilt_bottom[1]);

    // console.log(this.left_stilt_bottom[1], this.right_stilt_bottom[1]);

    let center_coord = vec4(0, Math.min(left_leg_y, right_leg_y), (left_leg_z + right_leg_z) / 2, 1);

    if (this.left_lift) {
      if (this.left_stilt_model[1][3] + (new Date().getTime() / 1000 - this.left_stilt_time) < this.stilt_max_height) {
        this.left_stilt_model = Mat4.translation(0, 1 * (new Date().getTime() / 1000 - this.left_stilt_time), 0).times(this.left_stilt_model);
      }
    } else {
      if (this.left_stilt_model[1][3] - (new Date().getTime() / 1000 - this.left_stilt_time) >= 0) {
        this.left_stilt_model = Mat4.translation(0, -1 * (new Date().getTime() / 1000 - this.left_stilt_time), 0).times(this.left_stilt_model);
        // if (this.left_stilt_bottom[1] > ground_model[1][3]) {
        //   this.left_stilt_model = Mat4.translation(0, -1 * (new Date().getTime() / 1000 - this.left_stilt_time), 0).times(this.left_stilt_model);
        // } else {
        //   // this.left_stilt_model = Mat4.identity();
        //   this.left_stilt_touch_ground = true;
        // }
      }
      // else {
      //   this.left_stilt_model = Mat4.identity();
      // }
    }

    if (this.left_rotate_forward && this.left_lift) {
      if (this.left_stilt_model[2][1] < 0.7) {
        this.left_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation(stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);
      }
    }

    if (this.left_rotate_backward && this.left_lift) {
      if (this.left_stilt_model[2][1] > -0.7) {
        this.left_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation((-1 * stilt_rotation_angle) / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);
      }
    }

    if (this.right_lift) {
      if (this.right_stilt_model[1][3] + (new Date().getTime() / 1000 - this.right_stilt_time) < this.stilt_max_height) {
        this.right_stilt_model = Mat4.translation(0, 1 * (new Date().getTime() / 1000 - this.right_stilt_time), 0).times(this.right_stilt_model);
      }
    } else {
      if (this.right_stilt_model[1][3] - (new Date().getTime() / 1000 - this.right_stilt_time) >= 0) {
        this.right_stilt_model = Mat4.translation(0, -1 * (new Date().getTime() / 1000 - this.right_stilt_time), 0).times(this.right_stilt_model);
        // if (this.right_stilt_bottom[1] > ground_model[1][3]) {
        //   this.right_stilt_model = Mat4.translation(0, -1 * (new Date().getTime() / 1000 - this.right_stilt_time), 0).times(this.right_stilt_model);
        // } else {
        //   // this.right_stilt_model = Mat4.translation(-20, 0, 0).times(
        //   //   Mat4.identity()
        //   // );
        //   this.right_stilt_touch_ground = true;
        // }
      }
      // else {
      //   this.right_stilt_model = Mat4.translation(-20, 0, 0).times(
      //     Mat4.identity()
      //   );
      // }
    }

    if (this.right_rotate_forward && this.right_lift) {
      if (this.right_stilt_model[2][1] < 0.7) {
        this.right_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation(stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);
      }
    }

    if (this.right_rotate_backward && this.right_lift) {
      if (this.right_stilt_model[2][1] > -0.7) {
        this.right_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation((-1 * stilt_rotation_angle) / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);
      }
    }


    // character
    // const scale_factor = 3;
    // const character_transform = Mat4.translation(-10, 10, 0).times(Mat4.scale(
    //   scale_factor,
    //   scale_factor,
    //   scale_factor
    // ).times(Mat4.identity()));


    // character head
    const scale_factor = 4;
    const character_head_transform = Mat4.translation(-10, 20, 0).times(
      Mat4.scale(scale_factor, scale_factor, scale_factor).times(
        Mat4.identity()
      )
    );


    // character torso
    // upper left hand
    const scale_factor_torse = 2;
    const character_upper_left = Mat4.translation(-18, 10, 0).times(
      Mat4.scale(
        scale_factor_torse,
        scale_factor_torse,
        scale_factor_torse
      ).times(Mat4.identity())
    );
    const character_upper_right = Mat4.translation(-2, 10, 0).times(
      Mat4.scale(
        scale_factor_torse,
        scale_factor_torse,
        scale_factor_torse
      ).times(Mat4.identity())
    );
    const character_lower_left = Mat4.translation(-18, -5, 0).times(
      Mat4.scale(
        scale_factor_torse,
        scale_factor_torse,
        scale_factor_torse
      ).times(Mat4.identity())
    );
    const character_lower_right = Mat4.translation(-2, -5, 0).times(
      Mat4.scale(
        scale_factor_torse,
        scale_factor_torse,
        scale_factor_torse
      ).times(Mat4.identity())
    );

    // lean
    if (this.lean_backward && !(this.left_stilt_touch_ground || this.right_stilt_touch_ground)) {
      this.lean_angle += max_rotation_angle / 100;
      if (!this.left_lift && !this.right_lift) {
        if (Math.abs(this.left_stilt_bottom[1] - this.right_stilt_bottom[1]) <= 0.05) {
          if (this.left_stilt_bottom[1] < this.right_stilt_bottom[1]) {
            this.lean = Mat4.translation(0, this.left_stilt_bottom[1] + 16, left_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.left_stilt_bottom[1] - 16, -left_foot_z)));
          } else {
            this.lean = Mat4.translation(0, this.right_stilt_bottom[1] + 20, right_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.right_stilt_bottom[1] - 20, -right_foot_z)));
          }
        }
      } else if (this.left_lift && this.right_lift) {
        if (this.left_stilt_bottom[1] < this.right_stilt_bottom[1]) {
          this.lean = Mat4.translation(0, this.left_stilt_bottom[1] + 16, left_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.left_stilt_bottom[1] - 16, -left_foot_z)));
        } else {
          this.lean = Mat4.translation(0, this.right_stilt_bottom[1] + 20, right_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.right_stilt_bottom[1] - 20, -right_foot_z)));
        }
      } else if (this.left_lift) {
        // rotate forward
        this.left_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation(stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);

        this.right_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation(stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);

        this.lean = Mat4.translation(0, this.right_stilt_bottom[1] + 20, right_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.right_stilt_bottom[1] - 20, -right_foot_z)));
      } else {
        this.left_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation(stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);

        this.right_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation(stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);

        this.lean = Mat4.translation(0, this.left_stilt_bottom[1] + 16, left_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.left_stilt_bottom[1] - 16, -left_foot_z)));
      }

      // this.lean = Mat4.translation(0, front_y, front_z)
      //                 .times(Mat4.rotation(lean_angle, 1, 0, 0))
      //                 .times(Mat4.translation(0, 0 - front_y, 0 - front_z))
      //                 .times(this.lean);
    } else if (this.lean_forward && !(this.left_stilt_touch_ground || this.right_stilt_touch_ground)) {
      this.lean_angle -= max_rotation_angle / 100;
      if (!this.left_lift && !this.right_lift) {
        if (this.left_stilt_bottom[1] < this.right_stilt_bottom[1]) {
          this.lean = Mat4.translation(0, this.left_stilt_bottom[1] + 16, left_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.left_stilt_bottom[1] - 16, -left_foot_z)));
        } else {
          this.lean = Mat4.translation(0, this.right_stilt_bottom[1] + 20, right_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.right_stilt_bottom[1] - 20, -right_foot_z)));
        }
      } else if (this.left_lift && this.right_lift) {
        if (Math.abs(this.left_stilt_bottom[1] - this.right_stilt_bottom[1]) <= 0.05) {
          if (this.left_stilt_bottom[1] < this.right_stilt_bottom[1]) {
            this.lean = Mat4.translation(0, this.left_stilt_bottom[1] + 16, left_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.left_stilt_bottom[1] - 16, -left_foot_z)));
          } else {
            this.lean = Mat4.translation(0, this.right_stilt_bottom[1] + 20, right_foot_z).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.right_stilt_bottom[1] - 20, -right_foot_z)));
          }
        }
      } else if (this.left_lift) {
        // rotate backward
        this.left_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation((-1 * stilt_rotation_angle) / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);

        this.right_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation((-1 * stilt_rotation_angle) / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);

        this.lean = Mat4.translation(0, this.right_stilt_bottom[1] + 20, 0).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.right_stilt_bottom[1] - 20, 0)));
      } else {
        this.left_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation((-1 * stilt_rotation_angle) / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);

        this.right_stilt_model = Mat4.translation(0, 8, 0)
          .times(Mat4.rotation((-1 * stilt_rotation_angle) / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);

        this.lean = Mat4.translation(0, this.left_stilt_bottom[1] + 16, 0).times(Mat4.rotation(this.lean_angle, 1, 0, 0).times(Mat4.translation(0, -this.left_stilt_bottom[1] - 16, 0)));
      }

      // this.lean = Mat4.translation(0, back_y, back_z)
      //                 .times(Mat4.rotation(0 - lean_angle, 1, 0, 0))
      //                 .times(Mat4.translation(0, 0 - back_y, 0 - back_z))
      //                 .times(this.lean);
    }

    center_coord = this.lean.times(center_coord).plus(vec4(0, this.gravity, 0, 0));
    this.z_displacement = center_coord[2];

    /***************************************** start drawing ***************************************/
    // left stilt
    let left_stilt_draw_shape = Mat4.translation(this.x_displacement, this.gravity, 0).times(
      this.lean.times(this.left_stilt_model)
    );
    left_stilt_draw_shape[1][3] = Math.max(-20, left_stilt_draw_shape[1][3]);

    this.shapes.stilt.draw(
      context,
      program_state,
      left_stilt_draw_shape,
      this.materials.plastic.override({ color: blue })
    );
    // ground
    this.shapes.stilt.draw(
      context,
      program_state,
      ground_model,
      this.materials.plastic.override({ color: grey })
    );
    // right stilt
    let right_stilt_draw_shape = Mat4.translation(this.x_displacement, this.gravity, 0)
      .times(this.lean)
      .times(this.right_stilt_model);

    right_stilt_draw_shape[1][3] = Math.max(-20, right_stilt_draw_shape[1][3]);

    this.shapes.stilt.draw(
      context,
      program_state,
      right_stilt_draw_shape,
      this.materials.plastic.override({ color: blue })
    );

    this.draw_character_head(
      context,
      program_state,
      Mat4.translation(this.x_displacement, this.gravity, this.z_displacement)
      // .times(
      //   this.lean
        .times(character_head_transform)
      // )
      ,
      this.materials.plastic.override({ color: salmon })
    );

    // character body

    this.draw_character_body(
      context,
      program_state,
      Mat4.translation(this.x_displacement, this.gravity, this.z_displacement)
      // .times(
      //   this.lean
        .times(character_body_transform)
      ,
      this.materials.plastic.override({ color: salmon })
    );

    this.shapes.sphere_4.draw(
      context,
      program_state,
      Mat4.translation(this.x_displacement, this.gravity, 0)
      .times(
        this.lean
        .times(character_upper_left)
      )
      ,
      this.materials.plastic.override({ color: salmon })
    );
    this.shapes.sphere_4.draw(
      context,
      program_state,
      Mat4.translation(this.x_displacement, this.gravity, 0).times(
        this.lean.times(character_upper_right)
      ),
      this.materials.plastic.override({ color: salmon })
    );
    this.shapes.sphere_4.draw(
      context,
      program_state,
      Mat4.translation(this.x_displacement, this.gravity, 0).times(
        this.lean.times(character_lower_left)
      ),
      this.materials.plastic.override({ color: salmon })
    );
    this.shapes.sphere_4.draw(
      context,
      program_state,
      Mat4.translation(this.x_displacement, this.gravity, 0).times(
        this.lean.times(character_lower_right)
      ),
      this.materials.plastic.override({ color: salmon })
    );

    const camera_model = Mat4.scale(-1, 1, 1).times(
      Mat4.inverse(
        Mat4.translation(this.x_displacement, this.gravity, this.z_displacement).times(
          Mat4.translation(-12.5, 50, 70).times(
            Mat4.rotation(-Math.PI / 7, 1, 0, 0).times(Mat4.identity())
          )
        )
      )
    );
    program_state.set_camera(camera_model);

    if (!this.left_lift && !this.right_lift) {
      this.left_stilt_touch_ground = false;
      this.right_stilt_touch_ground = false;
    }

    if (
      (this.left_lift || this.right_lift) &&
      (this.lean_forward || this.lean_backward)
    ) {
      if (this.left_lift) {
        if (this.left_stilt_bottom[1] <= ground_model[1][3]) {
          this.left_stilt_touch_ground = true;
        } else {
          this.left_stilt_touch_ground = false;
        }
      }

      if (this.right_lift) {
        if (this.right_stilt_bottom[1] <= ground_model[1][3]) {
          this.right_stilt_touch_ground = true;
        } else {
          this.right_stilt_touch_ground = false;
        }
      }

      if (
        this.left_lift &&
        this.left_stilt_bottom[2] < -0.5 &&
        this.lean_backward
      ) {
        this.left_stilt_touch_ground = false;
      } else if (
        this.left_lift &&
        this.left_stilt_bottom[2] > 0.5 &&
        this.lean_forward
      ) {
        this.left_stilt_touch_ground = false;
      }

      if (
        this.right_lift &&
        this.right_stilt_bottom[2] < -0.5 &&
        this.lean_backward
      ) {
        this.right_stilt_touch_ground = false;
      } else if (
        this.right_lift &&
        this.right_stilt_bottom[2] > 0.5 &&
        this.lean_forward
      ) {
        this.right_stilt_touch_ground = false;
      }
    }

    if (Math.min(this.left_stilt_bottom[1], this.right_stilt_bottom[1]) > ground_model[1][3] + 0.1) {
      this.gravity += -0.1;
    }
    // if (Math.min(this.left_stilt_bottom[1], this.right_stilt_bottom[1]) <= ground_model[1][3]) {
    //   this.gravity += 0.1;
    // }
    // if (Math.min(this.left_stilt_bottom[1], this.right_stilt_bottom[1]) <= ground_model[1][3]) {
    //   this.gravity += 0.1;
    // }
  }
}
