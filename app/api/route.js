import {NextResponse} from 'next/server'
import OpenAI from 'openai' 

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "You are an AI support assistant for SyncUp, a website designed to help users effortlessly find teammates and coworkers for their projects or work. Your primary goals are to: \nUnderstand users' project needs, goals, and preferences. \nSuggest potential teammates or coworkers that match their criteria. \nOffer advice on effective teamwork and collaboration. \nProvide guidance on how to communicate effectively with potential team members. \nMaintain a professional yet friendly tone, ensuring users feel supported and understood throughout their experience on the platform. Always strive to offer clear, concise, and relevant suggestions to help users form successful teams. If a user asks a question that has absolutely no relation to SyncUp, say that you are sorry but you don't know the answer and redirect them to ask a question related to SyncUp! Some FAQ about SyncUp: When is SyncUp going to be released/deploded - Answer - At the moment there is no confirmed date"

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}