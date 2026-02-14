import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logoutUser } from '../../../actions/userAction'
import { toast } from 'react-toastify'

const tabs = [
    {
        title: "Edit Profile",
        nav: "/accounts/edit"
    },
    {
        title: "Change Password",
        nav: "/accounts/password/change"
    },
]

const Sidebar = ({ activeTab }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
        toast.success("Logout Successfully");
    }

    return (
        <div className="flex flex-col border-r w-1/4">
            {tabs.map((el, i) => (
                <Link to={el.nav} className={`${activeTab === i ? 'border-black text-black border-l-2 font-medium' : 'hover:border-gray-300 text-gray-600'} py-3 px-6 hover:border-l-2 hover:bg-gray-50 cursor-pointer`}>{el.title}</Link>
            ))}

            <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-2 mx-4 mb-4 py-2.5 text-sm font-medium text-red-500 border border-red-500 rounded hover:bg-red-50 cursor-pointer"
            >
                <svg aria-label="Logout" height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
            </button>
        </div>
    )
}

export default Sidebar