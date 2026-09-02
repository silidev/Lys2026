const FILE_PATH = 'data/defaultCsvItems.ts';

interface CsvItem {
    name: string;
    group: string;
    crossedOut: boolean;
    id: string;
}

export const csvItems: CsvItem[] = [
    { name: "Milk (Look at home if you need this)", group: "Fridge", crossedOut: false, id: 'd-1' },
    { name: "Turkey for thanksgiving", group: "Hidden", crossedOut: true, id: 'd-2' },
];