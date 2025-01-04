import fetch, { Headers } from 'node-fetch';

import env from '../config/env';
import { GetTokenRes } from '../types/response';
import logger from '../utils/log';

export default async function getToken(): Promise<GetTokenRes | null> {
    return await fetchToken(env.DeviceTime, env.Sign, env.UserAgent);
}

export async function fetchToken(
    DeviceTime: string,
    Sign: string,
    UserAgent: string
): Promise<GetTokenRes | null> {
    const headers = new Headers();
    headers.append('Appvr', '5.8.0');
    headers.append('Device-Time', DeviceTime);
    headers.append('Origin', 'https://www.capcut.com');
    headers.append('Pf', '7');
    headers.append('Sign', Sign);
    headers.append('Sign-Ver', '1');
    headers.append('User-Agent', UserAgent);

    try {
        const res = await fetch(env.CapCutAPIURL+"/common/tts/token", {
            method: 'POST',
            headers: headers
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        logger.error("can't get token");
        return null;
    }
}

export async function getTokenIndex(index: number): Promise<GetTokenRes | null> {
   // signs and deviceTimes are arrays
    const signs = env.Signs;
    const deviceTimes = env.DeviceTimes;
    return await fetchToken(deviceTimes[index], signs[index], env.UserAgent);
}