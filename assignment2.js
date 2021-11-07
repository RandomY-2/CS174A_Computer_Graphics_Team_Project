import { defs, tiny } from "./examples/common.js";

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
          [-1, -20, -1], [1, -20, -1], [-1, -20, 1], [1, -20, 1], [1, 20, -1], [-1, 20, -1], [1, 20, 1], [-1, 20, 1],
          [-1, -20, -1], [-1, -20, 1], [-1, 20, -1], [-1, 20, 1], [1, -20, 1], [1, -20, -1], [1, 20, 1], [1, 20, -1],
          [-1, -20, 1], [1, -20, 1], [-1, 20, 1], [1, 20, 1], [1, -20, -1], [-1, -20, -1], [1, 20, -1], [-1, 20, -1]);
      this.arrays.normal = Vector3.cast(
          [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
          [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
          [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
      // Arrange the vertices into a square shape in texture space too:
      this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 20, 9, 11, 20, 12, 13,
          14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
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
    this.outline = false;
    this.hover = this.swarm = false;
    this.left_lift = this.right_lift = false;
    this.left_rotate_forward = this.right_rotate_forward = false;
    this.left_rotate_backward = this.right_rotate_backward = false;
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

    const sun_model_transform = Mat4.translation(-10, 30, 30).times(Mat4.scale(
      scale_factor,
      scale_factor,
      scale_factor
    ).times(Mat4.identity()));

    const light_position = vec4(-10, 50, 50, 1);
    program_state.lights = [
      new Light(light_position, sun_color, 1000 ** 30),
    ];

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
    this.left_rotate_time = new Date().getTime() / 1000;

    this.left_stilt_model = Mat4.identity();
    this.right_stilt_model = Mat4.translation(-20, 0, 0).times(Mat4.identity());

    this.stilt_max_height = 5;
    this.keyboard_color = "#6E6460";
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
    this.key_triggered_button("Lift Left", ["v"], () => {
      this.left_lift = true;
      this.left_stilt_time = new Date().getTime() / 1000;
    }, this.keyboard_color, () => {
      this.left_lift = false;
      this.left_stilt_time = new Date().getTime() / 1000;
    });
    this.key_triggered_button("Lift Right", ["n"], () => {
      this.right_lift = true;
      this.right_stilt_time = new Date().getTime() / 1000;
    }, this.keyboard_color, () => {
      this.right_lift = false;
      this.right_stilt_time = new Date().getTime() / 1000;
    });
    this.key_triggered_button("Rotate Forward", ["g"], () => {
      this.left_rotate_forward = true;
      this.right_rotate_forward = true;
      this.left_rotate_time = new Date().getTime() / 1000;
    }, this.keyboard_color, () => {
      this.left_rotate_forward = false;
      this.right_rotate_forward = false;
    });
    this.key_triggered_button("Rotate Backward", ["b"], () => {
      this.left_rotate_backward = true;
      this.right_rotate_backward = true;
      this.left_rotate_time = new Date().getTime() / 1000;
    }, this.keyboard_color, () => {
      this.left_rotate_backward = false;
      this.right_rotate_backward = false;
    });
  }

  draw_box(
    context,
    program_state,
    model_transform,
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

  draw_character_head(
    context,
    program_state,
    model_transform,
    color
  ){
    this.shapes.sphere_4.draw(
      context,
      program_state,
      model_transform,
      color
    );
    return model_transform;
  }

  draw_character_body(
    context,
    program_state,
    model_transform,
    color,
  ){
    this.shapes.stilt.draw(
      context,
      program_state,
      model_transform,
      color,      
    )
    return model_transform;
  }

  display(context, program_state) {
    super.display(context, program_state);
    const blue = hex_color("#1a9ffa");
    let t = new Date().getTime() / 1000;

    let max_rotation_angle = (0.25 * Math.PI);
    let stilt_rotation_angle = max_rotation_angle / 5;

    if (this.left_lift) {
      if (this.left_stilt_model[1][3] + (new Date().getTime() / 1000 - this.left_stilt_time) < this.stilt_max_height) {
        this.left_stilt_model = Mat4.translation(0, 1 * (new Date().getTime() / 1000 - this.left_stilt_time), 0).times(this.left_stilt_model);
      }
    } else {
      if (this.left_stilt_model[1][3] - (new Date().getTime() / 1000 - this.left_stilt_time) >= 0) {
        this.left_stilt_model = Mat4.translation(0, -1 * (new Date().getTime() / 1000 - this.left_stilt_time), 0).times(this.left_stilt_model);
      } else {
        this.left_stilt_model = Mat4.identity();
      }
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
          .times(Mat4.rotation(-1 * stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.left_stilt_model);
      }
    }

    this.shapes.stilt.draw(
      context,
      program_state,
      this.left_stilt_model,
      this.materials.plastic.override({ color: blue })
    );

    if (this.right_lift) {
      if (this.right_stilt_model[1][3] + (new Date().getTime() / 1000 - this.right_stilt_time) < this.stilt_max_height) {
        this.right_stilt_model = Mat4.translation(0, 1 * (new Date().getTime() / 1000 - this.right_stilt_time), 0).times(this.right_stilt_model);
      }
    } else {
      if (this.right_stilt_model[1][3] - (new Date().getTime() / 1000 - this.right_stilt_time) >= 0) {
        this.right_stilt_model = Mat4.translation(0, -1 * (new Date().getTime() / 1000 - this.right_stilt_time), 0).times(this.right_stilt_model);
      } else {
        this.right_stilt_model = Mat4.translation(-20, 0, 0).times(Mat4.identity());
      }
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
          .times(Mat4.rotation(-1 * stilt_rotation_angle / 20, 1, 0, 0))
          .times(Mat4.translation(0, -8, 0))
          .times(this.right_stilt_model);
      }
    }

    this.shapes.stilt.draw(
      context,
      program_state,
      this.right_stilt_model,
      this.materials.plastic.override({ color: blue })
    );


    // character head
    const scale_factor = 4;
    const character_head_transform = Mat4.translation(-10, 20, 0).times(Mat4.scale(
      scale_factor,
      scale_factor,
      scale_factor
    ).times(Mat4.identity()));
    this.draw_character_head(
      context,
      program_state,
      character_head_transform,
      this.materials.plastic.override({ color: color(Math.random(), Math.random(), Math.random(), 1.0) })
      )
    
    // character body
    const character_body_transform = Mat4.translation(-10,5,0).times(Mat4.scale(5,0.3,5)).times(Mat4.identity());
    this.draw_character_body(
      context, 
      program_state,
      character_body_transform,
      this.materials.plastic.override({ color: color(Math.random(), Math.random(), Math.random(), 1.0) })
      )
  }
}
