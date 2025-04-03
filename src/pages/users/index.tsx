import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Link コンポーネントをインポート

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  icon?: string;
}

const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URLが設定されていません。');
  }
  return apiUrl;
};

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error('ユーザー情報の取得に失敗しました。');
  }
  return response.json();
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('authToken');
        const data: User[] = await apiRequest(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">ロード中...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">エラー: {error}</p>;
  }

  const defaultIcon = process.env.NEXT_PUBLIC_DEFAULT_ICON_URL || 'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png';

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>ユーザー一覧ページ</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">ユーザー一覧</h1>
      <ul className="space-y-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="border p-4 rounded-md shadow-sm flex items-center"
            style={{ minHeight: '100px' }}
          >
            <Link href={`/users/${user.id}/profile`} className="flex items-center w-full"> {/* Link コンポーネントでラップ */}
              <img
                src={user.icon || defaultIcon}
                alt={`${user.name}のアイコン`}
                className="w-14 h-14 rounded-full mr-4"
              />
              <div className="grid grid-cols-3 gap-4 w-full">
                <div>
                  <strong>名前:</strong> {user.name}
                </div>
                <div>
                  <strong>メールアドレス:</strong> {user.email}
                </div>
                <div>
                  <strong>ユーザータイプ:</strong> {user.user_type === 'student' ? '学生' : user.user_type === 'company' ? '企業' : '不明'}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}