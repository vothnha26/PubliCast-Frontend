import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"

let socket = null
let eventQueue = []

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    })

    socket.on("connect", () => {
      // Flush event queue on connect
      while (eventQueue.length > 0) {
        const { event, data, ack } = eventQueue.shift()
        if (ack) {
          socket.emit(event, data, ack)
        } else {
          socket.emit(event, data)
        }
      }
    })
  }

  return socket
}

export const emitSocketEvent = (event, data, ack) => {
  const s = getSocket()
  if (s && s.connected) {
    if (ack) {
      s.emit(event, data, ack)
    } else {
      s.emit(event, data)
    }
  } else {
    eventQueue.push({ event, data, ack })
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
