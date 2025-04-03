import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfileForm from '@/components/ProfileForm';
import Head from 'next/head';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface Profile {
  id: number;
  user_id: number;
  introduction: string;
  skills: string;
  company_name: string;
  industry: string;
  user_icon_url: string;
  bg_image_url: string;
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
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        const apiUrl = getApiUrl();
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${apiUrl}/users/${id}/profiles/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const profileData: Profile = await response.json();
          setProfile(profileData);
        } else if (response.status === 404) {
          setProfile(null);
        } else {
          throw new Error('APIリクエストに失敗しました。');
        }

        const userData = await apiRequest(`${apiUrl}/users/show_by_id/${id}`);
        setUsername(userData.name);
        // localStorage から userId を取得 (変更箇所)
        const userIdFromStorage = localStorage.getItem('userId');
        setCurrentUserId(userIdFromStorage ? parseInt(userIdFromStorage) : null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleCreateProfile = async (profileData: {
    introduction: string;
    skills: string;
    company_name: string;
    industry: string;
    user_icon?: File | null | undefined;
    bg_image?: File | null | undefined;
  }) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('introduction', profileData.introduction);
      formData.append('skills', profileData.skills);
      formData.append('company_name', profileData.company_name);
      formData.append('industry', profileData.industry);
      if (profileData.user_icon) {
        formData.append('user_icon', profileData.user_icon);
      }
      if (profileData.bg_image) {
        formData.append('bg_image', profileData.bg_image);
      }

      const newProfile: Profile = await apiRequest(`${apiUrl}/users/${id}/profiles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setProfile(newProfile);
      setEditing(false);
      setIsCreating(false);

      Swal.fire({
        icon: 'success',
        title: 'プロフィールを作成しました。',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'プロフィールの作成に失敗しました。',
        text: err.message,
      });
    }
  };

  const handleUpdateProfile = async (profileData: {
    introduction: string;
    skills: string;
    company_name: string;
    industry: string;
    user_icon?: File | null | undefined;
    bg_image?: File | null | undefined;
  }) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('introduction', profileData.introduction || ' ');
      formData.append('skills', profileData.skills || ' ');
      formData.append('company_name', profileData.company_name || ' ');
      formData.append('industry', profileData.industry || ' ');
      if (profileData.user_icon) {
        formData.append('user_icon', profileData.user_icon);
      }
      if (profileData.bg_image) {
        formData.append('bg_image', profileData.bg_image);
      }

      const updatedProfile: Profile = await apiRequest(`${apiUrl}/users/${id}/profiles/1`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setProfile(updatedProfile);
      setEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'プロフィールを更新しました。',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'プロフィールの更新に失敗しました。',
        text: err.message,
      });
    }
  };

  if (loading) {
    return <p className="text-center mt-8">ロード中...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">エラー: {error}</p>;
  }

  // localStorage から取得した userId と表示されているプロフィールの userId を比較 (変更箇所)
  const showEditButton = currentUserId && currentUserId === parseInt(id as string);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>プロフィールページ</title>
      </Head>
      <div className="relative h-64 bg-cover bg-center rounded-lg shadow-md mb-6">
        <div style={{ backgroundImage: `url(${profile?.bg_image_url || process.env.NEXT_PUBLIC_DEFAULT_BG_IMAGE_URL || 'https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8JUU5JUEyJUE4JUU2JTk5JUFGJUU4JTgzJThDJUU2JTk5JUFGfGVufDB8fDB8fHww)'})` }} className="relative h-64 bg-cover bg-center rounded-lg shadow-md mb-6">
          <div className="absolute bottom-0 left-0 p-4 flex items-center">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden mr-4">
              <img src={profile?.user_icon_url || process.env.NEXT_PUBLIC_DEFAULT_USER_ICON_URL || 'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png'} alt="プロフィール画像" className="h-full w-full object-cover" />
            </div>
            {username && <h1 className="text-3xl font-bold text-white">{username}</h1>}
          </div>
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
          isCreating ? (
            <ProfileForm onSubmit={handleCreateProfile} />
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">プロフィールがまだ作成されていません。</p>
              {showEditButton && (
                <button onClick={() => setIsCreating(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  プロフィールを作成する
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}