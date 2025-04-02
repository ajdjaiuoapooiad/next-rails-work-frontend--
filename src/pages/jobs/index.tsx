import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';

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
  image_url?: string;
  user_name: string;
  user_icon_url?: string;
  created_at: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const industryCategories: any = {
    IT: ['エンジニア', 'デザイナー', 'マーケター', 'プロジェクトマネージャー'],
    Finance: ['アナリスト', 'トレーダー', 'コンサルタント', '会計士'],
    Manufacturing: ['生産管理', '品質管理', '研究開発', '設計'],
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URLが設定されていません。');
        }
        const response = await fetch(`${apiUrl}/jobs`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '求人情報の取得に失敗しました');
        }
        let data: Job[] = await response.json();
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setJobs(data);
      } catch (err: any) {
        setError(err.message || '求人情報の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const locationMatch = selectedLocation.length === 0 || selectedLocation.includes(job.location);
    const industryMatch = !selectedIndustry || industryCategories[selectedIndustry].includes(job.title);
    const employmentTypeMatch = !selectedEmploymentType || job.employment_type === selectedEmploymentType;
    const featuresMatch = selectedFeatures.length === 0 || selectedFeatures.every((feature) => job.benefits.includes(feature));
    const keywordMatch = !keyword || job.title.toLowerCase().includes(keyword.toLowerCase()) || job.description.toLowerCase().includes(keyword.toLowerCase());

    return locationMatch && industryMatch && employmentTypeMatch && featuresMatch && keywordMatch;
  });

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
      <Head>
        <title>求人一覧ページ</title>
        <link rel="icon" href="/images/logo2.svg" />
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 md:px-[150px]">
        <div className="md:col-span-1">
          <button
            className="md:hidden w-full text-left p-2 border rounded mb-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? 'フィルターを閉じる' : 'フィルターを開く'}
          </button>
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
            <Sidebar
              selectedIndustry={selectedIndustry}
              setSelectedIndustry={setSelectedIndustry}
              industryCategories={industryCategories}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedEmploymentType={selectedEmploymentType}
              setSelectedEmploymentType={setSelectedEmploymentType}
              selectedFeatures={selectedFeatures}
              setSelectedFeatures={setSelectedFeatures}
              keyword={keyword}
              setKeyword={setKeyword}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">求人一覧</h1>
          <p className="text-sm text-gray-600 mb-4">{filteredJobs.length}件の求人</p>
          {filteredJobs.map((job) => {
            const defaultUserIcon = 'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png';
            const defaultJobImage = 'https://images.wantedly.com/i/fzq897n?w=1960&format=jpeg';

            return (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <Link href={`/jobs/${job.id}`}>
                  <div>
                    <img
                      src={job.image_url || defaultJobImage} // デフォルトの求人画像を表示
                      alt={job.title}
                      className="w-full h-[250px] object-cover rounded-md mb-2"
                    />
                    <h2 className="text-lg font-semibold mb-1 text-blue-600 hover:underline cursor-pointer">
                      {job.title}
                    </h2>
                    <p className="text-gray-800 text-sm">
                      {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">場所: {job.location}</p>
                      <p className="text-sm text-gray-600">雇用形態: {job.employment_type}</p>
                    </div>
                    <div className="flex items-center mt-2">
                      <img
                        src={job.user_icon_url || defaultUserIcon} // デフォルトのユーザーアイコンを表示
                        alt={job.user_name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-600">{job.user_name}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}