var ForumSession, JSZip, ProjectManager, RegexLib, RelayService, SHA256;

SHA256 = require("crypto-js/sha256");

ProjectManager = require(__dirname + "/projectmanager.js");

RegexLib = require(__dirname + "/../../static/js/util/regexlib.js");

ForumSession = require(__dirname + "/../forum/forumsession.js");

JSZip = require("jszip");

RelayService = require(__dirname + "/../relay/relayservice.js");

this.Session = class Session {
  constructor(server, socket) {
    var j, len1, plugin, ref;
    this.uploadRequest = this.uploadRequest.bind(this);
    this.bufferReceived = this.bufferReceived.bind(this);
    this.server = server;
    this.socket = socket;
    //console.info "new session"
    this.content = this.server.content;
    if (this.content == null) {
      return this.socket.close();
    }
    this.translator = this.content.translator.getTranslator("en");
    this.user = null;
    this.token = null;
    this.checkCookie();
    this.last_active = Date.now();
    this.socket.on("message", (msg) => {
      //console.info "received msg: #{msg}"
      this.messageReceived(msg);
      return this.last_active = Date.now();
    });
    this.socket.on("close", () => {
      this.server.sessionClosed(this);
      return this.disconnected();
    });
    this.socket.on("error", (err) => {
      if (this.user) {
        console.error(`WS ERROR for user ${this.user.id} - ${this.user.nick}`);
      } else {
        console.error("WS ERROR");
      }
      return console.error(err);
    });
    this.commands = {};
    this.register("ping", (msg) => {
      this.send({
        name: "pong"
      });
      return this.checkUpdates();
    });
    this.register("create_account", (msg) => {
      return this.createAccount(msg);
    });
    this.register("create_guest", (msg) => {
      return this.createGuestAccount(msg);
    });
    this.register("login", (msg) => {
      return this.login(msg);
    });
    this.register("send_password_recovery", (msg) => {
      return this.sendPasswordRecovery(msg);
    });
    this.register("token", (msg) => {
      return this.checkToken(msg);
    });
    this.register("delete_guest", (msg) => {
      return this.deleteGuest(msg);
    });
    this.register("change_password", (msg) => {
      return this.changePassword(msg);
    });
    this.register("send_validation_mail", (msg) => {
      return this.sendValidationMail(msg);
    });
    this.register("change_email", (msg) => {
      return this.changeEmail(msg);
    });
    this.register("change_nick", (msg) => {
      return this.changeNick(msg);
    });
    this.register("change_password", (msg) => {
      return this.changePassword(msg);
    });
    this.register("change_newsletter", (msg) => {
      return this.changeNewsletter(msg);
    });
    this.register("change_experimental", (msg) => {
      return this.changeExperimental(msg);
    });
    this.register("set_user_setting", (msg) => {
      return this.setUserSetting(msg);
    });
    this.register("set_user_profile", (msg) => {
      return this.setUserProfile(msg);
    });
    this.register("create_project", (msg) => {
      return this.createProject(msg);
    });
    this.register("import_project", (msg) => {
      return this.importProject(msg);
    });
    this.register("set_project_option", (msg) => {
      return this.setProjectOption(msg);
    });
    this.register("set_project_property", (msg) => {
      return this.setProjectProperty(msg);
    });
    this.register("set_project_public", (msg) => {
      return this.setProjectPublic(msg);
    });
    this.register("set_project_tags", (msg) => {
      return this.setProjectTags(msg);
    });
    this.register("delete_project", (msg) => {
      return this.deleteProject(msg);
    });
    this.register("get_project_list", (msg) => {
      return this.getProjectList(msg);
    });
    this.register("update_code", (msg) => {
      return this.updateCode(msg);
    });
    this.register("lock_project_file", (msg) => {
      return this.lockProjectFile(msg);
    });
    this.register("write_project_file", (msg) => {
      return this.writeProjectFile(msg);
    });
    this.register("read_project_file", (msg) => {
      return this.readProjectFile(msg);
    });
    this.register("rename_project_file", (msg) => {
      return this.renameProjectFile(msg);
    });
    this.register("delete_project_file", (msg) => {
      return this.deleteProjectFile(msg);
    });
    this.register("list_project_files", (msg) => {
      return this.listProjectFiles(msg);
    });
    this.register("list_public_project_files", (msg) => {
      return this.listPublicProjectFiles(msg);
    });
    this.register("read_public_project_file", (msg) => {
      return this.readPublicProjectFile(msg);
    });
    this.register("listen_to_project", (msg) => {
      return this.listenToProject(msg);
    });
    this.register("get_file_versions", (msg) => {
      return this.getFileVersions(msg);
    });
    this.register("sync_project_files", (msg) => {
      return this.syncProjectFiles(msg);
    });
    this.register("invite_to_project", (msg) => {
      return this.inviteToProject(msg);
    });
    this.register("accept_invite", (msg) => {
      return this.acceptInvite(msg);
    });
    this.register("remove_project_user", (msg) => {
      return this.removeProjectUser(msg);
    });
    this.register("get_public_projects", (msg) => {
      return this.getPublicProjects(msg);
    });
    this.register("get_public_plugins", (msg) => {
      return this.getPublicPlugins(msg);
    });
    this.register("get_public_libraries", (msg) => {
      return this.getPublicLibraries(msg);
    });
    this.register("get_public_project", (msg) => {
      return this.getPublicProject(msg);
    });
    this.register("clone_project", (msg) => {
      return this.cloneProject(msg);
    });
    this.register("clone_public_project", (msg) => {
      return this.clonePublicProject(msg);
    });
    this.register("toggle_like", (msg) => {
      return this.toggleLike(msg);
    });
    this.register("get_language", (msg) => {
      return this.getLanguage(msg);
    });
    this.register("get_translation_list", (msg) => {
      return this.getTranslationList(msg);
    });
    this.register("set_translation", (msg) => {
      return this.setTranslation(msg);
    });
    this.register("add_translation", (msg) => {
      return this.addTranslation(msg);
    });
    this.register("get_project_comments", (msg) => {
      return this.getProjectComments(msg);
    });
    this.register("add_project_comment", (msg) => {
      return this.addProjectComment(msg);
    });
    this.register("delete_project_comment", (msg) => {
      return this.deleteProjectComment(msg);
    });
    this.register("edit_project_comment", (msg) => {
      return this.editProjectComment(msg);
    });
    this.register("build_project", (msg) => {
      return this.buildProject(msg);
    });
    this.register("get_build_status", (msg) => {
      return this.getBuildStatus(msg);
    });
    this.register("start_builder", (msg) => {
      return this.startBuilder(msg);
    });
    this.register("backup_complete", (msg) => {
      return this.backupComplete(msg);
    });
    this.register("upload_request", (msg) => {
      return this.uploadRequest(msg);
    });
    this.register("tutorial_completed", (msg) => {
      return this.tutorialCompleted(msg);
    });
    // moderation
    this.register("set_project_approved", (msg) => {
      return this.setProjectApproved(msg);
    });
    this.register("set_user_approved", (msg) => {
      return this.setUserApproved(msg);
    });
    // client / server
    this.register("relay_server_available", (msg) => {
      return this.relayServerAvailable(msg);
    });
    this.register("get_relay_server", (msg) => {
      return this.getRelayServer(msg);
    });
    this.register("get_server_token", (msg) => {
      return this.getServerToken(msg);
    });
    this.register("check_server_token", (msg) => {
      return this.checkServerToken(msg);
    });
    if (!this.server.config.delegate_relay_service) {
      this.relay_service = new RelayService(this);
    }
    ref = this.server.plugins;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      plugin = ref[j];
      if (plugin.registerSessionMessages != null) {
        plugin.registerSessionMessages(this);
      }
    }
    this.forum_session = new ForumSession(this);
    this.reserved_nicks = {
      "admin": true,
      "api": true,
      "static": true,
      "blog": true,
      "news": true,
      "about": true,
      "discord": true,
      "article": true,
      "forum": true,
      "community": true
    };
  }

  checkCookie() {
    var cookie, error;
    try {
      cookie = this.socket.request.headers.cookie;
      if ((cookie != null) && cookie.indexOf("token") >= 0) {
        cookie = cookie.split("token")[1];
        cookie = cookie.split("=")[1];
        if (cookie != null) {
          cookie = cookie.split(";")[0];
          this.token = cookie.trim();
          this.token = this.content.findToken(this.token);
          if (this.token != null) {
            this.user = this.token.user;
            this.user.addListener(this);
            this.send({
              name: "token_valid",
              nick: this.user.nick,
              flags: !this.user.flags.censored ? this.user.flags : [],
              info: this.getUserInfo(),
              settings: this.user.settings
            });
            this.user.set("last_active", Date.now());
            return this.logActiveUser();
          }
        }
      }
    } catch (error1) {
      error = error1;
      return console.error(error);
    }
  }

  logActiveUser() {
    if (this.user == null) {
      return;
    }
    if (this.user.flags.guest) {
      return this.server.stats.unique("active_guests", this.user.id);
    } else {
      return this.server.stats.unique("active_users", this.user.id);
    }
  }

  register(name, callback) {
    return this.commands[name] = callback;
  }

  disconnected() {
    var err;
    try {
      if ((this.project != null) && (this.project.manager != null)) {
        this.project.manager.removeSession(this);
        this.project.manager.removeListener(this);
      }
      if (this.user != null) {
        return this.user.removeListener(this);
      }
    } catch (error1) {
      err = error1;
      return console.error(err);
    }
  }

  setCurrentProject(project) {
    if (project !== this.project || (this.project.manager == null)) {
      if ((this.project != null) && (this.project.manager != null)) {
        this.project.manager.removeSession(this);
      }
      this.project = project;
      if (this.project.manager == null) {
        new ProjectManager(this.project);
      }
      return this.project.manager.addUser(this);
    }
  }

  messageReceived(msg) {
    var c, err;
    if (typeof msg !== "string") {
      return this.bufferReceived(msg);
    }
    try {
      //console.info msg
      msg = JSON.parse(msg);
      if (msg.name != null) {
        c = this.commands[msg.name];
        if (c != null) {
          c(msg);
        }
      }
    } catch (error1) {
      err = error1;
      console.info(err);
    }
    this.server.stats.inc("websocket_requests");
    if (this.user != null) {
      return this.logActiveUser();
    }
  }

  sendCodeUpdated(file, code) {
    this.send({
      name: "code_updated",
      file: file,
      code: code
    });
  }

  sendProjectFileUpdated(type, file, version, data, properties) {
    return this.send({
      name: "project_file_updated",
      type: type,
      file: file,
      version: version,
      data: data,
      properties: properties
    });
  }

  sendProjectFileDeleted(type, file) {
    return this.send({
      name: "project_file_deleted",
      type: type,
      file: file
    });
  }

  createGuestAccount(data) {
    var chars, i, j, nick;
    if (!this.server.rate_limiter.accept("create_account_ip", this.socket.remoteAddress)) {
      return;
    }
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    while (true) {
      nick = "";
      for (i = j = 0; j <= 9; i = j += 1) {
        nick += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!this.content.findUserByNick(nick)) {
        break;
      }
    }
    this.user = this.content.createUser({
      nick: nick,
      flags: {
        guest: true
      },
      language: data.language,
      date_created: Date.now(),
      last_active: Date.now(),
      creation_ip: this.socket.remoteAddress
    });
    this.user.addListener(this);
    this.send({
      name: "guest_created",
      nick: nick,
      flags: this.user.flags,
      info: this.getUserInfo(),
      settings: this.user.settings,
      token: this.content.createToken(this.user).value,
      request_id: data.request_id
    });
    return this.logActiveUser();
  }

  deleteGuest(data) {
    if ((this.user != null) && this.user.flags.guest) {
      this.user.delete();
      return this.send({
        name: "guest_deleted",
        request_id: data.request_id
      });
    }
  }

  createAccount(data) {
    var chars, hash, i, j, salt;
    if (data.email == null) {
      return this.sendError(this.translator.get("email not specified"), data.request_id);
    }
    if (data.nick == null) {
      return this.sendError(this.translator.get("nickname not specified"), data.request_id);
    }
    if (data.password == null) {
      return this.sendError(this.translator.get("password not specified"), data.request_id);
    }
    if (this.content.findUserByEmail(data.email)) {
      return this.sendError(this.translator.get("email already exists"), data.request_id);
    }
    if (this.content.findUserByNick(data.nick)) {
      return this.sendError(this.translator.get("nickname already exists"), data.request_id);
    }
    if (this.reserved_nicks[data.nick]) {
      return this.sendError(this.translator.get("nickname already exists"), data.request_id);
    }
    if (!RegexLib.nick.test(data.nick)) {
      return this.sendError(this.translator.get("Incorrect nickname. Use 5 characters minimum, only letters, numbers or _"), data.request_id);
    }
    if (!RegexLib.email.test(data.email)) {
      return this.sendError(this.translator.get("Incorrect e-mail address"), data.request_id);
    }
    if (data.password.trim().length < 6) {
      return this.sendError(this.translator.get("Password too weak"), data.request_id);
    }
    if (!this.server.rate_limiter.accept("create_account_ip", this.socket.remoteAddress)) {
      return;
    }
    salt = "";
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (i = j = 0; j <= 15; i = j += 1) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    hash = salt + "|" + SHA256(salt + data.password);
    if ((this.user != null) && this.user.flags.guest) {
      this.server.content.changeUserNick(this.user, data.nick);
      this.server.content.changeUserEmail(this.user, data.email);
      this.user.setFlag("guest", false);
      this.user.setFlag("newsletter", data.newsletter);
      this.user.set("hash", hash);
      this.user.resetValidationToken();
      this.user.updateTier();
    } else {
      this.user = this.content.createUser({
        nick: data.nick,
        email: data.email,
        flags: {
          newsletter: data.newsletter
        },
        language: data.language,
        hash: hash,
        date_created: Date.now(),
        last_active: Date.now(),
        creation_ip: this.socket.remoteAddress
      });
      this.user.addListener(this);
    }
    this.send({
      name: "account_created",
      nick: data.nick,
      email: data.email,
      flags: this.user.flags,
      info: this.getUserInfo(),
      settings: this.user.settings,
      notifications: [this.server.content.translator.getTranslator(data.language).get("Account created successfully!")],
      token: this.content.createToken(this.user).value,
      request_id: data.request_id
    });
    this.sendValidationMail();
    return this.logActiveUser();
  }

  login(data) {
    var h, hash, s, user;
    if (data.nick == null) {
      return;
    }
    if (!this.server.rate_limiter.accept("login_ip", this.socket.remoteAddress)) {
      return;
    }
    if (!this.server.rate_limiter.accept("login_user", data.nick)) {
      return;
    }
    user = this.content.findUserByNick(data.nick);
    if (user == null) {
      user = this.content.findUserByEmail(data.nick);
    }
    if ((user != null) && (user.hash != null)) {
      hash = user.hash;
      s = hash.split("|");
      h = SHA256(s[0] + data.password);
      //console.info "salt: #{s[0]}"
      //console.info "hash: #{h}"
      //console.info "recorded hash: #{s[1]}"
      if (h.toString() === s[1]) {
        this.user = user;
        this.user.addListener(this);
        this.send({
          name: "logged_in",
          token: this.content.createToken(this.user).value,
          nick: this.user.nick,
          email: this.user.email,
          flags: !this.user.flags.censored ? this.user.flags : {},
          info: this.getUserInfo(),
          settings: this.user.settings,
          notifications: this.user.notifications,
          request_id: data.request_id
        });
        this.user.notifications = [];
        return this.logActiveUser();
      } else {
        return this.sendError("wrong password", data.request_id);
      }
    } else {
      return this.sendError("unknown user", data.request_id);
    }
  }

  createHashedPassword(password) {
    var chars, i, j, salt;
    salt = "";
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (i = j = 0; j <= 15; i = j += 1) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt + "|" + SHA256(salt + password);
  }

  changePassword(data) {
    var h, hash, s;
    if ((this.user == null) || (this.user.hash == null)) {
      return;
    }
    if (data.current == null) {
      return;
    }
    if (data.new == null) {
      return;
    }
    hash = this.user.hash;
    s = hash.split("|");
    h = SHA256(s[0] + data.current);
    if (h.toString() === s[1]) {
      hash = this.createHashedPassword(data.new);
      this.user.set("hash", hash);
      return this.send({
        request_id: data.request_id,
        name: "password_changed"
      });
    } else {
      return this.sendError("wrong password", data.request_id);
    }
  }

  getUserInfo() {
    return {
      size: this.user.getTotalSize(),
      early_access: this.user.early_access,
      max_storage: this.user.max_storage,
      description: this.user.description,
      stats: this.user.progress.exportStats(),
      achievements: this.user.progress.exportAchievements()
    };
  }

  sendPasswordRecovery(data) {
    var user;
    if (data.email != null) {
      user = this.content.findUserByEmail(data.email);
      if (user != null) {
        if (this.server.rate_limiter.accept("send_mail_user", user.id)) {
          this.server.content.sendPasswordRecoveryMail(user);
        }
      }
    }
    return this.send({
      name: "send_password_recovery",
      request_id: data.request_id
    });
  }

  checkToken(data) {
    var token;
    if (this.server.config.standalone && this.content.user_count === 1) {
      this.user = this.server.content.users[0];
      this.user.addListener(this);
      this.send({
        name: "token_valid",
        nick: this.user.nick,
        email: this.user.email,
        flags: !this.user.flags.censored ? this.user.flags : {},
        info: this.getUserInfo(),
        settings: this.user.settings,
        notifications: this.user.notifications,
        request_id: data.request_id
      });
      this.user.notifications = [];
      this.user.set("last_active", Date.now());
      this.logActiveUser();
    }
    token = this.content.findToken(data.token);
    if ((token != null) && (token.user != null) && !token.user.flags.deleted) {
      this.user = token.user;
      this.user.addListener(this);
      this.send({
        name: "token_valid",
        nick: this.user.nick,
        email: this.user.email,
        flags: !this.user.flags.censored ? this.user.flags : {},
        info: this.getUserInfo(),
        settings: this.user.settings,
        notifications: this.user.notifications,
        request_id: data.request_id
      });
      this.user.notifications = [];
      this.user.set("last_active", Date.now());
      return this.logActiveUser();
    } else {
      return this.sendError("invalid token", data.request_id);
    }
  }

  send(data) {
    return this.socket.send(JSON.stringify(data));
  }

  sendError(error, request_id) {
    return this.send({
      name: "error",
      error: error,
      request_id: request_id
    });
  }

  syncProjectFiles(data) {
    var dest, source;
    if (data.request_id == null) {
      return this.sendError("Bad request");
    }
    if (this.user == null) {
      return this.sendError("not connected", data.request_id);
    }
    if (data.source == null) {
      return this.sendError("bad request", data.request_id);
    }
    if (data.dest == null) {
      return this.sendError("bad request", data.request_id);
    }
    if (data.ops == null) {
      return this.sendError("bad request", data.request_id);
    }
    dest = this.content.projects[data.dest];
    if (dest != null) {
      this.setCurrentProject(dest);
      source = this.content.projects[data.source];
      if (source != null) {
        if (!dest.manager.canReadProject(this.user, source)) {
          return this.sendError("access denied", data.request_id);
        }
        return dest.manager.syncFiles(this, data, source);
      }
    }
  }

  importProject(data) {
    var buffer, projectFileName, zip;
    if (data.request_id == null) {
      return this.sendError("Bad request");
    }
    if (this.user == null) {
      return this.sendError("not connected", data.request_id);
    }
    if (this.server.PROD && !this.user.flags.validated) {
      return this.sendError("Email validation is required", data.request_id);
    }
    if (!this.server.rate_limiter.accept("import_project_user", this.user.id)) {
      return this.sendError("Rate limited", data.request_id);
    }
    //return @sendError("wrong data") if not data.zip_data? or typeof data.zip_data != "string"

    //split = data.zip_data.split(",")
    //return @sendError("unrecognized data") if not split[1]?
    buffer = data.data; //Buffer.from(split[1],'base64')
    if (buffer.byteLength > this.user.max_storage - this.user.getTotalSize()) {
      return this.sendError("storage space exceeded", data.request_id);
    }
    zip = new JSZip;
    projectFileName = "project.json";
    return zip.loadAsync(buffer).then(((contents) => {
      if (zip.file(projectFileName) == null) {
        this.sendError(`[ZIP] Missing ${projectFileName}; import aborted`, data.request_id);
        console.log(`[ZIP] Missing ${projectFileName}; import aborted`);
        return;
      }
      return zip.file(projectFileName).async("string").then(((text) => {
        var err, projectInfo;
        try {
          projectInfo = JSON.parse(text);
        } catch (error1) {
          err = error1;
          this.sendError("Incorrect JSON data", data.request_id);
          console.error(err);
          return;
        }
        return this.content.createProject(this.user, projectInfo, ((project) => {
          this.setCurrentProject(project);
          return project.manager.importFiles(contents, () => {
            project.set("files", projectInfo.files || {});
            return this.send({
              name: "project_imported",
              id: project.id,
              request_id: data.request_id
            });
          });
        }), true);
      }), () => {
        return this.sendError("Malformed ZIP file", data.request_id);
      });
    }), () => {
      return this.sendError("Malformed ZIP file", data.request_id);
    });
  }

  createProject(data) {
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.server.rate_limiter.accept("create_project_user", this.user.id)) {
      return;
    }
    return this.content.createProject(this.user, data, (project) => {
      return this.send({
        name: "project_created",
        id: project.id,
        request_id: data.request_id
      });
    });
  }

  clonePublicProject(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.server.rate_limiter.accept("create_project_user", this.user.id)) {
      return;
    }
    if (data.project == null) {
      return this.sendError("");
    }
    project = this.server.content.projects[data.project];
    if ((project != null) && project.public) {
      return this.content.createProject(this.user, {
        title: project.title,
        slug: project.slug,
        public: false
      }, ((clone) => {
        var files, folders, funk, man;
        clone.setType(project.type);
        clone.setOrientation(project.orientation);
        clone.setAspect(project.aspect);
        clone.set("language", project.language);
        clone.setGraphics(project.graphics);
        clone.set("networking", project.networking);
        clone.set("libs", project.libs);
        clone.set("tabs", project.tabs);
        clone.set("plugins", project.plugins);
        clone.set("libraries", project.libraries);
        clone.set("files", JSON.parse(JSON.stringify(project.files)));
        man = this.getProjectManager(project);
        folders = ["ms", "sprites", "maps", "sounds", "sounds_th", "music", "music_th", "assets", "assets_th", "doc"];
        files = [];
        funk = () => {
          var dest, f, folder, src;
          if (folders.length > 0) {
            folder = folders.splice(0, 1)[0];
            return man.listFiles(folder, (list) => {
              var f, j, len1;
              for (j = 0, len1 = list.length; j < len1; j++) {
                f = list[j];
                files.push({
                  file: f.file,
                  folder: folder
                });
              }
              return funk();
            });
          } else if (files.length > 0) {
            f = files.splice(0, 1)[0];
            src = `${project.owner.id}/${project.id}/${f.folder}/${f.file}`;
            dest = `${clone.owner.id}/${clone.id}/${f.folder}/${f.file}`;
            return this.server.content.files.copy(src, dest, () => {
              return funk();
            });
          } else {
            return this.send({
              name: "project_created",
              id: clone.id,
              request_id: data.request_id
            });
          }
        };
        return funk();
      }), true);
    }
  }

  cloneProject(data) {
    var manager, project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.server.rate_limiter.accept("create_project_user", this.user.id)) {
      return;
    }
    if (data.project == null) {
      return this.sendError("");
    }
    project = this.server.content.projects[data.project];
    if (project != null) {
      manager = this.getProjectManager(project);
      if (manager.canRead(this.user)) {
        return this.content.createProject(this.user, {
          title: data.title || project.title,
          slug: project.slug,
          public: false
        }, ((clone) => {
          var files, folders, funk, man;
          clone.setType(project.type);
          clone.setOrientation(project.orientation);
          clone.setAspect(project.aspect);
          clone.set("language", project.language);
          clone.setGraphics(project.graphics);
          clone.set("networking", project.networking);
          clone.set("libs", project.libs);
          clone.set("tabs", project.tabs);
          clone.set("plugins", project.plugins);
          clone.set("libraries", project.libraries);
          clone.set("files", JSON.parse(JSON.stringify(project.files)));
          man = this.getProjectManager(project);
          folders = ["ms", "sprites", "maps", "sounds", "sounds_th", "music", "music_th", "assets", "assets_th", "doc"];
          files = [];
          funk = () => {
            var dest, f, folder, src;
            if (folders.length > 0) {
              folder = folders.splice(0, 1)[0];
              return man.listFiles(folder, (list) => {
                var f, j, len1;
                for (j = 0, len1 = list.length; j < len1; j++) {
                  f = list[j];
                  files.push({
                    file: f.file,
                    folder: folder
                  });
                }
                return funk();
              });
            } else if (files.length > 0) {
              f = files.splice(0, 1)[0];
              src = `${project.owner.id}/${project.id}/${f.folder}/${f.file}`;
              dest = `${clone.owner.id}/${clone.id}/${f.folder}/${f.file}`;
              return this.server.content.files.copy(src, dest, () => {
                return funk();
              });
            } else {
              return this.send({
                name: "project_created",
                id: clone.id,
                request_id: data.request_id
              });
            }
          };
          return funk();
        }), true);
      }
    }
  }

  getProjectManager(project) {
    if (project.manager == null) {
      new ProjectManager(project);
    }
    return project.manager;
  }

  setProjectPublic(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.public && !this.user.flags["validated"]) {
      return;
    }
    if (data.project == null) {
      if (this.user.flags.admin && data.id) {
        project = this.content.projects[data.id];
        if (project != null) {
          this.content.setProjectPublic(project, data.public);
          return this.send({
            name: "set_project_public",
            id: project.id,
            public: project.public,
            request_id: data.request_id
          });
        }
      }
    } else {
      project = this.user.findProject(data.project);
      if (project != null) {
        this.content.setProjectPublic(project, data.public);
        return this.send({
          name: "set_project_public",
          id: project.id,
          public: project.public,
          request_id: data.request_id
        });
      }
    }
  }

  setProjectApproved(data) {
    var project;
    if (this.user == null) {
      return;
    }
    if (data.project == null) {
      return;
    }
    if (this.user.flags.admin || this.user.flags.moderator) {
      project = this.content.projects[data.project];
      if (project != null) {
        project.setFlag("approved", data.approved);
        return this.send({
          name: "set_project_approved",
          id: project.id,
          approved: data.approved,
          request_id: data.request_id
        });
      }
    }
  }

  setUserApproved(data) {
    var user;
    if (this.user == null) {
      return;
    }
    if (data.user == null) {
      return;
    }
    if (this.user.flags.admin || this.user.flags.moderator) {
      user = this.content.users_by_nick[data.user];
      if ((user != null) && !user.flags.admin && !user.flags.moderator) {
        user.setFlag("approved", data.approved);
        return this.send({
          name: "set_project_approved",
          user: data.user,
          approved: data.approved,
          request_id: data.request_id
        });
      }
    }
  }

  setProjectTags(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.public && !this.user.flags["validated"]) {
      return;
    }
    if (data.project == null) {
      return;
    }
    project = this.user.findProject(data.project);
    if ((project == null) && this.user.flags.admin) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && (data.tags != null)) {
      this.content.setProjectTags(project, data.tags);
      return this.send({
        name: "set_project_tags",
        id: project.id,
        tags: project.tags,
        request_id: data.request_id
      });
    }
  }

  setProjectOption(data) {
    var j, len1, project, ref, v;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.value == null) {
      return this.sendError("no value");
    }
    project = this.user.findProject(data.project);
    if (project != null) {
      switch (data.option) {
        case "title":
          if (!project.setTitle(data.value)) {
            this.send({
              name: "error",
              value: project.title,
              request_id: data.request_id
            });
          }
          break;
        case "slug":
          if (!project.setSlug(data.value)) {
            this.send({
              name: "error",
              value: project.slug,
              request_id: data.request_id
            });
          }
          break;
        case "description":
          project.set("description", data.value);
          break;
        case "code":
          if (!project.setCode(data.value)) {
            this.send({
              name: "error",
              value: project.code,
              request_id: data.request_id
            });
          }
          break;
        case "platforms":
          if (Array.isArray(data.value)) {
            project.setPlatforms(data.value);
          }
          break;
        case "libs":
          if (Array.isArray(data.value)) {
            ref = data.value;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              v = ref[j];
              if (typeof v !== "string" || v.length > 100 || data.value.length > 20) {
                return;
              }
            }
            project.set("libs", data.value);
          }
          break;
        case "tabs":
          if (typeof data.value === "object") {
            project.set("tabs", data.value);
          }
          break;
        case "plugins":
          if (typeof data.value === "object") {
            project.set("plugins", data.value);
          }
          break;
        case "libraries":
          if (typeof data.value === "object") {
            project.set("libraries", data.value);
          }
          break;
        case "networking":
          project.set("networking", (data.value != null) && data.value !== false);
          break;
        case "type":
          if (typeof data.value === "string") {
            this.content.setProjectType(project, data.value);
          }
          break;
        case "orientation":
          if (typeof data.value === "string") {
            project.setOrientation(data.value);
          }
          break;
        case "aspect":
          if (typeof data.value === "string") {
            project.setAspect(data.value);
          }
          break;
        case "graphics":
          if (typeof data.value === "string") {
            project.setGraphics(data.value);
          }
          break;
        case "unlisted":
          project.set("unlisted", data.value ? true : false);
          break;
        case "language":
          project.set("language", data.value);
      }
      if (project.manager != null) {
        project.manager.propagateOptions(this);
      }
      return project.touch();
    }
  }

  setProjectProperty(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project == null) {
      return this.sendError("no project");
    }
    if (data.property == null) {
      return this.sendError("no property");
    }
    project = this.user.findProject(data.project);
    if (project != null) {
      return project.setProperty(data.property, data.value);
    }
  }

  deleteProject(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    project = this.user.findProject(data.project);
    if (project != null) {
      this.user.deleteProject(project);
      return this.send({
        name: "project_deleted",
        id: project.id,
        request_id: data.request_id
      });
    }
  }

  getProjectList(data) {
    var j, k, len1, len2, link, list, p, source;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    source = this.user.listProjects();
    list = [];
    for (j = 0, len1 = source.length; j < len1; j++) {
      p = source[j];
      if (!p.deleted) {
        list.push({
          id: p.id,
          owner: {
            id: p.owner.id,
            nick: p.owner.nick
          },
          title: p.title,
          slug: p.slug,
          code: p.code,
          description: p.description,
          tags: p.tags,
          flags: p.flags,
          poster: (p.files != null) && (p.files["sprites/poster.png"] != null),
          platforms: p.platforms,
          controls: p.controls,
          type: p.type,
          orientation: p.orientation,
          aspect: p.aspect,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          tabs: p.tabs,
          plugins: p.plugins,
          libraries: p.libraries,
          networking: p.networking,
          properties: p.properties,
          date_created: p.date_created,
          last_modified: p.last_modified,
          public: p.public,
          unlisted: p.unlisted,
          size: p.getSize(),
          users: p.listUsers()
        });
      }
    }
    source = this.user.listProjectLinks();
    for (k = 0, len2 = source.length; k < len2; k++) {
      link = source[k];
      if (!link.project.deleted) {
        p = link.project;
        list.push({
          id: p.id,
          owner: {
            id: p.owner.id,
            nick: p.owner.nick
          },
          accepted: link.accepted,
          title: p.title,
          slug: p.slug,
          code: p.code,
          description: p.description,
          tags: p.tags,
          flags: p.flags,
          poster: (p.files != null) && (p.files["sprites/poster.png"] != null),
          platforms: p.platforms,
          controls: p.controls,
          type: p.type,
          orientation: p.orientation,
          aspect: p.aspect,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          tabs: p.tabs,
          plugins: p.plugins,
          libraries: p.libraries,
          networking: p.networking,
          date_created: p.date_created,
          last_modified: p.last_modified,
          public: p.public,
          unlisted: p.unlisted,
          users: p.listUsers()
        });
      }
    }
    return this.send({
      name: "project_list",
      list: list,
      request_id: data != null ? data.request_id : void 0
    });
  }

  lockProjectFile(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      //console.info JSON.stringify data
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.lockFile(this, data.file);
    }
  }

  writeProjectFile(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      project.manager.writeProjectFile(this, data);
      if (typeof data.file === "string") {
        if (data.file.startsWith("ms/")) {
          this.user.progress.recordTime("time_coding");
          if (data.characters != null) {
            this.user.progress.incrementLimitedStat("characters_typed", data.characters);
          }
          if (data.lines != null) {
            this.user.progress.incrementLimitedStat("lines_of_code", data.lines);
          }
          return this.checkUpdates();
        } else if (data.file.startsWith("sprites/")) {
          this.user.progress.recordTime("time_drawing");
          if (data.pixels != null) {
            this.user.progress.incrementLimitedStat("pixels_drawn", data.pixels);
            return this.checkUpdates();
          }
        } else if (data.file.startsWith("maps/")) {
          this.user.progress.recordTime("time_mapping");
          if (data.cells != null) {
            this.user.progress.incrementLimitedStat("map_cells_drawn", data.cells);
            return this.checkUpdates();
          }
        }
      }
    }
  }

  renameProjectFile(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.renameProjectFile(this, data);
    }
  }

  deleteProjectFile(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.deleteProjectFile(this, data);
    }
  }

  readProjectFile(data) {
    var project;
    if (this.user == null) {
      //console.info "session.readProjectFile "+JSON.stringify data
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.readProjectFile(this, data);
    }
  }

  listProjectFiles(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.listProjectFiles(this, data);
    }
  }

  listPublicProjectFiles(data) {
    var manager, project;
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      manager = this.getProjectManager(project);
      return manager.listProjectFiles(this, data);
    }
  }

  readPublicProjectFile(data) {
    var manager, project;
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project.public) {
      manager = this.getProjectManager(project);
      return project.manager.readProjectFile(this, data);
    }
  }

  listenToProject(data) {
    var project, user;
    user = data.user;
    project = data.project;
    if ((user != null) && (project != null)) {
      user = this.content.findUserByNick(user);
      if (user != null) {
        project = user.findProjectBySlug(project);
        if (project != null) {
          if ((this.project != null) && (this.project.manager != null)) {
            this.project.manager.removeListener(this);
          }
          this.project = project;
          if (this.project.manager == null) {
            new ProjectManager(this.project);
          }
          return this.project.manager.addListener(this);
        }
      }
    }
  }

  getFileVersions(data) {
    var project, user;
    user = data.user;
    project = data.project;
    if ((user != null) && (project != null)) {
      user = this.content.findUserByNick(user);
      if (user != null) {
        project = user.findProjectBySlug(project);
        if (project != null) {
          if (project.manager == null) {
            new ProjectManager(project);
          }
          return project.manager.getFileVersions((res) => {
            return this.send({
              name: "project_file_versions",
              data: res,
              request_id: data.request_id
            });
          });
        }
      }
    }
  }

  getPublicProjects(data) {
    var found, i, j, k, l, len1, len2, len3, list, m, offset, p, ref, ref1, ref2, ref3, search, source, t, tags, type;
    switch (data.ranking) {
      case "new":
        source = this.content.new_projects;
        break;
      case "top":
        source = this.content.top_projects;
        break;
      default:
        source = this.content.hot_projects;
    }
    list = [];
    tags = Array.isArray(data.tags) ? data.tags : [];
    search = typeof data.search === "string" ? data.search : "";
    search = search.trim();
    type = data.type || "all";
    offset = data.offset || 0;
    for (i = j = ref = offset, ref1 = source.length - 1; j <= ref1; i = j += 1) {
      p = source[i];
      if (list.length >= 25) {
        break;
      }
      offset = i + 1;
      if (p.public && !p.deleted && !p.owner.flags.censored) {
        if (search) {
          found = false;
          found |= p.title.toLowerCase().includes(search);
          found |= p.description.toLowerCase().includes(search);
          found |= p.owner.nick.toLowerCase().includes(search);
          ref2 = p.tags;
          for (k = 0, len1 = ref2.length; k < len1; k++) {
            t = ref2[k];
            found |= t.includes(search);
          }
          if (!found) {
            continue;
          }
        }
        if (tags.length > 0) {
          found = false;
          for (l = 0, len2 = tags.length; l < len2; l++) {
            t = tags[l];
            if (p.tags.indexOf(t) >= 0) {
              found = true;
              break;
            }
          }
          if (!found) {
            continue;
          }
        }
        if (type !== "all" && p.type !== type) {
          continue;
        }
        list.push({
          id: p.id,
          title: p.title,
          description: p.description,
          poster: (p.files != null) && (p.files["sprites/poster.png"] != null),
          type: p.type,
          tags: p.tags,
          flags: p.flags,
          slug: p.slug,
          owner: p.owner.nick,
          owner_info: {
            tier: p.owner.flags.tier,
            profile_image: p.owner.flags.profile_image,
            approved: p.owner.flags.approved
          },
          likes: p.likes,
          liked: (this.user != null) && this.user.isLiked(p.id),
          tags: p.tags,
          date_published: p.first_published,
          last_modified: p.last_modified,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          tabs: p.tabs,
          plugins: p.plugins,
          libraries: p.libraries,
          networking: p.networking
        });
      }
    }
    tags = [];
    ref3 = this.content.sorted_tags;
    for (m = 0, len3 = ref3.length; m < len3; m++) {
      t = ref3[m];
      tags.push(t.tag);
      if (tags.length > 50) {
        break;
      }
    }
    return this.send({
      name: "public_projects",
      list: list,
      tags: tags,
      offset: offset,
      request_id: data.request_id
    });
  }

  getPublicPlugins(data) {
    var j, len1, list, p, source;
    source = this.content.plugin_projects;
    list = [];
    for (j = 0, len1 = source.length; j < len1; j++) {
      p = source[j];
      if (p.public && !p.deleted && !p.owner.flags.censored) {
        list.push({
          id: p.id,
          title: p.title,
          description: p.description,
          poster: (p.files != null) && (p.files["sprites/poster.png"] != null),
          type: p.type,
          tags: p.tags,
          flags: p.flags,
          slug: p.slug,
          owner: p.owner.nick,
          owner_info: {
            tier: p.owner.flags.tier,
            profile_image: p.owner.flags.profile_image,
            approved: p.owner.flags.approved
          },
          likes: p.likes,
          liked: (this.user != null) && this.user.isLiked(p.id),
          date_published: p.first_published,
          last_modified: p.last_modified,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          tabs: p.tabs,
          plugins: p.plugins,
          libraries: p.libraries,
          networking: p.networking
        });
      }
    }
    return this.send({
      name: "public_plugins",
      list: list,
      request_id: data.request_id
    });
  }

  getPublicLibraries(data) {
    var j, len1, list, p, source;
    source = this.content.library_projects;
    list = [];
    for (j = 0, len1 = source.length; j < len1; j++) {
      p = source[j];
      if (p.public && !p.deleted && !p.owner.flags.censored) {
        list.push({
          id: p.id,
          title: p.title,
          description: p.description,
          poster: (p.files != null) && (p.files["sprites/poster.png"] != null),
          type: p.type,
          tags: p.tags,
          flags: p.flags,
          slug: p.slug,
          owner: p.owner.nick,
          owner_info: {
            tier: p.owner.flags.tier,
            profile_image: p.owner.flags.profile_image,
            approved: p.owner.flags.approved
          },
          likes: p.likes,
          liked: (this.user != null) && this.user.isLiked(p.id),
          date_published: p.first_published,
          last_modified: p.last_modified,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          tabs: p.tabs,
          plugins: p.plugins,
          libraries: p.libraries,
          networking: p.networking
        });
      }
    }
    return this.send({
      name: "public_libraries",
      list: list,
      request_id: data.request_id
    });
  }

  getPublicProject(msg) {
    var owner, p, project, res;
    owner = msg.owner;
    project = msg.project;
    if ((owner != null) && (project != null)) {
      owner = this.content.findUserByNick(owner);
      if (owner != null) {
        p = owner.findProjectBySlug(project);
        if ((p != null) && p.public) {
          res = {
            id: p.id,
            title: p.title,
            description: p.description,
            poster: (p.files != null) && (p.files["sprites/poster.png"] != null),
            type: p.type,
            tags: p.tags,
            flags: p.flags,
            slug: p.slug,
            owner: p.owner.nick,
            owner_info: {
              tier: p.owner.flags.tier,
              profile_image: p.owner.flags.profile_image,
              approved: p.owner.flags.approved
            },
            likes: p.likes,
            liked: (this.user != null) && this.user.isLiked(p.id),
            date_published: p.first_published,
            last_modified: p.last_modified,
            graphics: p.graphics,
            language: p.language,
            libs: p.libs,
            tabs: p.tabs,
            plugins: p.plugins,
            libraries: p.libraries,
            networking: p.networking
          };
          return this.send({
            name: "get_public_project",
            project: res,
            request_id: msg.request_id
          });
        }
      }
    }
  }

  toggleLike(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.user.flags.validated) {
      return this.sendError("not validated");
    }
    project = this.content.projects[data.project];
    if (project != null) {
      if (this.user.isLiked(project.id)) {
        this.user.removeLike(project.id);
        project.likes--;
      } else {
        this.user.addLike(project.id);
        project.likes++;
        if (project.likes >= 5) {
          project.owner.progress.unlockAchievement("community/5_likes");
        }
      }
      return this.send({
        name: "project_likes",
        likes: project.likes,
        liked: this.user.isLiked(project.id),
        request_id: data.request_id
      });
    }
  }

  inviteToProject(data) {
    var project, user;
    if (this.user == null) {
      return this.sendError("not connected", data.request_id);
    }
    user = this.content.findUserByNick(data.user);
    if (user == null) {
      return this.sendError("user not found", data.request_id);
    }
    project = this.user.findProject(data.project);
    if (project == null) {
      return this.sendError("project not found", data.request_id);
    }
    this.setCurrentProject(project);
    return project.manager.inviteUser(this, user);
  }

  acceptInvite(data) {
    var j, k, len1, len2, li, link, ref, ref1;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    ref = this.user.project_links;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      link = ref[j];
      if (link.project.id === data.project) {
        link.accept();
        this.setCurrentProject(link.project);
        if (link.project.manager != null) {
          link.project.manager.propagateUserListChange();
        }
        ref1 = this.user.listeners;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          li = ref1[k];
          li.getProjectList();
        }
      }
    }
  }

  removeProjectUser(data) {
    var j, k, len1, len2, li, link, nick, project, ref, ref1, user;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project == null) {
      return this.sendError("project not found", data.request_id);
    }
    nick = data.user;
    if (nick == null) {
      return;
    }
    user = this.content.findUserByNick(nick);
    if (this.user !== project.owner && this.user !== user) {
      return;
    }
    ref = project.users;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      link = ref[j];
      if ((link != null) && (link.user != null) && link.user.nick === nick) {
        link.remove();
        if (this.user === project.owner) {
          this.setCurrentProject(project);
        } else {
          this.send({
            name: "project_link_deleted",
            request_id: data.request_id
          });
        }
        if (project.manager != null) {
          project.manager.propagateUserListChange();
        }
        if (user != null) {
          ref1 = user.listeners;
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            li = ref1[k];
            li.getProjectList();
          }
        }
      }
    }
  }

  sendValidationMail(data) {
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (this.server.rate_limiter.accept("send_mail_user", this.user.id)) {
      this.server.content.sendValidationMail(this.user);
      if (data != null) {
        this.send({
          name: "send_validation_mail",
          request_id: data.request_id
        });
      }
    }
  }

  changeNick(data) {
    if (this.user == null) {
      return;
    }
    if (data.nick == null) {
      return;
    }
    if (!RegexLib.nick.test(data.nick)) {
      return this.send({
        name: "error",
        value: "Incorrect nickname",
        request_id: data.request_id
      });
    } else {
      if ((this.server.content.findUserByNick(data.nick) != null) || this.reserved_nicks[data.nick]) {
        return this.send({
          name: "error",
          value: "Nickname not available",
          request_id: data.request_id
        });
      } else {
        this.server.content.changeUserNick(this.user, data.nick);
        return this.send({
          name: "change_nick",
          nick: data.nick,
          request_id: data.request_id
        });
      }
    }
  }

  changeEmail(data) {
    if (this.user == null) {
      return;
    }
    if (data.email == null) {
      return;
    }
    if (!RegexLib.email.test(data.email)) {
      return this.send({
        name: "error",
        value: "Incorrect email",
        request_id: data.request_id
      });
    } else {
      if (this.server.content.findUserByEmail(data.email) != null) {
        return this.send({
          name: "error",
          value: "E-mail is already used for another account",
          request_id: data.request_id
        });
      } else {
        this.user.setFlag("validated", false);
        this.user.resetValidationToken();
        this.server.content.changeUserEmail(this.user, data.email);
        this.sendValidationMail();
        return this.send({
          name: "change_email",
          email: data.email,
          request_id: data.request_id
        });
      }
    }
  }

  changeNewsletter(data) {
    if (this.user == null) {
      return;
    }
    this.user.setFlag("newsletter", data.newsletter);
    return this.send({
      name: "change_newsletter",
      newsletter: data.newsletter,
      request_id: data.request_id
    });
  }

  changeExperimental(data) {
    if ((this.user == null) || !this.user.flags.validated) {
      return;
    }
    this.user.setFlag("experimental", data.experimental);
    return this.send({
      name: "change_experimental",
      experimental: data.experimental,
      request_id: data.request_id
    });
  }

  setUserSetting(data) {
    if (this.user == null) {
      return;
    }
    if ((data.setting == null) || (data.value == null)) {
      return;
    }
    return this.user.setSetting(data.setting, data.value);
  }

  setUserProfile(data) {
    var content, file;
    if (this.user == null) {
      return;
    }
    if (data.image != null) {
      if (data.image === 0) {
        this.user.setFlag("profile_image", false);
      } else {
        file = `${this.user.id}/profile_image.png`;
        content = new Buffer(data.image, "base64");
        this.server.content.files.write(file, content, () => {
          this.user.setFlag("profile_image", true);
          return this.send({
            name: "set_user_profile",
            request_id: data.request_id
          });
        });
        return;
      }
    }
    if (data.description != null) {
      this.user.set("description", data.description);
    }
    return this.send({
      name: "set_user_profile",
      request_id: data.request_id
    });
  }

  getLanguage(msg) {
    var lang;
    if (msg.language == null) {
      return;
    }
    lang = this.server.content.translator.languages[msg.language];
    lang = lang != null ? lang.export() : "{}";
    return this.send({
      name: "get_language",
      language: lang,
      request_id: msg.request_id
    });
  }

  getTranslationList(msg) {
    return this.send({
      name: "get_translation_list",
      list: this.server.content.translator.list,
      request_id: msg.request_id
    });
  }

  setTranslation(msg) {
    var lang, source, translation;
    if (this.user == null) {
      return;
    }
    lang = msg.language;
    if (!this.user.flags["translator_" + lang]) {
      return;
    }
    source = msg.source;
    translation = msg.translation;
    if (!this.server.content.translator.languages[lang]) {
      this.server.content.translator.createLanguage(lang);
    }
    return this.server.content.translator.languages[lang].set(this.user.id, source, translation);
  }

  addTranslation(msg) {
    var source;
    if (this.user == null) {
      return;
    }
    //return if not @user.flags.admin
    source = msg.source;
    return this.server.content.translator.reference(source);
  }

  getProjectComments(data) {
    var project;
    if (data.project == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project.public) {
      return this.send({
        name: "project_comments",
        request_id: data.request_id,
        comments: project.comments.getAll()
      });
    }
  }

  addProjectComment(data) {
    var project;
    if (data.project == null) {
      return;
    }
    if (data.text == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project.public) {
      if ((this.user != null) && this.user.flags.validated && !this.user.flags.banned && !this.user.flags.censored) {
        if (!this.server.rate_limiter.accept("post_comment_user", this.user.id)) {
          return;
        }
        project.comments.add(this.user, data.text);
        return this.send({
          name: "add_project_comment",
          request_id: data.request_id
        });
      }
    }
  }

  deleteProjectComment(data) {
    var c, project;
    if (data.project == null) {
      return;
    }
    if (data.id == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project.public) {
      if (this.user != null) {
        c = project.comments.get(data.id);
        if ((c != null) && (c.user === this.user || this.user.flags.admin)) {
          c.remove();
          return this.send({
            name: "delete_project_comment",
            request_id: data.request_id
          });
        }
      }
    }
  }

  editProjectComment(data) {
    var c, project;
    if (data.project == null) {
      return;
    }
    if (data.id == null) {
      return;
    }
    if (data.text == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project.public) {
      if (this.user != null) {
        c = project.comments.get(data.id);
        if ((c != null) && c.user === this.user) {
          c.edit(data.text);
          return this.send({
            name: "edit_project_comment",
            request_id: data.request_id
          });
        }
      }
    }
  }

  tutorialCompleted(msg) {
    if (this.user == null) {
      return;
    }
    if ((msg.id == null) || typeof msg.id !== "string") {
      return;
    }
    if (!msg.id.startsWith("tutorials/")) {
      return;
    }
    this.user.progress.unlockAchievement(msg.id);
    return this.checkUpdates();
  }

  checkUpdates() {
    if (this.user != null) {
      if (this.user.progress.achievements_update !== this.achievements_update) {
        this.achievements_update = this.user.progress.achievements_update;
        this.sendAchievements();
      }
      if (this.user.progress.stats_update !== this.stats_update) {
        this.stats_update = this.user.progress.stats_update;
        return this.sendUserStats();
      }
    }
  }

  sendAchievements() {
    if (this.user == null) {
      return;
    }
    return this.send({
      name: "achievements",
      achievements: this.user.progress.exportAchievements()
    });
  }

  sendUserStats() {
    if (this.user == null) {
      return;
    }
    return this.send({
      name: "user_stats",
      stats: this.user.progress.exportStats()
    });
  }

  buildProject(msg) {
    var build, project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (msg.project != null) {
      project = this.content.projects[msg.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      if (!project.manager.canWrite(this.user)) {
        return;
      }
      if (msg.target == null) {
        return;
      }
      build = this.server.build_manager.startBuild(project, msg.target);
      return this.send({
        name: "build_project",
        request_id: msg.request_id,
        build: build != null ? build.export() : null
      });
    }
  }

  getBuildStatus(msg) {
    var build, project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (msg.project != null) {
      project = this.content.projects[msg.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      if (!project.manager.canWrite(this.user)) {
        return;
      }
      if (msg.target == null) {
        return;
      }
      build = this.server.build_manager.getBuildInfo(project, msg.target);
      return this.send({
        name: "build_project",
        request_id: msg.request_id,
        build: build != null ? build.export() : null,
        active_target: this.server.build_manager.hasBuilder(msg.target)
      });
    }
  }

  timeCheck() {
    if (Date.now() > this.last_active + 5 * 60000) { // 5 minutes prevents breaking large assets uploads
      this.socket.close();
      this.server.sessionClosed(this);
      this.socket.terminate();
    }
    if ((this.upload_request_activity != null) && Date.now() > this.upload_request_activity + 60000) {
      this.upload_request_id = -1;
      return this.upload_request_buffers = [];
    }
  }

  startBuilder(msg) {
    if (msg.target != null) {
      if (msg.key === this.server.config["builder-key"]) {
        this.server.sessionClosed(this);
        return this.server.build_manager.registerBuilder(this, msg.target);
      }
    }
  }

  backupComplete(msg) {
    if (msg.key === this.server.config["backup-key"]) {
      this.server.sessionClosed(this);
      return this.server.last_backup_time = Date.now();
    }
  }

  relayServerAvailable(msg) {
    if (msg.key === this.server.config["relay-key"]) {
      this.server.relay_server = {
        address: msg.address,
        session: this,
        time: Date.now()
      };
      this.disconnected = () => {
        if ((this.server.relay_server != null) && this === this.server.relay_server.session) {
          console.info("relay server disconnected: " + this.server.relay_server.address);
          return delete this.server.relay_server;
        }
      };
      return console.info("relay server available: " + msg.address);
    }
  }

  getRelayServer(msg) {
    if (!this.server.config.delegate_relay_service) {
      return this.send({
        name: "get_relay_server",
        address: "self",
        request_id: msg.request_id
      });
    } else {
      if (this.server.relay_server != null) {
        return this.send({
          name: "get_relay_server",
          address: this.server.relay_server.address,
          request_id: msg.request_id
        });
      } else {
        return this.send({
          name: "error",
          error: "Relay server not available",
          request_id: msg.request_id
        });
      }
    }
  }

  getServerToken(msg) {
    var chars, i, id, j, manager, owner, project, token, user, value;
    if (!msg.user_token) {
      return;
    }
    if (!msg.server_id) {
      return;
    }
    if (this.server.config.standalone && this.content.user_count === 1) {
      user = this.server.content.users[0];
    } else {
      token = this.content.findToken(msg.user_token);
      if ((token != null) && (token.user != null) && !token.user.flags.deleted) {
        user = token.user;
      }
    }
    if (user != null) {
      id = msg.server_id.split("/");
      owner = this.server.content.users_by_nick[id[0]];
      if (owner != null) {
        project = owner.findProjectBySlug(id[1]);
        if (project != null) {
          manager = new ProjectManager(project);
          if (manager.canWrite(user)) {
            value = "";
            chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (i = j = 0; j <= 31; i = j += 1) {
              value += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            token = {
              value: value,
              time: Date.now(),
              server_id: msg.server_id
            };
            if (this.server.server_tokens == null) {
              this.server.server_tokens = {};
            }
            this.server.server_tokens[value] = token;
            return this.send({
              name: "get_server_token",
              token: value,
              request_id: msg.request_id
            });
          }
        }
      }
    }
  }

  serverTokensCleanup() {
    var key, ref, value;
    if (this.server.server_tokens != null) {
      ref = this.server.server_tokens;
      for (key in ref) {
        value = ref[key];
        if (value.time < Date.now() - 60000) {
          delete this.server.server_tokens[key];
        }
      }
    }
  }

  checkServerToken(msg) {
    this.serverTokensCleanup();
    if (msg.token == null) {
      return;
    }
    return this.serverTokenCheck(msg.token, msg.server_id, () => {
      return this.send({
        name: "check_server_token",
        server_id: msg.server_id,
        token: msg.token,
        valid: true,
        request_id: msg.request_id
      });
    });
  }

  serverTokenCheck(token, server_id, callback) {
    var t;
    if (this.server.server_tokens != null) {
      t = this.server.server_tokens[token];
      if ((t != null) && t.server_id === server_id) {
        delete this.server.server_tokens[token];
        return callback();
      }
    }
  }

  uploadRequest(msg) {
    if (this.user == null) {
      return;
    }
    if (msg.size == null) {
      return this.sendError("Bad request");
    }
    if (msg.request_id == null) {
      return this.sendError("Bad request");
    }
    if (msg.request == null) {
      return this.sendError("Bad request");
    }
    if (!this.server.rate_limiter.accept("file_upload_user", this.user.id)) {
      return this.sendError("Rate limited", msg.request_id);
    }
    if (msg.size > 100000000) { // 100 Mb max
      return this.sendError("File size limit exceeded");
    }
    this.upload_request_id = msg.request_id;
    this.upload_request_size = msg.size;
    this.upload_uploaded = 0;
    this.upload_request_buffers = [];
    this.upload_request_request = msg.request;
    this.upload_request_activity = Date.now();
    return this.send({
      name: "upload_request",
      request_id: msg.request_id
    });
  }

  bufferReceived(buffer) {
    var b, buf, c, count, error, id, j, len, len1, msg, ref;
    if (buffer.byteLength >= 4) {
      id = buffer.readInt32LE(0);
      if (id === this.upload_request_id) {
        len = buffer.byteLength - 4;
        if (len > 0 && this.upload_uploaded < this.upload_request_size) {
          buf = Buffer.alloc(len);
          buffer.copy(buf, 0, 4, buffer.byteLength);
          this.upload_request_buffers.push(buf);
          this.upload_uploaded += len;
          this.upload_request_activity = Date.now();
        }
        if (this.upload_uploaded >= this.upload_request_size) {
          msg = this.upload_request_request;
          buf = Buffer.alloc(this.upload_request_size);
          count = 0;
          ref = this.upload_request_buffers;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            b = ref[j];
            b.copy(buf, count, 0, b.byteLength);
            count += b.byteLength;
          }
          msg.data = buf;
          msg.request_id = id;
          try {
            if (msg.name != null) {
              c = this.commands[msg.name];
              if (c != null) {
                return c(msg);
              }
            }
          } catch (error1) {
            error = error1;
            return console.error(error);
          }
        } else {
          return this.send({
            name: "next_chunk",
            request_id: id
          });
        }
      }
    }
  }

};

module.exports = this.Session;
