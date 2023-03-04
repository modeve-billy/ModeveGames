this.Player = (function() {
  function Player(listener) {
    var i, len, ref, source;
    this.listener = listener;
    this.source_count = 0;
    this.sources = {};
    this.resources = resources;
    this.request_id = 1;
    this.pending_requests = {};
    if (resources.sources != null) {
      ref = resources.sources;
      for (i = 0, len = ref.length; i < len; i++) {
        source = ref[i];
        this.loadSource(source);
      }
    } else {
      this.sources.main = document.getElementById("code").innerText;
      this.start();
    }
  }

  Player.prototype.loadSource = function(source) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        var name;
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            name = source.file.split(".")[0];
            _this.sources[name] = req.responseText;
            _this.source_count++;
            if (_this.source_count >= resources.sources.length && (_this.runtime == null)) {
              return _this.start();
            }
          }
        }
      };
    })(this);
    req.open("GET", location.origin + location.pathname + ("ms/" + source.file + "?v=" + source.version));
    return req.send();
  };

  Player.prototype.start = function() {
    var touchListener, touchStartListener, wrapper;
    this.runtime = new Runtime((window.exported_project ? "" : location.origin + location.pathname), this.sources, resources, this);
    this.client = new PlayerClient(this);
    wrapper = document.getElementById("canvaswrapper");
    wrapper.appendChild(this.runtime.screen.canvas);
    window.addEventListener("resize", (function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
    this.resize();
    touchStartListener = (function(_this) {
      return function(event) {
        event.preventDefault();
        _this.runtime.screen.canvas.removeEventListener("touchstart", touchStartListener);
        return true;
      };
    })(this);
    touchListener = (function(_this) {
      return function(event) {
        _this.setFullScreen();
        return true;
      };
    })(this);
    this.runtime.screen.canvas.addEventListener("touchstart", touchStartListener);
    this.runtime.screen.canvas.addEventListener("touchend", touchListener);
    this.runtime.start();
    window.addEventListener("message", (function(_this) {
      return function(msg) {
        return _this.messageReceived(msg);
      };
    })(this));
    return this.postMessage({
      name: "focus"
    });
  };

  Player.prototype.resize = function() {
    var file, ref, results, src;
    this.runtime.screen.resize();
    if (this.runtime.vm != null) {
      if (this.runtime.vm.context.global.draw == null) {
        this.runtime.update_memory = {};
        ref = this.runtime.sources;
        results = [];
        for (file in ref) {
          src = ref[file];
          results.push(this.runtime.updateSource(file, src, false));
        }
        return results;
      } else if (this.runtime.stopped) {
        return this.runtime.drawCall();
      }
    }
  };

  Player.prototype.setFullScreen = function() {
    var ref;
    if ((document.documentElement.webkitRequestFullScreen != null) && !document.webkitIsFullScreen) {
      document.documentElement.webkitRequestFullScreen();
    } else if ((document.documentElement.requestFullScreen != null) && !document.fullScreen) {
      document.documentElement.requestFullScreen();
    } else if ((document.documentElement.mozRequestFullScreen != null) && !document.mozFullScreen) {
      document.documentElement.mozRequestFullScreen();
    }
    if ((window.screen != null) && (window.screen.orientation != null) && ((ref = window.orientation) === "portrait" || ref === "landscape")) {
      return window.screen.orientation.lock(window.orientation).then(null, function(error) {});
    }
  };

  Player.prototype.reportError = function(err) {
    return this.postMessage({
      name: "error",
      data: err
    });
  };

  Player.prototype.log = function(text) {
    return this.postMessage({
      name: "log",
      data: text
    });
  };

  Player.prototype.codePaused = function() {
    return this.postMessage({
      name: "code_paused"
    });
  };

  Player.prototype.exit = function() {
    return this.postMessage({
      name: "exit"
    });
  };

  Player.prototype.messageReceived = function(msg) {
    var code, data, err, file;
    data = msg.data;
    try {
      data = JSON.parse(data);
      switch (data.name) {
        case "command":
          return this.runtime.runCommand(data.line, (function(_this) {
            return function(res) {
              if (!data.line.trim().startsWith("print")) {
                return _this.postMessage({
                  name: "output",
                  data: res,
                  id: data.id
                });
              }
            };
          })(this));
        case "pause":
          return this.runtime.stop();
        case "step_forward":
          return this.runtime.stepForward();
        case "resume":
          return this.runtime.resume();
        case "code_updated":
          code = data.code;
          file = data.file.split(".")[0];
          if (this.runtime.vm != null) {
            this.runtime.vm.clearWarnings();
          }
          return this.runtime.updateSource(file, code, true);
        case "sprite_updated":
          file = data.file;
          return this.runtime.updateSprite(file, 0, data.data, data.properties);
        case "map_updated":
          file = data.file;
          return this.runtime.updateMap(file, 0, data.data);
        case "take_picture":
          this.runtime.screen.takePicture((function(_this) {
            return function(pic) {
              return _this.postMessage({
                name: "picture_taken",
                data: pic
              });
            };
          })(this));
          if (this.runtime.stopped) {
            return this.runtime.drawCall();
          }
          break;
        case "time_machine":
          return this.runtime.time_machine.messageReceived(data);
        case "watch":
          return this.runtime.watch(data.list);
        case "stop_watching":
          return this.runtime.stopWatching();
        default:
          if (data.request_id != null) {
            if (this.pending_requests[data.request_id] != null) {
              this.pending_requests[data.request_id](data);
              return delete this.pending_requests[data.request_id];
            }
          }
      }
    } catch (error1) {
      err = error1;
      return console.error(err);
    }
  };

  Player.prototype.call = function(name, args) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.call(name, args);
    }
  };

  Player.prototype.setGlobal = function(name, value) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.context.global[name] = value;
    }
  };

  Player.prototype.exec = function(command, callback) {
    if (this.runtime != null) {
      return this.runtime.runCommand(command, callback);
    }
  };

  Player.prototype.postMessage = function(data) {
    var err;
    if (window !== window.parent) {
      window.parent.postMessage(JSON.stringify(data), "*");
    }
    if (this.listener != null) {
      try {
        return this.listener(data);
      } catch (error1) {
        err = error1;
        return console.error(err);
      }
    }
  };

  Player.prototype.postRequest = function(data, callback) {
    data.request_id = this.request_id;
    this.pending_requests[this.request_id++] = callback;
    return this.postMessage(data);
  };

  return Player;

})();

if ((navigator.serviceWorker != null) && !window.skip_service_worker) {
  navigator.serviceWorker.register('sw.js', {
    scope: location.pathname
  }).then(function(reg) {
    return console.log('Registration succeeded. Scope is' + reg.scope);
  })["catch"](function(error) {
    return console.log('Registration failed with' + error);
  });
}
