export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { website } = req.body;

        if (!website) {
            return res.status(400).json({
                error: "Website URL is required."
            });
        }

        let url;

        try {
            url = new URL(website);
        } catch {
            return res.status(400).json({
                error: "Please enter a valid website URL."
            });
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            return res.status(400).json({
                error: "Only HTTP and HTTPS websites are supported."
            });
        }

        const hostname = url.hostname.toLowerCase();

        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1" ||
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("169.254.") ||
            hostname.startsWith("172.16.") ||
            hostname.startsWith("172.17.") ||
            hostname.startsWith("172.18.") ||
            hostname.startsWith("172.19.") ||
            hostname.startsWith("172.20.") ||
            hostname.startsWith("172.21.") ||
            hostname.startsWith("172.22.") ||
            hostname.startsWith("172.23.") ||
            hostname.startsWith("172.24.") ||
            hostname.startsWith("172.25.") ||
            hostname.startsWith("172.26.") ||
            hostname.startsWith("172.27.") ||
            hostname.startsWith("172.28.") ||
            hostname.startsWith("172.29.") ||
            hostname.startsWith("172.30.") ||
            hostname.startsWith("172.31.")
        ) {
            return res.status(400).json({
                error: "This website address is not allowed."
            });
        }

        // Normalize website URL
        const normalizedWebsite =
            url.toString().replace(/\/$/, "");

        // Fetch website
        const response = await fetch(normalizedWebsite, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; ReviewAssistant/1.0)"
            }
        });

        if (!response.ok) {
            return res.status(502).json({
                error: "Unable to access this website."
            });
        }

        const html = await response.text();

        // Extract readable text
        const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
            .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 20000);

        if (text.length < 100) {
            return res.status(422).json({
                error:
                    "Not enough readable information was found on this website."
            });
        }

        // Ask Groq to extract business information
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`
                },

                body: JSON.stringify({

                    model: "openai/gpt-oss-20b",

                    reasoning_effort: "low",

                    messages: [

                        {
                            role: "system",

                            content: `
You are a business website information extraction assistant.

Analyze the supplied public website text and extract only information that is clearly supported by the website.

Rules:
- Do not invent information.
- Do not guess the business location.
- Do not guess services.
- Do not guess the industry.
- If information is unclear or missing, return an empty string.
- Keep services concise and specific.
- Return only the requested structured information.
`
                        },

                        {
                            role: "user",

                            content: `
Extract the following information from this website:

1. Business name
2. Industry
3. City/location
4. Main services

Website URL:
${normalizedWebsite}

Website content:
${text}
`
                        }

                    ],

                    response_format: {
                        type: "json_schema",

                        json_schema: {
                            name: "business_information",

                            strict: true,

                            schema: {
                                type: "object",

                                properties: {

                                    businessName: {
                                        type: "string"
                                    },

                                    industry: {
                                        type: "string"
                                    },

                                    location: {
                                        type: "string"
                                    },

                                    services: {
                                        type: "string"
                                    }

                                },

                                required: [
                                    "businessName",
                                    "industry",
                                    "location",
                                    "services"
                                ],

                                additionalProperties: false
                            }
                        }
                    },

                    temperature: 0.2,

                    max_completion_tokens: 500
                })
            }
        );

        const groqData = await groqResponse.json();

        if (!groqResponse.ok) {

            console.error("Groq error:", groqData);

            return res.status(500).json({
                error: "Website analysis failed."
            });
        }

        const content =
            groqData.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({
                error: "AI returned an empty response."
            });
        }

        const result = JSON.parse(content);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
        error: "Database configuration is missing."
    });
}

const normalizedWebsite = url.toString().replace(/\/+$/, "");

const headers = {
    "Content-Type": "application/json",
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`
};

// Check if this business already exists
const existingResponse = await fetch(
    `${supabaseUrl}/rest/v1/businesses?select=business_id&website=eq.${encodeURIComponent(normalizedWebsite)}&limit=1`,
    {
        method: "GET",
        headers
    }
);

if (!existingResponse.ok) {
    const errorText = await existingResponse.text();
    console.error("Supabase lookup error:", errorText);

    return res.status(500).json({
        error: "Unable to access business database."
    });
}

const existingBusinesses = await existingResponse.json();

let businessId;

