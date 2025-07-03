import { DefaultEventsMap, Server } from 'socket.io';

export type ISocketIo = Server<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	unknown
>;

export interface ISocketUserInfo {
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
