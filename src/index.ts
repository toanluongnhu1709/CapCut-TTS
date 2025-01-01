import express, { Request, Response } from 'express';
import cors from 'cors';

import logger from './utils/log';
import env from './config/env';
import synthesize from './routes/synthesize';
import { tokenTask, refreshToken } from './token';

// エラーハンドリング
if (env.ErrorHandle) {
    process.on("uncaughtException", (err) => {
        logger.error(err.toString());
    });
}

// TOKEN Task
tokenTask();

const app = express();
app.use(cors({ origin: env.Origin })); // cors 設定
const server = app.listen(env.Port, env.Host, () => {
    logger.info(`Server is running on: http://${env.Host}:${env.Port}`);
});

server.timeout = 1000 * 60 * 10; // 10分

// restServer
const mainRouter = express.Router();
app.use('/v1', mainRouter);
app.use((req, res, next) => {
    res.status(404).end();
});
mainRouter.get('/synthesize', synthesize);

// middleware to refresh token every 10 requests
let requestCounter = 0;
mainRouter.use((req, res, next) => {
    requestCounter++;
    if (requestCounter >= 10) {
        requestCounter = 0;
        refreshToken()
        .then(() => {
            next();
        })
        .catch((err) => {
            logger.error(err.toString());
            res.status(500).json({
                error: "Internal Server Error"
            });
        });
    }
});