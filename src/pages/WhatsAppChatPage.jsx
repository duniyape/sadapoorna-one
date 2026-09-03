import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  MessageCircle,
  Image as ImageIcon,
  FileText,
  X
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function WhatsAppChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const fetchChats = async (pageNum = 1, search = "") => {
    try {
      if (pageNum === 1) setIsChatsLoading(true);
      const res = await fetch(`/whatsapp-webhook/whatsapp/chats?page=${pageNum}&limit=30${search ? `&search=${search}` : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status) {
          if (pageNum === 1) {
            setChats(json.data);
          } else {
            setChats(prev => [...prev, ...json.data]);
          }
          setHasMoreChats(json.pagination.page < json.pagination.pages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
      showToast("Failed to fetch chats");
    } finally {
      setIsChatsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats(1, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Basic polling for chats list every 10 seconds
    const interval = setInterval(() => {
      fetchChats(1, searchQuery);
    }, 10000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const fetchMessages = async (chatId) => {
    setIsMessagesLoading(true);
    try {
      const res = await fetch(`/whatsapp-webhook/whatsapp/chats/${chatId}/messages?limit=100`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status) {
          setMessages(json.data.reverse()); // Assume newest is first from API, we want oldest first for chat view
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
      showToast("Failed to fetch messages");
    } finally {
      setIsMessagesLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    let interval;
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      // Basic polling for messages
      interval = setInterval(() => {
        fetchMessages(selectedChat.id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !file) return;
    if (!selectedChat) return;

    setIsSending(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("phone", selectedChat.phone);
        formData.append("file", file);
        
        // Determine media type
        let mediaType = "document";
        if (file.type.startsWith("image/")) mediaType = "image";
        else if (file.type.startsWith("video/")) mediaType = "video";
        else if (file.type.startsWith("audio/")) mediaType = "audio";
        
        formData.append("media_type", mediaType);
        if (inputText.trim()) {
            formData.append("caption", inputText.trim());
        }

        const res = await fetch("/whatsapp-webhook/whatsapp/send-media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        });

        if (res.ok) {
          setFile(null);
          setInputText("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          fetchMessages(selectedChat.id);
          fetchChats(1, searchQuery);
        } else {
            showToast("Failed to send file");
        }
      } else {
        const res = await fetch("/whatsapp-webhook/whatsapp/send-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            phone: selectedChat.phone,
            text: inputText.trim()
          })
        });

        if (res.ok) {
          setInputText("");
          fetchMessages(selectedChat.id);
          fetchChats(1, searchQuery);
        } else {
            showToast("Failed to send message");
        }
      }
    } catch (error) {
      console.error("Send error", error);
      showToast("Error sending message");
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDateHeader = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-130px)] overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-200/80">
      <div className="flex h-full">
        {/* Left Sidebar - Chat List */}
        <div className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 flex flex-col border-r border-slate-100 bg-slate-50/50 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">WhatsApp</h2>
            </div>
          </div>
          
          {/* Search */}
          <div className="p-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isChatsLoading && chats.length === 0 ? (
              <div className="flex justify-center p-8 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-sm font-medium">
                No chats found
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-colors ${
                      selectedChat?.id === chat.id 
                        ? 'bg-emerald-50 border border-emerald-100' 
                        : 'hover:bg-slate-100/80 border border-transparent'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden shadow-sm">
                      {chat.customer_name ? chat.customer_name.charAt(0) : <Phone className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 truncate">
                          {chat.customer_name || chat.phone}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formatTime(chat.last_message_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs text-slate-500 truncate flex-1 flex items-center gap-1">
                          {chat.last_message_type === 'image' && <ImageIcon className="w-3 h-3 inline" />}
                          {chat.last_message_type === 'document' && <FileText className="w-3 h-3 inline" />}
                          {chat.last_message || (chat.last_message_type ? `Sent a ${chat.last_message_type}` : 'No messages yet')}
                        </p>
                        {chat.unread_count > 0 && (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {hasMoreChats && (
                  <button 
                    onClick={() => {
                        setPage(p => p + 1);
                        fetchChats(page + 1, searchQuery);
                    }}
                    className="w-full py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Chat View */}
        <div className={`flex-1 flex flex-col bg-[#EFEAE2] relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Background pattern for WhatsApp feel */}
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }}></div>
          
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase shadow-sm">
                    {selectedChat.customer_name ? selectedChat.customer_name.charAt(0) : <Phone className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {selectedChat.customer_name || "Unknown"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      +{selectedChat.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10">
                {isMessagesLoading && messages.length === 0 ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <>
                    {/* Date grouping can be implemented here, simplified for now */}
                    <div className="text-center my-4">
                        <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-500 shadow-sm inline-block">
                            Today
                        </span>
                    </div>

                    {messages.map((msg, index) => {
                      const isOutgoing = msg.direction === 'outgoing';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}>
                          <div 
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-2.5 shadow-sm relative ${
                              isOutgoing 
                                ? 'bg-[#D9FDD3] text-slate-800 rounded-tr-none' 
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                            }`}
                          >
                            {/* Media content */}
                            {msg.type === 'image' && msg.media?.media_id && (
                              <div className="mb-2 rounded-lg overflow-hidden border border-black/5 bg-black/5 flex items-center justify-center min-h-[100px] min-w-[100px]">
                                <img src={`/whatsapp-webhook/whatsapp/media/${msg.media.media_id}/download`} alt="Media" className="max-w-full max-h-[300px] object-contain" onError={(e) => { e.target.style.display='none'; }} />
                              </div>
                            )}
                            
                            {msg.type === 'document' && msg.media?.filename && (
                                <div className="mb-2 flex items-center gap-3 bg-black/5 p-3 rounded-lg">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate text-slate-700">{msg.media.filename}</p>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">{msg.media.mime_type?.split('/')[1] || 'Document'}</p>
                                    </div>
                                </div>
                            )}
                            
                            {msg.type === 'audio' && (
                                <div className="mb-2 p-2 bg-black/5 rounded-lg flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="flex-1 h-2 bg-slate-300 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-slate-500"></div>
                                    </div>
                                </div>
                            )}

                            {/* Text content */}
                            {msg.text && (
                              <p className="text-[15px] leading-snug whitespace-pre-wrap word-break">
                                {msg.text}
                              </p>
                            )}

                            {/* Meta info (time, status) */}
                            <div className={`flex items-center justify-end gap-1 mt-1 -mb-1 ${isOutgoing ? '' : 'float-right ml-3'}`}>
                              <span className="text-[10px] text-slate-500/80 font-semibold">
                                {formatTime(msg.timestamp)}
                              </span>
                              {isOutgoing && (
                                <span className={msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}>
                                  {msg.status === 'sent' || msg.status === 'delivered' || msg.status === 'read' ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-slate-100 border-t border-slate-200 z-10 shrink-0">
                  {file && (
                      <div className="mb-2 p-2 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                              <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                              <span className="text-sm font-semibold truncate text-slate-700">{file.name}</span>
                          </div>
                          <button onClick={clearFile} className="p-1 rounded-full hover:bg-rose-100 text-rose-500 shrink-0">
                              <X className="w-4 h-4" />
                          </button>
                      </div>
                  )}
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <div className="flex-1 bg-white rounded-2xl flex items-center border border-slate-200 shadow-sm overflow-hidden px-2">
                    <label className="p-2 cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <Paperclip className="w-5 h-5" />
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message"
                      className="flex-1 bg-transparent py-3 px-2 outline-none text-[15px] resize-none max-h-32 min-h-[44px]"
                      rows="1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={(!inputText.trim() && !file) || isSending}
                    className="w-12 h-12 flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 z-10 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner border border-slate-200">
                <MessageCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">WhatsApp Web</h2>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                Select a chat from the sidebar or start a new conversation to begin messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
