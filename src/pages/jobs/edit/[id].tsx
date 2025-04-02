import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  requirements: string;
  benefits: string;
  employment_type: string;
  image: string | null;
}

export default function JobEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [salary, setSalary] = useState<number | null>(null);
  const [requirements, setRequirements] = useState<string>('');
  const [benefits, setBenefits] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];

  const employmentTypes = ['正社員', '契約社員', '派遣社員', 'アルバイト', 'パート', 'インターン'];

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません。');
        }
        const response = await fetch(`${apiUrl}/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('求人情報の取得に失敗しました');
        }

        const data: Job = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setLocation(data.location);
        setSalary(data.salary);
        setRequirements(data.requirements);
        setBenefits(data.benefits);
        setEmploymentType(data.employment_type);
        setPreviewImage(data.image);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URLが設定されていません。');
      }

      const response = await fetch(`${apiUrl}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', // JSON形式で送信
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ // 画像以外のデータを送信
          title,
          description,
          location,
          salary,
          requirements,
          benefits,
          employment_type: employmentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '求人情報の更新に失敗しました');
      }

      Swal.fire({
        icon: 'success',
        title: '求人情報を更新しました。',
        showConfirmButton: false,
        timer: 1500,
      });

      router.push('/jobs');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: '求人情報の更新に失敗しました。',
        text: err.message || '求人情報の更新中にエラーが発生しました',
      });
      setError(err.message || '求人情報の更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>ロード中...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 w-full max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-gray-300 shadow-lg rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">求人編集</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... 他のフォーム要素 ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">画像</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full"
              />
              {previewImage && (
                <img src={previewImage} alt="Preview" className="mt-2 max-w-full max-h-48" />
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              更新
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}