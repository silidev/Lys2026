const FILE_PATH = 'common/services/downloader.ts';
// No test coverage is needed. This service directly manipulates the DOM to trigger a download,
// which is not suitable for unit/logic testing.
const downloaderService = {
  downloadBlob: (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export default downloaderService;
