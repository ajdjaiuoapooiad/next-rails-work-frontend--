import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  MailIcon,
  PlusCircleIcon,
  UserIcon, // ユーザーアイコン
  InformationCircleIcon, // 情報アイコン
  ChatIcon, // チャットアイコン
  ViewGridIcon, // グリッド表示アイコン
  BriefcaseIcon, // 応募アイコン
  HeartIcon, // いいねアイコン
  ClipboardListIcon, // 求人リストアイコン
  LogoutIcon, // ログアウトアイコン
} from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
  LoginIcon, // ログインアイコン (v1)
  UserAddIcon as UserAddSolidIcon, // 新規登録アイコン (v1)
} from '@heroicons/react/solid'; // v1 のインポート

interface User {
  id: number;
  name: string;
  user_type: string;
  profile: {
    user_icon_url: string | null;
    bg_image_url: string | null;
  } | null;
}

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userIconUrl, setUserIconUrl]: any = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    const id = localStorage.getItem('userId');
    if (id) {
      setUserId(parseInt(id));
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URLが設定されていません。');
      }
      axios
        .get<User>(`${apiUrl}/users/show_by_id/${userId}`)
        .then((response) => {
          setUsername(response.data.name);
          setUserType(response.data.user_type);
          setUserIconUrl(
            response.data.profile?.user_icon_url ||
              'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png'
          );
        })
        .catch((error) => {
          console.error('ユーザー情報の取得に失敗しました:', error);
          setUserIconUrl(
            'https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_user_1.png'
          );
        });
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
    setUserType(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/jobs');
    Swal.fire({
      icon: 'success',
      title: 'ログアウトしました。',
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/jobs"
            className="text-2xl font-extrabold text-white tracking-wide flex items-center"
          >
            <img src="/images/logo2.svg" className="w-10 h-10 mr-2" alt="ロゴ" />
            インターンマッチングアプリ
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/jobs"
              className=" text-white hover:text-white transition-colors duration-300"
            >
              求人一覧
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href="/messages"
                  className=" text-white hover:text-white transition-colors duration-300 flex items-center"
                >
                  <MailIcon className="h-5 w-5 mr-1" />
                  メッセージ
                </Link>
                {userType === 'company' && (
                  <Link
                    href="/jobs/create"
                    className=" text-white hover:text-white transition-colors duration-300 flex items-center"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-1" />
                    求人作成
                  </Link>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors duration-300 p-2 rounded-md"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="flex flex-col items-center">
                      {userType && (
                        <span className="text-xs text-gray-300">
                          {userType === 'company' ? '企業' : '学生'}
                        </span>
                      )}
                      {username && (
                        <p className="text-white">
                          {username.length > 5
                            ? `${username.substring(0, 5)}...`
                            : username}
                        </p>
                      )}
                    </div>
                    <div className="rounded-full h-10 w-10 bg-gray-300 flex items-center justify-center overflow-hidden">
                      <img
                        src={userIconUrl}
                        alt="User Icon"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isDropdownOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <Link
                        href={`/users/${userId}/profile`}
                        className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          closeDropdown();
                        }}
                      >
                        <UserIcon className="h-5 w-5 mr-2" />
                        プロフィール
                      </Link>
                      <Link
                        href={`/users/${userId}`}
                        className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          closeDropdown();
                        }}
                      >
                        <InformationCircleIcon className="h-5 w-5 mr-2" />
                        ユーザー情報
                      </Link>
                      <Link
                        href={`/messages`}
                        className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          closeDropdown();
                        }}
                      >
                        <ChatIcon className="h-5 w-5 mr-2" />
                        メッセージ
                      </Link>
                      <Link
                        href={'/users'}
                        className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          closeDropdown();
                        }}
                      >
                        <ViewGridIcon className="h-5 w-5 mr-2" />
                        ユーザー一覧
                      </Link>
                      {userType === 'student' && (
                        <>
                          <Link
                            href={`/users/${userId}/profile`}
                            className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              closeDropdown();
                            }}
                          >
                            <BriefcaseIcon className="h-5 w-5 mr-2" />
                            応募した企業
                          </Link>
                          <Link
                            href={`/users/${userId}/profile`}
                            className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              closeDropdown();
                            }}
                          >
                            <HeartIcon className="h-5 w-5 mr-2" />
                            いいねした求人
                          </Link>
                        </>
                      )}
                      {userType === 'company' && (
                        <Link
                          href={'/users/jobs'}
                          className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            closeDropdown();
                          }}
                        >
                          <ClipboardListIcon className="h-5 w-5 mr-2" />
                          募集した求人
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogoutIcon className="h-5 w-5 mr-2" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!isLoggedIn && (
              <div>
                <Link
                  href="/users/login"
                  className="px-5 py-2 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-100 transition-colors duration-300"
                >
                  ログイン
                </Link>
                <Link
                  href="/users/register"
                  className="px-5 py-2 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-100 transition-colors duration-300"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
          <button
            className="text-white focus:outline-none md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white shadow-md rounded-md p-4 mt-2"
        >
          <div className="flex flex-col items-center space-y-4">
 
            {isLoggedIn && (
              <>
                <Link
                  href={`/users/${userId}/profile`}
                  className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  プロフィール
                </Link>
                <Link
                  href={`/users/${userId}`}
                  className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                >
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  ユーザー情報
                </Link>
                <Link
                  href={`/messages`}
                  className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                >
                  <ChatIcon className="h-5 w-5 mr-2" />
                  メッセージ
                </Link>
                <Link
                  href={'/users'}
                  className="block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 flex items-center justify-center" // justify-center を追加
                  onClick={() => {
                    closeDropdown();
                  }}
                >
                  <ViewGridIcon className="h-5 w-5 mr-2" />
                  ユーザー一覧
                </Link>
                {userType === 'student' && (
                  <>
                    <Link
                      href={`/users/${userId}/profile`}
                      className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                    >
                      <BriefcaseIcon className="h-5 w-5 mr-2" />
                      応募した企業
                    </Link>
                    <Link
                      href={`/users/${userId}/profile`}
                      className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                    >
                      <HeartIcon className="h-5 w-5 mr-2" />
                      いいねした求人
                    </Link>
                  </>
                )}
                {userType === 'company' && (
                  <>
                    <Link
                      href="/jobs/create"
                      className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                    >
                      <PlusCircleIcon className="h-5 w-5 mr-2" />
                      求人作成
                    </Link>
                    <Link
                      href="/users/jobs"
                      className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                    >
                      <ClipboardListIcon className="h-5 w-5 mr-2" />
                      募集した求人
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-700 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center" // justify-center を追加
                >
                  <LogoutIcon className="h-5 w-5 mr-2" />
                  ログアウト
                </button>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  href="/users/login"
                  className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center"
                >
                  <LoginIcon className="h-5 w-5 mr-2" />
                  ログイン
                </Link>
                <Link
                  href="/users/register"
                  className="text-indigo-600 hover:bg-gray-100 p-2 rounded-md transition-colors duration-300 w-full flex items-center justify-center"
                >
                  <UserAddSolidIcon className="h-5 w-5 mr-2" />
                  新規登録
                </Link>
              </>
            )}
                        
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;