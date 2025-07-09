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
	RoomUpdated = 'user:room-updated',
}

export type ISocketEventHandler = (
	io: Server,
	socket: Socket,
	floorManager: ISocketioFloorManager
) => void;

export interface IFloorManagerRoom<SocketData = any> {
	sockets: ISocketAgentDetails[];
	socketsData: {
		socket: string;
		data: { [key: string]: SocketData };
	}[];
	room: string;
}

/**
 * Interface for managing Socket.IO floor connections and room assignments.
 *
 * Provides methods to handle socket agents, manage their association with rooms,
 * and extract typed headers from sockets.
 *
 * @property activeConnections - An array representing the current active connections,
 * each containing a list of socket agent details and the associated room name.
 *
 * @method getRoom
 * Retrieves the room object by its name, including the sockets connected to it.
 *
 * @method getSocketHeaders
 * Extracts and types the headers from a given socket, including agent details.
 *
 * @method addSocketToRoom
 * Adds a socket agent to a specified room.
 *
 * @method removeSocketFromRoom
 * Removes a socket agent from all rooms they are currently assigned to.
 */
/**
 * Interface for managing Socket.IO floor (room) connections and agent details.
 *
 * Provides methods to handle active socket connections, manage rooms,
 * extract and type socket headers, and add or remove agents from rooms.
 *
 * @remarks
 * This interface is designed to abstract the logic for handling
 * socket connections and room management in a Socket.IO environment,
 * ensuring type safety and encapsulation of agent details.
 */
export interface ISocketioFloorManager {
	/** List of active connections, each with agent details and room name */
	activeConnections: IFloorManagerRoom[];

	/** Returns the room object by name, including connected sockets */
	getRoom(room: string): IFloorManagerRoom | undefined;

	/** Extracts and types the headers from a socket, including agent details */
	getSocketHeaders<T>(socket: Socket): T & { agent: ISocketAgentDetails };

	/** Adds an agent (socket) to a specified room */
	addSocketToRoom(socket: Socket, room: string): void;

	/** Removes an agent (socket) from all assigned rooms */
	removeSocketFromRoom(socket: Socket): IFloorManagerRoom | undefined;

	getSocketRoom<T>(socket: Socket): IFloorManagerRoom | undefined;

	editRoomSocketData<T>(socket: Socket, data: { [key: string]: T }): void;
}

export type FloorManager = {
	new (io: ISocketIo): ISocketioFloorManager;
};
