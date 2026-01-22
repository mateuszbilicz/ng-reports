export const downloadFile = (blob: Blob, filename: string) => {
  const currentLocation = window.location.href + '';
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.download = `${filename}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  window.location.replace(currentLocation);
}
