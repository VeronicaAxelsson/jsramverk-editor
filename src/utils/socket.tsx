import React from 'react';
import io from 'socket.io-client';
const SOCKET_URL = 'https://jsramverk-editor-veax20.azurewebsites.net';

export const socket = io(SOCKET_URL);
export const SocketContext = React.createContext(socket);
