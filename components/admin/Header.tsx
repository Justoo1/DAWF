"use client"

import Link from "next/link";
import ProfileMenu from "../shared/ProfileMenu";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fetchUserWithContributions } from "@/lib/actions/users.action";
import { UserValues } from "@/lib/validation";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { data: session } = authClient.useSession();
  const [userInfo, setUserInfo] = useState<UserValues | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (session?.user?.email) {
        const data = await fetchUserWithContributions(session.user.email);
        if (data.success && data.user) {
          setUserInfo(data.user);
        }
      }
    };
    loadUser();
  }, [session]);

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Hamburger menu for mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-800" />
          </button>
          <Link href="/admin" className="text-blue-600 hover:underline hidden sm:block">Admin Dashboard</Link>
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Employee Welfare</h1>
        {userInfo && <ProfileMenu user={userInfo} />}
      </div>
    </header>
  )
}
 
export default Header;
  