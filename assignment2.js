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
  Texture,
} = tiny;

const {
  Cube,
  Axis_Arrows,
  Textured_Phong,
  Phong_Shader,
  Basic_Shader,
  Subdivision_Sphere,
} = defs;

import {
  Color_Phong_Shader,
  Shadow_Textured_Phong_Shader,
  Depth_Texture_Shader_2D,
  Buffered_Texture,
  LIGHT_DEPTH_TEX_SIZE,
} from "./examples/shadow-demo-shaders.js";

class Base_Scene extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      stilt: new defs.Cube(),
      sphere: new Subdivision_Sphere(6),
      triangle: new defs.Triangle(),
    };

    // *** Materials
    this.materials = {
      plastic: new Material(new Shadow_Textured_Phong_Shader(1), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
        color_texture: null,
        light_depth_texture: null,
      }),

      destination: new Material(new Shadow_Textured_Phong_Shader(1), {
        color: hex_color("#9e6f00"),
        ambient: 1.0,
        diffusivity: 0.1,
        specularity: 0.1,
        color_texture: new Texture("assets/wood.jpeg", "LINEAR_MIPMAP_LINEAR"),
        light_depth_texture: null,
      }),

      ground: new Material(new Shadow_Textured_Phong_Shader(1), {
        color: hex_color("#9e6f00"),
        ambient: 1.0,
        diffusivity: 0.1,
        specularity: 0.1,
        color_texture: new Texture(
          "assets/ground.jpeg",
          "LINEAR_MIPMAP_LINEAR"
        ),
        light_depth_texture: null,
      }),

      sun_material: new Material(new defs.Phong_Shader(), {
        ambient: 1.0,
        diffusivity: 0.6,
        color: hex_color("#992828"),
      }),
    };
    // The white material and basic shader are used for drawing the outline.
    this.white = new Material(new defs.Basic_Shader());

    // For the floor or other plain objects
    this.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
      color: color(1, 1, 1, 1),
      ambient: 0.3,
      diffusivity: 0.6,
      specularity: 0.4,
      smoothness: 64,
      color_texture: null,
      light_depth_texture: null,
    });
    // For the first pass
    this.pure = new Material(new Color_Phong_Shader(), {});
    // For light source
    this.light_src = new Material(new Phong_Shader(), {
      color: color(1, 1, 1, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
    });
    // For depth texture display
    this.depth_tex = new Material(new Depth_Texture_Shader_2D(), {
      color: color(0, 0, 0.0, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
      texture: null,
    });

    // To make sure texture initialization only does once
    this.init_ok = false;

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 10, 20),
      vec3(0, 0, 0),
      vec3(0, 1, 0)
    );
  }
}

