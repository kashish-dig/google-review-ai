export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            businessName,
            rating,
            service,
            feedback
        } = req.body;

        if (!businessName || !rating || !feedback) {
            return res.status(400).json({
                error: "Business name, rating and feedback are required."
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",

                    messages: [
                        {
                            role: "system",
                            content: `
You are an AI review-writing assistant.

Create natural Google review drafts from the customer's own genuine experience.

Rules:
- Use ONLY facts provided by the customer.
- Never invent details.
- Never add services, staff names, results, prices, locations or claims that the customer did not provide.
- Keep the customer's meaning.
- Do not manipulate the customer's rating.
- Do not encourage a positive review.
- Make each draft sound natural and different from the others.
- Keep each draft between 40 and 80 words.
- The customer must be able to edit the draft before posting.
`
                        },
                        {
                            role: "user",
                            content: `
Business: ${businessName}
Rating given by customer: ${rating}/5
Service: ${service || "Not specified"}

Customer's genuine experience:
${feedback}

Create exactly 3 different review drafts.

Return ONLY valid JSON in this format:
{
  "drafts": [
    "draft 1",
    "draft 2",
    "draft 3"
  ]
}
`
                        }
                    ],

                    response_format: {
                        type: "json_object"
                    },

                    temperature: 0.8,
                    max_completion_tokens: 500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq error:", data);

            return res.status(500).json({
                error: "AI generation failed."
            });
        }

        const content =
            data.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({
                error: "AI returned an empty response."
            });
        }

        const result = JSON.parse(content);

        return res.status(200).json(result);

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: "Something went wrong."
        });
    }
}
