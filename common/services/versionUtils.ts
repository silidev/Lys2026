const FILE_PATH = 'common/services/versionUtils.ts';

export interface VersionDate {
    year: number; // e.g. 2025
    month: number; // 1-12
    day: number;
    hours: number;
    minutes: number;
}

const pad = (num: number): string => num.toString().padStart(2, '0');

export const getAppVersionString = (date: VersionDate): string => {
    const { year, month, day, hours, minutes } = date;
    const yearShort = year.toString().slice(-2);
    return `${yearShort}-${pad(month)}-${pad(day)}_${pad(hours)}:${pad(minutes)}`;
};

export const getVersionAgeInDays = (date: VersionDate): number => {
    // JS month is 0-indexed, so subtract 1
    const versionTimestamp = new Date(date.year, date.month - 1, date.day, date.hours, date.minutes).getTime();
    const nowTimestamp = Date.now();
    
    const diffMillis = nowTimestamp - versionTimestamp;
    const diffHours = diffMillis / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    return diffDays;
};

export const formatTimestamp = (timestamp: number): string => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDaysAgo = (
    timestamp: number,
    t: (key: string, ...args: (string | number)[]) => string
): string => {
    const diffDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
        return t('time.today');
    }
    if (diffDays < 2) {
        return t('time.yesterday');
    }
    return t('time.daysAgo', Math.floor(diffDays));
};
