/**
 * Execute every specified time, and the number of executions can be specified.
 * Executed once at the moment of call.
 * @param time Interval time
 * @param num Number of executions
 * @param func Function to be executed
 * @param callback Executed when last `func` done
 */
export function callPerPeriod(
  time: number,
  num: number,
  func: Function = () => {},
  callback: Function = () => {}
) {
  func();
  num--;
  if (num <= 0) {
    callback();
    console.log('complete count');
    return;
  }
  setTimeout(() => callPerPeriod(time, num, func, callback), time);
}

/**
 * Download data from local memory.
 * ```ts
 * fakeDownload(filename, [res.data])
 * ```
 * @param filename
 * @param blobParts
 * @param options
 */
export function fakeDownload(
  filename?: string,
  blobParts?: BlobPart[] | undefined,
  options?: BlobPropertyBag | undefined
) {
  const url = window.URL.createObjectURL(new Blob(blobParts, options));
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  let real_filename: string;
  if (filename) {
    real_filename = filename;
  } else {
    real_filename = 'untitled';
  }
  link.setAttribute('download', real_filename);
  // download
  document.body.appendChild(link);
  link.click();
  // remove
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
