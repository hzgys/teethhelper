
import { LogEntry, WearStatus, RemovalReason, TrayConfig, Settings, PhotoRecord } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

export const generateMockData = () => {
    const logs: LogEntry[] = [];
    const now = new Date();
    
    // Generate 30 days of logs
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0); // Start day at 8 AM
        
        let currentTime = date.getTime();

        // Morning wear (4.5 hours)
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: currentTime + 4.5 * 3600 * 1000,
            status: WearStatus.WEARING
        });
        currentTime += 4.5 * 3600 * 1000;

        // Breakfast (15 mins - fast eater to meet goals!)
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: currentTime + 15 * 60 * 1000,
            status: WearStatus.REMOVED,
            reason: RemovalReason.EATING
        });
        currentTime += 15 * 60 * 1000;

        // Mid-day wear (5 hours)
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: currentTime + 5 * 3600 * 1000,
            status: WearStatus.WEARING
        });
        currentTime += 5 * 3600 * 1000;

        // Lunch (25 mins)
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: currentTime + 25 * 60 * 1000,
            status: WearStatus.REMOVED,
            reason: RemovalReason.EATING
        });
        currentTime += 25 * 60 * 1000;

        // Afternoon wear (6 hours)
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: currentTime + 6 * 3600 * 1000,
            status: WearStatus.WEARING
        });
        currentTime += 6 * 3600 * 1000;

         // Dinner (35 mins)
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: currentTime + 35 * 60 * 1000,
            status: WearStatus.REMOVED,
            reason: RemovalReason.EATING
        });
        currentTime += 35 * 60 * 1000;

        // Night wear until next morning 8am
        const nextMorning = new Date(date);
        nextMorning.setDate(nextMorning.getDate() + 1);
        nextMorning.setHours(8, 0, 0, 0);
        
        // If it's today (i=0), leave endTime null to simulate currently wearing
        const wearEnd = i === 0 ? null : nextMorning.getTime();
        
        logs.push({
            id: crypto.randomUUID(),
            startTime: currentTime,
            endTime: wearEnd,
            status: WearStatus.WEARING
        });
    }

    const trayConfig: TrayConfig = {
        currentTray: 12,
        totalTrays: 40,
        daysPerTray: 10,
        // Simulate being on Day 6 of the current tray (5 full days passed)
        startDate: new Date().getTime() - (5 * 24 * 60 * 60 * 1000)
    };

    return {
        logs,
        trayConfig,
        settings: DEFAULT_SETTINGS,
        photos: [] as PhotoRecord[]
    };
};
