import {Observable} from 'rxjs';

export type FileReaderReadAs = 'url' | 'array-buffer' | 'text';

export function readFile(
  file: File,
  readAs: 'url'
): Observable<string>
export function readFile(
  file: File,
  readAs: 'array-buffer'
): Observable<ArrayBuffer>
export function readFile(
  file: File,
  readAs: 'text'
): Observable<string>
export function readFile(
  file: File,
  readAs: FileReaderReadAs
): Observable<string | ArrayBuffer> {
  const reader = new FileReader();
  switch (readAs) {
    case 'url':
      reader.readAsDataURL(file);
      break;
    case 'text':
      reader.readAsText(file);
      break;
    case 'array-buffer':
      reader.readAsArrayBuffer(file);
      break;
    default:
      throw new Error(`Unknown readAs argument in readFile(blob, '${readAs}')`);
  }
  return new Observable(sub => {
    reader.onload = () => {
      sub.next(reader.result!);
      sub.complete();
    }
    reader.onerror = (err) => {
      sub.error(err);
      sub.complete();
    }
    reader.onabort = () => {
      sub.error(new Error('File read aborted'));
      sub.complete();
    }
  });
}
