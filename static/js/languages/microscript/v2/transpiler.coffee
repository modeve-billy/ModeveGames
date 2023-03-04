class Transpiler
  constructor:()->

  transpile:(r)->
    for i in [0..r.opcodes.length-1] by 1
      op = OPCODES[r.opcodes[i]]
      if @transpilable(op,r.arg1[i])
        j = i+1
        while j < r.opcodes.length and r.removeable(j) and @transpilable(OPCODES[r.opcodes[j]],r.arg1[j])
          j += 1

        j -= 1

        if j-i>=2
          #console.info "transpilable segment: "+(j-i)
          @transpileSegment(r,i,j)

  transpileSegment:(r,i,j)->
    @vcount = 0
    @stack = new Stack()
    @locals = {}
    @variables = {}

    s = "f = function(stack,stack_index,locals,locals_offset,object,global) {\n"
    for k in [i..j] by 1
      console.info OPCODES[r.opcodes[k]]+" "+r.arg1[k]
      comp = @[OPCODES[r.opcodes[k]]](r.arg1[k])
      if comp
        s += comp+"\n" ;


    # if @stack.index > 0
    #   if @stack.touched[0]
    #     s += "stack[stack_index] = #{@stack.get(-@stack.index)} ;\n"
    #
    #   for k in [1..@stack.index] by 1
    #     s += "stack[++stack_index] = #{@stack.get(-@stack.index+k)} ;\n"
    # else if @stack.index < 0
    #   s += "stack_index -= #{-@stack.index} ;\n"
    #   if @stack.touched[@stack.index]
    #     s += "stack[stack_index] = #{@stack.stack[@stack.index]} ;\n"
    # else
    #   if @stack.touched[0]
    #     s += "stack[stack_index] = #{@stack.get()} ;\n"

    for index of @stack.touched
      if @stack.touched[index]
        if index < 0
          s += "stack[stack_index-#{Math.abs(index)}] = #{@stack.stack[index]} ;\n"
        else if index > 0
          s += "stack[stack_index+#{index}] = #{@stack.stack[index]} ;\n"
        else
          s += "stack[stack_index] = #{@stack.stack[index]} ;\n"

    if @stack.index < 0
      s += "stack_index -= #{Math.abs(@stack.index)} ;\n"
    else if @stack.index > 0
      s += "stack_index += #{@stack.index} ;\n"

    s += """return stack_index ;\n}"""

    console.info s

    try
      eval(s)
    catch err
      console.error s
      console.error err

    r.opcodes[i] = 200
    r.arg1[i] = f
    for k in [i+1..j] by 1
      r.remove(i+1)
    return

  createVariable:()->
    "v#{@vcount++}"

  transpilable:(op,arg)->
    if op == "LOAD_VALUE"
      return typeof arg in ["string","number"]
    else
      return @[op]?

  LOAD_VALUE:(arg)->
    if typeof arg == "string"
      @stack.push(""" "#{arg.replace(/"/g,"\\\"")}" """)
    else if typeof arg == "number"
      @stack.push(arg+"")
    ""

  LOAD_LOCAL:(arg)->
    v = @createVariable()
    @stack.push v
    """
    let #{v} = locals[locals_offset+#{arg}] ; // LOAD_LOCAL
    """

  LOAD_LOCAL_OBJECT:(arg)->
    if @locals[arg]?
      v = @locals[arg]
      @stack.push v
      """
      if (typeof #{v} != "object") { #{v} = locals[locals_offset+#{arg}] = {} } ;
      """
    else
      v = @createVariable()
      res = """
      let #{v} = locals[locals_offset+#{arg}] ;
      if (typeof #{v} != "object") { #{v} = locals[locals_offset+#{arg}] = {} } ;
      """
      @stack.push v
      @locals[arg] = v
      res

  STORE_LOCAL:(arg)->
    v = @stack.get()
    """
    locals[locals_offset+#{arg}] = #{v} ; // STORE_LOCAL
    """

  POP:()->
    @stack.pop()
    ""

  # DIV:()->
  #   v = @createVariable()
  #
  #   res = """
  #   let #{v} = #{@stack.get(-1)} / #{@stack.get()} ;
  #   """
  #   @stack.pop()
  #   @stack.pop()
  #   @stack.push(v)
  #   res
  #
  # MUL:()->
  #   v = @createVariable()
  #
  #   res = """
  #   let #{v} = #{@stack.get(-1)} * #{@stack.get()} ;
  #   """
  #   @stack.pop()
  #   @stack.pop()
  #   @stack.push(v)
  #   res
  #
  # ADD:()->
  #   v = @createVariable()
  #
  #   res = """
  #   let #{v} = #{@stack.get(-1)} + #{@stack.get()} ;
  #   """
  #   @stack.pop()
  #   @stack.pop()
  #   @stack.push(v)
  #   res
  #
  # SUB:()->
  #   v = @createVariable()
  #
  #   res = """
  #   let #{v} = #{@stack.get(-1)}-#{@stack.get()} ;
  #   """
  #   @stack.pop()
  #   @stack.pop()
  #   @stack.push(v)
  #   res

  CREATE_PROPERTY:(arg)->
    res = """
    #{@stack.get(-2)}[#{@stack.get(-1)}] = #{@stack.get()} ;
    """
    @stack.pop()
    @stack.pop()
    res

  LOAD_PROPERTY:(arg)->
    v = @createVariable()
    res = """
      let #{v} = #{@stack.get(-1)}[#{@stack.get()}] ; // LOAD_PROPERTY
      if (#{v} == null) { #{v} = 0 ; }
  """
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res

  LOAD_PROPERTY_ATOP:(arg)->
    v = @createVariable()
    res = """
      let #{v} = #{@stack.get(-1)}[#{@stack.get()}] ; // LOAD_PROPERTY_ATOP
      if (#{v} == null) { #{v} = 0 ; }
  """
    @stack.push(v)
    res

  NEW_OBJECT:()->
    v = @createVariable()
    @stack.push(v)
    "let #{v} = {} ;"

  NEW_ARRAY:()->
    v = @createVariable()
    @stack.push(v)
    "let #{v} = [] ;"

  MAKE_OBJECT:()->
    v = @createVariable()
    res = """
let #{v} = #{@stack.get()} ;
if (typeof #{v} != "object") #{v} = {} ; """

    @stack.pop()
    @stack.push v
    res

  # NEGATE:()->
  #   v = @createVariable()
  #   res = """
  #   let #{v} = - #{@stack.get()} ; // NEGATE
  #   if (!isFinite(#{v})) { #{v} = 0 ;};
  #   """
  #   @stack.pop()
  #   @stack.push v
  #   res

  # LOAD_VARIABLE:(arg)->
  #   if @variables[arg]?
  #     @stack.push @variables[arg]
  #     ""
  #   else
  #     v = @createVariable()
  #     res = """
  #     let #{v} = object["#{arg}"] ; // LOAD_VARIABLE
  #     if (#{v} == null) {
  #       let obj = object ;
  #       while ((#{v} == null) && (obj["class"] != null)) { obj = obj["class"] ; #{v} = obj["#{arg}"] }
  #       if (#{v} == null) v = global["#{arg}"] ;
  #       if (#{v} == null) { #{v} = 0 ; }
  #     }
  #   """
  #     @stack.push v
  #     @variables[arg] = v
  #
  #     res

  STORE_VARIABLE:(arg)->
    if @variables[arg]?
      """
      #{@variables[arg]} = object["#{arg}"] = #{@stack.get()} ; // STORE_VARIABLE
      """
    else
      """
      object["#{arg}"] = #{@stack.get()} ; // STORE_VARIABLE
      """

  STORE_PROPERTY:(arg)->
    v = @createVariable()
    res = """
      let #{v} = #{@stack.get(-2)}[#{@stack.get(-1)}] = #{@stack.get(0)} ; // STORE_PROPERTY
  """
    @stack.pop()
    @stack.pop()
    @stack.pop()
    @stack.push(v)
    res

class @Stack
  constructor:()->
    @stack = ["stack[stack_index]"]
    @index = 0
    @touched = {}

  push:(value)->
    @stack[++@index] = value
    @touched[@index] = true
    # console.info "push: "+value

  pop:()->
    if @index>=0
      res = @stack.splice(@index,1)[0]
    else if @stack[@index]?
      res = @stack[@index]
    else
      res = "stack[stack_index-#{@index}]"

    @index -= 1
    # console.info "pop: "+res
    res

  get:(index=0)->
    i = @index+index
    if i>=0
      @stack[i]
    else if @stack[i]?
      @stack[i]
    else
      "stack[stack_index-#{-i}]"
