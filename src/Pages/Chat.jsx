import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Share, Sparkles, Volume2, Copy, RotateCcw, HelpCircle, Sun, Moon, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "katex/dist/katex.min.css";

function Chat() {
    const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! How can I assist you today?" }]);
    const [inputMessage, setInputMessage] = useState("");
    const [isDarkTheme, setIsDarkTheme] = useState(localStorage.getItem("theme"));
    const [modelList, setModelList] = useState([]);
    const [model, setModel] = useState("gpt-4o");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState(null);

    useEffect(() => {
        document.body.classList.toggle("dark", isDarkTheme);
    }, [isDarkTheme]);

    useEffect(() => {
        fetch(`/models.json`)
            .then((response) => response.json())
            .then((data) => {
                setModelList(data.data);
            });
        if (localStorage.getItem("theme") === "dark") {
            localStorage.setItem("theme", "dark");
            setIsDarkTheme(true);
        } else {
            localStorage.setItem("theme", "light");
            setIsDarkTheme(false);
        }
        setIsSidebarOpen(window.innerWidth >= 768);
    }, []);

    const scrollToBottom = () => {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() === "") return;
        const newMessages = [...messages, { role: "user", content: inputMessage }];
        setMessages(newMessages);
        scrollToBottom();
        setInputMessage("");

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: JSON.stringify([...messages, { role: "user", content: inputMessage }]), model: model }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let assistantMessage = "";

            while (!done) {
                let { value, done: doneReading } = await reader.read();
                done = doneReading;
                let chunk = decoder.decode(value, { stream: true });
                if (!chunk.includes("[DONE]")) {
                    try {
                        let content = chunk;
                        assistantMessage += content;
                        setMessages((prevMessages) => {
                            let lastMessage = prevMessages[prevMessages.length - 1];
                            if (lastMessage.role === "assistant") {
                                const updatedMessages = [...prevMessages.slice(0, -1), { ...lastMessage, content: assistantMessage }];
                                scrollToBottom();
                                return updatedMessages;
                            } else {
                                const updatedMessages = [...prevMessages, { role: "assistant", content: assistantMessage }];
                                scrollToBottom();
                                return updatedMessages;
                            }
                        });
                    } catch (error) {
                        console.error("Error parsing JSON:", error, chunk);
                    }
                } else {
                    assistantMessage += chunk;
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleRegenerateMessage = async (index) => {
        const messageToRegenerate = messages[index];
        if (messageToRegenerate.role !== "assistant") return;

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: JSON.stringify(messages.slice(0, index)), model: model }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let assistantMessage = "";

            while (!done) {
                let { value, done: doneReading } = await reader.read();
                done = doneReading;
                let chunk = decoder.decode(value, { stream: true });
                if (!chunk.includes("[DONE]")) {
                    try {
                        let content = chunk;
                        assistantMessage += content;
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages];
                            updatedMessages[index] = { ...messageToRegenerate, content: assistantMessage };
                            scrollToBottom();
                            return updatedMessages;
                        });
                    } catch (error) {
                        console.error("Error parsing JSON:", error, chunk);
                    }
                } else {
                    assistantMessage += chunk;
                }
            }
        } catch (error) {
            console.error("Error regenerating message:", error);
        }
    };

    const handleCopyMessage = (content, index) => {
        navigator.clipboard.writeText(content).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const toggleTheme = () => {
        document.body.classList.toggle("dark");
        setIsDarkTheme(!isDarkTheme);
        localStorage.setItem("theme", isDarkTheme ? "light" : "dark");
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen text-black/70 dark:text-white">
            {/* Sidebar */}
            <div className={` ${isSidebarOpen ? "w-[260px]" : "w-0"} border-r transition-all border-gray-200 dark:border-zinc-800 bg-[#f9f9f9] dark:bg-[#171717] flex flex-col`}>
                <div className="p-2">
                    <div className="flex justify-between h-fit items-center">
                        <span className="flex" data-state="closed">
                            <button className="h-10 hover:bg-black/5 dark:hover:bg-white/25 p-1 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 disabled:text-token-text-quaternary focus-visible:bg-token-sidebar-surface-secondary enabled:hover:bg-token-sidebar-surface-secondary no-draggable" onClick={toggleSidebar}>
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.85719 3H15.1428C16.2266 2.99999 17.1007 2.99998 17.8086 3.05782C18.5375 3.11737 19.1777 3.24318 19.77 3.54497C20.7108 4.02433 21.4757 4.78924 21.955 5.73005C22.2568 6.32234 22.3826 6.96253 22.4422 7.69138C22.5 8.39925 22.5 9.27339 22.5 10.3572V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118ZM11.5 5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V10.4C20.5 9.26339 20.4992 8.47108 20.4488 7.85424C20.3994 7.24907 20.3072 6.90138 20.173 6.63803C19.8854 6.07354 19.4265 5.6146 18.862 5.32698C18.5986 5.19279 18.2509 5.10062 17.6458 5.05118C17.0289 5.00078 16.2366 5 15.1 5H11.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor" />
                                </svg>
                            </button>
                        </span>
                        <div className="flex">
                            <span className="flex" data-state="closed">
                                <button
                                    onClick={() => {
                                        setMessages([{ role: "assistant", content: "Hello! How can I assist you today?" }]);
                                    }}
                                    aria-label="New chat"
                                    data-testid="create-new-chat-button"
                                    className="h-10 hover:bg-black/5 dark:hover:bg-white/25 p-1 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 disabled:text-token-text-quaternary focus-visible:bg-token-sidebar-surface-secondary enabled:hover:bg-token-sidebar-surface-secondary"
                                >
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy">
                                        <path d="M15.6729 3.91287C16.8918 2.69392 18.8682 2.69392 20.0871 3.91287C21.3061 5.13182 21.3061 7.10813 20.0871 8.32708L14.1499 14.2643C13.3849 15.0293 12.3925 15.5255 11.3215 15.6785L9.14142 15.9899C8.82983 16.0344 8.51546 15.9297 8.29289 15.7071C8.07033 15.4845 7.96554 15.1701 8.01005 14.8586L8.32149 12.6785C8.47449 11.6075 8.97072 10.615 9.7357 9.85006L15.6729 3.91287ZM18.6729 5.32708C18.235 4.88918 17.525 4.88918 17.0871 5.32708L11.1499 11.2643C10.6909 11.7233 10.3932 12.3187 10.3014 12.9613L10.1785 13.8215L11.0386 13.6986C11.6812 13.6068 12.2767 13.3091 12.7357 12.8501L18.6729 6.91287C19.1108 6.47497 19.1108 5.76499 18.6729 5.32708ZM11 3.99929C11.0004 4.55157 10.5531 4.99963 10.0008 5.00007C9.00227 5.00084 8.29769 5.00827 7.74651 5.06064C7.20685 5.11191 6.88488 5.20117 6.63803 5.32695C6.07354 5.61457 5.6146 6.07351 5.32698 6.63799C5.19279 6.90135 5.10062 7.24904 5.05118 7.8542C5.00078 8.47105 5 9.26336 5 10.4V13.6C5 14.7366 5.00078 15.5289 5.05118 16.1457C5.10062 16.7509 5.19279 17.0986 5.32698 17.3619C5.6146 17.9264 6.07354 18.3854 6.63803 18.673C6.90138 18.8072 7.24907 18.8993 7.85424 18.9488C8.47108 18.9992 9.26339 19 10.4 19H13.6C14.7366 19 15.5289 18.9992 16.1458 18.9488C16.7509 18.8993 17.0986 18.8072 17.362 18.673C17.9265 18.3854 18.3854 17.9264 18.673 17.3619C18.7988 17.1151 18.8881 16.7931 18.9393 16.2535C18.9917 15.7023 18.9991 14.9977 18.9999 13.9992C19.0003 13.4469 19.4484 12.9995 20.0007 13C20.553 13.0004 21.0003 13.4485 20.9999 14.0007C20.9991 14.9789 20.9932 15.7808 20.9304 16.4426C20.8664 17.116 20.7385 17.7136 20.455 18.2699C19.9757 19.2107 19.2108 19.9756 18.27 20.455C17.6777 20.7568 17.0375 20.8826 16.3086 20.9421C15.6008 21 14.7266 21 13.6428 21H10.3572C9.27339 21 8.39925 21 7.69138 20.9421C6.96253 20.8826 6.32234 20.7568 5.73005 20.455C4.78924 19.9756 4.02433 19.2107 3.54497 18.2699C3.24318 17.6776 3.11737 17.0374 3.05782 16.3086C2.99998 15.6007 2.99999 14.7266 3 13.6428V10.3572C2.99999 9.27337 2.99998 8.39922 3.05782 7.69134C3.11737 6.96249 3.24318 6.3223 3.54497 5.73001C4.02433 4.7892 4.78924 4.0243 5.73005 3.54493C6.28633 3.26149 6.88399 3.13358 7.55735 3.06961C8.21919 3.00673 9.02103 3.00083 9.99922 3.00007C10.5515 2.99964 10.9996 3.447 11 3.99929Z" fill="currentColor" />
                                    </svg>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-2 pb-4" id="sidebar">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xs text-gray-500 dark:text-zinc-400 px-2 mb-2">Today</h2>
                            <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                Hello and project update
                            </Button>
                        </div>

                        <div>
                            <h2 className="text-xs text-gray-500 dark:text-zinc-400 px-2 mb-2">Yesterday</h2>
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    Pizza Topping Detection Tool
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    MCQs on Resources Management
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    Galaxy Background Visibility Fix
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xs text-gray-500 dark:text-zinc-400 px-2 mb-2">Previous 7 Days</h2>
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    Domino's Pizza Builder App
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    Npm dependency conflict
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-black/70 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    CSS Class Mapping Python
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#212121]">
                <header className="h-12 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        {!isSidebarOpen && (
                            <button className="hover:bg-black/5 dark:hover:bg-white/25 p-1 rounded-lg" onClick={toggleSidebar}>
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xl-heavy">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.85719 3H15.1428C16.2266 2.99999 17.1007 2.99998 17.8086 3.05782C18.5375 3.11737 19.1777 3.24318 19.77 3.54497C20.7108 4.02433 21.4757 4.78924 21.955 5.73005C22.2568 6.32234 22.3826 6.96253 22.4422 7.69138C22.5 8.39925 22.5 9.27339 22.5 10.3572V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118ZM11.5 5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V10.4C20.5 9.26339 20.4992 8.47108 20.4488 7.85424C20.3994 7.24907 20.3072 6.90138 20.173 6.63803C19.8854 6.07354 19.4265 5.6146 18.862 5.32698C18.5986 5.19279 18.2509 5.10062 17.6458 5.05118C17.0289 5.00078 16.2366 5 15.1 5H11.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor" />
                                </svg>
                            </button>
                        )}
                        <Select
                            defaultValue={model}
                            onValueChange={(value) => {
                                setModel(value);
                            }}
                        >
                            <SelectTrigger className="w-fit text-black/70 dark:text-gray-400 font-bold text-lg bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#2f2f2f]">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900">
                                {modelList.map((model, index) => {
                                    if (model?.capabilities?.type === "chat") {
                                        return (
                                            <SelectItem key={index} value={model?.id}>
                                                {model?.name.replace(" (Preview)", "")}
                                            </SelectItem>
                                        );
                                    }
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="gap-2  hover:bg-black/5 dark:hover:bg-white/25 p-1 px-3 flex items-center justify-center rounded">
                            <Share className="w-4 h-4" />
                            Share
                        </button>
                        <button className="hover:bg-black/5 dark:hover:bg-white/25 p-2 rounded-full" onClick={toggleTheme}>
                            {isDarkTheme ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                        </button>
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">JP</div>
                    </div>
                </header>

                <ScrollArea id="chat-container" className="flex-1 p-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                {message.role === "assistant" && (
                                    <div className="relative p-1.5 flex items-center justify-center bg-transparent h-8 w-8 border border-[#f3f3f3] dark:border-[#303030] rounded-full">
                                        <svg width={41} height={41} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M37.532 16.87a9.96 9.96 0 0 0-.856-8.184 10.08 10.08 0 0 0-10.855-4.835A9.96 9.96 0 0 0 18.307.5a10.08 10.08 0 0 0-9.614 6.977 9.97 9.97 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.97 9.97 0 0 0 .856 8.185 10.08 10.08 0 0 0 10.855 4.835 9.97 9.97 0 0 0 7.516 3.35 10.08 10.08 0 0 0 9.617-6.981 9.97 9.97 0 0 0 6.663-4.834 10.08 10.08 0 0 0-1.243-11.813M22.498 37.886a7.47 7.47 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.3 1.3 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496M6.392 31.006a7.47 7.47 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.3 1.3 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744M4.297 13.62A7.47 7.47 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.3 1.3 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237m27.658 6.437-9.724-5.615 3.367-1.943a.12.12 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.29 1.29 0 0 0-.65-1.132m3.35-5.043a7 7 0 0 0-.236-.141l-7.965-4.6a1.3 1.3 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763m-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 7 7 0 0 0-.236.134l-7.965 4.6a1.3 1.3 0 0 0-.654 1.132zm1.829-3.943 4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5z" fill="currentColor" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 group relative">
                                    <div className={`relative  ${message.role === "user" ? "ml-auto bg-[#f3f3f3] dark:bg-[#303030] w-fit max-w-[70%] px-4" : "max-w-3xl"} rounded-3xl py-2.5`}>
                                        <svg className={`absolute -left-8 top-0 w-6 h-6 cursor-pointer text-gray-400 hover:text-gray-500 dark:text-zinc-400 dark:hover:text-gray-300 bg-[#f3f3f3] dark:bg-[#303030] p-1 rounded-full hidden ${message.role === "user" ? "group-hover:block" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M13.293 4.293a4.536 4.536 0 1 1 6.414 6.414l-1 1-7.094 7.094A5 5 0 0 1 8.9 20.197l-4.736.79a1 1 0 0 1-1.15-1.151l.789-4.736a5 5 0 0 1 1.396-2.713zM13 7.414l-6.386 6.387a3 3 0 0 0-.838 1.628l-.56 3.355 3.355-.56a3 3 0 0 0 1.628-.837L16.586 11zm5 2.172L14.414 6l.293-.293a2.536 2.536 0 0 1 3.586 3.586z" fill="currentColor" />
                                        </svg>
                                        <ReactMarkdown
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter children={String(children).replace(/\n$/, "")} style={isDarkTheme ? vscDarkPlus : vs} language={match[1]} PreTag="div" {...props} />
                                                    ) : (
                                                        <code className={className} style={{ color: "white !important" }} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                            remarkPlugins={[remarkRehype, remarkMath, remarkGfm]}
                                            rehypePlugins={[rehypeMathjax]}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {message.role === "assistant" && (
                                        <div className="flex items-center gap-2 mt-2 justify-start">
                                            <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#f3f3f3] dark:hover:bg-[#303030]">
                                                <Volume2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#f3f3f3] dark:hover:bg-[#303030]" onClick={() => handleCopyMessage(message.content, index)}>
                                                {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#f3f3f3] dark:hover:bg-[#303030]" onClick={() => handleRegenerateMessage(index)}>
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 max-w-2xl mx-auto w-full">
                    <div className="relative bg-gray-100 dark:bg-[#2f2f2f]  border border-gray-300 dark:border-zinc-700 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-zinc-600" >
                        <div className="absolute left-3 bottom-4">
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M9 7a5 5 0 0 1 10 0v8a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v6a5 5 0 0 0 10 0V7a3 3 0 1 0-6 0v8a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v6a3 3 0 1 1-6 0z" fill="currentColor" />
                            </svg>
                        </div>
                        <textarea
                            className="w-full mb-5 mt-2 bg-transparent py-3 pl-10 pr-24 placeholder:text-gray-400 dark:placeholder:text-zinc-400 focus:outline-none"
                            placeholder="Message ChatGPT"
                            rows={Math.min(inputMessage?.split("\n")?.length, 7)}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button className="absolute right-2 bottom-2.5 text-white flex items-center justify-center bg-gray-400 dark:bg-zinc-700 hover:bg-gray-500 dark:hover:bg-zinc-600 w-10 h-10 p-0 rounded-full" onClick={handleSendMessage}>
                            <svg width={32} height={32} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
                        <p>ChatGPT can make mistakes. Check important info.</p>
                        <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-200 dark:hover:bg-zinc-800">
                            <HelpCircle className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;