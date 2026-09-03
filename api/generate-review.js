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

                    reasoning_effort: "low",

                    messages: [
                        {
                            role: "system",
                            content: `
You are an AI review-writing assistant.

Turn the customer's own genuine experience into three natural, editable Google review drafts.
- Write every review in the customer's first-person voice.
- The review must sound like the customer is personally describing their own experience.
- Use first-person language such as "I", "my", and "I found" when appropriate.
- Never refer to the customer as "the customer", "they", "the user", or "the reviewer".
- Never describe what the customer said or reported.
- Output only the review itself, not commentary about the customer's feedback.
Rules:
- Rewrite the customer's feedback; do not create a new experience.
- Use ONLY facts explicitly stated by the customer.
- Never invent facts, results, benefits, emotions, recommendations, opinions, staff names, prices, locations or outcomes.
- Never add phrases such as "I highly recommend", "exceeded my expectations", "5-star service", or similar praise unless the customer explicitly said it.
- Never infer that the customer would recommend the business.
- Never turn a rating into additional praise or claims.
- Preserve the customer's actual meaning.
- You may improve grammar, clarity and sentence structure.
- You may combine or rearrange information that the customer provided.
- The three drafts must use the same factual information but have naturally different wording.
- Do not add information simply to make a draft sound better.
- Keep each draft between 30 and 80 words.
`
                        },
                        {
                            role: "user",
                            content: `
Business: ${businessName}
Customer rating: ${rating}/5
Service used: ${service || "Not specified"}

Customer's genuine experience:
${feedback}

Create exactly three different review drafts.
`
                        }
                    ],

                    response_format: {
                        type: "json_schema",
                        json_schema: {
                            name: "review_drafts",
                            strict: true,
                            schema: {
                                type: "object",
                                properties: {
                                    drafts: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    }
                                },
                                required: ["drafts"],
                                additionalProperties: false
                            }
                        }
                    },

                    temperature: 0.8,
                    max_completion_tokens: 1000
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

        if (
            !Array.isArray(result.drafts) ||
            result.drafts.length !== 3
        ) {
            return res.status(500).json({
                error: "AI returned an invalid number of drafts."
            });
        }

        return res.status(200).json(result);

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: "Something went wrong."
        });
    }
}
