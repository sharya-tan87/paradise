import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const userRole = JSON.parse(localStorage.getItem('user') || '{}').role || 'unknown';

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-prompt">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <svg
                        className="w-20 h-20 text-red-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-primary-900 mb-4">
                    Access Denied
                </h1>

                <p className="text-gray-600 mb-2">
                    You do not have permission to view this page.
                </p>
                <p className="text-gray-500 text-sm mb-8">
                    Your current role: <span className="font-semibold">{userRole}</span>
                </p>

                <div className="space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white border border-primary-500 text-primary-500 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-900 transition-colors font-semibold"
                    >
                        Login as Different User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
