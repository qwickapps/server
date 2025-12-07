import { AppConfigBuilder } from '@qwickapps/react-framework';

/**
 * Default control panel configuration
 * Consumers can override this by passing their own config
 */
export const defaultConfig = AppConfigBuilder.create()
  .withName('Control Panel')
  .withId('com.qwickapps.control-panel')
  .withVersion('1.0.0')
  .withDefaultTheme('dark')
  .withDefaultPalette('cosmic')
  .withThemeSwitcher(true)
  .withPaletteSwitcher(true)
  .withDisplay('standalone')
  .build();

export type ControlPanelUIConfig = ReturnType<typeof AppConfigBuilder.prototype.build>;
