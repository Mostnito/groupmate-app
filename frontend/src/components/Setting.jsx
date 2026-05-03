
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Setting.css';

const API_URL = 'http://localhost:5000';

function Setting() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    const [tempFormData, setTempFormData] = useState(formData);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('กรุณาเข้าสู่ระบบ');
                    return;
                }
                const response = await axios.get(`${API_URL}/api/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const userData = response.data.user;
                const userFormData = {
                    firstName: userData.name || '',
                    lastName: userData.surname || '',
                    phone: userData.phone || '',
                    email: userData.email || ''
                };
                setFormData(userFormData);
                setTempFormData(userFormData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('ไม่สามารถดึงข้อมูลผู้ใช้');
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setTempFormData(formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempFormData(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempFormData({
            ...tempFormData,
            [name]: value
        });
    };

    const handleSave = async () => {
        if (!tempFormData.firstName || !tempFormData.lastName || !tempFormData.phone || !tempFormData.email) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('กรุณาเข้าสู่ระบบ');
                setSaving(false);
                return;
            }

            await axios.put(`${API_URL}/api/user/update`, {
                name: tempFormData.firstName,
                surname: tempFormData.lastName,
                phone: tempFormData.phone,
                email: tempFormData.email
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFormData(tempFormData);
            setIsEditing(false);
            toast.success('บันทึกข้อมูลสำเร็จ!');
            setSaving(false);
        } catch (error) {
            console.error('Error updating user data:', error);
            toast.error(error.response?.data?.error || 'ไม่สามารถอัปเดตข้อมูล');
            setSaving(false);
        }
    };

    return (
        <>
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>กำลังดึงข้อมูล...</p>
                </div>
            ) : (
                <>
                    <div className="profile-section">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                            </div>
                        </div>
                        <div className="profile-info">
                            <h2>{formData.firstName} {formData.lastName}</h2>
                            <p>{formData.email}</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="setting-form view-mode">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ชื่อ</label>
                                    <div className="display-value">{formData.firstName}</div>
                                </div>
                                <div className="form-group">
                                    <label>นามสกุล</label>
                                    <div className="display-value">{formData.lastName}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>เบอร์โทร</label>
                                    <div className="display-value">{formData.phone}</div>
                                </div>
                                <div className="form-group">
                                    <label>อีเมล</label>
                                    <div className="display-value">{formData.email}</div>
                                </div>
                            </div>
                            <div className="action-buttons">
                                <button className="edit-btn" onClick={handleEdit}>แก้ไข</button>
                            </div>
                        </div>
                    ) : (
                        <div className="setting-form edit-mode">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">ชื่อ</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={tempFormData.firstName}
                                        onChange={handleChange}
                                        placeholder="กรุณากรอกชื่อ"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">นามสกุล</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={tempFormData.lastName}
                                        onChange={handleChange}
                                        placeholder="กรุณากรอกนามสกุล"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">เบอร์โทร</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={tempFormData.phone}
                                        onChange={handleChange}
                                        placeholder="กรุณากรอกเบอร์โทร"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">อีเมล</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={tempFormData.email}
                                        onChange={handleChange}
                                        placeholder="กรุณากรอกอีเมล"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div className="action-buttons">
                                <button className="save-btn" onClick={handleSave} disabled={saving}>
                                    {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
                                </button>
                                <button className="cancel-btn" onClick={handleCancel} disabled={saving}>ยกเลิก</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default Setting;