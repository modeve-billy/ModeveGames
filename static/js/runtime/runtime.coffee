class @Runtime
  constructor:(@url,@sources,@resources,@listener)->
    @screen = new Screen @

    @audio = new AudioCore @
    @keyboard = new Keyboard()
    @gamepad = new Gamepad()
    @asset_manager = new AssetManager @

    @sprites = {}
    @maps = {}
    @sounds = {}
    @music = {}
    @assets = {}
    @touch = {}
    @mouse = @screen.mouse
    @previous_init = null
    @random = new Random(0)
    @orientation = window.orientation
    @aspect = window.aspect
    @report_errors = true

    @log = (text)=>
      @listener.log text

    @update_memory = {}

    @time_machine = new TimeMachine @
    @createDropFeature()
    window.ms_async_load = false
    @connections = []

  addConnection:(connection)->
    @connections.push connection

  updateSource:(file,src,reinit=false)->
    return false if not @vm?
    return false if src == @update_memory[file]
    @update_memory[file] = src
    @audio.cancelBeeps()
    @screen.clear()

    try
      @vm.run(src,3000,file)

      @listener.postMessage
        name: "compile_success"
        file: file

      @reportWarnings()
      if @vm.error_info?
        err = @vm.error_info
        err.type = "init"
        err.file = file
        @listener.reportError err
        return false

      if @vm.runner.getFunctionSource?
        init = @vm.runner.getFunctionSource "init"
        if init? and init != @previous_init and reinit
          @previous_init = init
          @vm.call("init")
          if @vm.error_info?
            err = @vm.error_info
            err.type = "init"
            @listener.reportError err

      return true
    catch err
      if @report_errors
        console.error err
        err.file = file
        @listener.reportError err
        return false

  start:()->
    if window.ms_async_load
      @startReady()

    for i in @resources.images
      s = LoadSprite @url+"sprites/"+i.file+"?v="+i.version,i.properties,()=>
        @updateMaps()
        @checkStartReady()

      name = i.file.split(".")[0].replace /-/g,"/"
      s.name = name
      @sprites[name] = s

    if Array.isArray(@resources.maps)
      for m in @resources.maps
        name = m.file.split(".")[0].replace(/-/g,"/")
        @maps[name] = LoadMap @url+"maps/#{m.file}?v=#{m.version}",()=>
          @checkStartReady()
        @maps[name].name = name

    else if @resources.maps?
      if not window.player?
        window.player = @listener

      for key,value of @resources.maps
        @updateMap(key,0,value)

    for s in @resources.sounds
      name = s.file.split(".")[0]
      s = new Sound(@audio,@url+"sounds/"+s.file+"?v="+s.version)
      s.name = name
      @sounds[name] = s

    for m in @resources.music
      name = m.file.split(".")[0]
      m = new Music(@audio,@url+"music/"+m.file+"?v="+m.version)
      m.name = name
      @music[name] = m

    for a in @resources.assets
      name = a.file.split(".")[0]
      name = name.replace /-/g,"/"
      a.name = name
      @assets[name] = a

    return

  checkStartReady:()->
    count = 0
    ready = 0

    for key,value of @sprites
      count += 1
      if value.ready
        ready += 1

    for key,value of @maps
      count += 1
      if value.ready
        ready += 1

    if ready < count
      if not @loading_bar_time? or Date.now()>@loading_bar_time+16
        @loading_bar_time = Date.now()
        @screen.clear()
        @screen.drawRect 0,0,100,10,"#DDD"
        progress = ready/count
        @screen.fillRect -(1-progress)*48,0,progress*96,6,"#DDD"
        if window.ms_async_load and @vm?
          @vm.context.global.system.loading = Math.floor(ready/count*100)

      if not window.ms_async_load
        return
    else
      if window.ms_async_load and @vm?
        @vm.context.global.system.loading = 100

    if not @started
      @startReady()

  startReady:()->
    @started = true
    meta =
      print: (text)=>
        if (typeof text == "object" or typeof text == "function") and @vm?
          text = @vm.runner.toString(text)
        @listener.log(text)

    global =
      screen: @screen.getInterface()
      audio: @audio.getInterface()
      keyboard: @keyboard.keyboard
      gamepad: @gamepad.status
      sprites: @sprites
      sounds: @sounds
      music: @music
      assets: @assets
      asset_manager: @asset_manager.getInterface()
      maps: @maps
      touch: @touch
      mouse: @mouse
      fonts: window.fonts
      Sound: Sound.createSoundClass @audio
      Image: msImage
      Sprite: Sprite
      Map: MicroMap

    if window.graphics == "M3D"
      global.M3D = M3D
      M3D.runtime = @
    else if window.graphics == "M2D"
      global.M2D = M2D
      M2D.runtime = @
    else if window.graphics == "PIXI"
      global.PIXI = PIXI
      PIXI.runtime = @
    else if window.graphics == "BABYLON"
      global.BABYLON = BABYLON
      BABYLON.runtime = @

    for lib in window.ms_libs
      switch lib
        when "matterjs" then global.Matter = Matter
        when "cannonjs" then global.CANNON = CANNON

    namespace = location.pathname
    @vm = new MicroVM(meta,global,namespace,location.hash == "#transpiler")
    if window.ms_use_server
      @vm.context.global.ServerConnection = MPServerConnection

    @vm.context.global.system.pause = ()=>
      @listener.codePaused()

    @vm.context.global.system.exit = ()=>
      @exit()

    if not window.ms_async_load
      @vm.context.global.system.loading = 100

    @vm.context.global.system.file = System.file
    @vm.context.global.system.javascript = System.javascript
    if window.ms_in_editor
      @vm.context.global.system.project = new ProjectInterface(@).interface

    System.runtime = @

    for file,src of @sources
      @updateSource(file,src,false)

    if @vm.runner.getFunctionSource?
      init = @vm.runner.getFunctionSource "init"
      if init?
        @previous_init = init
        @vm.call("init")
        if @vm.error_info?
          err = @vm.error_info
          err.type = "draw"
          @listener.reportError err
    else
      @vm.call("init")
      if @vm.error_info?
        err = @vm.error_info
        err.type = "draw"
        @listener.reportError err

    @dt = 1000/60
    @last_time = Date.now()
    @current_frame = 0
    @floating_frame = 0
    requestAnimationFrame(()=>@timer())
    @screen.startControl()
    @listener.postMessage
      name: "started"

  updateMaps:()->
    for key,map of @maps
      map.needs_update = true
    return

  runCommand:(command,callback)->
    try
      warnings = @vm.context.warnings
      @vm.clearWarnings()
      res = @vm.run(command,undefined,undefined,callback)
      @reportWarnings()
      @vm.context.warnings = warnings
      if @vm.error_info?
        err = @vm.error_info
        err.type = "exec"
        @listener.reportError err

      @watchStep()
      if not callback?
        return res
      else if res?
        callback(res)
      return null
    catch err
      @listener.reportError err

  projectFileUpdated:(type,file,version,data,properties)->
    switch type
      when "sprites"
        @updateSprite(file,version,data,properties)
      when "maps"
        @updateMap(file,version,data)
      when "ms"
        @updateCode(file,version,data)

  projectFileDeleted:(type,file)->
    switch type
      when "sprites"
        delete @sprites[file.substring(0,file.length-4).replace(/-/g,"/")]
      when "maps"
        delete @maps[file.substring(0,file.length-5).replace(/-/g,"/")]

  projectOptionsUpdated:(msg)->
    @orientation = msg.orientation
    @aspect = msg.aspect
    @screen.resize()

  updateSprite:(name,version,data,properties)->
    slug = name
    name = name.replace(/-/g,"/")
    if data?
      data = "data:image/png;base64,"+data
      if @sprites[name]?
        img = new Image
        img.crossOrigin = "Anonymous"
        img.src = data
        img.onload = ()=>
          UpdateSprite @sprites[name],img,properties
          @updateMaps()
      else
        @sprites[name] = LoadSprite data,properties,()=>@updateMaps()
        @sprites[name].name = name
    else
      if @sprites[name]?
        img = new Image
        img.crossOrigin = "Anonymous"
        img.src = @url+"sprites/"+slug+".png?v=#{version}"
        img.onload = ()=>
          UpdateSprite @sprites[name],img,properties
          @updateMaps()
      else
        @sprites[name] = LoadSprite @url+"sprites/"+slug+".png?v=#{version}",properties,()=>@updateMaps()
        @sprites[name].name = name

  updateMap:(name,version,data)->
    name = name.replace(/-/g,"/")
    if data?
      m = @maps[name]
      if m?
        UpdateMap m,data
        m.needs_update = true
      else
        m = new MicroMap(1,1,1,1)
        UpdateMap m,data
        @maps[name] = m
        @maps[name].name = name
    else
      url = @url+"maps/#{name}.json?v=#{version}"
      m = @maps[name]
      if m?
        m.loadFile(url)
      else
        @maps[name] = LoadMap url
        @maps[name].name = name

  updateCode:(name,version,data)->
    if data?
      @sources[name] = data
      if @vm? and data != @update_memory[name]
        @vm.clearWarnings()
      @updateSource name,data,true
    else
      url = @url+"ms/#{name}.ms?v=#{version}"

      req = new XMLHttpRequest()
      req.onreadystatechange = (event) =>
        if req.readyState == XMLHttpRequest.DONE
          if req.status == 200
            @sources[name] = req.responseText
            @updateSource(name,@sources[name],true)

      req.open "GET",url
      req.send()

  stop:()->
    @stopped = true
    @audio.cancelBeeps()

  stepForward:()->
    if @stopped
      @updateCall()
      @drawCall()
      if @vm.runner.tick?
        @vm.runner.tick()
      @watchStep()

  resume:()->
    if @stopped
      @stopped = false
      requestAnimationFrame(()=>@timer())

  timer:()->
    return if @stopped
    requestAnimationFrame(()=>@timer())
    time = Date.now()
    if Math.abs(time-@last_time)>160
      @last_time = time-16

    dt = time-@last_time
    @dt = @dt*.9+dt*.1
    @last_time = time

    @vm.context.global.system.fps = Math.round(fps = 1000/@dt)

    update_rate = @vm.context.global.system.update_rate
    if not update_rate? or not (update_rate > 0) or not isFinite(update_rate)
      update_rate = 60

    @floating_frame += @dt*update_rate/1000
    ds = Math.min(10,Math.round(@floating_frame-@current_frame))
    if (ds == 0 or ds == 2) and update_rate == 60 and Math.abs(fps-60) < 2
      #console.info "INCORRECT DS: "+ds+ " floating = "+@floating_frame+" current = "+@current_frame
      ds = 1
      @floating_frame = @current_frame+1

    for i in [1..ds] by 1
      @updateCall()
      if i < ds
        if @vm.runner.tick?
          @vm.runner.tick()

    @current_frame += ds
    @drawCall()
    if @vm.runner.tick?
      @vm.runner.tick()

    if ds>0
      @watchStep()

    #if ds != 1
    #  console.info "frame missed"
    #if @current_frame%60 == 0
    #  console.info("fps: #{Math.round(1000/@dt)}")

  updateCall:()->
    if @vm.runner.triggers_controls_update
      if not @vm.runner.updateControls?
        @vm.runner.updateControls = ()=> @updateControls()
    else
      @updateControls()

    try
      #time = Date.now()
      @vm.call("update")

      @time_machine.step()

      @reportWarnings()
      #console.info "update time: "+(Date.now()-time)
      if @vm.error_info?
        err = @vm.error_info
        err.type = "update"
        @listener.reportError err
    catch err
      @listener.reportError err if @report_errors

  drawCall:()->
    try
      @screen.initDraw()
      @screen.updateInterface()

      @vm.call("draw")
      @reportWarnings()
      if @vm.error_info?
        err = @vm.error_info
        err.type = "draw"
        @listener.reportError err
    catch err
      @listener.reportError err if @report_errors

  reportWarnings:()->
    if @vm?
      for key,value of @vm.context.warnings.invoking_non_function
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "non_function"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.using_undefined_variable
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "undefined_variable"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.assigning_field_to_undefined
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "assigning_undefined"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.assigning_api_variable
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "assigning_api_variable"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.assignment_as_condition
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "assignment_as_condition"
            line: value.line
            column: value.column
            file: value.file

      return

  updateControls:()->
    for c in @connections
      c.update()

    touches = Object.keys(@screen.touches)
    @touch.touching = if touches.length>0 then 1 else 0
    @touch.touches = []
    for key in touches
      t = @screen.touches[key]
      @touch.x = t.x
      @touch.y = t.y
      @touch.touches.push
        x: t.x
        y: t.y
        id: key

    if @mouse.pressed and not @previous_mouse_pressed
      @previous_mouse_pressed = true
      @mouse.press = 1
    else
      @mouse.press = 0

    if not @mouse.pressed and @previous_mouse_pressed
      @previous_mouse_pressed = false
      @mouse.release = 1
    else
      @mouse.release = 0

    @mouse.wheel = @screen.wheel or 0
    @screen.wheel = 0

    if @touch.touching and not @previous_touch
      @previous_touch = true
      @touch.press = 1
    else
      @touch.press = 0

    if not @touch.touching and @previous_touch
      @previous_touch = false
      @touch.release = 1
    else
      @touch.release = 0

    @vm.context.global.system.file.dropped = 0
    if @files_dropped?
      @vm.context.global.system.file.dropped = @files_dropped
      delete @files_dropped

    @vm.context.global.system.file.loaded = 0
    if @files_loaded?
      @vm.context.global.system.file.loaded = @files_loaded
      delete @files_loaded

    @gamepad.update()
    @keyboard.update()
    try
      @vm.context.global.system.inputs.gamepad = if @gamepad.count>0 then 1 else 0
    catch err

    return

  getAssetURL:(asset)->
    @url+"assets/"+asset+".glb"

  getWatcher:()-> @watcher or (@watcher = new Watcher @)
  watch:(variables)-> @getWatcher().watch(variables)
  watchStep:()-> @getWatcher().step()
  stopWatching:()-> @getWatcher().stop()

  exit:()->
    @stop()
    if @screen.clear?
      setTimeout (()=>@screen.clear()),1

    # microStudio embedded exit
    try
      @listener.exit()
    catch err

    # TODO: Cordova exit, this might work
    try
      if navigator.app? and navigator.app.exitApp?
        navigator.app.exitApp()
    catch err

    # TODO: Electron exit, may already be covered by window.close()

    # Windowed mode exit
    try
      window.close()
    catch err

  createDropFeature:()->
    document.addEventListener "dragenter",(event)=>
      event.stopPropagation()

    document.addEventListener "dragleave",(event)=>
      event.stopPropagation()

    document.addEventListener "dragover",(event)=>
      event.preventDefault()
      if player.runtime.screen.mouseMove?
        player.runtime.screen.mouseMove(event)

    document.addEventListener "drop",(event)=>
      event.preventDefault()
      event.stopPropagation()

      try
        list = []
        files = []
        for i in event.dataTransfer.items
          if i.kind == "file"
            file = i.getAsFile()
            files.push file

        result = []
        index = 0
        processFile = ()->
          if index < files.length
            f = files[index++]
            loadFile f,(data)->
              result.push
                name: f.name
                size: f.size
                content: data
                file_type: f.type

              processFile()
          else
            player.runtime.files_dropped = result
            window.dropHandler(result) if typeof window.dropHandler == "function"

        processFile()
      catch err
        console.error err

