const FILE_PATH = 'testing/mocks/dataTransfer.mock.ts';
// A mock for the DataTransfer object, which is not fully implemented in JSDOM.
export class MockDataTransfer {
    private store = new Map<string, string>();
    dropEffect: 'none' | 'copy' | 'link' | 'move' = 'none';
    effectAllowed: 'none' | 'copy' | 'copyLink' | 'copyMove' | 'link' | 'linkMove' | 'move' | 'all' | 'uninitialized' = 'uninitialized';
    files: File[] = [];
    items: DataTransferItem[] = [];
    types: readonly string[] = [];

    clearData(format?: string) {
        if (format) {
            this.store.delete(format);
        } else {
            this.store.clear();
        }
    }
    getData(format: string): string {
        return this.store.get(format) ?? '';
    }
    setData(format: string, data: string): void {
        this.store.set(format, data);
    }
    setDragImage(_image: Element, _x: number, _y: number): void {}
}