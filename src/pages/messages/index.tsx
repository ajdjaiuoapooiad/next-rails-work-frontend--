import { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import MessageForm from '../../components/MessageForm';
import Head from 'next/head';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useRouter } from 'next/navigation';


interface User {
  id: number;
  name: string;
  profile?: {
    user_icon_url?: string;
  };
}

interface ErrorResponse {
  error: string;
}

interface MessageType {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender_name: string;
  sender_icon: string;
  receiver_name: string;
  receiver_icon: string;
}

const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URLが設定されていません。');
  }
  return apiUrl;
};

const DEFAULT_ICON = 'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png';

export default function Messages() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedMessages, setGroupedMessages] = useState<{ [key: string]: MessageType[] }>({});
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: number | null }>({ id: null });
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // useRouterを初期化

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      setCurrentUser({ id: userId ? parseInt(userId) : null });
    }
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('authToken');
        const response = await axios.get<MessageType[]>(`${apiUrl}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<ErrorResponse>;
          setError(axiosError.response?.data?.error || 'メッセージの取得に失敗しました。');
        } else {
          setError('メッセージの取得中に予期しないエラーが発生しました。');
        }
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };
    fetchMessages();
  }, [refresh]);

  useEffect(() => {
    const grouped: { [key: string]: MessageType[] } = messages.reduce((acc, message) => {
      const conversationId = [Math.min(message.sender_id, message.receiver_id), Math.max(message.sender_id, message.receiver_id)].join('-');
      if (!acc[conversationId]) {
        acc[conversationId] = [];
      }
      acc[conversationId].push(message);
      return acc;
    }, {} as { [key: string]: MessageType[] });
    setGroupedMessages(grouped);
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('authToken');
        const response = await axios.get<User[]>(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersMap: { [key: number]: User } = {};
        response.data.forEach(user => {
          usersMap[user.id] = user;
        });
        setUsers(usersMap);
      } catch (err) {
        console.error('ユーザーの取得に失敗しました。', err);
      }
    };
    fetchUsers();
  }, []);

  const formatMessagesForConversation = (messages: MessageType[]) => {
    const sortedMessages = messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return sortedMessages.map((message) => {
      return {
        senderId: message.sender_id,
        content: message.content,
        createdAt: message.created_at,
        isCurrentUser: message.sender_id === currentUser.id,
        senderName: message.sender_name,
        senderIcon: message.sender_icon,
      };
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupedMessages[selectedConversation || '']]);

  const handleUserIconClick = (userId: number) => {
    router.push(`/users/${userId}/profile`);
  };

  if (loading) return <p>ロード中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Head>
        <title>メッセージ一覧ページ</title>
      </Head>
      <aside className="w-full md:w-1/4 border-r p-4 bg-white shadow-md">
        <h2 className="text-lg font-semibold mb-4">会話一覧</h2>
        <ul className="space-y-2">
          {Object.keys(groupedMessages).map((conversationId) => {
            const conversationMessages = groupedMessages[conversationId];
            const otherUserId = conversationMessages[0].sender_id === currentUser.id ? conversationMessages[0].receiver_id : conversationMessages[0].sender_id;
            const otherUser = users[otherUserId];
            const otherUserName = otherUser?.name || '不明なユーザー';
            const otherUserIcon = otherUser?.profile?.user_icon_url;

            return (
              <li
                key={conversationId}
                className={`cursor-pointer p-3 rounded-lg hover:bg-gray-100 ${selectedConversation === conversationId ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedConversation(conversationId)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    <img
                      src={otherUserIcon || DEFAULT_ICON}
                      alt={`${otherUserName}のアイコン`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_ICON;
                      }}
                      onClick={() => handleUserIconClick(otherUserId)} // クリックイベントハンドラを追加
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{otherUserName}</p>
                    <p className="text-sm text-gray-500">メッセージ数: {conversationMessages.length}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
      <main className={`flex-1 p-4 ${selectedConversation ? 'block' : 'hidden'}`}>
        {selectedConversation ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">メッセージ詳細</h2>
            <div className="space-y-4">
              {formatMessagesForConversation(groupedMessages[selectedConversation]).map((message) => (
                <div key={message.createdAt} className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'} items-start`}>
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                    {!message.isCurrentUser && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
                          <img
                            src={message.senderIcon || DEFAULT_ICON}
                            alt={`${message.senderName}のアイコン`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_ICON;
                            }}
                            onClick={() => handleUserIconClick(message.senderId)} // クリックイベントハンドラを追加
                          />
                        </div>
                        <div className={`p-4 rounded-lg bg-gray-50 max-w-2/3`}>
                          <p className="text-base leading-relaxed">{message.content}</p>
                          <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {message.isCurrentUser && (
                      <div className={`p-4 rounded-lg bg-blue-100 max-w-2/3`}>
                        <p className="text-base leading-relaxed">{message.content}</p>
                        <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
             {/* 修正箇所 */}
             {groupedMessages[selectedConversation]?.length > 0 ? (
              groupedMessages[selectedConversation].find(
                (message) => message.sender_id !== currentUser.id
              )?.sender_id !== currentUser.id && (
                <MessageForm
                  onMessageSent={() => {
                    setRefresh(true);
                    Swal.fire({
                      icon: 'success',
                      title: 'メッセージを送信しました。',
                      showConfirmButton: false,
                      timer: 1500,
                    });
                  }}
                  onError={() => {
                    Swal.fire({
                      icon: 'error',
                      title: 'メッセージの送信に失敗しました。',
                      text: 'メッセージの送信中にエラーが発生しました。',
                    });
                  }}
                  receiverId={
                    groupedMessages[selectedConversation].find(
                      (message) => message.sender_id !== currentUser.id
                    )?.sender_id
                  }
                />
              )
            ) : (
              <MessageForm
                onMessageSent={() => {
                  setRefresh(true);
                  Swal.fire({
                    icon: 'success',
                    title: 'メッセージを送信しました。',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                }}
                onError={() => {
                  Swal.fire({
                    icon: 'error',
                    title: 'メッセージの送信に失敗しました。',
                    text: 'メッセージの送信中にエラーが発生しました。',
                  });
                }}
                receiverId={
                  messages.find(
                    (message) =>
                      message.sender_id ===
                        parseInt(selectedConversation.split('-')[0]) ||
                      message.sender_id ===
                        parseInt(selectedConversation.split('-')[1])
                  )?.sender_id === currentUser.id
                    ? messages.find(
                        (message) =>
                          message.sender_id ===
                            parseInt(selectedConversation.split('-')[0]) ||
                          message.sender_id ===
                            parseInt(selectedConversation.split('-')[1])
                      )?.receiver_id
                    : messages.find(
                        (message) =>
                          message.sender_id ===
                            parseInt(selectedConversation.split('-')[0]) ||
                          message.sender_id ===
                            parseInt(selectedConversation.split('-')[1])
                      )?.sender_id
                }
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p>会話を選択してください。</p>
          </div>
        )}
      </main>
    </div>
  );
}