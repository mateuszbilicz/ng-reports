export interface Config {
    port: number; // server port
    clearRequireCache: boolean; // clear require cache after starting http server
    // cors configuration, default: allow all
    cors?: {
        origin: string[];
        methods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
        credentials: boolean;
    }
}