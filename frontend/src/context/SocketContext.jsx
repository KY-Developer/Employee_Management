import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
      })

      setSocket(newSocket)

      // Join appropriate room based on user role
      if (user.role === 'admin') {
        newSocket.emit('join-admin', user._id)
      } else if (user.role === 'company') {
        newSocket.emit('join-company', user._id)
      }

      // Listen for notifications
      newSocket.on('new-notification', (notification) => {
        setNotifications((prev) => [notification, ...prev])
      })

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user])

  const value = {
    socket,
    notifications,
    setNotifications,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)