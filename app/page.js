'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the SyncUp support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;  // Don't send empty messages

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
  ])

    // const response = fetch('api/chat')

  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]
        let otherMessages = messages.slice(0, messages.length - 1)
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
      })
    }
  } catch (error) {
    console.error('Error:', error)
    setMessages((messages) => [
      ...messages,
      { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
    ])
  }
  setIsLoading(false)
}

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
      width="100vw" height="100vh"
      display="flex" flexDirection="column"
      justifyContent="center" alignItems="center"
    >
      <Stack
        direction="column"
        sx={{width: {xs: "95%", md: "40%"}, height: {xs: "95%", md: "80%"}, backgroundColor: 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.7)'}}
        border="1px solid black"
        borderRadius={8}
        p={2}
        spacing={3}
      >
        <Stack
          direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box 
            key={index}
            display="flex"
            justifyContent={
              message.role == 'assistant' ? 'flex-start' : 'flex-end '
            }><Box bgcolor={
              message.role == 'assistant' ? 'primary.main' : 'secondary.main'
            }
            color="white"
            borderRadius={16}
            p={3}
            >
              {message.content}
              </Box></Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}