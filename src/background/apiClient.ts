import { Ban } from '../common/types';

export interface SeasonInfo {
    seasonNumber: number;
    startDate: string;
    endDate: string;
    updatedAt: string;
    urls: {
        bans: string;
        extendedBans: string;
        cardPrices: string;
    };
}

export interface CachedData {
    bans: Ban[];
    extendedBans: Ban[];
    cardPrices: Record<string, number>;
    seasonInfo: SeasonInfo;
    cacheTimestamp: number;
}

interface CachedSeasonInfo {
    data: SeasonInfo,
    timestamp: number,
}

const API_BASE_URL = __API_BASE_URL__;
const CACHE_KEY = 'api_cached_data';
const SEASON_INFO_CACHE_KEY = 'season_info_cache';
const SEASON_INFO_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export class ApiClient {
    private static instance: ApiClient;

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    async getCurrentSeasonInfo(): Promise<SeasonInfo> {
        // Check if we have cached season info that's less than 1 hour old
        const cachedResult = await chrome.storage.local.get([SEASON_INFO_CACHE_KEY]);
        const cached: CachedSeasonInfo = cachedResult[SEASON_INFO_CACHE_KEY];
        
        if (cached && (Date.now() - cached.timestamp) < SEASON_INFO_CACHE_DURATION) {
            return cached.data;
        }
        
        // Fetch fresh data
        const response = await fetch(`${API_BASE_URL}/legacy/season/current`);
        if (!response.ok) {
            throw new Error(`Failed to fetch season info: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Cache the result with timestamp
        try {
            await chrome.storage.local.set({
                [SEASON_INFO_CACHE_KEY]: {
                    data,
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.error('Error caching season info:', error);
        }
        
        return data;
    }

    async getBans(season: number): Promise<Ban[]> {
        const response = await fetch(`${API_BASE_URL}/legacy/season/${season}/bans.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch bans for season ${season}: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    }

    async getExtendedBans(season: number): Promise<Ban[]> {
        const response = await fetch(`${API_BASE_URL}/legacy/season/${season}/extended-bans.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch extended bans for season ${season}: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    }

    async getCardPrices(season: number): Promise<Record<string, number>> {
        const response = await fetch(`${API_BASE_URL}/legacy/season/${season}/card-prices.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch card prices for season ${season}: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    }

    async isCacheValid(): Promise<boolean> {
        try {
            const cached = await this.getCachedData();
            if (!cached) {
                return false;
            }

            const currentSeasonInfo = await this.getCurrentSeasonInfo();
            
            // Check if season number changed
            if (cached.seasonInfo.seasonNumber !== currentSeasonInfo.seasonNumber) {
                return false;
            }

            // Check if data was updated
            const cachedUpdatedAt = new Date(cached.seasonInfo.updatedAt).getTime();
            const currentUpdatedAt = new Date(currentSeasonInfo.updatedAt).getTime();
            
            return cachedUpdatedAt >= currentUpdatedAt;
        } catch (error) {
            console.error('Error validating cache:', error);
            return false;
        }
    }

    async getCachedData(): Promise<CachedData | null> {
        try {
            const result = await chrome.storage.local.get([CACHE_KEY]);
            return result[CACHE_KEY] || null;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }

    async setCachedData(data: CachedData): Promise<void> {
        try {
            await chrome.storage.local.set({ [CACHE_KEY]: data });
        } catch (error) {
            console.error('Error writing to cache:', error);
            throw error;
        }
    }

    async clearCache(): Promise<void> {
        try {
            await chrome.storage.local.remove([CACHE_KEY, SEASON_INFO_CACHE_KEY]);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    async fetchFreshData(): Promise<CachedData> {
        const seasonInfo = await this.getCurrentSeasonInfo();
        const season = seasonInfo.seasonNumber;

        const [bans, extendedBans, cardPrices] = await Promise.all([
            this.getBans(season),
            this.getExtendedBans(season),
            this.getCardPrices(season)
        ]);

        const cachedData: CachedData = {
            bans,
            extendedBans,
            cardPrices,
            seasonInfo,
            cacheTimestamp: Date.now()
        };

        await this.setCachedData(cachedData);
        return cachedData;
    }

    async getData(): Promise<CachedData> {
        const isValid = await this.isCacheValid();
        
        if (isValid) {
            const cached = await this.getCachedData();
            if (cached) {
                return cached;
            }
        }

        // Cache is invalid or doesn't exist, fetch fresh data
        return this.fetchFreshData();
    }
}
