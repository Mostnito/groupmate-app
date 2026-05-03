
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Group.css';

function Group() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/group', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const mappedGroups = response.data.groups.map((group) => ({
                id: group.group_id,
                name: group.group_name,
                code: group.group_code,
                members: parseInt(group.member_count) || 0,
                role: group.role
            }));
            setGroups(mappedGroups);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error('ไม่สามารถดึงข้อมูลกลุ่มได้');
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchGroups();
    }, []);

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) {
            toast.error('กรุณากรอกชื่อกลุ่ม');
            return;
        }
        
        const createGroupAsync = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
                await axios.post(
                    'http://localhost:5000/api/group/create',
                    { name: newGroupName, user_id: userId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                toast.success(`สร้างกลุ่ม "${newGroupName}" สำเร็จ!`);
                setNewGroupName('');
                setShowCreateModal(false);
                await fetchGroups();
            } catch (error) {
                console.error('Error creating group:', error);
                toast.error(error.response?.data?.error || 'ไม่สามารถสร้างกลุ่มได้');
            }
        };
        createGroupAsync();
    };

    const handleJoinGroup = (e) => {
        e.preventDefault();
        if (!joinCode.trim()) {
            toast.error('กรุณากรอกรหัส 6 หลัก');
            return;
        }

        const joinGroupAsync = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
                await axios.post(
                    'http://localhost:5000/api/group/join',
                    { code: joinCode, user_id: userId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                toast.success('เข้าร่วมกลุ่มสำเร็จ!');
                setJoinCode('');
                setShowJoinModal(false);
                await fetchGroups();
            } catch (error) {
                console.error('Error joining group:', error);
                toast.error(error.response?.data?.error || 'ไม่สามารถเข้าร่วมกลุ่มได้');
            }
        };
        joinGroupAsync();
    };

    const handleLeaveGroup = (groupId) => {
        const leaveGroupAsync = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
                await axios.post(
                    'http://localhost:5000/api/group/leave',
                    { group_id: groupId, user_id: userId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                toast.success('ออกจากกลุ่มสำเร็จ!');
                await fetchGroups();
            } catch (error) {
                console.error('Error leaving group:', error);
                toast.error(error.response?.data?.error || 'ไม่สามารถออกจากกลุ่มได้');
            }
        };
        leaveGroupAsync();
    };

    const handleDeleteGroup = (groupId) => {
        const deleteGroupAsync = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
                await axios.delete(
                    'http://localhost:5000/api/group/delete',
                    {
                        data: { group_id: groupId, user_id: userId },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                toast.success('ลบกลุ่มสำเร็จ!');
                await fetchGroups();
            } catch (error) {
                console.error('Error deleting group:', error);
                toast.error(error.response?.data?.error || 'ไม่สามารถลบกลุ่มได้');
            }
        };
        deleteGroupAsync();
    };

    return (
        <>

            <div className="group-actions">
                <button className="action-btn create-btn" onClick={() => setShowCreateModal(true)}>
                    สร้างกลุ่มใหม่
                </button>
                <button className="action-btn join-btn" onClick={() => setShowJoinModal(true)}>
                    เข้าร่วมกลุ่ม
                </button>
            </div>

            <div className="group-list">
                <h2>กลุ่ม ({groups.length})</h2>
                {loading ? (
                    <div className="loading-state">
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="empty-state">
                        <p>ยังไม่มีกลุ่มใดเลย</p>
                        <p className="sub-text">สร้างกลุ่มใหม่หรือขอรหัสจากเพื่อนเพื่อเข้าร่วม</p>
                    </div>
                ) : (
                    <div className="group-card-grid">
                        {groups.map((group) => (
                            <article className="group-card" key={group.id}>
                                <div className="group-card-header">
                                    <h3>{group.name}</h3>
                                    <span className="group-code">รหัส: {group.code}</span>
                                </div>
                                <div className="group-card-body">
                                    <span className="group-members">👥 {group.members} คน</span>
                                </div>
                                <div className="group-card-actions">
                                    <button className="card-btn view-btn" onClick={() => navigate(`/group-manage/${group.id}`)}>ดูรายละเอียด</button>
                                    {group.role === 'leader' ? (
                                        <button className="card-btn delete-btn" onClick={() => handleDeleteGroup(group.id)}>
                                            ลบกลุ่ม
                                        </button>
                                    ) : (
                                        <button className="card-btn leave-btn" onClick={() => handleLeaveGroup(group.id)}>
                                            ออกจากกลุ่ม
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>สร้างกลุ่มใหม่</h2>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group">
                                <label htmlFor="groupName">ชื่อกลุ่ม</label>
                                <input
                                    type="text"
                                    id="groupName"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="กรุณากรอกชื่อกลุ่ม"
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="modal-btn create-btn">สร้างกลุ่ม</button>
                                <button
                                    type="button"
                                    className="modal-btn cancel-btn"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>เข้าร่วมกลุ่ม</h2>
                        <form onSubmit={handleJoinGroup}>
                            <div className="form-group">
                                <label htmlFor="joinCode">รหัสกลุ่ม (6 หลัก)</label>
                                <input
                                    type="text"
                                    id="joinCode"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.slice(0, 6))}
                                    placeholder="000000"
                                    maxLength="6"
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="modal-btn join-btn">เข้าร่วม</button>
                                <button
                                    type="button"
                                    className="modal-btn cancel-btn"
                                    onClick={() => setShowJoinModal(false)}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Group;