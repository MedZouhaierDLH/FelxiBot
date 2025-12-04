import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ActionButtons from './ActionButtons';
import { exportConversationToPDF } from '../utils/pdfExport';
import '../styles/chat.css';

const SYSTEM_PROMPT = `
You are GridAssist, an expert consultant in Demand Response (DR) and Smart Grids.
Your expertise comes from the "Re-powering markets" document, Chapter 6.

You have deep knowledge of these 4 areas:

**Part 1: No Wire Alternative**
- Non-equipment solutions for grid constraints
- Behavioral change programs for consumers
- Avoiding heavy infrastructure ("wires") via demand optimization

**Part 2: AI & Digital Platforms**
- Smart metering and hourly consumption data
- Consumer clustering and segmentation
- Targeted messaging (NO broadcast)
- IHD, web portals, chatbots for engagement
- AI-driven demand management

**Part 3: Business Models**
- Time-of-use (TOU) pricing
- Critical Peak Pricing (CPP)
- Dynamic tariffs and incentives
- Load shifting programs

**Part 4: Feedback & Recommendations**
- Real-world DR implementations
- Best practices and lessons learned

When answering:
- Be concise and actionable
- Cite specific data when available
- Propose DR strategies with estimated impact
- Format responses clearly with bullet points
`;

const ChatInterface = ({ apiKey, messages, onMessagesUpdate, onInvalidKey, dataContext = '' }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleVisualize = () => {
        alert('Navigate to Dashboard to see data visualizations');
    };

    const handleExport = () => {
        exportConversationToPDF(messages, { filename: 'GridAssist Chat' });
    };

    const handleRecommend = async () => {
        const recommendPrompt = "Based on our conversation, provide 3 specific Demand Response recommendations with estimated impact.";

        const userMessage = {
            id: Date.now(),
            text: recommendPrompt,
            sender: 'user',
            timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage];
        onMessagesUpdate(updatedMessages);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const enhancedPrompt = SYSTEM_PROMPT + dataContext;

            const historyContents = [
                { role: "user", parts: [{ text: enhancedPrompt }] },
                { role: "model", parts: [{ text: "Understood. I'm GridAssist, ready to help with Demand Response analysis and strategy." }] },
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ];

            historyContents.push({ role: "user", parts: [{ text: recommendPrompt }] });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: historyContents,
            });

            const botMessage = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'bot',
                timestamp: new Date()
            };

            onMessagesUpdate([...updatedMessages, botMessage]);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage];
        onMessagesUpdate(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const enhancedPrompt = SYSTEM_PROMPT + dataContext;

            const historyContents = [
                { role: "user", parts: [{ text: enhancedPrompt }] },
                { role: "model", parts: [{ text: "Understood. I'm GridAssist, ready to help with Demand Response analysis and strategy." }] },
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ];

            historyContents.push({ role: "user", parts: [{ text: input }] });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: historyContents,
            });

            const botMessage = {
                id: Date.now() + 1,
                text: response.text,
                sender: 'bot',
                timestamp: new Date()
            };

            onMessagesUpdate([...updatedMessages, botMessage]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            let errorText = "I apologize, but I encountered an error connecting to the AI.";

            if (error.message && (error.message.includes("API key expired") || error.message.includes("API_KEY_INVALID"))) {
                if (onInvalidKey) {
                    onInvalidKey();
                    return;
                }
                errorText = "Your API key has expired or is invalid. Please update it.";
            } else if (error.message) {
                errorText += `\n\nDetails: ${error.message}`;
            }

            const errorMessage = {
                id: Date.now() + 1,
                text: errorText,
                sender: 'bot',
                timestamp: new Date()
            };
            onMessagesUpdate([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>
                    <span className="status-indicator"></span>
                    GridAssist DR Chat
                </h1>
            </div>

            <div className="messages-area">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        {msg.sender === 'bot' && (
                            <ActionButtons
                                message={msg}
                                onVisualize={handleVisualize}
                                onExport={handleExport}
                                onRecommend={handleRecommend}
                            />
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <p>Analyzing...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about load forecasting, DR campaigns, or upload data..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className="send-button" disabled={isLoading || !input.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