if (existingBusinesses.length > 0) {

    businessId = existingBusinesses[0].business_id;

    // Update existing business
    const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/businesses?business_id=eq.${encodeURIComponent(businessId)}`,
        {
            method: "PATCH",
            headers,
            body: JSON.stringify({
                business_name: result.businessName,
                website: normalizedWebsite,
                industry: result.industry,
                location: result.location,
                services: result.services
            })
        }
    );

    if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Supabase update error:", errorText);

        return res.status(500).json({
            error: "Unable to save business information."
        });
    }

} else {

    // Create a new business ID
    const baseName =
        (result.businessName || "business")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 45);

    const suffix =
        crypto.randomUUID().replace(/-/g, "").slice(0, 6);

    businessId = `${baseName || "business"}-${suffix}`;

    // Save new business
    const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/businesses`,
        {
            method: "POST",
            headers: {
                ...headers,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                business_id: businessId,
                business_name: result.businessName,
                website: normalizedWebsite,
                industry: result.industry,
                location: result.location,
                services: result.services,
                google_review_link: ""
            })
        }
    );

    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error("Supabase insert error:", errorText);

        return res.status(500).json({
            error: "Unable to save business information."
        });
    }
}

return res.status(200).json({
    ...result,
    businessId
});

        // ------------------------------------------------
        // SAVE BUSINESS TO SUPABASE
        // ------------------------------------------------

        const supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseSecretKey =
            process.env.SUPABASE_SECRET_KEY;

        if (!supabaseUrl || !supabaseSecretKey) {

            console.error(
                "Supabase environment variables are missing."
            );

            return res.status(500).json({
                error: "Database configuration is missing."
            });
        }

        const supabaseHeaders = {
            "Content-Type": "application/json",
            "apikey": supabaseSecretKey
        };

        // Check if this website already exists
        const existingResponse = await fetch(
            `${supabaseUrl}/rest/v1/businesses?select=business_id&website=eq.${encodeURIComponent(normalizedWebsite)}&limit=1`,
            {
                method: "GET",
                headers: supabaseHeaders
            }
        );

        const existingBusinesses =
            await existingResponse.json();

        if (!existingResponse.ok) {

            console.error(
                "Supabase lookup error:",
                existingBusinesses
            );

            return res.status(500).json({
                error: "Unable to access business database."
            });
        }

        let businessId;

        // Existing business
        if (
            Array.isArray(existingBusinesses) &&
            existingBusinesses.length > 0
        ) {

            businessId =
                existingBusinesses[0].business_id;

            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/businesses?business_id=eq.${encodeURIComponent(businessId)}`,
                {
                    method: "PATCH",

                    headers: {
                        ...supabaseHeaders,
                        "Prefer": "return=minimal"
                    },

                    body: JSON.stringify({

                        business_name:
                            result.businessName,

                        website:
                            normalizedWebsite,

                        industry:
                            result.industry,

                        location:
                            result.location,

                        services:
                            result.services

                    })
                }
            );

            if (!updateResponse.ok) {

                const updateError =
                    await updateResponse.text();

                console.error(
                    "Supabase update error:",
                    updateError
                );

                return res.status(500).json({
                    error:
                        "Unable to update business information."
                });
            }

        }

        // New business
        else {

            const baseName =
                (result.businessName || "business")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                    .slice(0, 40);

            const randomPart =
                crypto.randomUUID()
                    .replace(/-/g, "")
                    .slice(0, 6);

            businessId =
                `${baseName || "business"}-${randomPart}`;

            const insertResponse = await fetch(
                `${supabaseUrl}/rest/v1/businesses`,
                {
                    method: "POST",

                    headers: {
                        ...supabaseHeaders,
                        "Prefer": "return=minimal"
                    },

                    body: JSON.stringify({

                        business_id:
                            businessId,

                        business_name:
                            result.businessName,

                        website:
                            normalizedWebsite,

                        industry:
                            result.industry,

                        location:
                            result.location,

                        services:
                            result.services

                    })
                }
            );

            if (!insertResponse.ok) {

                const insertError =
                    await insertResponse.text();

                console.error(
                    "Supabase insert error:",
                    insertError
                );

                return res.status(500).json({
                    error:
                        "Unable to save business information."
                });
            }
        }

        // Return extracted information + Business ID
        return res.status(200).json({

            businessId: businessId,

            businessName:
                result.businessName,

            industry:
                result.industry,

            location:
                result.location,

            services:
                result.services

        });

    } catch (error) {

        console.error(
            "Analyze error:",
            error
        );

        return res.status(500).json({
            error:
                "Something went wrong while analyzing the website."
        });
    }
}
