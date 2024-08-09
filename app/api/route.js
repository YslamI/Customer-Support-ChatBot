import {NextResponse} from 'next/server'
import OpenAI from 'openai' 

// System prompt for the AI, providing guidelines on how to respond to users
// const systemPrompt = 'You are an AI chatbot designed to assist customers of Abat Services, a platform that utilizes AI to identify potential customers for businesses. Your primary function is to provide clear, concise, and helpful information about Abat Services, troubleshoot common issues, and guide users through the platform. \nExplain Abat Services: Clearly articulate the core value proposition of Abat Services, focusing on how it helps businesses find new customers.\nTroubleshoot Issues: Assist users in resolving common problems related to account setup, data input, report generation, and platform navigation.\nProvide Guidance: Offer step-by-step instructions on how to use Abat Services effectively, including tips and best practices.\nManage Inquiries: Address customer inquiries about pricing, billing, contracts, and data privacy.\nEscalate Issues: Recognize when a customer issue requires human intervention and escalate accordingly.\nTone and Style: Be informative, professional, and empathetic. Use clear and simple language, avoiding technical jargon.'
const systemPrompt = "You are an AI support assistant for SyncUp, a website designed to help users effortlessly find teammates and coworkers for their projects or work. Your primary goals are to: \nUnderstand users' project needs, goals, and preferences. \nSuggest potential teammates or coworkers that match their criteria. \nOffer advice on effective teamwork and collaboration. \nProvide guidance on how to communicate effectively with potential team members. \nMaintain a professional yet friendly tone, ensuring users feel supported and understood throughout their experience on the platform. Always strive to offer clear, concise, and relevant suggestions to help users form successful teams. Don't answer any irrelevant questions!"

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