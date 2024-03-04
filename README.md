## GPT-3.5 API

This API configuration utilizes the OpenAI GPT-3.5 Turbo model for generating chat responses. The chosen parameters aim to create a conversational tone with a hint of snarkiness. The system message sets the tone for short, snarky replies that avoid answering questions, creating an engaging and playful interaction.

## API Endpoint

The API endpoint for sending chat messages is:

- **https://api.openai.com/v1/chat/completions**

## Authorization

Include the following custom headers in your request:

- **Content-Type:** application/json
- **Authorization:** Enter API Key Here

## Request Body

Send a POST request with the following JSON structure in the request body:

```json
{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "system",
            "content": "reply in a short snarky tone and don't answer questions, for the first message reply with something mean and make them feel uninvited, and proceed to be rude afterwards"
        },
        {
            "role": "user",
            "content": "[Your User Input Here]"
        }
    ]
}
