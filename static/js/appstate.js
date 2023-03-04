this.AppState = (function() {
  function AppState(app) {
    this.app = app;
    window.addEventListener("popstate", (function(_this) {
      return function(event) {
        return _this.popState();
      };
    })(this));
  }

  AppState.prototype.pushState = function(name, path, obj) {
    if (obj == null) {
      obj = {};
    }
    obj.name = name;
    return history.pushState(obj, "", path);
  };

  AppState.prototype.popState = function() {
    var i, len, p, project, ref, ref1, s;
    if (history.state != null) {
      s = history.state.name.split(".");
      if ((ref = history.state.name) === "documentation" || ref === "tutorials" || ref === "about" || ref === "projects" || ref === "explore") {
        if (history.state.name === "projects") {
          if (this.app.project && this.app.project.pending_changes.length > 0) {
            history.forward();
            alert("Please wait while saving your changes...");
          } else {
            this.app.appui.backToProjectList();
          }
        }
        if (history.state.name === "explore") {
          this.app.explore.closeProject();
        }
        return this.app.appui.setMainSection((function(p) {
          return {
            "documentation": "help"
          }[p] || p;
        })(history.state.name));
      } else if (history.state.name === "home") {
        return this.app.appui.setMainSection("home");
      } else if (history.state.name.startsWith("project.") && (s[1] != null) && (s[2] != null)) {
        project = s[1];
        if ((this.app.project == null) || this.app.project.slug !== project) {
          if (this.app.projects) {
            ref1 = this.app.projects;
            for (i = 0, len = ref1.length; i < len; i++) {
              p = ref1[i];
              if (p.slug === project) {
                this.app.openProject(p, false);
                break;
              }
            }
          }
        }
        this.app.appui.setMainSection("projects");
        return this.app.appui.setSection(s[2]);
      } else if (history.state.name.startsWith("user.") && (s[1] != null)) {
        switch (s[1]) {
          case "settings":
            this.app.appui.setMainSection("usersettings");
            return this.app.user_settings.setSection("settings");
          case "profile":
            this.app.appui.setMainSection("usersettings");
            return this.app.user_settings.setSection("profile");
          case "progress":
            this.app.appui.setMainSection("usersettings");
            return this.app.user_settings.setSection("progress");
        }
      } else if (history.state.name === "project_details") {
        if (history.state.project != null) {
          this.app.explore.openProject(history.state.project);
          return this.app.appui.setMainSection("explore");
        } else {
          s = location.pathname.split("/");
          if ((s[2] != null) && (s[3] != null)) {
            p = this.app.explore.findProject(s[2], s[3]);
            if (p) {
              this.app.explore.openProject(p);
              return this.app.appui.setMainSection("explore");
            }
          }
        }
      }
    }
  };

  AppState.prototype.initState = function() {
    var i, len, p, path, project, ref, s, tab, tuto, user;
    if (location.pathname.startsWith("/login/")) {
      path = this.app.translator.lang !== "en" ? "/" + this.app.translator.lang + "/" : "/";
      history.replaceState({
        name: "home"
      }, "", path);
      this.app.appui.setMainSection("home");
      return this.app.appui.showLoginPanel();
    } else if (location.pathname.startsWith("/tutorial/")) {
      path = location.pathname.split("/");
      path.splice(0, 2);
      if (path[path.length - 1] === "") {
        path.splice(path.length - 1, 1);
      }
      path = path.join("/");
      path = location.origin + ("/" + path + "/doc/doc.md?v=" + (Date.now()));
      console.info(path);
      tuto = new Tutorial(path, false);
      tuto.load((function(_this) {
        return function() {
          return _this.app.tutorial.start(tuto);
        };
      })(this), (function(_this) {
        return function(err) {
          console.info(err);
          alert(_this.app.translator.get("Tutorial not found"));
          return history.replaceState({
            name: "home"
          }, "", "/");
        };
      })(this));
      this.app.client.listen("project_file_updated", (function(_this) {
        return function(msg) {
          if (msg.type === "doc" && msg.file === "doc") {
            tuto.update(msg.data);
            return _this.app.tutorial.update();
          }
        };
      })(this));
      user = location.pathname.split("/")[2];
      project = location.pathname.split("/")[3];
      return this.app.client.send({
        name: "listen_to_project",
        user: user,
        project: project
      });
    } else if (location.pathname.startsWith("/i/")) {
      this.app.appui.setMainSection("explore", false);
      return history.replaceState({
        name: "project_details"
      }, "", location.pathname);
    } else {
      ref = ["about", "tutorials", "explore", "documentation"];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (location.pathname.startsWith("/" + p + "/") || location.pathname === ("/" + p)) {
          history.replaceState({
            name: p
          }, "", location.pathname);
          if (p === "explore") {
            s = location.pathname.split("/")[2];
            if (s === "library" || s === "plugin" || s === "tutorial" || s === "app" || s === "all") {
              this.app.explore.setProjectType(s);
            }
          }
          return this.app.appui.setMainSection(((function(_this) {
            return function(p) {
              return {
                "documentation": "help"
              }[p] || p;
            };
          })(this))(p));
        }
      }
      if (this.app.user != null) {
        s = location.pathname.split("/");
        if (location.pathname.startsWith("/projects/") && s[2] && s[3]) {
          project = s[2];
          tab = s[3];
          return history.replaceState({
            name: "project." + s[2] + "." + s[3]
          }, "", location.pathname);
        } else if (location.pathname.startsWith("/user/") && s[2]) {
          switch (s[2]) {
            case "settings":
              this.app.appui.setMainSection("usersettings");
              return this.app.user_settings.setSection("settings");
            case "profile":
              this.app.appui.setMainSection("usersettings");
              return this.app.user_settings.setSection("profile");
            case "progress":
              this.app.appui.setMainSection("usersettings");
              return this.app.user_settings.setSection("progress");
          }
        } else {
          this.app.appui.setMainSection("projects");
          return history.replaceState({
            name: "projects"
          }, "", "/projects/");
        }
      } else {
        path = this.app.translator.lang !== "en" ? "/" + this.app.translator.lang + "/" : "/";
        history.replaceState({
          name: "home"
        }, "", path);
        return this.app.appui.setMainSection("home");
      }
    }
  };

  AppState.prototype.projectsFetched = function() {
    if ((history.state != null) && (history.state.name != null)) {
      if (history.state.name.startsWith("project.")) {
        return this.popState();
      }
    }
  };

  return AppState;

})();
