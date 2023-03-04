this.ProjectDetails = (function() {
  function ProjectDetails(app) {
    var fn, j, len, ref, s;
    this.app = app;
    this.menu = ["code", "sprites", "sounds", "music", "assets", "doc"];
    ref = this.menu;
    fn = (function(_this) {
      return function(s) {
        return document.getElementById("project-contents-menu-" + s).addEventListener("click", function() {
          return _this.setSection(s);
        });
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      fn(s);
    }
    this.splitbar = new SplitBar("explore-project-details", "horizontal");
    this.splitbar.setPosition(45);
    this.editor = ace.edit("project-contents-view-editor");
    this.editor.$blockScrolling = 2e308;
    this.editor.setTheme("ace/theme/tomorrow_night_bright");
    this.editor.getSession().setMode("ace/mode/microscript");
    this.editor.setReadOnly(true);
    this.editor.getSession().setOptions({
      tabSize: 2,
      useSoftTabs: true,
      useWorker: false
    });
    document.querySelector("#project-contents-source-import").addEventListener("click", (function(_this) {
      return function() {
        var count, file, name;
        if (_this.app.project == null) {
          return;
        }
        file = _this.selected_source;
        if (file == null) {
          return;
        }
        if (_this.imported_sources[file]) {
          return;
        }
        _this.imported_sources[file] = true;
        name = file.split(".")[0];
        count = 1;
        while (_this.app.project.getSource(name) != null) {
          count += 1;
          name = file.split(".")[0] + count;
        }
        file = name + ".ms";
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "ms/" + file,
          content: _this.sources[_this.selected_source]
        }, function(msg) {
          _this.app.project.updateSourceList();
          return _this.setSelectedSource(_this.selected_source);
        });
      };
    })(this));
    document.getElementById("project-contents-sprite-import").addEventListener("click", (function(_this) {
      return function() {
        var base, count, data, name;
        if (_this.app.project == null) {
          return;
        }
        if (_this.selected_sprite == null) {
          return;
        }
        name = _this.selected_sprite.name;
        if (name == null) {
          return;
        }
        if (_this.imported_sprites[name]) {
          return;
        }
        _this.imported_sprites[name] = true;
        document.getElementById("project-contents-sprite-import").style.display = "none";
        count = 1;
        base = name;
        while (_this.app.project.getSprite(name) != null) {
          count += 1;
          name = base + count;
        }
        data = _this.selected_sprite.saveData().split(",")[1];
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "sprites/" + name + ".png",
          properties: {
            frames: _this.selected_sprite.frames.length,
            fps: _this.selected_sprite.fps
          },
          content: data
        }, function(msg) {
          return _this.app.project.updateSpriteList();
        });
      };
    })(this));
    document.querySelector("#project-contents-doc-import").addEventListener("click", (function(_this) {
      return function() {
        var value;
        if (_this.app.project == null) {
          return;
        }
        if (_this.imported_doc || (_this.doc == null)) {
          return;
        }
        _this.imported_doc = true;
        value = _this.app.doc_editor.editor.getValue();
        if ((value != null) && value.length > 0) {
          value = value + "\n\n" + _this.doc;
        } else {
          value = _this.doc;
        }
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "doc/doc.md",
          content: value
        }, function(msg) {
          _this.app.project.loadDoc();
          document.querySelector("#project-contents-doc-import").classList.add("done");
          document.querySelector("#project-contents-doc-import i").classList.add("fa-check");
          document.querySelector("#project-contents-doc-import i").classList.remove("fa-download");
          return document.querySelector("#project-contents-doc-import span").innerText = _this.app.translator.get("Doc imported");
        });
      };
    })(this));
    document.getElementById("post-project-comment-button").addEventListener("click", (function(_this) {
      return function() {
        var text;
        text = document.querySelector("#post-project-comment textarea").value;
        if ((text != null) && text.length > 0) {
          _this.postComment(text);
          return document.querySelector("#post-project-comment textarea").value = "";
        }
      };
    })(this));
    document.getElementById("login-to-post-comment").addEventListener("click", (function(_this) {
      return function() {
        return _this.app.appui.showLoginPanel();
      };
    })(this));
    document.getElementById("validate-to-post-comment").addEventListener("click", (function(_this) {
      return function() {
        return _this.app.appui.setMainSection("usersettings");
      };
    })(this));
  }

  ProjectDetails.prototype.set = function(project1) {
    var a, j, len, ref, ref1, section, t;
    this.project = project1;
    this.splitbar.update();
    this.sources = [];
    this.sprites = [];
    this.sounds = [];
    this.music = [];
    this.maps = [];
    this.imported_sources = {};
    this.imported_sprites = {};
    this.imported_doc = false;
    document.querySelector("#project-contents-doc-import").classList.remove("done");
    document.querySelector("#project-contents-doc-import").style.display = this.app.project != null ? "block" : "none";
    document.querySelector("#project-contents-source-import").style.display = (this.app.project != null) && this.app.project.id !== this.project.id ? "block" : "none";
    if (this.app.project != null) {
      document.querySelector("#project-contents-doc-import span").innerText = this.app.translator.get("Import doc to") + " " + this.app.project.title;
    }
    document.querySelector("#project-contents-view .code-list").innerHTML = "";
    document.querySelector("#project-contents-view .sprite-list").innerHTML = "";
    document.querySelector("#project-contents-view .sound-list").innerHTML = "";
    document.querySelector("#project-contents-view .music-list").innerHTML = "";
    document.querySelector("#project-contents-view .asset-list").innerHTML = "";
    document.querySelector("#project-contents-view .doc-render").innerHTML = "";
    section = "code";
    ref = this.project.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      if (t.indexOf("sprite") >= 0) {
        section = "sprites";
      } else if (t.indexOf("tutorial") >= 0 || t.indexOf("tutoriel") >= 0) {
        section = "doc";
      }
    }
    if ((ref1 = this.project.type) === "tutorial" || ref1 === "library") {
      section = "doc";
    }
    this.setSection(section);
    this.sources = {};
    this.selected_source = null;
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "ms"
    }, (function(_this) {
      return function(msg) {
        return _this.setSourceList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "sprites"
    }, (function(_this) {
      return function(msg) {
        return _this.setSpriteList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "sounds"
    }, (function(_this) {
      return function(msg) {
        return _this.setSoundList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "music"
    }, (function(_this) {
      return function(msg) {
        return _this.setMusicList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "assets"
    }, (function(_this) {
      return function(msg) {
        return _this.setAssetList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "doc"
    }, (function(_this) {
      return function(msg) {
        return _this.setDocList(msg.files);
      };
    })(this));
    this.updateComments();
    this.updateCredentials();
    a = document.querySelector("#project-contents-view .sprites .export-panel a");
    a.href = "/" + this.project.owner + "/" + this.project.slug + "/export/sprites/";
    a.download = this.project.slug + "_sprites.zip";
    a = document.querySelector("#project-details-exportbutton");
    a.href = "/" + this.project.owner + "/" + this.project.slug + "/export/project/";
    return a.download = this.project.slug + "_files.zip";
  };

  ProjectDetails.prototype.updateCredentials = function() {
    if (this.app.user != null) {
      document.getElementById("login-to-post-comment").style.display = "none";
      if (this.app.user.flags.validated) {
        document.getElementById("validate-to-post-comment").style.display = "none";
        return document.getElementById("post-project-comment").style.display = "block";
      } else {
        document.getElementById("validate-to-post-comment").style.display = "inline-block";
        return document.getElementById("post-project-comment").style.display = "none";
      }
    } else {
      document.getElementById("login-to-post-comment").style.display = "inline-block";
      document.getElementById("validate-to-post-comment").style.display = "none";
      return document.getElementById("post-project-comment").style.display = "none";
    }
  };

  ProjectDetails.prototype.loadFile = function(url, callback) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            return callback(req.responseText);
          }
        }
      };
    })(this);
    req.open("GET", url);
    return req.send();
  };

  ProjectDetails.prototype.setSection = function(section) {
    var j, len, ref, s;
    ref = this.menu;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById("project-contents-menu-" + s).classList.add("selected");
        document.querySelector("#project-contents-view ." + s).style.display = "block";
      } else {
        document.getElementById("project-contents-menu-" + s).classList.remove("selected");
        document.querySelector("#project-contents-view ." + s).style.display = "none";
      }
    }
  };

  ProjectDetails.prototype.createSourceEntry = function(file) {
    return this.app.client.sendRequest({
      name: "read_public_project_file",
      project: this.project.id,
      file: "ms/" + file
    }, (function(_this) {
      return function(msg) {
        var div;
        _this.sources[file] = msg.content;
        div = document.createElement("div");
        div.innerHTML = "<i class='fa fa-file-code'></i> " + (file.split(".")[0]);
        document.querySelector("#project-contents-view .code-list").appendChild(div);
        div.id = "project-contents-view-source-" + file;
        div.addEventListener("click", function() {
          return _this.setSelectedSource(file);
        });
        if (_this.selected_source == null) {
          return _this.setSelectedSource(file);
        }
      };
    })(this));
  };

  ProjectDetails.prototype.setSelectedSource = function(file) {
    var source;
    this.selected_source = file;
    this.source_folder.setSelectedItem(file);
    source = this.project_sources[file];
    if ((source != null) && (source.parent != null)) {
      source.parent.setOpen(true);
    }
    this.editor.setValue(this.sources[file], -1);
    if (this.app.project == null) {
      return;
    }
    if (this.imported_sources[file]) {
      document.querySelector("#project-contents-source-import").classList.add("done");
      document.querySelector("#project-contents-source-import i").classList.remove("fa-download");
      document.querySelector("#project-contents-source-import i").classList.add("fa-check");
      return document.querySelector("#project-contents-source-import span").innerText = this.app.translator.get("Source file imported");
    } else {
      document.querySelector("#project-contents-source-import").classList.remove("done");
      document.querySelector("#project-contents-source-import i").classList.add("fa-download");
      document.querySelector("#project-contents-source-import i").classList.remove("fa-check");
      return document.querySelector("#project-contents-source-import span").innerText = this.app.translator.get("Import source file to") + " " + this.app.project.title;
    }
  };

  ProjectDetails.prototype.setSourceList = function(files) {
    var f, folder, j, len, manager, project, s, table, view;
    table = {};
    manager = {
      folder: "ms",
      item: "source",
      openItem: (function(_this) {
        return function(item) {
          return _this.setSelectedSource(item);
        };
      })(this)
    };
    this.project_sources = {};
    project = JSON.parse(JSON.stringify(this.project));
    project.app = this.app;
    project.notifyListeners = (function(_this) {
      return function(source) {
        _this.sources[source.name] = source.content;
        if (_this.selected_source == null) {
          return _this.setSelectedSource(source.name);
        }
      };
    })(this);
    project.getFullURL = function() {
      var url;
      return url = location.origin + ("/" + project.owner + "/" + project.slug + "/");
    };
    folder = new ProjectFolder(null, "source");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ExploreProjectSource(project, f.file);
      this.project_sources[s.name] = s;
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .code-list"));
    this.source_folder = view;
    view.editable = false;
    view.rebuildList(folder);
  };

  ProjectDetails.prototype.setSpriteList = function(files) {
    var f, folder, j, len, manager, project, s, table;
    table = {};
    this.sprites = {};
    manager = {
      folder: "sprites",
      item: "sprite",
      openItem: (function(_this) {
        return function(item) {
          _this.sprites_folder_view.setSelectedItem(item);
          _this.selected_sprite = _this.sprites[item];
          if ((_this.app.project != null) && !_this.imported_sprites[item]) {
            document.querySelector("#project-contents-sprite-import span").innerText = _this.app.translator.get("Import %ITEM% to project %PROJECT%").replace("%ITEM%", item.replace(/-/g, "/")).replace("%PROJECT%", _this.app.project.title);
            return document.getElementById("project-contents-sprite-import").style.display = "block";
          } else {
            return document.getElementById("project-contents-sprite-import").style.display = "none";
          }
        };
      })(this)
    };
    project = JSON.parse(JSON.stringify(this.project));
    project.getFullURL = function() {
      var url;
      return url = location.origin + ("/" + project.owner + "/" + project.slug + "/");
    };
    project.map_list = [];
    project.notifyListeners = function() {};
    folder = new ProjectFolder(null, "sprites");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectSprite(project, f.file, null, null, f.properties);
      folder.push(s);
      table[s.name] = s;
      this.sprites[s.name] = s;
    }
    this.sprites_folder_view = new FolderView(manager, document.querySelector("#project-contents-view .sprite-list"));
    this.sprites_folder_view.editable = false;
    this.sprites_folder_view.rebuildList(folder);
    document.getElementById("project-contents-sprite-import").style.display = "none";
  };

  ProjectDetails.prototype.setSoundList = function(files) {
    var f, folder, j, len, manager, project, s, table, view;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-sounds").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-sounds").style.display = "none";
    }
    table = {};
    manager = {
      folder: "sounds",
      item: "sound",
      openItem: function(item) {
        return table[item].play();
      }
    };
    project = JSON.parse(JSON.stringify(this.project));
    project.getFullURL = function() {
      var url;
      return url = location.origin + ("/" + project.owner + "/" + project.slug + "/");
    };
    folder = new ProjectFolder(null, "sounds");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectSound(project, f.file);
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .sound-list"));
    view.editable = false;
    view.rebuildList(folder);
  };

  ProjectDetails.prototype.setMusicList = function(files) {
    var f, folder, j, len, manager, project, s, table, view;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-music").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-music").style.display = "none";
    }
    table = {};
    manager = {
      folder: "music",
      item: "music",
      openItem: function(item) {
        return table[item].play();
      }
    };
    project = JSON.parse(JSON.stringify(this.project));
    project.getFullURL = (function(_this) {
      return function() {
        var url;
        return url = location.origin + ("/" + project.owner + "/" + project.slug + "/");
      };
    })(this);
    folder = new ProjectFolder(null, "sounds");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectMusic(project, f.file);
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .music-list"));
    view.editable = false;
    view.rebuildList(folder);
  };

  ProjectDetails.prototype.setAssetList = function(files) {
    var f, folder, j, len, manager, project, s, table, view;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-assets").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-assets").style.display = "none";
    }
    table = {};
    manager = {
      folder: "assets",
      item: "asset",
      openItem: function(item) {}
    };
    project = JSON.parse(JSON.stringify(this.project));
    project.getFullURL = function() {
      var url;
      return url = location.origin + ("/" + project.owner + "/" + project.slug + "/");
    };
    folder = new ProjectFolder(null, "assets");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectAsset(project, f.file);
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .asset-list"));
    view.editable = false;
    view.rebuildList(folder);
  };

  ProjectDetails.prototype.setMapList = function(files) {
    return console.info(files);
  };

  ProjectDetails.prototype.setDocList = function(files) {
    if (files.length > 0) {
      document.getElementById("project-contents-menu-doc").style.display = "block";
      return this.app.client.sendRequest({
        name: "read_public_project_file",
        project: this.project.id,
        file: "doc/" + files[0].file
      }, (function(_this) {
        return function(msg) {
          _this.doc = msg.content;
          if ((_this.doc != null) && _this.doc.trim().length > 0) {
            return document.querySelector("#project-contents-view .doc-render").innerHTML = DOMPurify.sanitize(marked(msg.content));
          } else {
            return document.getElementById("project-contents-menu-doc").style.display = "none";
          }
        };
      })(this));
    } else {
      return document.getElementById("project-contents-menu-doc").style.display = "none";
    }
  };

  ProjectDetails.prototype.updateComments = function() {
    return this.app.client.sendRequest({
      name: "get_project_comments",
      project: this.project.id
    }, (function(_this) {
      return function(msg) {
        var c, e, j, len, ref;
        e = document.getElementById("project-comment-list");
        e.innerHTML = "";
        if (msg.comments != null) {
          ref = msg.comments;
          for (j = 0, len = ref.length; j < len; j++) {
            c = ref[j];
            _this.createCommentBox(c);
          }
        }
      };
    })(this));
  };

  ProjectDetails.prototype.createCommentBox = function(c) {
    var author, buttons, clear, contents, div, i, span, t, time, tt;
    console.info(c);
    div = document.createElement("div");
    div.classList.add("comment");
    author = document.createElement("div");
    author.classList.add("author");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-user");
    span = document.createElement("span");
    span.innerText = c.user;
    author.appendChild(i);
    author.appendChild(span);
    author = this.app.appui.createUserTag(c.user, c.user_info.tier, c.user_info.profile_image, 12);
    time = document.createElement("div");
    time.classList.add("time");
    t = (Date.now() - c.time) / 60000;
    if (t < 2) {
      tt = this.app.translator.get("now");
    } else if (t < 120) {
      tt = this.app.translator.get("%NUM% minutes ago").replace("%NUM%", Math.round(t));
    } else {
      t /= 60;
      if (t < 48) {
        tt = this.app.translator.get("%NUM% hours ago").replace("%NUM%", Math.round(t));
      } else {
        t /= 24;
        if (t < 14) {
          tt = this.app.translator.get("%NUM% days ago").replace("%NUM%", Math.round(t));
        } else if (t < 30) {
          tt = this.app.translator.get("%NUM% weeks ago").replace("%NUM%", Math.round(t / 7));
        } else {
          tt = new Date(c.time).toLocaleDateString(this.app.translator.lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
    }
    time.innerText = tt;
    div.appendChild(time);
    div.appendChild(author);
    if ((this.app.user != null) && (this.app.user.nick === c.user || this.app.user.flags.admin)) {
      buttons = document.createElement("div");
      buttons.classList.add("buttons");
      buttons.appendChild(this.createButton("trash", this.app.translator.get("Delete"), "red", (function(_this) {
        return function() {
          return _this.deleteComment(c);
        };
      })(this)));
      div.appendChild(buttons);
    }
    contents = document.createElement("div");
    contents.classList.add("contents");
    contents.innerHTML = DOMPurify.sanitize(marked(c.text));
    div.appendChild(contents);
    clear = document.createElement("div");
    clear.style = "clear:both";
    div.appendChild(clear);
    return document.getElementById("project-comment-list").appendChild(div);
  };

  ProjectDetails.prototype.createButton = function(icon, text, color, callback) {
    var button, i, span;
    button = document.createElement("div");
    button.classList.add("small" + color + "button");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-" + icon);
    button.appendChild(i);
    span = document.createElement("span");
    span.innerText = text;
    button.appendChild(span);
    button.addEventListener("click", (function(_this) {
      return function() {
        return callback();
      };
    })(this));
    return button;
  };

  ProjectDetails.prototype.postComment = function(text) {
    return this.app.client.sendRequest({
      name: "add_project_comment",
      project: this.project.id,
      text: text
    }, (function(_this) {
      return function(msg) {
        return _this.updateComments();
      };
    })(this));
  };

  ProjectDetails.prototype.editComment = function(id, text) {};

  ProjectDetails.prototype.deleteComment = function(c) {
    return ConfirmDialog.confirm(this.app.translator.get("Do you really want to delete this comment?"), this.app.translator.get("Delete"), this.app.translator.get("Cancel"), (function(_this) {
      return function() {
        return _this.app.client.sendRequest({
          name: "delete_project_comment",
          project: _this.project.id,
          id: c.id
        }, function(msg) {
          return _this.updateComments();
        });
      };
    })(this));
  };

  return ProjectDetails;

})();

this.ExploreProjectSource = (function() {
  function ExploreProjectSource(project1, file1, size) {
    var s;
    this.project = project1;
    this.file = file1;
    this.size = size != null ? size : 0;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "ms/" + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
    this.content = "";
    this.fetched = false;
    this.reload();
  }

  ExploreProjectSource.prototype.reload = function() {
    return fetch(this.project.getFullURL() + ("ms/" + this.name + ".ms")).then((function(_this) {
      return function(result) {
        return result.text().then(function(text) {
          _this.content = text;
          _this.fetched = true;
          return _this.project.notifyListeners(_this);
        });
      };
    })(this));
  };

  return ExploreProjectSource;

})();
