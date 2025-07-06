import { DefaultEventsMap, Server, Socket } from 'socket.io';

export type ISocketIo = Server<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	unknown
>;

export interface ISocketAgentDetails {
	browser: string;
	device: string;
	deviceType: string;
	connectionTimestamp: number;
	id: string;
}

export enum EnumSocketIOSystemEvents {
	Connection = 'connection',
	Disconnect = 'disconnect',
}

export enum EnumSocketIOUserEvents {
	Connected = 'user:connected',
}

export type ISocketEventHandler = (
	io: Server,
	socket: Socket,
	floorManager: ISocketioFloorManager
) => void;

export interface ISocketioFloorManager {
	/** Connessioni attive per ogni stanza */
	activeConnections: { sockets: ISocketAgentDetails[]; room: string }[];

	/** Estrae e tipizza gli headers di un socket */
	getSocketHeaders<T>(socket: Socket): T & { agent: ISocketAgentDetails };

	/** Aggiunge un agente a una stanza */
	add(agent: ISocketAgentDetails, room: string): void;

	/** Rimuove un agente da tutte le stanze */
	remove(agent: ISocketAgentDetails): void;
}

export type FloorManager = {
	new (io: ISocketIo): ISocketioFloorManager;
};
