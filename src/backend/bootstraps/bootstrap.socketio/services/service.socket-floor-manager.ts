import * as _ from 'lodash';
import { Socket } from 'socket.io';
import {
	EnumSocketIOUserEvents,
	IFloorManagerRoom,
	ISocketAgentDetails,
	ISocketIo,
	ISocketioFloorManager,
} from '../../../../interfaces/interface.socketio';
/**
 * Manages active socket connections for different rooms using Socket.IO.
 *
 * The `SocketioFloorManager` class tracks users connected to various rooms,
 * allowing addition and removal of users, and emits updates to each room
 * when the list of connected users changes.
 *
 * @remarks
 * - Each room maintains a list of unique user sockets.
 * - When users are added or removed, the updated list is broadcast to the room.
 *
 * @example
 * ```typescript
 * const manager = new SocketioFloorManager(io);
 * manager.add(userInfo, 'room1');
 * manager.remove(userInfo);
 * ```
 */
export class SocketioFloorManager implements ISocketioFloorManager {
	private _activeConnections: IFloorManagerRoom[] = [];

	public get activeConnections() {
		return this._activeConnections;
	}

	constructor(private io: ISocketIo) {}

	public getSocketRoom(socket: Socket): IFloorManagerRoom | undefined {
		const agent = this.getSocketHeaders<ISocketAgentDetails>(socket).agent;
		return this._activeConnections.find((connection) =>
			connection.sockets.find((socket) => this._compare(socket, agent))
		);
	}

	public getRoom(room: string) {
		return this._activeConnections?.find((v) => v.room === room);
	}

	public getSocketHeaders = <T>(socket: Socket) => {
		const headers = socket.handshake.headers;

		return <T & { agent: ISocketAgentDetails }>{
			..._.cloneDeep(headers),
			agent: JSON.parse(headers['agent'] as string),
		};
	};

	public editRoomSocketData<T>(socket: Socket, data: { [key: string]: T }) {
		const agent = this.getSocketHeaders<ISocketAgentDetails>(socket).agent;
		const roomIndex = this._activeConnections.findIndex((connection) =>
			connection.sockets.find((socket) => this._compare(socket, agent))
		);

		if (roomIndex === -1) {
			return;
		}

		const room = this._activeConnections[roomIndex].room;

		this.activeConnections[roomIndex].socketsData[agent.id] = data;

		this._emitUpdates(room);
	}

	public addSocketToRoom(socket: Socket, room: string) {
		socket.join(room);
		//check if the room already exists
		const existingRoom = this._activeConnections.find(
			(connection) => connection.room === room
		);

		const agent = this.getSocketHeaders<ISocketAgentDetails>(socket).agent;

		if (!existingRoom) {
			//if the room doesn't exist, create it and add the user
			this._activeConnections.push({ sockets: [agent], room, socketsData: {} });

			//emit to room the new list of connected devices
			this._emitUpdates(room);

			return;
		}

		const userExists = existingRoom.sockets.find((roomSockets) =>
			this._compare(roomSockets, agent)
		);

		if (userExists) {
			//if the user already exists, do nothing
			return;
		}

		//if the room exists, push the new user to the list
		existingRoom.sockets.push(agent);

		//emit to room the new list of connected devices
		this._emitUpdates(room);
	}

	public removeSocketFromRoom(socket: Socket) {
		const agent = this.getSocketHeaders<ISocketAgentDetails>(socket).agent;
		const roomIndex = this._activeConnections.findIndex((connection) =>
			connection.sockets.find((socket) => this._compare(socket, agent))
		);

		if (roomIndex === -1) {
			//if the index isn't found (-1) then there is nothing to remove
			return;
		}

		//find the current room of the socket
		const room = this._activeConnections[roomIndex].room;

		const socketIndex = this._activeConnections[roomIndex].sockets.findIndex(
			(socket) => this._compare(socket, agent)
		);

		//remove socket from list
		this._activeConnections[roomIndex].sockets.splice(socketIndex, 1);
		delete this._activeConnections[roomIndex].socketsData[agent.id];

		socket.leave(room);
		//emit to room the new list of connected devices
		this._emitUpdates(room);

		return this._activeConnections[roomIndex];
	}

	private _compare(source: ISocketAgentDetails, target: ISocketAgentDetails) {
		return source.id === target.id;
	}

	private _socketsInRoom(room: string) {
		//unicque by id
		return (
			this._activeConnections
				.find((connection) => connection.room === room)
				?.sockets.filter(
					(socket, index, self) =>
						index === self.findIndex((s) => s.id === socket.id)
				) || []
		);
	}

	private _emitUpdates(room: string) {
		this.io
			.in(room)
			.emit(EnumSocketIOUserEvents.RoomUpdated, this._socketsInRoom(room));
	}
}
