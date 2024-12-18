import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            {/* Logo */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" width={41} height={41} viewBox="0 0 41 41" fill="none">
                    <path d="M37.532 16.87a9.96 9.96 0 0 0-.856-8.184 10.08 10.08 0 0 0-10.855-4.835A9.96 9.96 0 0 0 18.307.5a10.08 10.08 0 0 0-9.614 6.977 9.97 9.97 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.97 9.97 0 0 0 .856 8.185 10.08 10.08 0 0 0 10.855 4.835 9.97 9.97 0 0 0 7.516 3.35 10.08 10.08 0 0 0 9.617-6.981 9.97 9.97 0 0 0 6.663-4.834 10.08 10.08 0 0 0-1.243-11.813M22.498 37.886a7.47 7.47 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.3 1.3 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496M6.392 31.006a7.47 7.47 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.3 1.3 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744M4.297 13.62A7.47 7.47 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.3 1.3 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237m27.658 6.437-9.724-5.615 3.367-1.943a.12.12 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.29 1.29 0 0 0-.65-1.132m3.35-5.043a7 7 0 0 0-.236-.141l-7.965-4.6a1.3 1.3 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763m-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 7 7 0 0 0-.236.134l-7.965 4.6a1.3 1.3 0 0 0-.654 1.132zm1.829-3.943 4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5z" fill="currentColor" />
                </svg>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold text-center">Enter your password</h1>

                <div className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Password" className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {/* Continue Button */}
                    <button
                        onClick={() => {
                            navigate("/");
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
