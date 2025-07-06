import { inject, Inject, Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ISocketAgentDetails } from 'vecholib-interfaces';
@Injectable()
export class SocketConnectionHandlerService {
  private _detector = inject(DeviceDetectorService);

  public connectedDevices$ = new BehaviorSubject<ISocketAgentDetails[]>([]);
  public connection$ = new BehaviorSubject<{
    active: boolean;
    user?: ISocketAgentDetails;
  }>({
    active: false,
  });

  public agent?: ISocketAgentDetails;
  public serviceLoeadedAt = Date.now();

  public socket!: Socket;

  public get connection() {
    return this.connection$.value;
  }

  constructor(
    @Inject('SOCKET_SERVER_URL') private _socketUrl: string,
    @Inject('SOCKET_SECURE_CONNECTION') private _secureConnection: boolean
  ) {}

  public connect<T>(userId?: string, headers?: T) {
    console.log(`Connecting to socket server`);
    this._setAgentInformation(userId);

    this.socket = io(this._socketUrl, {
      secure: this._secureConnection,
      extraHeaders: {
        user: JSON.stringify(headers || {}),
        agent: JSON.stringify(this.agent),
        id: this.agent?.id || '',
      },
    });

    this.socket.connect();

    this._baseEvents();
    this.appEvents();
  }

  public disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.connectedDevices$.next([]);
  }

  /**
   * To be overridden by the child classes to handle context events.
   * This method is intentionally left empty to allow child classes to implement their own logic.
   * @returns {void}
   * @memberof SocketService
   */
  public appEvents(): void {
    return;
  }

  private _setAgentInformation(userId?: string) {
    const _guestId = Math.random().toString(36).substr(2, 9);
    const info = this._detector.getDeviceInfo();

    const id = userId || _guestId;

    this.agent = {
      browser: `${info.browser} ${info.browser_version}`,
      device: info.device,
      deviceType: info.deviceType,
      connectionTimestamp: Date.now(),
      id,
    };
  }

  private _baseEvents() {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      console.log(`Connected to socket server`);
      this.connection$.next({
        active: true,
        user: this.agent,
      });
    });

    this.socket.on('disconnect', () => {
      this.connection$.next({
        active: false,
      });
    });

    // //connected devices
    // this.socket.on(
    //   EnumSocketIOProfileEvents.ConnectedDevices,
    //   (devices: ISocketUserInfo[]) => {
    //     this.connectedDevices$.next(
    //       devices.filter((device) => device.id !== this.user?.id)
    //     );
    //   }
    // );

    // this._socket.on(
    //   EnumSocketIOProfileEvents.RecieveFile,
    //   (data: { fileData: Buffer; fileName: string }) => {
    //     this.fileRecieved$.next(data);
    //   }
    // );

    // this._socket.on(
    //   EnumSocketIONotificationsEvents.IncreaseNotificationCount,
    //   () => {
    //     console.log('notification recieved');
    //     this.increaseNotificationsCount$.next();
    //   }
    // );
  }
}

export const provideSocketConnectionHandlerService = (config: {
  url: string;
  secure?: boolean;
}) => {
  return [
    { provide: 'SOCKET_SERVER_URL', useValue: config.url },
    { provide: 'SOCKET_SECURE_CONNECTION', useValue: config.secure }, // Set to true for secure connections (HTTPS)
    {
      provide: SocketConnectionHandlerService,
      useClass: SocketConnectionHandlerService,
      deps: [
        DeviceDetectorService,
        'SOCKET_SERVER_URL',
        'SOCKET_SECURE_CONNECTION',
      ],
    },
  ];
};
