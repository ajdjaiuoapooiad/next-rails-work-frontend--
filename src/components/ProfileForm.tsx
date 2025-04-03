import { useState } from 'react';

interface Profile {
  id?: number;
  user_id?: number;
  introduction: string;
  skills: string;
  company_name: string;
  industry: string;
  user_icon_url?: string;
  bg_image_url?: string;
}

interface ProfileFormProps {
  initialProfile?: Profile | null;
  onSubmit: (profileData: {
    introduction: string;
    skills: string;
    company_name: string;
    industry: string;
    user_icon?: File | null;
    bg_image?: File | null;
  }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSubmit }) => {
  const [introduction, setIntroduction] = useState(initialProfile?.introduction || '');
  const [skills, setSkills] = useState(initialProfile?.skills || '');
  const [companyName, setCompanyName] = useState(initialProfile?.company_name || '');
  const [industry, setIndustry] = useState(initialProfile?.industry || '');
  const [userIcon, setUserIcon] = useState<File | null>(null);
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [userIconPreview, setUserIconPreview] = useState<string | null>(initialProfile?.user_icon_url || null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(initialProfile?.bg_image_url || null);
  const [userIconError, setUserIconError] = useState<string | null>(null);
  const [bgImageError, setBgImageError] = useState<string | null>(null);

  const handleUserIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        setUserIconError("ファイルサイズは5MB以下にしてください。");
        return;
      }
      setUserIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUserIconError(null);
    }
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        setBgImageError("ファイルサイズは5MB以下にしてください。");
        return;
      }
      setBgImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setBgImageError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ introduction, skills, company_name: companyName, industry, user_icon: userIcon, bg_image: bgImage });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-300 rounded-lg">
      <div className="space-y-4 ">
        <div>
          <label className="block text-sm font-medium text-gray-700">自己紹介</label>
          <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} className="mt-1 block w-full pb-44 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" rows={6} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">スキル</label>
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1 block w-full  pb-44 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" rows={6} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">会社名</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">業界</label>
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">アイコン画像</label>
          <input type="file" accept="image/*" onChange={handleUserIconChange} className="mt-1 block w-full" />
          {userIconPreview && <img src={userIconPreview} alt="アイコンプレビュー" className="mt-2 max-w-full max-h-48 rounded-md" />}
          {userIconError && <p className="text-red-500 text-sm">{userIconError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">背景画像</label>
          <input type="file" accept="image/*" onChange={handleBgImageChange} className="mt-1 block w-full" />
          {bgImagePreview && <img src={bgImagePreview} alt="背景プレビュー" className="mt-2 max-w-full max-h-48 rounded-md" />}
          {bgImageError && <p className="text-red-500 text-sm">{bgImageError}</p>}
        </div>
      </div>
      <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        保存
      </button>
    </form>
  );
};

export default ProfileForm;