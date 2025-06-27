/**
 * It takes a message and a type, and logs the message in a color based on the type
 * @param {string} msg - The message to be displayed.
 * @param {'success' | 'info' | 'error' | 'start' | 'warning' | 'end'} type - 'success' | 'info' |
 * 'error' | 'start' | 'warning' | 'end'
 */
export const log = (
  msg: string,
  type: 'success' | 'info' | 'error' | 'start' | 'warning' | 'end'
) => {
  let color = 'white';
  // const  bgc = "White";
  switch (type) {
    case 'success':
      color = '\u001b[1;32m';
      break;
    case 'info':
      color = '\u001b[1;36m';
      break;
    case 'error':
      color = '\u001b[1;31m';
      break;
    case 'start':
      color = '\u001b[1;35m';
      break;
    case 'warning':
      color = '\u001b[1;33m';
      break;
    case 'end':
      color = '\u001b[1;35m';
      break;
  }

  const _message = `${color}${msg}\u001b[0m`;

  console.log(_message);
};

/**
 *
 * Usage example: 
 *  export const managedLogs = LogManager.init([], 100);

export const mLog = (...args: Parameters<typeof log>) => {
  args.push(managedLogs);
  log(...args);
};
 */
export class LogManager {
  private _recentLogs: string[] = [];

  constructor(private ignore: string[], private _cacheSize: number) {}

  public static init(ignore: string[] = [], _cacheSize = 100) {
    return new LogManager(ignore, _cacheSize);
  }

  public get logs() {
    return this._recentLogs;
  }

  private _storeLogEntry(message: string) {
    if (this.ignore.some((i) => message.includes(i))) {
      return;
    }

    this._recentLogs.push(message);
    this._clean();
  }

  public log(
    msg: string,
    type: 'success' | 'info' | 'error' | 'start' | 'warning' | 'end'
  ) {
    log(msg, type);
    this._storeLogEntry(msg);
  }

  private _clean() {
    //removes logs older than cacheSize

    if (this._recentLogs.length < this._cacheSize) {
      return;
    }
    this._recentLogs.splice(0, this._recentLogs.length - this._cacheSize);
  }
}
