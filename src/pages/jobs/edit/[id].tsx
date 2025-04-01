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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('salary', salary !== null ? salary.toString() : '');
      formData.append('requirements', requirements);
      formData.append('benefits', benefits);
      formData.append('employment_type', employmentType);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${apiUrl}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">タイトル<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">場所<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">給与</label>
                <input
                  type="number"
                  value={salary !== null ? salary.toString() : ''}
                  onChange={(e) => setSalary(e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">雇用形態<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">説明<span className="text-red-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">応募要件</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">福利厚生</label>
              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={5}
              />
            </div>
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