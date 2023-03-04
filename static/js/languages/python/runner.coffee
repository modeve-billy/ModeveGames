class @Runner
  constructor:(@microvm)->

  init:()->
    @initialized = true
    window.ctx = @microvm.context.global
    src = ""

    for key of @microvm.context.global
      kd = key
      src += """#{kd} =  window.ctx.#{key}\n"""

    window.stdout =
      write:(text)=>
        @microvm.context.meta.print(text)

    window.stderr =
      write:(text)=>
        if Array.isArray(text)
          line = 1
          file = ""
          for t in text
            f = t.split("File")
            if f[1]?
              f = f[1].split('"')
              if f[1]? and f[1].length > 0
                file = f[1]
            t = t.split(" line ")
            if t[1]?
              line = t[1].split("\n")[0].split(",")[0]

          @microvm.context.location =
            token:
              file: file
              line: line
              column: 0
              error_text: text[text.length-1].replace("\n","")
          throw text[text.length-1].replace("\n","")
        else
          throw text

    src += """
import sys

sys.stdout = window.stdout\n
sys.stderr = window.stderr\n

    """

    @run(src)

  run:(program,name="")->
    if not @initialized
      @init()

    try
      res = python(program,name)

      program = """
import traceback
import sys

def __draw():
  try:
    draw()
  except BaseException as err:
    sys.stderr.write(traceback.format_exception(err))

  except Error as err:
    sys.stderr.write(traceback.format_exception(err))

def __update():
  try:
    update()
  except BaseException as err:
    sys.stderr.write(traceback.format_exception(err))

  except Error as err:
    sys.stderr.write(traceback.format_exception(err))

def __init():
  try:
    init()
  except BaseException as err:
    sys.stderr.write(traceback.format_exception(err))

  except Error as err:
    sys.stderr.write(traceback.format_exception(err))

def __serverInit():
  try:
    serverInit()
  except BaseException as err:
    sys.stderr.write(traceback.format_exception(err))

  except Error as err:
    sys.stderr.write(traceback.format_exception(err))

def __serverUpdate():
  try:
    serverUpdate()
  except BaseException as err:
    sys.stderr.write(traceback.format_exception(err))

  except Error as err:
    sys.stderr.write(traceback.format_exception(err))

if "draw" in globals():
  window.draw = __draw

if "update" in globals():
  window.update = __update

if "init" in globals():
  window.init = __init

if "serverInit" in globals():
  window.serverInit = __serverInit

if "serverUpdate" in globals():
  window.serverUpdate = __serverUpdate

      """

      python(program,"__init__")

      return res
    catch err
      throw err.toString()

  call:(name,args)->
    if name in ["draw","update","init","serverInit","serverUpdate"] and typeof window[name] == "function"
      try
        return window[name]()
      catch err
        throw err.toString()
    else
      return

  toString:(obj)->
    if obj?
      obj.toString()
    else
      "none"
