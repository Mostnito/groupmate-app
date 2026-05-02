import './Register.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Register(){
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('รหัสผ่านไม่ตรงกัน',{theme: "colored",transition: Flip});
            return;
        }
        if (firstName.trim() === '' || lastName.trim() === '' || email.trim() === '' || phone.trim() === '' || password.trim() === '') {
            toast.error('กรุณากรอกข้อมูลให้ครบ',{theme: "colored",transition: Flip});
            return;
        }
        const register = async() =>{
            try {
                await axios.post('http://localhost:5000/api/register', {
                    name: firstName,
                    surname: lastName,
                    phone: phone,
                    email: email,
                    password: password
                });
                localStorage.setItem("token", res.data.token);
                navigate('/dashboard');
            } catch (error) {
                toast.error('เกิดข้อผิดพลาด',{theme: "colored",transition: Flip});
            }
        }
        register();
        console.log('Register:', { firstName, lastName, email, phone, password });
    };

    return (
        <div className="register-container">
            <ToastContainer />
            <div className="register-card">
                <div className="register-header">
                    <h1>สมัครสมาชิก</h1>
                    <p>สร้างบัญชีใหม่ฟรี</p>
                </div>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">ชื่อ</label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="กรุณากรอกชื่อ"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">นามสกุล</label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="กรุณากรอกนามสกุล"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">อีเมล</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="กรุณากรอกอีเมล"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">เบอร์โทร</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="กรุณากรอกเบอร์โทร"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">รหัสผ่าน</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="กรุณากรอกรหัสผ่าน"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"

                        />
                    </div>
                    <button type="submit" className="register-btn">สมัครสมาชิก</button>
                </form>
                <div className="register-footer">
                    <p>มีบัญชีแล้ว? <a onClick={(e)=>{e.preventDefault(); navigate('/login'); }}>เข้าสู่ระบบ</a></p>
                </div>
            </div>
        </div>
    );   
}

export default Register;