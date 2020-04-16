import { colorConsole } from 'tracer';

export const logger = colorConsole({
  format: '[{{timestamp}}] [{{title}}] {{message}}',
  level: 'info'
});
