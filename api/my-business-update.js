export default async function handler(req, res) {
    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const authHeader = req.headers.authorization || "";
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (!match) return res.status(401).json({ error: "Authentication required." });

        const accessToken = match[1];
        const supabaseUrl = process.env.SUPABASE_URL;
        const secretKey = process.env.SUPABASE_SECRET_KEY;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !secretKey || !publishableKey) {
            return res.status(500).json({ error: "Database configuration is missing." });
        }

        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` }
        });
        const userData = await userResponse.json();
        if (!userResponse.ok || !userData?.id) {
            return res.status(401).json({ error: "Your login session is invalid or expired." });
        }

        const body = req.body || {};
        const businessId = String(body.businessId || "").trim();
        if (!businessId) return res.status(400).json({ error: "Business ID is required." });

        const update = {
            business_name: String(body.businessName || "").trim(),
            website: String(body.website || "").trim(),
            industry: String(body.industry || "").trim(),
            location: String(body.location || "").trim(),
            services: String(body.services || "").trim(),
            google_review_link: String(body.googleReviewLink || "").trim()
        };

        if (!update.business_name || !update.industry) {
            return res.status(400).json({ error: "Business name and industry are required." });
        }

        const response = await fetch(
            `${supabaseUrl}/rest/v1/businesses?business_id=eq.${encodeURIComponent(businessId)}&owner_id=eq.${encodeURIComponent(userData.id)}`,
            {
                method: "PATCH",
                headers: {
                    apikey: secretKey,
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                    Prefer: "return=representation"
                },
                body: JSON.stringify(update)
            }
        );
        const data = await response.json();
        if (!response.ok) {
            console.error("Supabase business update error:", data);
            return res.status(500).json({ error: "Unable to save your business." });
        }
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(404).json({ error: "Business not found for your account." });
        }

        return res.status(200).json({ business: data[0] });
    } catch (error) {
        console.error("Business update error:", error);
        return res.status(500).json({ error: "Something went wrong." });
    }
}