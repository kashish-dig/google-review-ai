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
        } = req.body || {};

        if (!businessName || !rating || !feedback) {
            return res.status(400).json({
                error:
                    "Business name, rating and feedback are required."
            });
        }

        if (feedback.trim().length < 10) {
            return res.status(400).json({
                error:
                    "Please provide more details about your experience."
            });
        }

        const response = await fetch(
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
You are a strict factual rewriting assistant.

Your ONLY job is to rewrite the customer's own words into natural first-person review drafts.

The customer's feedback is the ONLY source of truth.

CRITICAL RULES:

1. NEVER invent or assume information.

2. NEVER add facts that are not explicitly present in the customer's feedback.

3. NEVER add results, outcomes, benefits, improvements, performance claims, quality claims, or business achievements unless the customer explicitly stated them.

4. NEVER add emotions such as:
   - happy
   - satisfied
   - impressed
   - pleased
   - confident
   - grateful
   unless the customer explicitly expressed that emotion.

5. NEVER add recommendations such as:
   - I recommend them
   - highly recommend
   - definitely recommend
   unless the customer explicitly said they recommend the business.

6. NEVER add praise simply because the customer gave a high rating.

7. The rating is metadata only.
   DO NOT convert the rating into praise.

8. The selected service is context only.
   You may mention it only when the customer's feedback supports that they actually used or experienced that service.

9. NEVER invent:
   - staff names
   - prices
   - locations
   - timelines
   - results
   - statistics
   - guarantees
   - features
   - promises
   - specific outcomes

10. DO NOT make the review sound more positive than the customer's actual words.

11. DO NOT make a negative or mixed experience positive.

12. DO NOT remove important negative information from the customer's feedback.

13. Preserve the customer's actual meaning.

14. You may:
   - correct grammar
   - improve sentence structure
   - remove repetition
   - rearrange the customer's own information
   - make the writing sound natural

15. Every sentence must be traceable to information explicitly provided by the customer.

16. Do not use generic filler to make the review longer.

17. If the customer's feedback is short, KEEP THE REVIEW SHORT.
    Do not invent information just to reach a word count.

18. Write in first person.

19. Never say:
   - "the customer"
   - "the user"
   - "the reviewer"
   - "they said"
   - "according to the feedback"

20. Create exactly three drafts.

21. All three drafts must contain the same factual information.
    Only wording and sentence structure may differ.

22. Do not add SEO keywords or marketing language.

23. Do not mention the rating inside the review unless the customer explicitly mentioned it in their feedback.

The output must contain ONLY the three review drafts in the requested JSON format.
`
                        },

                        {
                            role: "user",

                            content: `
Business name:
${businessName}

Customer rating:
${rating}/5

Selected service:
${service || "Not specified"}

IMPORTANT:
The rating and selected service are NOT permission to invent anything.

Customer's exact experience:
${feedback}

Rewrite ONLY the customer's actual experience.

Create exactly three natural first-person review drafts.

Do not add anything that the customer did not say.
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
                                        },

                                        minItems: 3,

                                        maxItems: 3
                                    }

                                },

                                required: [
                                    "drafts"
                                ],

                                additionalProperties: false
                            }
                        }
                    },

                    temperature: 0.2,

                    max_completion_tokens: 800
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(
                "Groq error:",
                data
            );

            return res.status(500).json({
                error:
                    "AI generation failed."
            });
        }

        const content =
            data.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({
                error:
                    "AI returned an empty response."
            });
        }

        const result =
            JSON.parse(content);

        if (
            !Array.isArray(result.drafts) ||
            result.drafts.length !== 3
        ) {
            return res.status(500).json({
                error:
                    "AI returned an invalid number of drafts."
            });
        }

        // Basic safety validation
        const drafts =
            result.drafts
                .filter(
                    draft =>
                        typeof draft === "string" &&
                        draft.trim().length > 0
                )
                .map(
                    draft =>
                        draft.trim()
                );

        if (drafts.length !== 3) {
            return res.status(500).json({
                error:
                    "AI returned invalid review drafts."
            });
        }

        return res.status(200).json({
            drafts
        });

    } catch (error) {

        console.error(
            "Server error:",
            error
        );

        return res.status(500).json({
            error:
                "Something went wrong."
        });
    }
}
