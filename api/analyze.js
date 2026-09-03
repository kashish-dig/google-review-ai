export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const { website } = req.body || {};

    if (!website) {
        return res.status(400).json({
            error: "Website URL is required"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Business website received successfully.",
        website: website
    });
}
