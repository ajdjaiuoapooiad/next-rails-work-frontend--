import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfileForm from '@/components/ProfileForm';
import Head from 'next/head';

interface Profile {
  id: number;
  user_id: number;
  introduction: string;
  skills: string;
  company_name: string;
  industry: string;
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
    throw new Error('APIリクエストに失敗しました。');
  }
  return response.json();
};

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('authToken');
        const profileData: Profile = await apiRequest(`${apiUrl}/users/${id}/profiles/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileData);

        const userData = await apiRequest(`${apiUrl}/users/show_by_id/${id}`);
        setUsername(userData.name);
        setCurrentUserId(userData.id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleCreateProfile = async (profileData: { introduction: string; skills: string; company_name: string; industry: string }) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('authToken');
      const newProfile: Profile = await apiRequest(`${apiUrl}/users/${id}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileData),
      });
      setProfile(newProfile);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateProfile = async (profileData: { introduction: string; skills: string; company_name: string; industry: string }) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('authToken');
      const updatedProfile: Profile = await apiRequest(`${apiUrl}/users/${id}/profiles/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          introduction: profileData.introduction || ' ',
          skills: profileData.skills || ' ',
          company_name: profileData.company_name || ' ',
          industry: profileData.industry || ' ',
        }),
      });
      setProfile(updatedProfile);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="text-center mt-8">ロード中...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">エラー: {error}</p>;
  }

  const showEditButton = currentUserId && currentUserId === parseInt(id as string);
  const profileImageUrl = process.env.NEXT_PUBLIC_PROFILE_IMAGE_URL || 'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png';

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>プロフィールページ</title>
      </Head>
      <div className="relative h-64 bg-cover bg-center rounded-lg shadow-md mb-6" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8JUU5JUEyJUE4JUU2JTk5JUFGJUU4JTgzJThDJUU2JTk5JUFGfGVufDB8fDB8fHww)' }}>
        <div className="absolute bottom-0 left-0 p-4 flex items-center">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden mr-4">
            <img src={profileImageUrl} alt="プロフィール画像" className="h-full w-full object-cover" />
          </div>
          {username && <h1 className="text-3xl font-bold text-white">{username}</h1>}
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="flex border-b border-gray-200 mb-6">
          <button className="px-4 py-2 border-b-2 border-indigo-600 font-semibold">プロフィール</button>
          <button className="px-4 py-2 text-gray-600">ストーリー</button>
          <button className="px-4 py-2 text-gray-600">スキル</button>
          <button className="px-4 py-2 text-gray-600">性格</button>
          <button className="px-4 py-2 text-gray-600">つながり</button>
          <button className="px-4 py-2 text-gray-600">基本情報</button>
        </div>
        {profile ? (
          editing ? (
            <ProfileForm initialProfile={profile} onSubmit={handleUpdateProfile} />
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">自己紹介</h2>
                <p style={{ whiteSpace: 'pre-wrap' }} className="text-gray-700">{profile.introduction}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">スキル</h2>
                <p style={{ whiteSpace: 'pre-wrap' }} className="text-gray-700">{profile.skills}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">会社名</h2>
                <p className="text-gray-700">{profile.company_name}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">業界</h2>
                <p className="text-gray-700">{profile.industry}</p>
              </div>
              {showEditButton && (
                <div className="text-center">
                  <button onClick={() => setEditing(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    編集
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          <ProfileForm onSubmit={handleCreateProfile} />
        )}
      </div>
    </div>
  );
}