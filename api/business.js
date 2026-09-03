export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                error: "Business ID is required."
            });
        }

        const supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseSecretKey =
            process.env.SUPABASE_SECRET_KEY;

        if (!supabaseUrl || !supabaseSecretKey) {
            return res.status(500).json({
                error: "Database configuration is missing."
            });
        }

        const response = await fetch(
            `${supabaseUrl}/rest/v1/businesses?select=business_id,business_name,website,industry,location,services,google_review_link&business_id=eq.${encodeURIComponent(id)}&limit=1`,
            {
                method: "GET",

                headers: {
                    "apikey": supabaseSecretKey
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(
                "Supabase lookup error:",
                data
            );

            return res.status(500).json({
                error: "Unable to access business database."
            });
        }

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(404).json({
                error: "Business not found."
            });
        }

        return res.status(200).json({
            business: data[0]
        });

    } catch (error) {

        console.error(
            "Business lookup error:",
            error
        );

        return res.status(500).json({
            error: "Something went wrong."
        });
    }
}
