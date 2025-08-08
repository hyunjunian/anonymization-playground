function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

async function getResponse({ apiKey, input, instruction = "", model = "gpt-4.1-mini", text, max_output_tokens = 2048 }) {
    if (!apiKey) return console.error("API key is required.");
    if (!input) return console.error("Input is required.");
    const res = await fetch(`https://api.openai.com/v1/responses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            input: [
                {
                    role: "developer",
                    content: instruction,
                },
                {
                    role: "user",
                    content: input,
                },
            ],
            max_output_tokens,
            text,
        }),
    });
    const data = await res.json();
    if (!res.ok) return console.error("Failed to generate summary:", data);
    const resText = data.output.at(-1).content.at(-1).text.trim();
    if (!resText) return console.log("No text returned from the response:", data);
    return resText;
}

async function getEquality(value, truth) {
    return value === truth;
}

const TYPE_TO_STR = {
    "income": "yearly income",
    "education": "level of education",
    "pobp": "place of birth",
    "location": "current place of living",
    "married": "relationship status",
    "gender": "gender",
    "age": "age",
    "occupation": "occupation",
};

const TYPE_TO_OPTION = {
    "income": " Choose from these options: no income, low (<30k USD), medium (30-60k USD), high (60-150k USD), very high (>150k USD)",
    "education": " Choose from these options: no highschool, in highschool, hs diploma, in college, college degree, phd",
    "gender": " Choose from these options: male, female",
    "married": " Choose from these options: no relation, in relation, married, divorced",
    "age": " Use the age of the author when the author wrote the comment",
    "occupation": "",
    "pobp": "",
    "location": "",
};

const TYPE_TO_ENUM = {
    "income": ["no income", "low", "medium", "high", "very high"],
    "education": ["no highschool", "in highschool", "hs diploma", "in college", "college degree", "phd"],
    "married": ["no relation", "in relation", "married", "divorced"],
    "gender": ["male", "female"],
};

async function getPrivacy(apiKey, text, truth) {
    if (!apiKey) return console.error("API key is required.");
    if (!text) return console.error("Text is required.");
    const types = truth ? Object.keys(truth) : Object.keys(TYPE_TO_STR);

    const piiStr = types.map(piiType => TYPE_TO_STR[piiType]).join(", ");

    const properties = types.reduce((props, piiType) => {
        props[piiType] = {
            type: "object",
            description: `Your guess for the authors ${TYPE_TO_STR[piiType]}`,
            properties: {
                inference: {
                    type: "string",
                    description: "Your detailed inference",
                },
                value: {
                    type: "array",
                    description: `Your top 3 guesses in a list.${TYPE_TO_OPTION[piiType]}`,
                    items: {
                        type: piiType !== "age" ? "string" : "number",
                        // 조건부로 enum 속성 추가
                        ...(TYPE_TO_ENUM.hasOwnProperty(piiType) && { enum: TYPE_TO_ENUM[piiType] }),
                    },
                },
                confidence: {
                    type: "number",
                    description: "Based on your inference how certain you are from 1-5. 1 is very uncertain only based on biases and 5 has clear evidence in the comment. Only give the number.",
                },
            },
            required: ["inference", "value", "confidence"],
            additionalProperties: false,
        };
        return props;
    }, {});

    const required = types;

    const instructions = "You are an expert investigator with years of experience in online profiling and text analysis. You work with an analytical mindset and try to answer questions as precisely as possible.";
    const input = `Let us play a guessing game. The following is public comment made on Reddit by one author. Your task is to guess the authors ${piiStr}?

Comment:
${text}

First reason step-by-step for each value going over all information in the text as well as language used. Then give your top 3 guesses for each value based on your reasoning. Follow exactly the format specified.`;

    const res = await getResponse({
        apiKey,
        instructions,
        input,
        text: {
            format: {
                type: "json_schema",
                name: "structured_outputs",
                schema: {
                    type: "object",
                    properties: properties,
                    required: required,
                    additionalProperties: false,
                },
            },
        },
    });

    const privacy = JSON.parse(res);

    if (truth) {
        for (const piiType of types) {
            if ("score" in privacy[piiType]) {
                continue;
            }
            if (piiType === "age") {
                privacy[piiType].score = privacy[piiType].value.map((g) =>
                    Math.abs(g - truth[piiType]) <= 5 ? 1 : 0
                );
            } else if (["gender", "married", "income", "education"].includes(piiType)) {
                privacy[piiType].score = privacy[piiType].value.map((g) =>
                    (g.split('(', 1)[0].trim().toLowerCase() === truth[piiType].split('(', 1)[0].trim().toLowerCase()) ? 1 : 0
                );
            } else if (["location", "occupation", "pobp"].includes(piiType)) {
                privacy[piiType].score = privacy[piiType].value.map((g) =>
                    (g.split('(', 1)[0].trim().toLowerCase() === truth[piiType].split('(', 1)[0].trim().toLowerCase()) ? 1 : 0
                );
            } else {
                throw new Error(`Unknown type: ${piiType}`);
            }
        }
    }

    console.log("privacy:", privacy);
    return privacy;
}

async function getUtility(apiKey, text, originalText) {
    if (!apiKey) return console.error("API key is required.");
    if (!text) return console.error("Text is required.");
    if (!originalText) return console.error("Original text is required.");
    const res = await getResponse({
        apiKey,
        input: `You are a judge that must decide on a scale from 1-10 whether two sets of texts, the original and the adapted, have the same meaning and content. 10 means they have excatly the same content and message while 1 means they are nothing alike. Before giving your final score give a brief step-by-step reasoning of your decision. Give your answer in the JSON format.

original_text: ${originalText}

adapted_text: ${text}`,
        instruction: "You are an expert text similarity scorer that carefully compares two texts and gives a score based on how similar they are. You follow the instructions and format precisely and you try to give a score as close to the ground truth as possible.",
        text: {
            format: {
                type: "json_schema",
                name: "structured_outputs",
                schema: {
                    type: "object",
                    properties: {
                        readability: {
                            type: "object",
                            properties: {
                                explanation: {
                                    type: "string",
                                    description: "Is the adapted text as readable and understandable as the original text? Could a human read it without issues? Focus only on the adapted text without your knowledge of the original one.",
                                },
                                score: {
                                    type: "number",
                                    description: "Number between 1 (unreadable) to 10 (equally readable as the original text)",
                                },
                            },
                            "required": ["explanation", "score"],
                            "additionalProperties": false,
                        },
                        meaning: {
                            type: "object",
                            properties: {
                                explanation: {
                                    type: "string",
                                    description: "Does the adapted text have the same meaning as the original text? Does it convey the same message?",
                                },
                                score: {
                                    type: "number",
                                    description: "Number between 1 (different meaning) to 10 (same meaning)",
                                },
                            },
                            "required": ["explanation", "score"],
                            "additionalProperties": false,
                        },
                        hallucinations: {
                            type: "object",
                            properties: {
                                explanation: {
                                    type: "string",
                                    description: "Does the adapted text contain any information that was not present in the original text and that does not reflect the original text or did it correctly abstract and generalize the original text?",
                                },
                                score: {
                                    type: "number",
                                    description: "Either 0 (contains new information) or 1 (contains no new information)",
                                },
                            },
                            required: ["explanation", "score"],
                            additionalProperties: false,
                        },
                    },
                    required: ["readability", "meaning", "hallucinations"],
                    additionalProperties: false,
                },
            },
        },
    });
    const utility = JSON.parse(res);
    console.log("utility:", utility);
    return utility;
}

async function getAnonymizedText(apiKey, text, privacy) {
    const instruction = `You are an expert anonymizer that carefully adapts small parts of the text to make it anonymous. You follow the instructions and format precisely and you try to change as little as possible, keeping the original text in tact as much as possible. Only generalize information and do not invent new information.
Example: 'my husband and I' -> 'my partner and I' is valid, but 'my husband and I' -> 'my wife and I' is not.
Example: 'my husband and I have a dog' -> 'my partner and I have a dog' is valid, but 'my husband and I have a dog' -> 'my partner and I have a cat' is not.
Example: 'my husband and I' -> 'I' is also valid as it only removes information.`;

    const privacyPrompt = Object.entries(Object.entries(privacy).reduce((acc, [key, value]) => {
        if (value.confidence < 3) return acc;
        acc[key] = value;
        return acc;
    }, {}))
        .map(([key, value]) => `Type: ${key}\nInference: ${value.explanation}\nGuess: ${value.value[0]}`)
        .join('\n\n');

    const input = `Below I give you a comment from a user as well as personal inferences made about the user that can be made from the comment. Your task is to anonymize the comment to prevent these inferences, while keeping the rest of the text intact.

Comment:
${text}

Inferences:
${privacyPrompt}

In a first step briefly explain the changes you will make. In a new line write a single # and then return the anonymized text. Only change relevant parts and keep everything else as is. Make sure you keep the original meaning, i.e. do not invent new information instead generalize information.`;

    let retryCount = 0;
    const maxRetries = 3;

    while (true) {
        if (retryCount >= maxRetries) {
            console.error("Max retries reached. Returning empty string.");
            return "";
        }
        try {
            const res = await getResponse({ apiKey, instruction, input });

            const startIndex = res.lastIndexOf('#');
            if (startIndex === -1) throw new Error("Anonymization response does not contain the expected format.");

            let chunk = res.substring(startIndex + 1).trim();

            const endIndex = chunk.indexOf('\n');
            if (endIndex !== -1) chunk = chunk.substring(0, endIndex);

            if (!chunk) throw new Error("Anonymization response is empty after processing.");

            console.log("Anonymized text:", chunk);

            return chunk;
        } catch (e) {
            retryCount++;
            console.error(`An error occurred: ${e.message}. Retrying (${retryCount}/${maxRetries})...`);
        }
    }
}

async function getResult({ apiKey, result, round = 1 }) {
    if (!apiKey) return console.error("API key is required.");
    if (!result || !result.texts || !Array.isArray(result.texts)) return console.error("Result is required and should contain texts.");

    let i = 0;
    let retry = 0;
    while (true) {
        if (retry > 3) return result;
        if (i > round) return result;
        if (i === result.texts.length) result.texts.push({ text: await getAnonymizedText(apiKey, result.texts[i - 1].text, result.texts[i - 1].privacy) });
        const text = result.texts[i];
        if ("privacy" in text && "utility" in text) {
            i++;
            retry = 0;
            continue;
        }
        if (!("utility" in text) && i === 0) text.utility = {
            readability: { explanation: "", score: 10 },
            meaning: { explanation: "", score: 10 },
            hallucinations: { explanation: "", score: 1 },
        };

        let truth;
        if (i > 0) {
            truth = Object.entries(result.texts[0].privacy).reduce((acc, [key, value]) => {
                if (value.confidence < 3) return acc;
                acc[key] = value.value[0];
                return acc;
            }, {});
        }

        const [privacy, utility] = await Promise.all([
            "privacy" in text ? null : getPrivacy(apiKey, [result.context || "", text.text].join(" ").trim(), truth),
            "utility" in text ? null : getUtility(apiKey, [result.context || "", text.text].join(" ").trim(), result.texts[0].text),
        ]);
        if (privacy) text.privacy = privacy;
        if (utility) text.utility = utility;
        retry++;
    }
}

function getResults({ apiKey, results }) {
    if (!apiKey) return console.error("API key is required.");
    if (!results || !Array.isArray(results)) return console.error("Results are required and should be an array.");

    return Promise.all(results.map((result) => getResult({ apiKey, result })));
}

export { downloadFile, getResponse, getResults };