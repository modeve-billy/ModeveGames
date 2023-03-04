this.About = (function() {
  function About(app) {
    this.app = app;
    this.current = "about";
    this.loaded = {};
    this.sections = ["about", "changelog", "terms", "privacy"];
    this.init();
  }

  About.prototype.init = function() {
    var i, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      results.push((function(_this) {
        return function(s) {
          return document.getElementById("about-menu-" + s).addEventListener("click", function() {
            return _this.setSection(s);
          });
        };
      })(this)(s));
    }
    return results;
  };

  About.prototype.setSection = function(section) {
    var i, len, ref, s;
    this.current = section;
    ref = this.sections;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if (s === section) {
        document.getElementById("about-menu-" + s).classList.add("selected");
      } else {
        document.getElementById("about-menu-" + s).classList.remove("selected");
      }
    }
    return this.load(section, (function(_this) {
      return function(text) {
        return _this.update(text);
      };
    })(this));
  };

  About.prototype.load = function(section, callback) {
    var ref, req;
    if (this.loaded[section] != null) {
      if (callback != null) {
        callback(this.loaded[section]);
      }
      return;
    }
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            _this.loaded[section] = req.responseText;
            if (callback != null) {
              return callback(_this.loaded[section]);
            }
          }
        }
      };
    })(this);
    if (((ref = this.app.translator.lang) === "fr" || ref === "it" || ref === "pt" || ref === "ru") && section !== "changelog") {
      req.open("GET", location.origin + ("/doc/" + this.app.translator.lang + "/" + section + ".md"));
    } else {
      req.open("GET", location.origin + ("/doc/en/" + section + ".md"));
    }
    return req.send();
  };

  About.prototype.update = function(doc) {
    var e, element, i, len, list;
    element = document.getElementById("about-content");
    element.innerHTML = DOMPurify.sanitize(marked(doc));
    list = element.getElementsByTagName("a");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.target = "_blank";
    }
  };

  return About;

})();
