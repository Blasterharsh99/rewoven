"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Heart, Send } from "lucide-react"
import Link from "next/link"

export default function NGOMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const [requestId, setRequestId] = useState<string>("")
  const [request, setRequest] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setRequestId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!requestId) return

    const fetchData = async () => {
      // Get current user
      const meRes = await fetch("/api/auth/me")
      if (meRes.ok) {
        const { data } = await meRes.json()
        setCurrentUser(data)
      }

      // Get request details
      const reqRes = await fetch(`/api/requests/${requestId}`)
      if (reqRes.ok) {
        const { data: requestData } = await reqRes.json()
        if (requestData) setRequest(requestData)
      }

      // Get messages
      const msgRes = await fetch(`/api/messages?request_id=${requestId}`)
      if (msgRes.ok) {
        const { data: messagesData } = await msgRes.json()
        if (messagesData) setMessages(messagesData)
      }
    }

    fetchData()

    // Poll for new messages every 3 seconds
    const pollInterval = setInterval(async () => {
      const msgRes = await fetch(`/api/messages?request_id=${requestId}`)
      if (msgRes.ok) {
        const { data: messagesData } = await msgRes.json()
        if (messagesData) setMessages(messagesData)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [requestId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    setIsLoading(true)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          message: newMessage.trim(),
        }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      setNewMessage("")

      // Refresh messages
      const msgRes = await fetch(`/api/messages?request_id=${requestId}`)
      if (msgRes.ok) {
        const { data } = await msgRes.json()
        if (data) setMessages(data)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!request || !currentUser) {
    return <div>Loading...</div>
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Rewoven</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/ngo/requests/${requestId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Request
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Messages with {request.profiles?.name} - {request.clothing_listings?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-emerald-50 rounded-lg">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === currentUser.id
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === currentUser.id ? "text-emerald-100" : "text-emerald-500"
                          }`}
                        >
                          {message.profiles?.contact_person} •{" "}
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-emerald-600 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !newMessage.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
