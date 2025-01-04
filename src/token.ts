import getToken, { getTokenIndex } from "./api/getToken";
import env from "./config/env";
import logger from "./utils/log";
import { sleep } from "./utils/util";

export const USER = {
    token: '',
    appKey: ''
}

interface User {
    token: string;
    appKey: string;
}

export const USERS: User[] = [];

export const getUserRandom = () => {

    if (USERS.length === 0) {
        return USER;
    }

    const randomIndex = Math.floor(Math.random() * USERS.length);
    return USERS[randomIndex];
}

export async function tokenTask() {
    logger.info("Token Task started");
    if (Array.isArray(env.DeviceTimes) && Array.isArray(env.Signs)) {
        tokenTaskMultiple();
    } else {
        tokenTaskSingle();
    }
}

export async function tokenTaskSingle() {
    logger.info("Token Task Single started");
    while(true) {
        if (Number.isNaN(env.TokenInterval)) throw ".env TOKEN_INTERVAL is invalid.";
        logger.info("Token generated");
        const tokenRes = await getToken();
        if (!tokenRes) continue;
        USER.token = tokenRes.data.token;
        USER.appKey = tokenRes.data.app_key;
        await sleep(1000 * 60 * 60 * env.TokenInterval);
    }
}

export async function tokenTaskMultiple() {
    logger.info("Token Task Multiple started");
    while(true) {
        if (Number.isNaN(env.TokenInterval)) throw ".env TOKEN_INTERVAL is invalid.";
        for (let i = 0; i < env.DeviceTimes.length; i++) {
            const tokenRes = await getTokenIndex(i);
            if (tokenRes) {
                USERS[i] = {
                    token: tokenRes.data.token,
                    appKey: tokenRes.data.app_key
                };
            }
            logger.info(`Token ${i} generated`);

            await sleep(1000);
        }
        await sleep(1000 * 60 * 60 * env.TokenInterval);
    }
}