import { logger } from './logger';

export enum AnalyticsEvent {
    // Core Events
    PAGE_VIEW = 'page_view',
    APP_STARTED = 'app_started',

    // Auth Events
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAILURE = 'login_failure',
    LOGOUT = 'logout',

    // Business Events
    REPORT_EXPORTED = 'report_exported',
    COMPLIANCE_QUERY = 'compliance_query',
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',

    // Error Events
    ERROR_CAPTURED = 'error_captured'
}

export interface AnalyticsProvider {
    name: string;
    identify(userId: string, traits?: Record<string, any>): void;
    track(event: string, properties?: Record<string, any>): void;
    page(path: string, properties?: Record<string, any>): void;
}

class ConsoleProvider implements AnalyticsProvider {
    name = 'Console';

    identify(userId: string, traits?: Record<string, any>): void {
        logger.debug(`[Analytics] Identify: ${userId}`, traits);
    }

    track(event: string, properties?: Record<string, any>): void {
        logger.debug(`[Analytics] Track: ${event}`, properties);
    }

    page(path: string, properties?: Record<string, any>): void {
        logger.debug(`[Analytics] Page: ${path}`, properties);
    }
}


const STORAGE_KEY = 'ecomed_analytics_events';
const MAX_EVENTS = 2000;

export interface StoredEvent {
    type: 'identify' | 'track' | 'page';
    name: string; // userId for identify, event name for track, path for page
    properties?: Record<string, any>;
    timestamp: string;
}

export const getStoredEvents = (): StoredEvent[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to parse analytics events', e);
        return [];
    }
};

class LocalStorageProvider implements AnalyticsProvider {
    name = 'LocalStorage (Dev)';

    private saveEvent(event: StoredEvent) {
        try {
            const events = getStoredEvents();
            events.unshift(event); // Add to beginning
            const trimmed = events.slice(0, MAX_EVENTS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.error('Failed to save analytics event', e);
        }
    }

    identify(userId: string, traits?: Record<string, any>): void {
        this.saveEvent({
            type: 'identify',
            name: userId,
            properties: traits,
            timestamp: new Date().toISOString()
        });
    }

    track(event: string, properties?: Record<string, any>): void {
        this.saveEvent({
            type: 'track',
            name: event,
            properties,
            timestamp: new Date().toISOString()
        });
    }

    page(path: string, properties?: Record<string, any>): void {
        this.saveEvent({
            type: 'page',
            name: path,
            properties,
            timestamp: new Date().toISOString()
        });
    }
}

class AnalyticsService {
    private providers: AnalyticsProvider[] = [];
    private userId: string | null = null;
    private userTraits: Record<string, any> = {};

    constructor() {
        // Add default providers
        this.addProvider(new ConsoleProvider());

        // Add LocalStorage provider for Dashboard demo
        this.addProvider(new LocalStorageProvider());

        // Future: Add Google Analytics, Segment, etc.
        // if (import.meta.env.VITE_GA_ID) {
        //     this.addProvider(new GoogleAnalyticsProvider());
        // }
    }

    addProvider(provider: AnalyticsProvider) {
        this.providers.push(provider);
        logger.info(`[Analytics] Provider added: ${provider.name}`);
    }

    identify(userId: string, traits?: Record<string, any>) {
        this.userId = userId;
        this.userTraits = { ...this.userTraits, ...traits };

        this.providers.forEach(provider => {
            try {
                provider.identify(userId, traits);
            } catch (error) {
                logger.error(`[Analytics] Error in identify with provider ${provider.name}`, error as Error);
            }
        });
    }

    track(event: string, properties?: Record<string, any>) {
        const enrichedProperties = {
            ...properties,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.providers.forEach(provider => {
            try {
                provider.track(event, enrichedProperties);
            } catch (error) {
                logger.error(`[Analytics] Error in track with provider ${provider.name}`, error as Error);
            }
        });
    }

    page(path: string, properties?: Record<string, any>) {
        const enrichedProperties = {
            ...properties,
            title: document.title,
            referrer: document.referrer
        };

        this.providers.forEach(provider => {
            try {
                provider.page(path, enrichedProperties);
            } catch (error) {
                logger.error(`[Analytics] Error in page with provider ${provider.name}`, error as Error);
            }
        });
    }

    reset() {
        this.userId = null;
        this.userTraits = {};
        // Some providers might need a reset call
    }
}

export const analytics = new AnalyticsService();
