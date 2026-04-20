import { schedule } from '@netlify/functions';

export const handler = schedule('0 */6 * * *', async () => {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const secret = process.env.CRON_SECRET;
        
        console.log("Running scheduled price check hitting:", `${appUrl}/api/check-prices`);

        const response = await fetch(`${appUrl}/api/check-prices`, {
            headers: {
                Authorization: `Bearer ${secret}`
            }
        });

        const data = await response.json();
        console.log("Check complete:", data);

        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (e) {
        console.error("Scheduled task failed", e);
        return { statusCode: 500 };
    }
});
