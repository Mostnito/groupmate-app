import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (email.trim() === '' || password.trim() === '') {
            toast.error('กรุณากรอกข้อมูลให้ครบ',{theme: "colored",transition: Flip});
            return;
        } else{
            const login = async() =>{
                try {
                    const res = await axios.post('http://localhost:5000/api/login', {
                        email: email,
                        password: password

                    });
                console.log("Login successful:", res.data);
                toast.success('เข้าสู่ระบบสำเร็จ',{theme: "colored",transition: Flip})
                localStorage.setItem("token", res.data.token);
                navigate('/dashboard');
                } catch (error) {
                    console.error("Login failed:", error);
                    toast.error('เข้าสู่ระบบไม่สำเร็จ',{theme: "colored",transition: Flip});
                }    
            }
            login();
        }

        
        
        
    };

    return (
        <div className="login-container">
            <ToastContainer />
            <div className="login-card">
                <div className="login-header">
                    <h1>เข้าสู่ระบบ</h1>
                    <p>ยินดีต้อนรับ</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
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
                        <label htmlFor="password">รหัสผ่าน</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="กรุณากรอกรหัสผ่าน"
                        />
                    </div>
                    <button type="submit" className="login-btn">เข้าสู่ระบบ</button>
                </form>
                <div className="login-footer">
                    <p>ยังไม่มีบัญชี? <a onClick={(e)=>{e.preventDefault(); navigate('/register'); }}>สมัครสมาชิก</a></p>
                </div>
                
            </div>
        </div>
    );   
}

export default Login;