export class Assignment2 extends Base_Scene {
  constructor() {
    super();

    this.blue = hex_color("#1a9ffa");
    this.grey = hex_color("888888");

    // barricades
    this.barricade_1_forward = true;
    this.barricade_1_angle = 0.0;
    this.barricade_1_rod_model = Mat4.translation(-8, 80, -40).times(
      Mat4.scale(2, 4, 2).times(Mat4.scale(1, 20, 1))
    );
    this.barricade_1_body_model = Mat4.translation(-8, -10, -40).times(
      Mat4.scale(20, 0.5, 20).times(Mat4.scale(1, 20, 1))
    );

    this.barricade_2_forward = false;
    this.barricade_2_angle = 0.0;
    this.barricade_2_rod_model = Mat4.translation(-8, 80, -140).times(
      Mat4.scale(2, 4, 2).times(Mat4.scale(1, 20, 1))
    );
    this.barricade_2_body_model = Mat4.translation(-8, -10, -140).times(
      Mat4.scale(20, 0.5, 20).times(Mat4.scale(1, 20, 1))
    );

    this.barricade_3_forward = true;
    this.barricade_3_angle = 0.0;
    this.barricade_3_rod_model = Mat4.translation(-8, 80, -240).times(
      Mat4.scale(2, 4, 2).times(Mat4.scale(1, 20, 1))
    );
    this.barricade_3_body_model = Mat4.translation(-8, -10, -240).times(
      Mat4.scale(20, 0.5, 20).times(Mat4.scale(1, 20, 1))
    );

    this.barricade_4_forward = false;
    this.barricade_4_angle = 0.0;
    this.barricade_4_rod_model = Mat4.translation(-8, 80, -340).times(
      Mat4.scale(2, 4, 2).times(Mat4.scale(1, 20, 1))
    );
    this.barricade_4_body_model = Mat4.translation(-8, -10, -340).times(
      Mat4.scale(20, 0.5, 20).times(Mat4.scale(1, 20, 1))
    );

    this.barricade_5_forward = true;
    this.barricade_5_angle = 0.0;
    this.barricade_5_rod_model = Mat4.translation(-8, 80, -440).times(
      Mat4.scale(2, 4, 2).times(Mat4.scale(1, 20, 1))
    );
    this.barricade_5_body_model = Mat4.translation(-8, -10, -440).times(
      Mat4.scale(20, 0.5, 20).times(Mat4.scale(1, 20, 1))
    );

    // destination coords
    this.dest_x_left = -35;
    this.dest_x_right = 15;
    this.dest_z = -500;

    // destination models
    this.destination_left_model = Mat4.translation(15, -20, -500).times(
      Mat4.scale(2, 1, 2).times(Mat4.scale(1, 20, 1))
    );
    this.destination_right_model = Mat4.translation(-35, -20, -500).times(
      Mat4.scale(2, 1, 2).times(Mat4.scale(1, 20, 1))
    );

    // ground
    this.ground_model = Mat4.translation(-10, -40, -50).times(
      Mat4.scale(30, 0.01, 600).times(Mat4.scale(1, 20, 1))
    );
    this.ground_y = -40.0;

    // avatar
    this.avatar_center_coord = vec3(0, 0, 0);

    this.avatar_model = Mat4.scale(5, 0.6, 5).times(Mat4.scale(1, 20, 1));

    // transformation model for left and right stilt
    this.left_stilt_model = Mat4.scale(1, 20, 1);
    this.right_stilt_model = Mat4.translation(-20, 0, 0).times(
      Mat4.scale(1, 20, 1)
    );

    // original coordinates
    this.original_left_stilt_coord = vec4(0, 0, 0, 1);
    this.original_right_stilt_coord = vec4(0, 0, 0, 1);
    this.original_left_stilt_bottom_coord = vec4(0, -1, 0, 1);
    this.original_right_stilt_bottom_coord = vec4(0, -1, 0, 1);

    // center coordinate of stilt
    this.left_stilt_coord = vec4(0, 0, 0, 1);
    this.right_stilt_coord = vec4(-1, 0, 0, 1);

    // bottom coordinate of stilt
    this.left_stilt_bottom_coord = vec4(0, -1, 0, 1);
    this.right_stilt_bottom_coord = vec4(-1, -1, 0, 1);

    // stilt flags
    this.left_stilt_grounded = true;
    this.right_stilt_grounded = true;

    // rotation and max rotation angle
    this.left_stilt_angle = 0.0;
    this.right_stilt_angle = 0.0;
    this.max_rotation_angle = 0.25 * Math.PI;

    // max stilt lift height
    this.stilt_max_height = -15;

    // collision flags
    this.reach_destination = false;
    this.touched_ground = false;
    this.hit_barricades = false;

    // key flags
    this.left_stilt_lift = false;
    this.right_stilt_lift = false;
    this.rotate_forward = false;
    this.rotate_backward = false;
    this.lean_forward = false;
    this.lean_backward = false;
    this.barricades_fast = false;
    this.freeze_barricade = false;
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      "Lift Left",
      ["v"],
      () => {
        this.left_stilt_lift = true;
      },
      this.keyboard_color,
      () => {
        this.left_stilt_lift = false;
      }
    );
    this.key_triggered_button(
      "Lift Right",
      ["n"],
      () => {
        this.right_stilt_lift = true;
      },
      this.keyboard_color,
      () => {
        this.right_stilt_lift = false;
      }
    );
    this.key_triggered_button(
      "Rotate Forward",
      ["g"],
      () => {
        this.rotate_forward = true;
        this.rotate_backward = false;
      },
      this.keyboard_color,
      () => {
        this.rotate_forward = false;
      }
    );
    this.key_triggered_button(
      "Rotate Backward",
      ["b"],
      () => {
        this.rotate_backward = true;
        this.rotate_forward = false;
      },
      this.keyboard_color,
      () => {
        this.rotate_backward = false;
      }
    );
    this.key_triggered_button(
      "Lean Backward",
      ["k"],
      () => {
        this.lean_backward = true;
        this.lean_forward = false;
      },
      this.keyboard_color,
      () => {
        this.lean_backward = false;
      }
    );
    this.key_triggered_button(
      "Lean Forward",
      ["i"],
      () => {
        this.lean_forward = true;
        this.lean_backward = false;
      },
      this.keyboard_color,
      () => {
        this.lean_forward = false;
      }
    );
    this.key_triggered_button("Toggle On/Off 2X speed", ["l"], () => {
      this.barricades_fast = !this.barricades_fast;
    });
    this.key_triggered_button("Freeze/Unfreeze Barricades", ["p"], () => {
      this.freeze_barricade = !this.freeze_barricade;
    });
  }

  draw_barricades(context, program_state, draw_shadow) {
    // barricade 1
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_1_rod_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_1_body_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );

    // barricade 2
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_2_rod_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_2_body_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );

    // barricade 3
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_3_rod_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_3_body_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );

    // barricade 4
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_4_rod_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_4_body_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );

    // barricade 5
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_5_rod_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
    this.shapes.stilt.draw(
      context,
      program_state,
      this.barricade_5_body_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
  }

  draw_destination(context, program_state, draw_shadow) {
    this.shapes.stilt.draw(
      context,
      program_state,
      this.destination_left_model,
      draw_shadow ? this.materials.destination : this.pure
    );

    this.shapes.stilt.draw(
      context,
      program_state,
      this.destination_right_model,
      draw_shadow ? this.materials.destination : this.pure
    );
  }

  draw_ground(context, program_state, draw_shadow) {
    this.shapes.stilt.draw(
      context,
      program_state,
      this.ground_model,
      draw_shadow ? this.materials.ground : this.pure
    );
  }

  // final render of left stilt
  draw_left_stilt(context, program_state, draw_shadow) {
    this.shapes.stilt.draw(
      context,
      program_state,
      this.left_stilt_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
  }

  // final render of right stilt
  draw_right_stilt(context, program_state, draw_shadow) {
    this.shapes.stilt.draw(
      context,
      program_state,
      this.right_stilt_model,
      draw_shadow
        ? this.materials.plastic.override({ color: this.blue })
        : this.pure
    );
  }

  // final render of avatar
  draw_avatar(context, program_state, draw_shadow) {
    this.shapes.stilt.draw(
      context,
      program_state,
      this.avatar_model,
      draw_shadow
        ? this.materials.plastic.override({ color: hex_color("#002de3") })
        : this.pure
    );
  }

  // set up gravity - a negative y axis displacement if not on the ground
  set_up_gravity(dt) {
    const left_stilt_bottom_y = this.left_stilt_bottom_coord[1];
    const right_stilt_bottom_y = this.right_stilt_bottom_coord[1];

    if (left_stilt_bottom_y - dt > this.ground_y + 0.0005) {
      this.left_stilt_model = Mat4.translation(0, -dt, 0).times(
        this.left_stilt_model
      );
    }
    if (right_stilt_bottom_y - dt > this.ground_y + 0.0005) {
      this.right_stilt_model = Mat4.translation(0, -dt, 0).times(
        this.right_stilt_model
      );
    }

    this.update_left_stilt_coords();
    this.update_right_stilt_coords();
  }

  // to lift stilts, translate y up until reach maximum stilt height
  lift_left_stilt(dt) {
    const left_stilt_y_coord = this.left_stilt_coord[1];

    if (left_stilt_y_coord < this.stilt_max_height) {
      this.left_stilt_model = Mat4.translation(0, 3 * dt, 0).times(
        this.left_stilt_model
      );
    }

    this.update_left_stilt_coords();
  }

  lift_right_stilt(dt) {
    const right_stilt_y_coord = this.right_stilt_coord[1];

    if (right_stilt_y_coord < this.stilt_max_height) {
      this.right_stilt_model = Mat4.translation(0, 3 * dt, 0).times(
        this.right_stilt_model
      );
    }

    this.update_right_stilt_coords();
  }

  // to rotate the stilt, bring the stilt back to original point by removing
  // its x and z displacement, then, move y down by 8 to rotate by hand
  rotate_left_stilt_by_unit(dt, is_forward) {
    if (!is_forward) {
      dt *= -1;
    }

    console.log(
      "backward: ",
      this.left_stilt_angle,
      dt,
      this.left_stilt_angle + dt,
      this.max_rotation_angle
    );

    if (this.left_stilt_angle + dt >= this.max_rotation_angle && is_forward) {
      return;
    }

    if (this.left_stilt_angle + dt <= -this.max_rotation_angle && !is_forward) {
      return;
    }

    this.left_stilt_angle += dt;
    this.left_stilt_model = Mat4.translation(
      this.left_stilt_coord[0],
      8 + this.left_stilt_coord[1],
      this.left_stilt_coord[2]
    )
      .times(Mat4.rotation(dt, 1, 0, 0))
      .times(
        Mat4.translation(
          -this.left_stilt_coord[0],
          -8 - this.left_stilt_coord[1],
          -this.left_stilt_coord[2]
        )
      )
      .times(this.left_stilt_model);

    this.update_left_stilt_coords();
  }

  // to rotate the stilt, bring the stilt back to original point by removing
  // its x and z displacement, then, move y down by 8 to rotate by hand
  rotate_right_stilt_by_unit(dt, is_forward) {
    if (!is_forward) {
      dt *= -1;
    }

    console.log(
      "backward: ",
      this.right_stilt_angle,
      dt,
      this.right_stilt_angle + dt,
      this.max_rotation_angle
    );

    if (this.right_stilt_angle + dt >= this.max_rotation_angle && is_forward) {
      return;
    }

    if (
      this.right_stilt_angle + dt <= -this.max_rotation_angle &&
      !is_forward
    ) {
      return;
    }

    this.right_stilt_angle += dt;
    this.right_stilt_model = Mat4.translation(
      this.right_stilt_coord[0],
      8 + this.right_stilt_coord[1],
      this.right_stilt_coord[2]
    ).times(
      Mat4.rotation(dt, 1, 0, 0).times(
        Mat4.translation(
          -this.right_stilt_coord[0],
          -8 - this.right_stilt_coord[1],
          -this.right_stilt_coord[2]
        ).times(this.right_stilt_model)
      )
    );

    this.update_right_stilt_coords();
  }

  /**
   * Lean:
   *
   * 1. If two stilts are both on the ground and have similar z axis - lean with origin as the center of bottoms of two stilt
   *
   * 2. If two stilts are both on the ground and one is before the other - unable to lean
   *
   * 3. If one stilt is on the ground - lean with origin as the center of bottom of that stilt
   */
  lean(is_forward, dt) {
    const left_stilt_bottom_z = this.left_stilt_bottom_coord[2];
    const right_stilt_bottom_z = this.right_stilt_bottom_coord[2];
    const z_epsilon = 1;

    let rotation_center_coord = vec4(0, 0, 0, 1);

    if (
      this.left_stilt_grounded &&
      this.right_stilt_grounded &&
      Math.abs(left_stilt_bottom_z - right_stilt_bottom_z) <= z_epsilon
    ) {
      console.log("lean case 1");
      rotation_center_coord[0] =
        (this.left_stilt_bottom_coord[0] + this.right_stilt_bottom_coord[0]) /
        2;
      rotation_center_coord[1] =
        (this.left_stilt_bottom_coord[1] + this.right_stilt_bottom_coord[1]) /
        2;
      rotation_center_coord[2] =
        (left_stilt_bottom_z + right_stilt_bottom_z) / 2;
    } else if (
      this.left_stilt_grounded &&
      this.right_stilt_grounded &&
      !(Math.abs(left_stilt_bottom_z - right_stilt_bottom_z) <= z_epsilon)
    ) {
      console.log("lean case 2");
      return;
    } else if (this.left_stilt_grounded) {
      console.log("lean case 3");
      rotation_center_coord = this.left_stilt_bottom_coord;
    } else {
      console.log("lean case 4");
      rotation_center_coord = this.right_stilt_bottom_coord;
    }

    console.log("lean rotation center: ", rotation_center_coord);

    // final rotation - bring rotation_center_coord back to origin and rotate forward and bring everything back
    const lean_angle = is_forward ? dt : -dt;

    const rotation_matrix = Mat4.translation(
      rotation_center_coord[0],
      rotation_center_coord[1],
      rotation_center_coord[2]
    ).times(
      Mat4.rotation(lean_angle, 1, 0, 0).times(
        Mat4.translation(
          -rotation_center_coord[0],
          -rotation_center_coord[1],
          -rotation_center_coord[2]
        )
      )
    );

    console.log("lean rotation matrix: ", rotation_matrix);

    this.left_stilt_model = rotation_matrix.times(this.left_stilt_model);
    this.right_stilt_model = rotation_matrix.times(this.right_stilt_model);

    this.update_left_stilt_coords();
    this.update_right_stilt_coords();
  }

  // update barricade sway angle - rotate by the top of rod
  update_barricades(dt) {
    // barricade 1
    let barricade_1_dt = dt;
    if (!this.barricade_1_forward) {
      barricade_1_dt *= -1;
    }

    if (
      this.barricade_1_angle + barricade_1_dt >= this.max_rotation_angle &&
      this.barricade_1_forward
    ) {
      this.barricade_1_forward = false;
      return;
    }

    if (
      this.barricade_1_angle + barricade_1_dt <= -this.max_rotation_angle &&
      !this.barricade_1_forward
    ) {
      this.barricade_1_forward = true;
      return;
    }

    const barricade_1_top_coord = this.barricade_1_rod_model.times(
      vec4(0, 1, 0, 1)
    );

    this.barricade_1_angle += barricade_1_dt;

    this.barricade_1_rod_model = Mat4.translation(
      barricade_1_top_coord[0],
      barricade_1_top_coord[1],
      barricade_1_top_coord[2]
    )
      .times(Mat4.rotation(barricade_1_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_1_top_coord[0],
          -barricade_1_top_coord[1],
          -barricade_1_top_coord[2]
        )
      )
      .times(this.barricade_1_rod_model);

    this.barricade_1_body_model = Mat4.translation(
      barricade_1_top_coord[0],
      barricade_1_top_coord[1],
      barricade_1_top_coord[2]
    )
      .times(Mat4.rotation(barricade_1_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_1_top_coord[0],
          -barricade_1_top_coord[1],
          -barricade_1_top_coord[2]
        )
      )
      .times(this.barricade_1_body_model);

    console.log(
      "barricade 1: ",
      barricade_1_top_coord,
      barricade_1_dt,
      this.barricade_1_rod_model
    );

    // barricade 2
    let barricade_2_dt = dt;
    if (!this.barricade_2_forward) {
      barricade_2_dt *= -1;
    }

    if (
      this.barricade_2_angle + barricade_2_dt >= this.max_rotation_angle &&
      this.barricade_2_forward
    ) {
      this.barricade_2_forward = false;
      return;
    }

    if (
      this.barricade_2_angle + barricade_2_dt <= -this.max_rotation_angle &&
      !this.barricade_2_forward
    ) {
      this.barricade_2_forward = true;
      return;
    }

    const barricade_2_top_coord = this.barricade_2_rod_model.times(
      vec4(0, 1, 0, 1)
    );

    this.barricade_2_angle += barricade_2_dt;

    this.barricade_2_rod_model = Mat4.translation(
      barricade_2_top_coord[0],
      barricade_2_top_coord[1],
      barricade_2_top_coord[2]
    )
      .times(Mat4.rotation(barricade_2_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_2_top_coord[0],
          -barricade_2_top_coord[1],
          -barricade_2_top_coord[2]
        )
      )
      .times(this.barricade_2_rod_model);

    this.barricade_2_body_model = Mat4.translation(
      barricade_2_top_coord[0],
      barricade_2_top_coord[1],
      barricade_2_top_coord[2]
    )
      .times(Mat4.rotation(barricade_2_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_2_top_coord[0],
          -barricade_2_top_coord[1],
          -barricade_2_top_coord[2]
        )
      )
      .times(this.barricade_2_body_model);

    console.log(
      "barricade 2: ",
      barricade_2_top_coord,
      barricade_2_dt,
      this.barricade_2_rod_model
    );

    // barricade 3
    let barricade_3_dt = dt;
    if (!this.barricade_3_forward) {
      barricade_3_dt *= -1;
    }

    if (
      this.barricade_3_angle + barricade_3_dt >= this.max_rotation_angle &&
      this.barricade_3_forward
    ) {
      this.barricade_3_forward = false;
      return;
    }

    if (
      this.barricade_3_angle + barricade_3_dt <= -this.max_rotation_angle &&
      !this.barricade_3_forward
    ) {
      this.barricade_3_forward = true;
      return;
    }

    const barricade_3_top_coord = this.barricade_3_rod_model.times(
      vec4(0, 1, 0, 1)
    );

    this.barricade_3_angle += barricade_3_dt;

    this.barricade_3_rod_model = Mat4.translation(
      barricade_3_top_coord[0],
      barricade_3_top_coord[1],
      barricade_3_top_coord[2]
    )
      .times(Mat4.rotation(barricade_3_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_3_top_coord[0],
          -barricade_3_top_coord[1],
          -barricade_3_top_coord[2]
        )
      )
      .times(this.barricade_3_rod_model);

    this.barricade_3_body_model = Mat4.translation(
      barricade_3_top_coord[0],
      barricade_3_top_coord[1],
      barricade_3_top_coord[2]
    )
      .times(Mat4.rotation(barricade_3_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_3_top_coord[0],
          -barricade_3_top_coord[1],
          -barricade_3_top_coord[2]
        )
      )
      .times(this.barricade_3_body_model);

    console.log(
      "barricade 3: ",
      barricade_3_top_coord,
      barricade_3_dt,
      this.barricade_3_rod_model
    );

    // barricade 4
    let barricade_4_dt = dt;
    if (!this.barricade_4_forward) {
      barricade_4_dt *= -1;
    }

    if (
      this.barricade_4_angle + barricade_4_dt >= this.max_rotation_angle &&
      this.barricade_4_forward
    ) {
      this.barricade_4_forward = false;
      return;
    }

    if (
      this.barricade_4_angle + barricade_4_dt <= -this.max_rotation_angle &&
      !this.barricade_4_forward
    ) {
      this.barricade_4_forward = true;
      return;
    }

    const barricade_4_top_coord = this.barricade_4_rod_model.times(
      vec4(0, 1, 0, 1)
    );

    this.barricade_4_angle += barricade_4_dt;

    this.barricade_4_rod_model = Mat4.translation(
      barricade_4_top_coord[0],
      barricade_4_top_coord[1],
      barricade_4_top_coord[2]
    )
      .times(Mat4.rotation(barricade_4_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_4_top_coord[0],
          -barricade_4_top_coord[1],
          -barricade_4_top_coord[2]
        )
      )
      .times(this.barricade_4_rod_model);

    this.barricade_4_body_model = Mat4.translation(
      barricade_4_top_coord[0],
      barricade_4_top_coord[1],
      barricade_4_top_coord[2]
    )
      .times(Mat4.rotation(barricade_4_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_4_top_coord[0],
          -barricade_4_top_coord[1],
          -barricade_4_top_coord[2]
        )
      )
      .times(this.barricade_4_body_model);

    console.log(
      "barricade 4: ",
      barricade_4_top_coord,
      barricade_4_dt,
      this.barricade_4_rod_model
    );

    // barricade 5
    let barricade_5_dt = dt;
    if (!this.barricade_5_forward) {
      barricade_5_dt *= -1;
    }

    if (
      this.barricade_5_angle + barricade_5_dt >= this.max_rotation_angle &&
      this.barricade_5_forward
    ) {
      this.barricade_5_forward = false;
      return;
    }

    if (
      this.barricade_5_angle + barricade_5_dt <= -this.max_rotation_angle &&
      !this.barricade_5_forward
    ) {
      this.barricade_5_forward = true;
      return;
    }

    const barricade_5_top_coord = this.barricade_5_rod_model.times(
      vec4(0, 1, 0, 1)
    );

    this.barricade_5_angle += barricade_5_dt;

    this.barricade_5_rod_model = Mat4.translation(
      barricade_5_top_coord[0],
      barricade_5_top_coord[1],
      barricade_5_top_coord[2]
    )
      .times(Mat4.rotation(barricade_5_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_5_top_coord[0],
          -barricade_5_top_coord[1],
          -barricade_5_top_coord[2]
        )
      )
      .times(this.barricade_5_rod_model);

    this.barricade_5_body_model = Mat4.translation(
      barricade_5_top_coord[0],
      barricade_5_top_coord[1],
      barricade_5_top_coord[2]
    )
      .times(Mat4.rotation(barricade_5_dt, 0, 0, 1))
      .times(
        Mat4.translation(
          -barricade_5_top_coord[0],
          -barricade_5_top_coord[1],
          -barricade_5_top_coord[2]
        )
      )
      .times(this.barricade_5_body_model);

    console.log(
      "barricade 5: ",
      barricade_5_top_coord,
      barricade_5_dt,
      this.barricade_5_rod_model
    );
  }

  // update left stilt related coordinates
  update_left_stilt_coords() {
    this.left_stilt_coord = this.left_stilt_model.times(
      this.original_left_stilt_coord
    );
    this.left_stilt_bottom_coord = this.left_stilt_model.times(
      this.original_left_stilt_bottom_coord
    );
  }

  // update right stilt related coordinates
  update_right_stilt_coords() {
    this.right_stilt_coord = this.right_stilt_model.times(
      this.original_right_stilt_coord
    );
    this.right_stilt_bottom_coord = this.right_stilt_model.times(
      this.original_right_stilt_bottom_coord
    );
  }

  // update stilt flags
  update_stilt_flags(dt) {
    const left_stilt_bottom_y = this.left_stilt_bottom_coord[1];
    const right_stilt_bottom_y = this.right_stilt_bottom_coord[1];

    this.left_stilt_grounded = !(
      left_stilt_bottom_y - dt >
      this.ground_y + 0.0005
    );
    this.right_stilt_grounded = !(
      right_stilt_bottom_y - dt >
      this.ground_y + 0.0005
    );
  }

  // after leaning, we want to recalculate the stilt current rotation angle
  // which should be the angle between stilt and y axis (0, 1, 0)
  // a dot b = |a| |b| cos(theta)
  update_rotation_angles() {
    const left_stilt_vector = this.left_stilt_coord
      .minus(this.left_stilt_bottom_coord)
      .to3()
      .normalized();
    const right_stilt_vector = this.right_stilt_coord
      .minus(this.right_stilt_bottom_coord)
      .to3()
      .normalized();

    const y_vector = vec3(0, 1, 0);
    const y_mag = y_vector.norm();

    // left stilt
    const left_dot_product = left_stilt_vector.dot(y_vector);
    const left_stilt_mag = left_stilt_vector.norm();
    this.left_stilt_angle = Math.acos(
      left_dot_product / (left_stilt_mag * y_mag)
    );

    // if stilt is behind, we need to multiply by -1
    if (left_stilt_vector[2] < 0) {
      this.left_stilt_angle *= -1;
    }

    // right stilt
    const right_dot_product = right_stilt_vector.dot(y_vector);
    const right_stilt_mag = right_stilt_vector.norm();
    this.right_stilt_angle = Math.acos(
      right_dot_product / (right_stilt_mag * y_mag)
    );

    // if stilt is behind, we need to multiply by -1
    if (right_stilt_vector[2] < 0) {
      this.right_stilt_angle *= -1;
    }

    console.log("left rotation angle: ", this.left_stilt_angle);
    console.log("right rotation angle: ", this.right_stilt_angle);
  }

  // update avatar position
  update_avatar() {
    this.avatar_center_coord = vec3(
      (this.left_stilt_coord[0] + this.right_stilt_coord[0]) / 2,
      (this.left_stilt_coord[1] + this.right_stilt_coord[1]) / 2,
      (this.left_stilt_coord[2] + this.right_stilt_coord[2]) / 2
    );

    this.avatar_model = Mat4.translation(
      this.avatar_center_coord[0],
      this.avatar_center_coord[1],
      this.avatar_center_coord[2]
    ).times(Mat4.scale(5, 0.6, 5).times(Mat4.scale(1, 20, 1)));

    console.log("avatar coord: ", this.avatar_center_coord, this.avatar_model);
  }

  // check if avatar has reached the destination
  check_reach_destination() {
    // if too far, no need to check
    if (Math.abs(this.avatar_center_coord[2] - this.dest_z) > 5) {
      return;
    }

    // check if avatar is in the destination area
    const x_flag =
      this.avatar_center_coord[0] <= this.dest_x_right &&
      this.avatar_center_coord[0] >= this.dest_x_left;
    const z_flag = Math.abs(this.avatar_center_coord[2] - this.dest_z) <= 1;

    if (x_flag && z_flag) {
      this.reach_destination = true;
    }
  }

  // check if avatar touched the ground - we can just check if
  // any of the vertices of the avatar has a -40 y value
  // check sequence: top to bottom, counterclockwise
  check_touch_ground() {
    const top_right_front_vertex = this.avatar_model.times(vec4(1, 1, -1, 1));
    const top_right_behind_vertex = this.avatar_model.times(vec4(1, 1, 1, 1));
    const top_left_behind_vertex = this.avatar_model.times(vec4(-1, 1, 1, 1));
    const top_left_front_vertex = this.avatar_model.times(vec4(-1, 1, -1, 1));
    const btn_right_front_vertex = this.avatar_model.times(vec4(1, -1, -1, 1));
    const btn_right_behind_vertex = this.avatar_model.times(vec4(1, -1, 1, 1));
    const btn_left_behind_vertex = this.avatar_model.times(vec4(-1, -1, 1, 1));
    const btn_left_front_vertex = this.avatar_model.times(vec4(-1, -1, -1, 1));

    console.log("vertices: ", btn_left_behind_vertex);

    this.touched_ground =
      Math.abs(top_right_front_vertex[1] + 40) <= 0.5 ||
      Math.abs(top_right_behind_vertex[1] + 40) <= 0.5 ||
      Math.abs(top_left_behind_vertex[1] + 40) <= 0.5 ||
      Math.abs(top_left_front_vertex[1] + 40) <= 0.5 ||
      Math.abs(btn_right_front_vertex[1] + 40) <= 0.5 ||
      Math.abs(btn_right_behind_vertex[1] + 40) <= 0.5 ||
      Math.abs(btn_left_behind_vertex[1] + 40) <= 0.5 ||
      Math.abs(btn_left_front_vertex[1] + 40) <= 0.5;
  }

  // barricade hits with the avatar in three cases:
  // 1. near edge is inside avatar
  // 2. far edge is inside avatar
  // 3. avatar is in between near and far edges
  check_barricade_avatar_side_overlap(
    barricade_near_coord,
    barricade_far_coord
  ) {
    if (this.hit_barricades) {
      return;
    }

    // x = 2 * 5 = 10 units, y = 40 * 0.6 = 24 units, z = 2 * 5 = 10 units
    const avatar_x_min = this.avatar_center_coord[0] - 5;
    const avatar_x_max = this.avatar_center_coord[0] + 5;
    const avatar_y_min = this.avatar_center_coord[1] - 12;
    const avatar_y_max = this.avatar_center_coord[1] + 12;
    const avatar_z_min = this.avatar_center_coord[2] - 5;
    const avatar_z_max = this.avatar_center_coord[2] + 5;

    // case 1
    if (
      barricade_near_coord[0] >= avatar_x_min &&
      barricade_near_coord[0] <= avatar_x_max &&
      barricade_near_coord[1] <= avatar_y_max &&
      barricade_near_coord[1] >= avatar_y_min &&
      barricade_near_coord[2] >= avatar_z_min &&
      barricade_near_coord[2] <= avatar_z_max
    ) {
      this.hit_barricades = true;
    }

    // case 2
    if (
      barricade_far_coord[0] >= avatar_x_min &&
      barricade_far_coord[0] <= avatar_x_max &&
      barricade_far_coord[1] <= avatar_y_max &&
      barricade_far_coord[1] >= avatar_y_min &&
      barricade_far_coord[2] >= avatar_z_min &&
      barricade_far_coord[2] <= avatar_z_max
    ) {
      this.hit_barricades = true;
    }

    // case 3
    if (
      barricade_far_coord[0] >= avatar_x_min &&
      barricade_far_coord[0] <= avatar_x_max &&
      barricade_far_coord[1] <= avatar_y_max &&
      barricade_far_coord[1] >= avatar_y_min &&
      barricade_near_coord[2] <= avatar_z_min &&
      barricade_far_coord[2] >= avatar_z_max
    ) {
      this.hit_barricades = true;
    }
  }

  // check hit barricades - just need to check if any surface
  // hits the barricades
  check_hit_barricades() {
    if (this.hit_barricades) {
      return;
    }

    // barricade 1
    const barricade_1_left_near_coord = this.barricade_1_body_model.times(
      vec4(1, 0, -1, 1)
    );
    const barricade_1_left_far_coord = this.barricade_1_body_model.times(
      vec4(1, 0, 1, 1)
    );
    const barricade_1_right_near_coord = this.barricade_1_body_model.times(
      vec4(-1, 0, -1, 1)
    );
    const barricade_1_right_far_coord = this.barricade_1_body_model.times(
      vec4(-1, 0, 1, 1)
    );

    if (this.barricade_1_forward) {
      this.check_barricade_avatar_side_overlap(
        barricade_1_left_near_coord,
        barricade_1_left_far_coord
      );
    } else {
      this.check_barricade_avatar_side_overlap(
        barricade_1_right_near_coord,
        barricade_1_right_far_coord
      );
    }
    this.check_barricade_avatar_side_overlap(
      barricade_1_left_far_coord,
      barricade_1_right_far_coord
    );
    this.check_barricade_avatar_side_overlap(
      barricade_1_left_near_coord,
      barricade_1_right_near_coord
    );

    // barricade 2
    const barricade_2_left_near_coord = this.barricade_2_body_model.times(
      vec4(1, 0, -1, 1)
    );
    const barricade_2_left_far_coord = this.barricade_2_body_model.times(
      vec4(1, 0, 1, 1)
    );
    const barricade_2_right_near_coord = this.barricade_2_body_model.times(
      vec4(-1, 0, -1, 1)
    );
    const barricade_2_right_far_coord = this.barricade_2_body_model.times(
      vec4(-1, 0, 1, 1)
    );

    if (this.barricade_2_forward) {
      this.check_barricade_avatar_side_overlap(
        barricade_2_left_near_coord,
        barricade_2_left_far_coord
      );
    } else {
      this.check_barricade_avatar_side_overlap(
        barricade_2_right_near_coord,
        barricade_2_right_far_coord
      );
    }
    this.check_barricade_avatar_side_overlap(
      barricade_2_left_far_coord,
      barricade_2_right_far_coord
    );
    this.check_barricade_avatar_side_overlap(
      barricade_2_left_near_coord,
      barricade_2_right_near_coord
    );

    // barricade 3
    const barricade_3_left_near_coord = this.barricade_3_body_model.times(
      vec4(1, 0, -1, 1)
    );
    const barricade_3_left_far_coord = this.barricade_3_body_model.times(
      vec4(1, 0, 1, 1)
    );
    const barricade_3_right_near_coord = this.barricade_3_body_model.times(
      vec4(-1, 0, -1, 1)
    );
    const barricade_3_right_far_coord = this.barricade_3_body_model.times(
      vec4(-1, 0, 1, 1)
    );

    if (this.barricade_3_forward) {
      this.check_barricade_avatar_side_overlap(
        barricade_3_left_near_coord,
        barricade_3_left_far_coord
      );
    } else {
      this.check_barricade_avatar_side_overlap(
        barricade_3_right_near_coord,
        barricade_3_right_far_coord
      );
    }
    this.check_barricade_avatar_side_overlap(
      barricade_3_left_far_coord,
      barricade_3_right_far_coord
    );
    this.check_barricade_avatar_side_overlap(
      barricade_3_left_near_coord,
      barricade_3_right_near_coord
    );

    // barricade 4
    const barricade_4_left_near_coord = this.barricade_4_body_model.times(
      vec4(1, 0, -1, 1)
    );
    const barricade_4_left_far_coord = this.barricade_4_body_model.times(
      vec4(1, 0, 1, 1)
    );
    const barricade_4_right_near_coord = this.barricade_4_body_model.times(
      vec4(-1, 0, -1, 1)
    );
    const barricade_4_right_far_coord = this.barricade_4_body_model.times(
      vec4(-1, 0, 1, 1)
    );

    if (this.barricade_4_forward) {
      this.check_barricade_avatar_side_overlap(
        barricade_4_left_near_coord,
        barricade_4_left_far_coord
      );
    } else {
      this.check_barricade_avatar_side_overlap(
        barricade_4_right_near_coord,
        barricade_4_right_far_coord
      );
    }
    this.check_barricade_avatar_side_overlap(
      barricade_4_left_far_coord,
      barricade_4_right_far_coord
    );
    this.check_barricade_avatar_side_overlap(
      barricade_4_left_near_coord,
      barricade_4_right_near_coord
    );

    // barricade 5
    const barricade_5_left_near_coord = this.barricade_5_body_model.times(
      vec4(1, 0, -1, 1)
    );
    const barricade_5_left_far_coord = this.barricade_5_body_model.times(
      vec4(1, 0, 1, 1)
    );
    const barricade_5_right_near_coord = this.barricade_5_body_model.times(
      vec4(-1, 0, -1, 1)
    );
    const barricade_5_right_far_coord = this.barricade_5_body_model.times(
      vec4(-1, 0, 1, 1)
    );

    if (this.barricade_5_forward) {
      this.check_barricade_avatar_side_overlap(
        barricade_5_left_near_coord,
        barricade_5_left_far_coord
      );
    } else {
      this.check_barricade_avatar_side_overlap(
        barricade_5_right_near_coord,
        barricade_5_right_far_coord
      );
    }
    this.check_barricade_avatar_side_overlap(
      barricade_5_left_far_coord,
      barricade_5_right_far_coord
    );
    this.check_barricade_avatar_side_overlap(
      barricade_5_left_near_coord,
      barricade_5_right_near_coord
    );

    console.log("hit: ", this.hit_barricades);
  }

  // check if the avatar has reached the destination
  // or have touched the groundas
  check_avatar_collision() {
    this.check_reach_destination();
    this.check_touch_ground();
    this.check_hit_barricades();
  }

  // shadow
  texture_buffer_init(gl) {
    // Depth Texture
    this.lightDepthTexture = gl.createTexture();
    // Bind it to TinyGraphics
    this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
    this.materials.plastic.light_depth_texture = this.light_depth_texture;
    this.materials.ground.light_depth_texture = this.light_depth_texture;
    this.materials.destination.light_depth_texture = this.light_depth_texture;

    this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
    gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D, // target
      0, // mip level
      gl.DEPTH_COMPONENT, // internal format
      this.lightDepthTextureSize, // width
      this.lightDepthTextureSize, // height
      0, // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT, // type
      null
    ); // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Depth Texture Buffer
    this.lightDepthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.DEPTH_ATTACHMENT, // attachment point
      gl.TEXTURE_2D, // texture target
      this.lightDepthTexture, // texture
      0
    ); // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // create a color texture of the same size as the depth texture
    // see article why this is needed_
    this.unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.lightDepthTextureSize,
      this.lightDepthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.COLOR_ATTACHMENT0, // attachment point
      gl.TEXTURE_2D, // texture target
      this.unusedTexture, // texture
      0
    ); // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render_scene(
    context,
    program_state,
    shadow_pass,
    draw_light_source = false,
    draw_shadow = false
  ) {
    // shadow_pass: true if this is the second pass that draw the shadow.
    // draw_light_source: true if we want to draw the light source.
    // draw_shadow: true if we want to draw the shadow

    let light_position = this.light_position;
    let light_color = this.light_color;
    const t = program_state.animation_time;

    program_state.draw_shadow = draw_shadow;

    if (draw_light_source && shadow_pass) {
      this.shapes.sphere.draw(
        context,
        program_state,
        Mat4.translation(
          light_position[0],
          light_position[1],
          light_position[2]
        ).times(Mat4.scale(5, 5, 5)),
        this.light_src.override({ color: light_color })
      );
    }

    this.draw_destination(context, program_state, draw_shadow);
    this.draw_ground(context, program_state, draw_shadow);
    this.draw_barricades(context, program_state, draw_shadow);
    this.draw_left_stilt(context, program_state, draw_shadow);
    this.draw_right_stilt(context, program_state, draw_shadow);
    this.draw_avatar(context, program_state, draw_shadow);
  }

  display(context, program_state) {
    if (this.reach_destination) {
      alert("You have reached the destination! Congratulation");
      window.location.reload();
    }

    if (this.touched_ground) {
      alert("You have touched the ground!");
      window.location.reload();
    }

    if (this.hit_barricades) {
      alert("You have hit a barricade!");
      window.location.reload();
    }

    const t = program_state.animation_time / 1000;
    const dt = program_state.animation_delta_time / 1000;
    const gl = context.context;

    if (!this.init_ok) {
      const ext = gl.getExtension("WEBGL_depth_texture");
      if (!ext) {
        return alert("need WEBGL_depth_texture"); // eslint-disable-line
      }
      this.texture_buffer_init(gl);

      this.init_ok = true;
    }

    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(
        Mat4.look_at(vec3(0, 12, 12), vec3(0, 2, 0), vec3(0, 1, 0))
      ); // Locate the camera here
    }

    // The position of the light
    this.light_position = vec4(2, 40, 0, 1);

    // The color of the light
    this.light_color = color(
      0.667 + Math.sin(t / 500) / 3,
      0.667 + Math.sin(t / 1500) / 3,
      0.667 + Math.sin(t / 3500) / 3,
      1
    );

    // This is a rough target of the light.
    // Although the light is point light, we need a target to set the POV of the light
    this.light_view_target = vec4(0, 0, 0, 1);
    this.light_field_of_view = 180; // 130 degree

    program_state.lights = [
      new Light(this.light_position, this.light_color, 1000000),
    ];

    // Step 1: set the perspective and camera to the POV of light
    const light_view_mat = Mat4.look_at(
      vec3(
        this.light_position[0],
        this.light_position[1],
        this.light_position[2]
      ),
      vec3(
        this.light_view_target[0],
        this.light_view_target[1],
        this.light_view_target[2]
      ),
      vec3(0, 1, 0) // assume the light to target will have a up dir of +y, maybe need to change according to your case
    );
    const light_proj_mat = Mat4.perspective(
      this.light_field_of_view,
      1,
      1,
      800
    );
    // Bind the Depth Texture Buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Prepare uniforms
    program_state.light_view_mat = light_view_mat;
    program_state.light_proj_mat = light_proj_mat;
    program_state.light_tex_mat = light_proj_mat;
    program_state.view_mat = light_view_mat;
    program_state.projection_transform = light_proj_mat;
    this.render_scene(context, program_state, false, false, false);

    // Step 2: unbind, draw to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    program_state.view_mat = program_state.camera_inverse;
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.5,
      800
    );
    this.render_scene(context, program_state, true, true, true);

    this.set_up_gravity(dt);
    this.update_rotation_angles();
    this.update_stilt_flags(dt);
    this.update_avatar();

    if (!this.freeze_barricade) {
      if (this.barricades_fast) {
        this.update_barricades(dt / 2);
      } else {
        this.update_barricades(dt / 5);
      }
    }

    this.check_avatar_collision();

    if (this.reach_destination) {
      return;
    }

    if (this.left_stilt_lift) {
      this.lift_left_stilt(dt);

      if (this.rotate_forward) {
        this.rotate_left_stilt_by_unit(dt, true);
      } else if (this.rotate_backward) {
        this.rotate_left_stilt_by_unit(dt, false);
      }
    }

    if (this.right_stilt_lift) {
      this.lift_right_stilt(dt);

      if (this.rotate_forward) {
        this.rotate_right_stilt_by_unit(dt, true);
      } else if (this.rotate_backward) {
        this.rotate_right_stilt_by_unit(dt, false);
      }
    }

    if (this.lean_forward) {
      this.lean(true, dt);
    }

    if (this.lean_backward) {
      this.lean(false, dt);
    }

    console.log("left stilt coord: ", this.left_stilt_coord);
    console.log("right stilt coord: ", this.right_stilt_coord);
    console.log("left stilt bottom coord: ", this.left_stilt_bottom_coord);
    console.log("right stilt bottom coord: ", this.right_stilt_bottom_coord);
  }
}
