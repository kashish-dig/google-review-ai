export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
        return res.status(500).json({
            error: "Supabase authentication configuration is missing."
        });
    }

    return res.status(200).json({
        supabaseUrl,
        publishableKey
    });
}
