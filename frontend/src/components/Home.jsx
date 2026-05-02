
import './Home.css';
import {  useNavigate } from 'react-router-dom';
import groupmateLogo from '../assets/groupmate_logo.svg';

function Home() {
    const navigate = useNavigate();
    return ( 
        <div className="home-container">
            <div className="header">
                <h1>GroupMate</h1>
                <button className='header-btn' onClick={(e)=>{e.preventDefault(); navigate('/login')}}>เริ่มต้นใช้งาน</button>
            </div>
            <div className="banner">
                <div className="banner-content">
                    <h1>GroupMate แอปพลิเคชั่นการทำงานกลุ่ม</h1>
                    <p>การสร้างกลุ่มสำหรับหรือทีมงาน GroupMate มีเครื่องมือที่ช่วยให้คุณสามารถเชิญสมาชิก จัดการงาน และสื่อสารกันได้อย่างมีประสิทธิภาพ มาเริ่มต้นใช้งาน GroupMate กันเถอะ!</p>
                    <button onClick={(e)=>{e.preventDefault(); navigate('/login')}}>เริ่มต้นใช้งาน</button>
                </div>
            </div>
        </div>
        
     );
}

export default Home;