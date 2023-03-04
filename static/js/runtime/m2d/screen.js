this.Screen = (function() {
  function Screen(runtime) {
    this.runtime = runtime;
    this.renderer = new PIXI.Renderer({
      width: 200,
      height: 200,
      antialias: true,
      resolution: 1,
      transparent: false
    });
    M2D.runtime = this.runtime;
    M2D.PIXI = PIXI;
    this.canvas = this.renderer.view;
    this.touches = {};
    this.mouse = {
      x: -10000,
      y: -10000,
      pressed: 0,
      left: 0,
      middle: 0,
      right: 0
    };
  }

  Screen.prototype.getInterface = function() {
    var screen;
    if (this["interface"] != null) {
      return this["interface"];
    }
    screen = this;
    return this["interface"] = {
      width: this.width,
      height: this.height,
      render: (function(_this) {
        return function(scene, camera) {
          return screen.render(scene, camera);
        };
      })(this)
    };
  };

  Screen.prototype.updateInterface = function() {
    this["interface"].width = this.width;
    return this["interface"].height = this.height;
  };

  Screen.prototype.initDraw = function() {};

  Screen.prototype.clear = function() {};

  Screen.prototype.resize = function() {
    var ch, cw, h, min, r, ratio, w;
    cw = window.innerWidth;
    ch = window.innerHeight;
    ratio = {
      "4x3": 4 / 3,
      "16x9": 16 / 9,
      "2x1": 2 / 1,
      "1x1": 1 / 1,
      ">4x3": 4 / 3,
      ">16x9": 16 / 9,
      ">2x1": 2 / 1,
      ">1x1": 1 / 1
    }[this.runtime.aspect];
    min = this.runtime.aspect.startsWith(">");
    if (ratio != null) {
      if (min) {
        switch (this.runtime.orientation) {
          case "portrait":
            ratio = Math.max(ratio, ch / cw);
            break;
          case "landscape":
            ratio = Math.max(ratio, cw / ch);
            break;
          default:
            if (ch > cw) {
              ratio = Math.max(ratio, ch / cw);
            } else {
              ratio = Math.max(ratio, cw / ch);
            }
        }
      }
      switch (this.runtime.orientation) {
        case "portrait":
          r = Math.min(cw, ch / ratio) / cw;
          w = cw * r;
          h = cw * r * ratio;
          break;
        case "landscape":
          r = Math.min(cw / ratio, ch) / ch;
          w = ch * r * ratio;
          h = ch * r;
          break;
        default:
          if (cw > ch) {
            r = Math.min(cw / ratio, ch) / ch;
            w = ch * r * ratio;
            h = ch * r;
          } else {
            r = Math.min(cw, ch / ratio) / cw;
            w = cw * r;
            h = cw * r * ratio;
          }
      }
    } else {
      w = cw;
      h = ch;
    }
    this.canvas.style["margin-top"] = Math.round((ch - h) / 2) + "px";
    this.canvas.style.width = Math.round(w) + "px";
    this.canvas.style.height = Math.round(h) + "px";
    this.camera_aspect = w / h;
    this.update_camera = true;
    this.renderer.resize(w, h);
    this.width = w;
    return this.height = h;
  };

  Screen.prototype.render = function(scene, camera) {
    var r;
    if (camera == null) {
      camera = {
        x: 0,
        y: 0,
        fov: 200
      };
    }
    scene.position.x = this.width / 2 - camera.x;
    scene.position.y = this.height / 2 - camera.y;
    if (this.width > this.height) {
      r = this.height / camera.fov;
    } else {
      r = this.width / camera.fov;
    }
    scene.scale.x = r;
    scene.scale.y = -r;
    this.renderer.render(scene);
    if (this.take_picture_callback != null) {
      this.take_picture_callback(this.canvas.toDataURL());
      return this.take_picture_callback = null;
    }
  };

  Screen.prototype.startControl = function(element) {
    this.element = element;
    document.addEventListener("touchstart", (function(_this) {
      return function(event) {
        return _this.touchStart(event);
      };
    })(this));
    document.addEventListener("touchmove", (function(_this) {
      return function(event) {
        return _this.touchMove(event);
      };
    })(this));
    document.addEventListener("touchend", (function(_this) {
      return function(event) {
        return _this.touchRelease(event);
      };
    })(this));
    document.addEventListener("touchcancel", (function(_this) {
      return function(event) {
        return _this.touchRelease(event);
      };
    })(this));
    document.addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.mouseDown(event);
      };
    })(this));
    document.addEventListener("mousemove", (function(_this) {
      return function(event) {
        return _this.mouseMove(event);
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function(event) {
        return _this.mouseUp(event);
      };
    })(this));
    document.addEventListener("mousewheel", (function(_this) {
      return function(event) {
        return _this.mouseWheel(event);
      };
    })(this));
    document.addEventListener("DOMMouseScroll", (function(_this) {
      return function(event) {
        return _this.mouseWheel(event);
      };
    })(this));
    return this.ratio = devicePixelRatio;
  };

  Screen.prototype.touchStart = function(event) {
    var b, i, j, min, ref, t, x, y;
    event.preventDefault();
    event.stopPropagation();
    b = this.canvas.getBoundingClientRect();
    for (i = j = 0, ref = event.changedTouches.length - 1; j <= ref; i = j += 1) {
      t = event.changedTouches[i];
      min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
      x = (t.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
      y = (this.canvas.clientHeight / 2 - (t.clientY - b.top)) / min * 200;
      this.touches[t.identifier] = {
        x: x,
        y: y
      };
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.pressed = 1;
      this.mouse.left = 1;
    }
    return false;
  };

  Screen.prototype.touchMove = function(event) {
    var b, i, j, min, ref, t, x, y;
    event.preventDefault();
    event.stopPropagation();
    b = this.canvas.getBoundingClientRect();
    for (i = j = 0, ref = event.changedTouches.length - 1; j <= ref; i = j += 1) {
      t = event.changedTouches[i];
      if (this.touches[t.identifier] != null) {
        min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
        x = (t.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
        y = (this.canvas.clientHeight / 2 - (t.clientY - b.top)) / min * 200;
        this.touches[t.identifier].x = x;
        this.touches[t.identifier].y = y;
        this.mouse.x = x;
        this.mouse.y = y;
      }
    }
    return false;
  };

  Screen.prototype.touchRelease = function(event) {
    var i, j, ref, t, x, y;
    for (i = j = 0, ref = event.changedTouches.length - 1; j <= ref; i = j += 1) {
      t = event.changedTouches[i];
      x = (t.clientX - this.canvas.offsetLeft) * this.ratio;
      y = (t.clientY - this.canvas.offsetTop) * this.ratio;
      delete this.touches[t.identifier];
      this.mouse.pressed = 0;
      this.mouse.left = 0;
      this.mouse.right = 0;
      this.mouse.middle = 0;
    }
    return false;
  };

  Screen.prototype.mouseDown = function(event) {
    var b, min, x, y;
    this.mousepressed = true;
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = (event.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
    y = (this.canvas.clientHeight / 2 - (event.clientY - b.top)) / min * 200;
    this.touches["mouse"] = {
      x: x,
      y: y
    };
    this.mouse.x = x;
    this.mouse.y = y;
    switch (event.button) {
      case 0:
        this.mouse.left = 1;
        break;
      case 1:
        this.mouse.middle = 1;
        break;
      case 2:
        this.mouse.right = 1;
    }
    this.mouse.pressed = Math.min(1, this.mouse.left + this.mouse.right + this.mouse.middle);
    return false;
  };

  Screen.prototype.mouseMove = function(event) {
    var b, min, x, y;
    event.preventDefault();
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = (event.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
    y = (this.canvas.clientHeight / 2 - (event.clientY - b.top)) / min * 200;
    if (this.touches["mouse"] != null) {
      this.touches["mouse"].x = x;
      this.touches["mouse"].y = y;
    }
    this.mouse.x = x;
    this.mouse.y = y;
    return false;
  };

  Screen.prototype.mouseUp = function(event) {
    var b, min, x, y;
    delete this.touches["mouse"];
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = (event.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
    y = (this.canvas.clientHeight / 2 - (event.clientY - b.top)) / min * 200;
    this.mouse.x = x;
    this.mouse.y = y;
    switch (event.button) {
      case 0:
        this.mouse.left = 0;
        break;
      case 1:
        this.mouse.middle = 0;
        break;
      case 2:
        this.mouse.right = 0;
    }
    this.mouse.pressed = Math.min(1, this.mouse.left + this.mouse.right + this.mouse.middle);
    return false;
  };

  Screen.prototype.mouseWheel = function(e) {
    e.preventDefault();
    if (e.wheelDelta < 0 || e.detail > 0) {
      return this.wheel = -1;
    } else {
      return this.wheel = 1;
    }
  };

  Screen.prototype.takePicture = function(take_picture_callback) {
    this.take_picture_callback = take_picture_callback;
  };

  return Screen;

})();
