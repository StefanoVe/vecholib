import * as _ from 'lodash';
import { Socket } from 'socket.io';
import {
	EnumSocketIOUserEvents,
	ISocketAgentDetails,
	ISocketIo,
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
export class SocketioFloorManager {
	public activeConnections: { sockets: ISocketAgentDetails[]; room: string }[] =
		[];

	constructor(private io: ISocketIo) {}

	public getSocketHeaders = <T>(socket: Socket) => {
		const headers = socket.handshake.headers;

		return <T & { agent: ISocketAgentDetails }>{
			..._.cloneDeep(headers),
			agent: JSON.parse(headers['agent'] as string),
		};
	};

	public add(agent: ISocketAgentDetails, room: string) {
		//check if the room already exists
		const existingRoom = this.activeConnections.find(
			(connection) => connection.room === room
		);

		if (!existingRoom) {
			//if the room doesn't exist, create it and add the user
			this.activeConnections.push({ sockets: [agent], room });

			//emit to room the new list of connected devices
			this._emitUpdates(room);

			return;
		}

		// const userExists = existingRoom.sockets.find((socket) =>
		//   this._compare(socket, user)
		// );

		// if (userExists) {
		//   //if the user already exists, do nothing
		//   return;
		// }

		//if the room exists, push the new user to the list
		existingRoom.sockets.push(agent);

		//emit to room the new list of connected devices
		this._emitUpdates(room);
	}

	public remove(agent: ISocketAgentDetails) {
		const roomIndex = this.activeConnections.findIndex((connection) =>
			connection.sockets.find((socket) => this._compare(socket, agent))
		);

		if (roomIndex === -1) {
			//if the index isn't found (-1) then there is nothing to remove
			return;
		}

		//find the current room of the socket
		const room = this.activeConnections[roomIndex].room;

		const socketIndex = this.activeConnections[roomIndex].sockets.findIndex(
			(socket) => this._compare(socket, agent)
		);

		//remove socket from list
		this.activeConnections[roomIndex].sockets.splice(socketIndex, 1);

		//emit to room the new list of connected devices
		this._emitUpdates(room);
	}

	private _compare(source: ISocketAgentDetails, target: ISocketAgentDetails) {
		return source.id === target.id;
	}

	private _socketsInRoom(room: string) {
		//unicque by id
		return (
			this.activeConnections
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
			.emit(EnumSocketIOUserEvents.Connected, this._socketsInRoom(room));
	}
}
