import { ScalekitClient } from '@scalekit-sdk/node';
import 'dotenv/config';

const scalekitClient = new ScalekitClient(
    process.env.SCALEKIT_ENV_URL,
    process.env.SCALEKIT_CLIENT_ID,
    process.env.SCALEKIT_CLIENT_SECRET
);

export const { connectedAccounts, tools } = scalekitClient;