import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: number;
  company_id: number;
  requirements: string;
  benefits: string;
  employment_type: string;
}

const CompanyJobs = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setUserId(parseInt(id));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchJobs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません。');
        }
        const response = await axios.get(`${apiUrl}/jobs?company_id=${userId}`);
        setJobs(response.data);
      } catch (err: any) {
        setError(err.message || '求人情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId]);

  const handleDelete = async (jobId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URLが設定されていません。');
      }
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('認証トークンがありません。');
      }
      await axios.delete(`${apiUrl}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJobs(jobs.filter((job) => job.id !== jobId));
      // sweetalert2で成功メッセージを表示
      Swal.fire({
        icon: 'success',
        title: '求人を削除しました。',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      setError(err.message || '求人情報の削除に失敗しました');
      // sweetalert2でエラーメッセージを表示
      Swal.fire({
        icon: 'error',
        title: '求人削除中にエラーが発生しました。',
        text: err.message || '求人情報の削除に失敗しました',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-semibold text-lg">エラー: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">募集した求人一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <Link href={`/jobs/${job.id}`}>
              <h2 className="text-xl font-semibold mb-3 text-blue-600 hover:underline cursor-pointer">
                {job.title}
              </h2>
            </Link>
            {job.location && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">場所:</span> {job.location}
              </p>
            )}
            {job.salary && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">時給:</span> {job.salary} 円
              </p>
            )}
            {job.employment_type && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">雇用形態:</span> {job.employment_type}
              </p>
            )}
            {job.description && (
              <p className="text-gray-800 text-sm">
                {job.description.length > 120
                  ? `${job.description.substring(0, 120)}...`
                  : job.description}
              </p>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <Link
                href={`/jobs/edit/${job.id}`}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
              >
                編集
              </Link>
              <button
                onClick={() => handleDelete(job.id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyJobs;