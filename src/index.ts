import { App } from "./app";
import config from "./app/config";

new App().server.listen(config.port);