import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@grc/shared';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function useSocketListener(event: SocketEvents | string, callback: (data: any) => void) {
  useEffect(() => {
    const s = getSocket();
    s.on(event, callback);

    return () => {
      s.off(event, callback);
    };
  }, [event, callback]);
}