saveFile = (data,name,type)->
  a = document.createElement("a")
  document.body.appendChild(a)
  a.style = "display: none"
  blob = new Blob([data], {type: type })
  url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)

loadWaveFileLib = (callback)->
  if wavefile?
    callback()
  else
    s = document.createElement "script"
    s.src = location.origin+"/lib/wavefile/wavefile.js"
    document.head.appendChild s
    s.onload = ()->
      callback()

loadLameJSLib = (callback)->
  if lamejs?
    callback()
  else
    s = document.createElement "script"
    s.src = location.origin+"/lib/lamejs/lame.min.js"
    document.head.appendChild s
    s.onload = ()->
      callback()

writeProjectFile = (name,data,thumb)->
  window.player.postMessage
    name: "write_project_file"
    filename: name
    content: data
    thumbnail: thumb

arrayBufferToBase64 = ( buffer )->
  binary = ''
  bytes = new Uint8Array( buffer )
  len = bytes.byteLength
  for i in [0..len-1] by 1
    binary += String.fromCharCode( bytes[ i ] )
  window.btoa( binary )


loadFile = (file,callback)->
  switch file.type
    when "image/png","image/jpeg"
      fr = new FileReader
      fr.onload = ()->
        img = new Image
        img.onload = ()->
          image = new msImage img
          callback(image)

        img.src = fr.result
      fr.readAsDataURL(file)

    when "audio/wav","audio/x-wav","audio/mp3"
      fr = new FileReader
      fr.onload = ()->
        player.runtime.audio.getContext().decodeAudioData fr.result, (buffer)->
          callback new Sound player.runtime.audio,buffer

      fr.readAsArrayBuffer file

    when "application/json"
      fr = new FileReader
      fr.onload = ()->
        object = fr.result
        try
          object = JSON.parse fr.result
        catch err

        callback object

      fr.readAsText(file)

    else
      fr = new FileReader
      fr.onload = ()->
        callback fr.result

      fr.readAsText(file)

