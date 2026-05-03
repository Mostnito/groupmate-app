import { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './Dashboard.css';

import { FaUserGroup } from "react-icons/fa6";
import { FaComment } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { FaCog } from "react-icons/fa";

import Setting  from './Setting';
import Task from './Task';
import Chat from './Chat';
import Group from './Group';



function Dashboard() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('groups');

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login');
        } else {
            const verifyToken = async () => {
                try {
                    await axios.get('http://localhost:5000/api/verify', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                } catch {
                    localStorage.removeItem("token");
                    navigate('/login');
                }
            }
            verifyToken();
            toast.success('ยินดีต้อนรับเข้าสู่แดชบอร์ด!',{theme: "colored",transition: Flip});
        }
    },[navigate]);

    const menuItems = [
        { id: 'groups', label: 'กลุ่ม', icon: <FaUserGroup /> },
        { id: 'chat', label: 'แชท', icon: <FaComment /> },
        { id: 'task', label: 'งาน', icon: <FaTasks /> },
        { id: 'settings', label: 'ตั้งค่า', icon: <FaCog /> }
    ];

    const renderContent = () => {
        switch(activeMenu) {
            case 'groups':
                return <Group />;
            case 'chat':
                return <Chat />;
            case 'task':
                return <Task />;
            case 'settings':
                return <Setting />;
            default:
                return <div className="content-section"><h2>ยินดีต้อนรับเข้าสู่แดชบอร์ด!</h2></div>;
        }
    };

    return (
        <div className="dashboard-container">
            <ToastContainer />
            <div className="dashboard-wrapper">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <h2>GroupMate</h2>
                    </div>
                    <nav className="sidebar-menu">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => setActiveMenu(item.id)}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}>ออกจากระบบ</button>
                    </div>
                </aside>

                <main className="main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;