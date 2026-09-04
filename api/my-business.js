export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const authHeader = req.headers.authorization || "";
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (!match) {
            return res.status(401).json({ error: "Authentication required." });
        }

        const accessToken = match[1];
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !supabaseSecretKey || !publishableKey) {
            return res.status(500).json({ error: "Database configuration is missing." });
        }

        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: "GET",
            headers: {
                "apikey": publishableKey,
                "Authorization": `Bearer ${accessToken}`
            }
        });

        const userData = await userResponse.json();
        if (!userResponse.ok || !userData?.id) {
            return res.status(401).json({ error: "Your login session is invalid or expired." });
        }

        const response = await fetch(
            `${supabaseUrl}/rest/v1/businesses?select=business_id,business_name,website,industry,location,services,google_review_link&owner_id=eq.${encodeURIComponent(userData.id)}&order=id.asc&limit=1`,
            {
                method: "GET",
                headers: {
                    "apikey": supabaseSecretKey,
                    "Authorization": `Bearer ${supabaseSecretKey}`
                }
            }
        );

        const data = await response.json();
        if (!response.ok) {
            console.error("Supabase owner business lookup error:", data);
            return res.status(500).json({ error: "Unable to access your saved business." });
        }

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(404).json({ error: "No saved business found." });
        }

        return res.status(200).json({ business: data[0] });
    } catch (error) {
        console.error("Owner business lookup error:", error);
        return res.status(500).json({ error: "Something went wrong." });
    }
}