@System =
  javascript:(s)->
    try
      f = eval("res = function(global) { #{s} }" )
      res = f.call(player.runtime.vm.context.global,player.runtime.vm.context.global)
    catch err
      console.error err

    if res? then res else 0

  file:
    save:(obj,name,format,options)->
      if obj instanceof MicroSound
        loadWaveFileLib ()->
          wav = new wavefile.WaveFile
          ch1 = []
          for i in [0..obj.length-1] by 1
            ch1[i] = Math.round(Math.min(1,Math.max(-1,obj.read(0,i)))*32767)
          if obj.channels == 2
            ch2 = []
            for i in [0..obj.length-1] by 1
              ch2[i] = Math.round(Math.min(1,Math.max(-1,obj.read(1,i)))*32767)

            ch = [ch1,ch2]
          else
            ch = [ch1]

          wav.fromScratch ch.length,obj.sampleRate,'16',ch
          buffer = wav.toBuffer()
          if typeof name != "string"
            name = "sound.wav"
          else if not name.endsWith(".wav")
            name += ".wav"
          saveFile buffer, name, "octet/stream"
      else if obj instanceof msImage
        c = obj.canvas
        if typeof name != "string"
          name = "image"

        format = if typeof format == "string" and format.toLowerCase() == "jpg" then "jpg" else "png"

        if not name.endsWith(".#{format}")
          name += ".#{format}"

        a = document.createElement("a")
        document.body.appendChild(a)
        a.style = "display: none"
        c.toBlob ((blob)=>
          url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = name
          a.click()
          window.URL.revokeObjectURL(url)
          ),(if format == "png" then "image/png" else "image/jpeg"),options
      else if typeof obj == "object"
        obj = System.runtime.vm.storableObject obj
        obj = JSON.stringify obj,null,2
        if typeof name != "string"
          name = "data"
        if not name.endsWith(".json") then name += ".json"

        saveFile obj,name,"text/json"

      else if typeof obj == "string"
        if typeof name != "string"
          name = "text"
        if not name.endsWith(".txt") then name += ".txt"

        saveFile obj,name,"text/plain"

    load:(options,callback)->
      if typeof options == "string" or Array.isArray(options)
        extensions = options
      else
        extensions = options.extensions or null

      input = document.createElement "input"
      if options.multiple
        input.multiple = true

      input.type = "file"
      if typeof extensions == "string"
        input.accept = ".#{extensions}"
      else if Array.isArray extensions
        for i in [0..extensions.length-1]
          extensions[i] = ".#{extensions[i]}"
        input.accept = extensions.join(",")

      input.addEventListener "change",(event)=>
        files = event.target.files
        result = []
        index = 0
        processFile = ()->
          if index < files.length
            f = files[index++]
            loadFile f,(data)->
              result.push
                name: f.name
                size: f.size
                content: data
                file_type: f.type

              processFile()
          else
            player.runtime.files_loaded = result
            callback(result) if typeof callback == "function"

        processFile()

      input.click()

    setDropHandler:(handler)->
      window.dropHandler = handler
