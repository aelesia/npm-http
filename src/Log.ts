export default new (class Log {
  private _stream?: (log: string) => void

  set stream(fun: (log: string) => void) {
    this._stream = fun
  }

  info(log: string): void {
    if (this._stream) this._stream(log)
  }
})()
