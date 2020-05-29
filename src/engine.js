export default class Engine {
  constructor (time_step, update, render, allowedSkippedFrames){
    this.accumulated_time        = 0;
    this.animation_frame_request = undefined,
    this.time                    = undefined,
    this.time_step               = time_step,

    this.updated = false;

    this.update = update;
    this.render = render;

    this.allowedSkippedFrames = allowedSkippedFrames;

    this.run = this.run.bind(this);
    this.end = false;
  }

  run(time_stamp){

      const {accumulated_time, time, time_step, updated, update, render, allowedSkippedFrames, end} = this;

      this.accumulated_time += time_stamp - time;
      this.time = time_stamp;

      if(accumulated_time > time_stamp * allowedSkippedFrames){
        this.accumulated_time = time_stamp;
      }

      while(this.accumulated_time >= time_step) {

        this.accumulated_time -= time_step;

        update(time_stamp);

        this.updated = true;

      }


      if (updated) {

        this.updated = false;
        render(time_stamp);

      }
      if(end){
        return;
      }
      this.animation_frame_request = requestAnimationFrame(this.run);

  }

  start() {

    this.accumulated_time = this.time_step;
    this.time = performance.now();
    this.animation_frame_request = requestAnimationFrame(this.run);

  }

  stop() {
    this.end = true;
    cancelAnimationFrame(this.animation_frame_request);
  }

}
