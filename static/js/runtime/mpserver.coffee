class @MPServer
  constructor:()->
    impl = new MPServerImpl @
    @send = (data)->
      try
        impl.sendMessage(data)
        return "sent"
      catch err
        console.error err
        return err.toString()

    @close = ()->
      try
        impl.close()
      catch err
        console.error err

    @new_connections = []
    @active_connections = []
    @closed_connections = []
    @messages = []
    player.runtime.addServer(impl)
 
class @MPServerImpl
  constructor:(@interface)->
    @interface.status = "starting"
    @reconnect_delay = 1000
    @clients = {}
    @clients_connected = []
    @clients_disconnected = {}
    try
      @getRelay (address) => @connect(address)
    catch err
      console.error err

  getRelay:(callback)->
    player.client.sendRequest {
      name: "get_relay_server"
    },(msg)=>
      console.info "RELAY SERVER RECEIVED"
      console.info msg
      if msg.name == "error"
        @interface.status = "error"
        @interface.error = msg.error
      else
        address = msg.address
        if address == "self"
          address = location.origin.replace "http", "ws"
        callback(address)

  connect:(address)->
    @socket = new WebSocket(address)

    @socket.onmessage = (msg)=>
      try
        msg = JSON.parse msg.data
        switch msg.name
          when "mp_update"
            @interface.status = "running"
            player.runtime.timer()
          when "mp_client_connection"
            @clientConnected msg
          when "mp_client_message"
            @clientMessage msg
          when "mp_client_disconnected"
            @clientDisconnected msg
            
      catch err
        console.error err

    @socket.onopen = ()=>
      @interface.status = "running"
      @reconnect_delay = 1000

      user = location.href

      @send
        name: "mp_start_server"
        token: window.ms_server_token
        server_id: ms_project_id

    @socket.onclose = ()=>
      @interface.status = "disconnected"

  clientConnected:(msg)->
    return if not msg.client_id?
    client = new MPClient @, msg.client_id
    @clients_connected.push client
    @clients[msg.client_id] = client

  clientMessage:(msg)->
    return if not msg.client_id?
    client = @clients[msg.client_id]
    if client?
      client.message(msg.data)

  clientDisconnected:(msg)->
    return if not msg.client_id?
    client = @clients[msg.client_id]
    delete @clients[msg.client_id]
    if client?
      @clients_disconnected[client.client_id] = true

  sendMessage:(data)->
    @send
      name: "mp_server_message"
      data: data

  send:(data)->
    @socket.send JSON.stringify data

  update:()->
    new_connections = []
    closed_connections = []

    for i in [@interface.active_connections.length-1..0] by -1
      c = @interface.active_connections[i]
      if @clients_disconnected[c.id]
        @interface.active_connections.splice i,1
        closed_connections.push c

    for c in @clients_connected
      new_connections.push c.interface
      @interface.active_connections.push c.interface

    @interface.new_connections = new_connections
    @interface.closed_connections = closed_connections

    @clients_disconnected = {}
    @clients_connected = []

    for id,client of @clients
      client.update()

    messages = []
    for connection in @interface.active_connections
      for m in connection.messages
        messages.push m

    @interface.messages = messages
    return

  close:()->
    @socket.close()
    

class @MPClient
  constructor:(@server,@client_id)->
    @interface =
      id: @client_id
      status: "connected"
      messages: []
      send:(data)=> @sendMessage(data)
      disconnect:()=> @disconnect()

    @message_buffer = []

  sendMessage:(data)->
    @server.send
      name: "mp_server_message"
      client_id: @client_id
      data: data
  
  disconnect:()->
    @server.send
      name: "mp_disconnect_client"
      client_id: @client_id
  
  message:(msg)->
    @message_buffer.push msg

  disconnected:()->
    @interface.status = "disconnected"
    
  update:()->
    messages = []
    for m in @message_buffer
      messages.push
        connection: @interface
        data: m

    @interface.messages = messages
    @message_buffer = []
    
    
    
    