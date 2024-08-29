import config from "./index";

export const {
  username,
  password,
  database,
  host,
  dialect,
  timezone
} = (config as any).database;

export default config.database;
