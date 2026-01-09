import { AppConfigBuilder } from '@qwickapps/react-framework';
/**
 * Default control panel configuration
 * Consumers can override this by passing their own config
 */
export declare const defaultConfig: import("@qwickapps/react-framework").AppConfig;
export type ControlPanelUIConfig = ReturnType<typeof AppConfigBuilder.prototype.build>;
