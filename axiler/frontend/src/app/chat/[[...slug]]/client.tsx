"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Plus,
  Send,
  Menu,
  Bot,
  User,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/provider/AuthContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const auth = useAuth();
  console.log(auth);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [chatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "General Chat",
      lastMessage: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "Code Review Discussion",
      lastMessage: "Let me review your React component...",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      title: "Project Planning",
      lastMessage: "Here are the recommended next steps...",
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your question. Let me help you with that...",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-background flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"} bg-card flex flex-col overflow-hidden border-r transition-all duration-300`}
      >
        {/* Sidebar Header - Fixed */}
        <div className="flex-shrink-0 border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat Sessions List - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-2">
              {chatSessions.map((session) => (
                <Card
                  key={session.id}
                  className="hover:bg-accent cursor-pointer p-3 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="text-muted-foreground mt-1 h-4 w-4" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium">
                        {session.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {session.lastMessage}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatTime(session.timestamp)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User Section - Fixed at Bottom */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">John Doe</p>
              <p className="text-muted-foreground truncate text-xs">
                john@example.com
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Chat Header - Fixed */}
        <div className="bg-card flex-shrink-0 border-b p-4">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold">AI Assistant</h1>
                <p className="text-muted-foreground text-sm">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="mx-auto max-w-4xl space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-lg rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`mt-1 text-xs ${
                          message.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Scroll target */}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Message Input - Fixed at Bottom */}
        <div className="bg-card flex-shrink-0 border-t p-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
