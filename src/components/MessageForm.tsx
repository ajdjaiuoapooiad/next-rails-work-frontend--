import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from './ui/button';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface MessageFormProps {
  onMessageSent: () => void;
  onError: () => void;
  receiverId: number | null | undefined;
}

interface ErrorResponse {
  errors: string[];
}

const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URLが設定されていません。');
  }
  return apiUrl;
};

const MessageForm: React.FC<MessageFormProps> = ({ onMessageSent, onError, receiverId }) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      setCurrentUserId(userId ? parseInt(userId) : null);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId) {
      setError('自分にはメッセージを送信できません。');
      return;
    }
    if (receiverId === currentUserId) {
      setError('自分にはメッセージを送信できません。');
      return;
    }
    if (!content.trim()) {
      setError('メッセージを入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('認証トークンがありません。ログインしてください。');
        return;
      }

      const apiUrl = getApiUrl();

      await axios.post(
        `${apiUrl}/messages`,
        {
          receiver_id: receiverId,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent('');
      onMessageSent();
      Swal.fire({
        icon: 'success',
        title: 'メッセージを送信しました。',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response?.data && axiosError.response.data.errors) {
          setError(axiosError.response.data.errors.join(', '));
        } else {
          setError('メッセージの送信に失敗しました。');
        }
      } else {
        setError('メッセージの送信中に予期しないエラーが発生しました。');
      }
      Swal.fire({
        icon: 'error',
        title: 'メッセージの送信に失敗しました。',
        text: 'メッセージの送信中にエラーが発生しました。',
      });
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-2">
        <label className="block">内容:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <Button type="submit" className="bg-blue-500 text-white p-2" disabled={isLoading}>
        {isLoading ? '送信中...' : '送信'}
      </Button>
    </form>
  );
};

export default MessageForm;