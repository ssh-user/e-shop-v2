import * as express from 'express';
import { config } from "./config";

import { serverConfig } from "./modules/serverConfig";
import { routers } from "./modules/routers";
import { auth } from "./modules/auth";
import { db } from './modules/mongo';
import { counter } from "./modules/visitor_counter";

const app = express();

// all configs are included (except auth)
serverConfig(app);

// set auth
auth(app);

// set visitor counter
app.use(counter);

// set routers
routers(app);

// start server
db.start(() => app.listen(config.server.port, () => console.log('Server - start')));


