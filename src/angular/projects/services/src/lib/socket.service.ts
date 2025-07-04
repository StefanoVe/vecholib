import { Inject, Injectable } from '@angular/core';
import {
  EnumSocketIONotificationsEvents,
  EnumSocketIOProfileEvents,
  ISocketUserInfo,
} from '@notify/interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public connectedDevices$ = new BehaviorSubject<ISocketUserInfo[]>([]);
  public fileRecieved$ = new Subject<{ fileData: Buffer; fileName: string }>();
  public increaseNotificationsCount$ = new Subject<void>();

  public connection$ = new BehaviorSubject<{
    status: boolean;
    userInfo?: ISocketUserInfo;
    profile?: string;
    owner?: string;
  }>({
    status: false,
  });

  public user?: ISocketUserInfo;

  private _socket?: Socket;

  public serviceLoeadedAt = Date.now();

  public get connection() {
    return this.connection$.value;
  }

  public get storedId() {
    return localStorage.getItem(this._socketIdKey);
  }

  constructor(
    @Inject('socketUrl') private _socketUrl: string,
    @Inject('socketidKey') private _socketIdKey: string,
    private _detector: DeviceDetectorService
  ) {}

  public connect(profile: string, owner = '', userId?: string) {
    console.log(`Connecting to socket server`);
    this._populateUserInfo(userId);

    this._socket = io(this._socketUrl, {
      secure: true,
      extraHeaders: {
        profile,
        owner,
        userinfo: JSON.stringify(this.user),
        id: this.user?.id || '',
      },
    });

    this._socket.connect();

    this._eventsListeners(profile, owner);
  }

  public disconnect() {
    if (!this._socket) {
      return;
    }

    this._socket.disconnect();
    this.connectedDevices$.next([]);
  }

  public sendFile(
    fileData: ArrayBuffer,
    fileName: string,
    target: ISocketUserInfo['id']
  ) {
    this._socket?.emit(
      EnumSocketIOProfileEvents.SendFile,
      {
        target,
        fileData,
        fileName,
      },
      (status: number) => {
        console.log(status);
      }
    );
  }

  private _populateUserInfo(userId?: string) {
    const _guestId = Math.random().toString(36).substr(2, 9);
    const info = this._detector.getDeviceInfo();

    const id = this.storedId || userId || _guestId;

    this.user = {
      browser: `${info.browser} ${info.browser_version}`,
      device: info.device,
      deviceType: info.deviceType,
      connectionTimestamp: Date.now(),
      id,
    };

    if (!this.storedId) {
      localStorage.setItem(this._socketIdKey, id);
    }
  }

  private _eventsListeners(profile: string, owner = '') {
    if (!this._socket) {
      return;
    }

    this._socket.on('connect', () => {
      console.log(`Connected to socket server`);
      this.connection$.next({
        status: true,
        profile,
        owner,
        userInfo: this.user,
      });
    });

    this._socket.on('disconnect', () => {
      this.connection$.next({
        status: false,
      });
    });

    //connected devices
    this._socket.on(
      EnumSocketIOProfileEvents.ConnectedDevices,
      (devices: ISocketUserInfo[]) => {
        this.connectedDevices$.next(
          devices.filter((device) => device.id !== this.user?.id)
        );
      }
    );

    this._socket.on(
      EnumSocketIOProfileEvents.RecieveFile,
      (data: { fileData: Buffer; fileName: string }) => {
        this.fileRecieved$.next(data);
      }
    );

    this._socket.on(
      EnumSocketIONotificationsEvents.IncreaseNotificationCount,
      () => {
        console.log('notification recieved');
        this.increaseNotificationsCount$.next();
      }
    );
  }
}
