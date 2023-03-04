class @Parser
  constructor:(@input,@filename="")->
    if /^\s*\/\/\s*javascript\s*\n/.test @input
      @input = 'system.javascript("""\n\n'+ @input.replace(/\\/g,"\\\\") + '\n\n""")'

    @tokenizer = new Tokenizer(@input,@filename)
    @program = new Program()
    @current_block = []
    @current =
      line: 1
      column: 1
    @verbose = false
    @nesting = 0
    @object_nesting = 0
    @not_terminated = []
    @api_reserved =
      screen: true
      audio: true
      keyboard: true
      gamepad: true
      sprites: true
      sounds: true
      music: true
      assets: true
      asset_manager: true
      maps: true
      touch: true
      mouse: true
      fonts: true
      Sound: true
      Image: true
      Sprite: true
      Map: true
      system: true
      storage: true
      print: true
      random: true
      Function: true
      List: true
      Object: true
      String: true
      Number: true

  nextToken:()->
    token = @tokenizer.next()
    if not token?
      @unexpected_eof = true
      throw "Unexpected end of file"
    @current = token

  nextTokenOptional:()->
    token = @tokenizer.next()
    if token?
      @current = token
    token

  parse:()->
    try
      @warnings = []
      loop
        expression = @parseLine()
        if not expression? and not @tokenizer.finished()
          token = @tokenizer.next()
          if token? and token.reserved_keyword
            if token.value == "end"
              @error "Too many 'end'"
            else
              @error "Misuse of reserved keyword: '#{token.value}'"
          else
            @error "Unexpected data"
        break if expression == null
        @current_block.push(expression)
        @program.add expression
        console.info(expression) if @verbose

      @
    catch err
      #console.info "Error at line: #{@current.line} column: #{@current.column}"
      if @not_terminated.length>0 and err == "Unexpected end of file"
        nt = @not_terminated[@not_terminated.length-1]
        @error_info =
          error: "Unterminated '#{nt.value}' ; no matching 'end' found"
          line: nt.line
          column: nt.column

      else
        @error_info =
          error: err
          line: @current.line
          column: @current.column
      #console.error err

  parseLine:()->
    token = @nextTokenOptional()
    return null if not token?

    switch token.type
      when Token.TYPE_RETURN
        return new Program.Return token,@parseExpression()
      when Token.TYPE_BREAK
        return new Program.Break token
      when Token.TYPE_CONTINUE
        return new Program.Continue token
      when Token.TYPE_LOCAL
        @parseLocalAssignment(token)
      else
        @tokenizer.pushBack token
        @parseExpression()


  parseExpression:(filter,first_function_call=false)->
    expression = @parseExpressionStart()
    return null if not expression?
    loop
      access = @parseExpressionSuffix(expression,filter)
      return expression if not access?
      return access if first_function_call and access instanceof Program.FunctionCall
      expression = access

  assertExpression:(filter,first_function_call=false)->
    exp = @parseExpression(filter,first_function_call)
    if not exp?
      throw "Expression expected"
    exp

  parseExpressionSuffix:(expression,filter)->
    token = @nextTokenOptional()
    return (if filter=="self" then expression else null) if not token?
    switch token.type
      when Token.TYPE_DOT
        if expression instanceof Program.Value and expression.type == Program.Value.TYPE_NUMBER
          @tokenizer.pushBack token
          return null
        else
          @tokenizer.changeNumberToIdentifier()
          identifier = @assertBroadIdentifier("Expected identifier")
          return Program.CreateFieldAccess(token,expression,new Program.Value(identifier,Program.Value.TYPE_STRING,identifier.value))
      when Token.TYPE_OPEN_BRACKET
        field = @assertExpression()
        @assert(Token.TYPE_CLOSED_BRACKET,"Expected ']'")
        return Program.CreateFieldAccess(token,expression,field)
      when Token.TYPE_OPEN_BRACE
        @parseFunctionCall(token,expression)
      when Token.TYPE_EQUALS
        @parseAssignment(token,expression)
      when Token.TYPE_PLUS_EQUALS
        @parseSelfAssignment(token,expression,token.type)
      when Token.TYPE_MINUS_EQUALS
        @parseSelfAssignment(token,expression,token.type)
      when Token.TYPE_MULTIPLY_EQUALS
        @parseSelfAssignment(token,expression,token.type)
      when Token.TYPE_DIVIDE_EQUALS
        @parseSelfAssignment(token,expression,token.type)
      when Token.TYPE_MODULO_EQUALS,Token.TYPE_AND_EQUALS,Token.TYPE_OR_EQUALS
        @parseSelfAssignment(token,expression,token.type)
      else
        if filter == "self"
          @tokenizer.pushBack token
          return expression
        else if token.is_binary_operator and filter != "noop"
          return @parseBinaryOperation token,expression
        else
          @tokenizer.pushBack token
          return null

  parseExpressionStart:()->
    token = @nextTokenOptional()
    return null if not token?
    switch token.type
      when Token.TYPE_IDENTIFIER # variable name
        return new Program.Variable token,token.value

      when Token.TYPE_NUMBER
        return @parseNumberExpression token

      when Token.TYPE_PLUS
        return @assertExpression()

      when Token.TYPE_MINUS
        return @parseExpressionSuffix(new Program.Negate(token,@assertExpression("noop")),"self")

      when Token.TYPE_NOT
        return @parseExpressionSuffix(new Program.Not(token,@assertExpression("noop")),"self")

      when Token.TYPE_STRING
        return @parseStringExpression token

      when Token.TYPE_IF
        return @parseIf token

      when Token.TYPE_FOR
        return @parseFor token

      when Token.TYPE_WHILE
        return @parseWhile token

      when Token.TYPE_OPEN_BRACE
        return @parseBracedExpression token

      when Token.TYPE_OPEN_BRACKET
        return @parseArray token

      when Token.TYPE_FUNCTION
        return @parseFunction token

      when Token.TYPE_OBJECT
        return @parseObject token

      when Token.TYPE_CLASS
        @parseClass token

      when Token.TYPE_NEW
        @parseNew token

      when Token.TYPE_DOT
        next = @assert(Token.TYPE_NUMBER,"malformed number")
        throw "malformed number" if not Number.isInteger(next.value)
        return new Program.Value(token,Program.Value.TYPE_NUMBER,Number.parseFloat(".#{next.string_value}"))

      when Token.TYPE_AFTER then @parseAfter token
      when Token.TYPE_EVERY then @parseEvery token
      when Token.TYPE_DO then @parseDo token
      when Token.TYPE_SLEEP then @parseSleep token
      when Token.TYPE_DELETE then @parseDelete token

      else
        @tokenizer.pushBack token
        return null

  parseNumberExpression:(number)->
    return new Program.Value(number,Program.Value.TYPE_NUMBER,number.value)

  parseStringExpression:(string)->
    token = @nextTokenOptional()
    if not token?
      return new Program.Value(string,Program.Value.TYPE_STRING,string.value)
    else
      @tokenizer.pushBack token
      return new Program.Value(string,Program.Value.TYPE_STRING,string.value)

  parseArray:(bracket)->
    res = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_CLOSED_BRACKET
        return new Program.Value bracket,Program.Value.TYPE_ARRAY,res
      else if token.type == Token.TYPE_COMMA
        continue
      else
        @tokenizer.pushBack token
        res.push @assertExpression()

  parseBinaryOperation:(operation,term1)->
    ops = [new Program.Operation(operation,operation.value)]
    terms = [term1]
    terms.push @assertExpression("noop")
    loop
      token = @nextTokenOptional()
      if not token?
        break
      if not token.is_binary_operator
        @tokenizer.pushBack token
        break

      ops.push new Program.Operation(token,token.value)
      terms.push @assertExpression("noop")

    Program.BuildOperations(ops,terms)

  parseAssignment:(token,expression)->
    if expression not instanceof Program.Variable and expression not instanceof Program.Field
      throw "Expected variable identifier or property"

    if @object_nesting == 0 and expression instanceof Program.Variable and @api_reserved[expression.identifier]
      @warnings.push
        type: "assigning_api_variable"
        identifier: expression.identifier
        line: token.line
        column: token.column

    if expression instanceof Program.Field
      @object_nesting += 1
      res = new Program.Assignment token,expression,@assertExpression()
      @object_nesting -= 1
    else
      res = new Program.Assignment token,expression,@assertExpression()
    res

  parseSelfAssignment:(token,expression,operation)->
    if expression not instanceof Program.Variable and expression not instanceof Program.Field
      throw "Expected variable identifier or property"
    return new Program.SelfAssignment token,expression,operation,@assertExpression()

  parseLocalAssignment:(local)->
    identifier = @assert(Token.TYPE_IDENTIFIER,"Expected identifier")
    @assert(Token.TYPE_EQUALS,"Expected '='")
    return new Program.Assignment local,new Program.Variable(identifier,identifier.value),@assertExpression(),true

  parseBracedExpression:(open)->
    expression = @assertExpression()
    token = @nextToken()
    if token.type == Token.TYPE_CLOSED_BRACE
      return new Program.Braced open,expression
    else
      return @error "missing closing parenthese"

  parseFunctionCall:(brace_token,expression)->
    args = []
    @last_function_call = new Program.FunctionCall brace_token,expression,args
    @last_function_call.argslimits = []
    loop
      token = @nextTokenOptional()
      if not token?
        return @error "missing closing parenthese"
      else if token.type == Token.TYPE_CLOSED_BRACE
        return new Program.FunctionCall token,expression,args
      else if token.type == Token.TYPE_COMMA
        continue
      else
        @tokenizer.pushBack token
        start = token.start
        args.push @assertExpression()
        @last_function_call.argslimits.push
          start: start
          end: @tokenizer.index-1


  addTerminable:(token)->
    @not_terminated.push token

  endTerminable:()->
    if @not_terminated.length>0
      @not_terminated.splice @not_terminated.length-1,1
    return

  parseFunction:(funk)->
    @nesting += 1
    @addTerminable funk
    args = @parseFunctionArgs()
    sequence = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_END
        @nesting -= 1
        @endTerminable()
        return new Program.Function funk,args,sequence,token
      else
        @tokenizer.pushBack token
        line = @parseLine()
        if line?
          sequence.push line
        else
          @error "Unexpected data while parsing function"

  parseFunctionArgs:()->
    token = @nextToken()
    args = []
    last = null
    if token.type != Token.TYPE_OPEN_BRACE
      return @error "Expected opening parenthese"
    loop
      token = @nextToken()
      if token.type == Token.TYPE_CLOSED_BRACE
        return args
      else if token.type == Token.TYPE_COMMA
        last = null
        continue
      else if token.type == Token.TYPE_EQUALS and last == "argument"
        exp = @assertExpression()
        args[args.length-1].default = exp
      else if token.type == Token.TYPE_IDENTIFIER
        last = "argument"
        args.push
          name: token.value
      else
        return @error "Unexpected token"

    return

  warningAssignmentCondition:(expression)->
    if expression instanceof Program.Assignment
      @warnings.push
        type: "assignment_as_condition"
        line: expression.token.line
        column: expression.token.column

  parseIf:(iftoken)->
    @addTerminable iftoken
    current =
      condition: @assertExpression()
      sequence: []

    @warningAssignmentCondition current.condition

    chain = []
    token = @nextToken()
    if token.type != Token.TYPE_THEN
      return @error "Expected 'then'"

    loop
      token = @nextToken()
      if token.type == Token.TYPE_ELSIF
        chain.push current
        current =
          condition: @assertExpression()
          sequence: []

        @warningAssignmentCondition current.condition

        @assert(Token.TYPE_THEN,"Expected 'then'")
      else if token.type == Token.TYPE_ELSE
        current.else = []
      else if token.type == Token.TYPE_END
        chain.push current
        @endTerminable()
        return new Program.Condition iftoken,chain
      else
        @tokenizer.pushBack token
        line = @parseLine()
        if not line?
          throw Error "Unexpected data while parsing if"
        if current.else?
          current.else.push line
        else
          current.sequence.push line


  assert:(type,error)->
    token = @nextToken()
    if token.type != type
      throw error
    token

  assertBroadIdentifier:(error)->
    token = @nextToken()
    if token.type != Token.TYPE_IDENTIFIER and token.reserved_keyword
      token.type = Token.TYPE_IDENTIFIER

    if token.type != Token.TYPE_IDENTIFIER
      throw error
    token

  error:(text)->
    throw text

  parseFor:(fortoken)->
    iterator = @assertExpression()
    if iterator instanceof Program.Assignment
      range_from = iterator.expression
      iterator = iterator.field
      token = @nextToken()
      if token.type != Token.TYPE_TO
        return @error("Expected 'to'")
      range_to = @assertExpression()
      token = @nextToken()

      if token.type == Token.TYPE_BY
        range_by = @assertExpression()
      else
        range_by = 0
        @tokenizer.pushBack token
      return new Program.For fortoken,iterator.identifier,range_from,range_to,range_by,@parseSequence(fortoken)
    else if iterator instanceof Program.Variable
      @assert(Token.TYPE_IN,"Error expected keyword 'in'")
      list = @assertExpression()
      return new Program.ForIn fortoken,iterator.identifier,list,@parseSequence(fortoken)
    else
      return @error "Malformed for loop"

  parseWhile:(whiletoken)->
    condition = @assertExpression()
    return new Program.While whiletoken,condition,@parseSequence(whiletoken)

  parseSequence:(start_token)->
    if start_token?
      @addTerminable start_token
    @nesting += 1
    sequence = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_END
        if start_token?
          @endTerminable()
        @nesting -= 1
        return sequence
      else
        @tokenizer.pushBack token
        line = @parseLine()
        if not line?
          @error "Unexpected data"
        sequence.push line
    sequence


  parseObject:(object)->
    @nesting += 1
    @object_nesting += 1
    @addTerminable object
    fields = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_END
        @nesting -= 1
        @object_nesting -= 1
        @endTerminable()
        return new Program.CreateObject(object,fields)
      else
        if token.type != Token.TYPE_IDENTIFIER and token.reserved_keyword
          token.type = Token.TYPE_IDENTIFIER

        if token.type == Token.TYPE_STRING
          token.type = Token.TYPE_IDENTIFIER

        if token.type == Token.TYPE_IDENTIFIER
          @assert(Token.TYPE_EQUALS,"Expected '='")
          exp = @assertExpression()
          fields.push
            field: token.value
            value: exp
        else
          return @error "Malformed object"

  parseClass:(object)->
    @nesting += 1
    @object_nesting += 1
    @addTerminable object
    fields = []
    token = @nextToken()
    if token.type == Token.TYPE_EXTENDS
      ext = @assertExpression()
      token = @nextToken()

    loop
      if token.type == Token.TYPE_END
        @nesting -= 1
        @object_nesting -= 1
        @endTerminable()
        return new Program.CreateClass(object,ext,fields)
      else
        if token.type != Token.TYPE_IDENTIFIER and token.reserved_keyword
          token.type = Token.TYPE_IDENTIFIER

        if token.type == Token.TYPE_STRING
          token.type = Token.TYPE_IDENTIFIER

        if token.type == Token.TYPE_IDENTIFIER
          @assert(Token.TYPE_EQUALS,"Expected '='")
          exp = @assertExpression()
          fields.push
            field: token.value
            value: exp
        else
          return @error "Malformed object"
      token = @nextToken()


  parseNew:(token)->
    exp = @assertExpression(null,true)
    return new Program.NewCall(token,exp)

  multipliers:
    millisecond: 1
    milliseconds: 1
    second: 1000
    seconds: 1000
    minute: 60000
    minutes: 60000
    hour: 60000*60
    hours: 60000*60
    day: 60000*60*24
    days: 60000*60*24

  parseAfter:(after)->
    @nesting += 1
    @addTerminable after
    delay = @assertExpression()
    token = @nextToken()
    multiplier = null
    if token.type == Token.TYPE_IDENTIFIER and @multipliers[token.value]
      multiplier = @multipliers[token.value]
      token = @nextToken()

    if not token? or token.type != Token.TYPE_DO then @error "Expected keyword 'do'"

    sequence = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_END
        @nesting -= 1
        @endTerminable()
        return new Program.After after,delay,sequence,token,multiplier
      else
        @tokenizer.pushBack token
        line = @parseLine()
        if line?
          sequence.push line
        else
          @error "Unexpected data while parsing after"

    return

  parseEvery:(every)->
    @nesting += 1
    @addTerminable every
    delay = @assertExpression()
    token = @nextToken()
    multiplier = null
    if token.type == Token.TYPE_IDENTIFIER and @multipliers[token.value]
      multiplier = @multipliers[token.value]
      token = @nextToken()

    if not token? or token.type != Token.TYPE_DO then @error "Expected keyword 'do'"

    sequence = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_END
        @nesting -= 1
        @endTerminable()
        return new Program.Every every,delay,sequence,token,multiplier
      else
        @tokenizer.pushBack token
        line = @parseLine()
        if line?
          sequence.push line
        else
          @error "Unexpected data while parsing after"

    return

  parseDo:(do_token)->
    @nesting += 1
    @addTerminable do_token

    sequence = []
    loop
      token = @nextToken()
      if token.type == Token.TYPE_END
        @nesting -= 1
        @endTerminable()
        return new Program.Do do_token,sequence,token
      else
        @tokenizer.pushBack token
        line = @parseLine()
        if line?
          sequence.push line
        else
          @error "Unexpected data while parsing after"

    return

  parseSleep:(sleep)->
    delay = @assertExpression()
    token = @nextToken()
    multiplier = null
    if token?
      if token.type == Token.TYPE_IDENTIFIER and @multipliers[token.value]
        multiplier = @multipliers[token.value]
      else
        @tokenizer.pushBack token

    return new Program.Sleep sleep,delay,multiplier

  parseDelete:(del)->
    v = @parseExpression()

    if not v? or (v not instanceof Program.Variable and v not instanceof Program.Field)
      @error "expecting variable name or property access after keyword `delete`"
    else
      return new Program.Delete del,v