
import { useState } from 'react';
import { toast } from 'react-toastify';
import './Setting.css';

function Setting() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: 'สมชาย',
        lastName: 'มงคลกิจ',
        phone: '081-234-5678',
        email: 'somchai@email.com'
    });

    const [tempFormData, setTempFormData] = useState(formData);

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

    const handleSave = () => {
        if (!tempFormData.firstName || !tempFormData.lastName || !tempFormData.phone || !tempFormData.email) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setFormData(tempFormData);
        setIsEditing(false);
        toast.success('บันทึกข้อมูลสำเร็จ!');
    };

    return (
        <>
            <div className="profile-section">
                    <div className="profile-avatar">
                        <div className="avatar-circle">SC</div>
                    </div>
                    <div className="profile-info">
                        <h2>{formData.firstName} {formData.lastName}</h2>
                        <p>{formData.email}</p>
                    </div>
                </div>

                {!isEditing ? (
                    // View Mode
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
                                <label>เมล</label>
                                <div className="display-value">{formData.email}</div>
                            </div>
                        </div>
                        <div className="action-buttons">
                            <button className="edit-btn" onClick={handleEdit}>✏️ แก้ไข</button>
                        </div>
                    </div>
                ) : (
                    // Edit Mode
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
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">เมล</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={tempFormData.email}
                                    onChange={handleChange}
                                    placeholder="กรุณากรอกเมล"
                                />
                            </div>
                        </div>
                        <div className="action-buttons">
                            <button className="save-btn" onClick={handleSave}>💾 บันทึก</button>
                            <button className="cancel-btn" onClick={handleCancel}>❌ ยกเลิก</button>
                        </div>
                    </div>
                )}
        </>
    );
}

export default Setting;