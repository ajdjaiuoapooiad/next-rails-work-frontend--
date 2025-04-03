import { useState } from 'react';

interface SidebarProps {
  selectedIndustry: string;
  setSelectedIndustry: (industry: string) => void;
  industryCategories: { [key: string]: string[] };
  selectedLocation: string[];
  setSelectedLocation: (location: string[]) => void;
  selectedEmploymentType: string;
  setSelectedEmploymentType: (employmentType: string) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  keyword: string;
  setKeyword: (keyword: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedIndustry,
  setSelectedIndustry,
  industryCategories,
  selectedLocation,
  setSelectedLocation,
  selectedEmploymentType,
  setSelectedEmploymentType,
  selectedFeatures,
  setSelectedFeatures,
  keyword,
  setKeyword,
}) => {
  const handleLocationChange = (location: string) => {
    if (selectedLocation.includes(location)) {
      setSelectedLocation(selectedLocation.filter((l) => l !== location));
    } else {
      setSelectedLocation([...selectedLocation, location]);
    }
  };

  const handleFeatureChange = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const locations = [
    '東京都',
    '大阪府',
    '京都府',
    '愛知県',
    '神奈川県',
    '埼玉県',
  ];

  const features = [
    '学生さん歓迎',
    '昼食おごります',
    '服装自由',
    'リモートワーク可',
    'フレックスタイム制',
    '未経験歓迎',
    '第二新卒歓迎',
    '土日祝休み',
  ];

  return (
    <aside className="col-span-1">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          キーワード検索
        </label>
        <input
          type="text"
          placeholder="キーワードで検索"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <h2 className="text-lg font-semibold mb-4">フィルタ</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">場所</label>
        <div className="flex flex-col">
          {locations.map((location) => (
            <label key={location} className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedLocation.includes(location)}
                onChange={() => handleLocationChange(location)}
              />
              <span className="ml-2">{location}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">業界</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">全て</option>
          <option value="IT">IT</option>
          <option value="Finance">金融</option>
          <option value="Manufacturing">製造業</option>
        </select>
      </div>
      {selectedIndustry && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            カテゴリ
          </label>
          <div className="flex flex-col">
            {industryCategories[selectedIndustry].map((category) => (
              <label key={category} className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          雇用形態
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={selectedEmploymentType}
          onChange={(e) => setSelectedEmploymentType(e.target.value)}
        >
          <option value="">全て</option>
          <option value="正社員">正社員</option>
          <option value="アルバイト">アルバイト</option>
          <option value="インターン">インターン</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">特徴</label>
        <div className="flex flex-col">
          {features.map((feature) => (
            <label key={feature} className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedFeatures.includes(feature)}
                onChange={() => handleFeatureChange(feature)}
              />
              <span className="ml-2">{feature}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;