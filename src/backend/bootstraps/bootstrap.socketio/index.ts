import http from 'http';
import { DefaultEventsMap, Server, Socket } from 'socket.io';

import { EnumSocketIOSystemEvents } from '../../../interfaces/interface.socketio';
import { SocketioFloorManager } from './services/service.socket-floor-manager';

export let SocketIoInstance: Server<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	any
>;

export const initializeSocketio = (
	server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
	events: (
		io: Server,
		socket: Socket,
		connections: SocketioFloorManager
	) => void
) => {
	const io = new Server(server, {
		cors: {
			origin: '*',
		},
		transports: ['websocket', 'polling'],
		perMessageDeflate: true,
		httpCompression: true,
		maxHttpBufferSize: 1e8, //100MB
		pingInterval: 10000,
		pingTimeout: 5000,
	});

	SocketIoInstance = io;

	return {
		listen: async (callback: () => any) => {
			const connections = new SocketioFloorManager(io);

			io.on(EnumSocketIOSystemEvents.Connection, async (socket: Socket) => {
				events(io, socket, connections);
			});

			return callback();
		},
	};
};
