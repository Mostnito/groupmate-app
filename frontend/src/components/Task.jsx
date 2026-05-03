import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Task.css';

const API_URL = 'http://localhost:5000';

function formatDateTime(dateString) {
	return new Intl.DateTimeFormat('th-TH', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(dateString));
}

function getDaysLeft(dateString) {
	const now = new Date();
	const target = new Date(dateString);

	// First, check if the target time has already passed today.
	const diffMs = target - now;
	if (diffMs < 0) {
		return 'เลยกำหนด';
	}

	// If not past due, then compare by days.
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	target.setHours(0, 0, 0, 0);

	const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'วันนี้';
	if (diffDays === 1) return 'พรุ่งนี้';
	return `${diffDays} วัน`;
}

function Task() {
	const navigate = useNavigate();
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState('all');

	// Fetch tasks on component mount
	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					toast.error('กรุณาเข้าสู่ระบบ');
					setLoading(false);
					return;
				}
				
				// Extract user ID from JWT token
				const userId = JSON.parse(atob(token.split('.')[1])).userId;
				
				const response = await axios.get(`${API_URL}/api/task/${userId}`, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const mappedTasks = response.data.tasks.map((task) => ({
					id: task.task_id,
					title: task.task_name,
					detail: task.task_des,
					deadline: task.end_date,
					groupName: task.group_name
					,status: task.task_status || 'in_progress'
				}));
				setTasks(mappedTasks);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching tasks:', error);
				toast.error('ไม่สามารถดึงข้อมูลงานได้');
				setLoading(false);
			}
		};
		fetchTasks();
	}, []);

	const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
	const filteredTasks = sortedTasks.filter((t) => {
		if (selectedStatus === 'all') return true;
		return t.status === selectedStatus;
	});

	return (
		<>
			<div className="task-list">
				<div className="task-filters" style={{display: 'flex', gap: 8, marginBottom: 12}}>
					<button className={`filter-btn ${selectedStatus === 'all' ? 'active' : ''}`} onClick={() => setSelectedStatus('all')}>ทั้งหมด</button>
					<button className={`filter-btn ${selectedStatus === 'in_progress' ? 'active' : ''}`} onClick={() => setSelectedStatus('in_progress')}>กำลังดำเนินการ</button>
					<button className={`filter-btn ${selectedStatus === 'submitted' ? 'active' : ''}`} onClick={() => setSelectedStatus('submitted')}>ส่งแล้ว</button>
					<button className={`filter-btn ${selectedStatus === 'reviewed' ? 'active' : ''}`} onClick={() => setSelectedStatus('reviewed')}>ตรวจแล้ว</button>
				</div>
				{loading ? (
					<div className="loading-state">
						<p>กำลังโหลดข้อมูล...</p>
					</div>
				) : tasks.length === 0 ? (
					<div className="empty-state">
						<p>ยังไม่มีงานใดเลย</p>
						<p className="sub-text">รอการมอบหมายงานจากเพื่อนร่วมกลุ่ม</p>
					</div>
				) : filteredTasks.length === 0 ? (
					<div className="empty-state">
						<p>ไม่มีงานสำหรับสถานะนี้</p>
					</div>
				) : (
					filteredTasks.map((task) => (
						<article 
							className="task-card task-card-row" 
							key={task.id}
							onClick={() => navigate(`/task-manage/${task.id}`)}
							style={{ cursor: 'pointer' }}
						>
							<div className="task-main">
								<div className="task-card-top">
									<span className="task-group">{task.groupName}</span>
									<span className="task-deadline-badge">{getDaysLeft(task.deadline)}</span>
								</div>

								<h2 className="task-title">{task.title}</h2>
								<p className="task-detail">{task.detail}</p>
							</div>

							<div className="task-meta task-meta-inline">
								<div className="meta-item">
									<span className="meta-label">เวลาส่ง</span>
									<span className="meta-value">{formatDateTime(task.deadline)}</span>
								</div>
								<div className="meta-item">
									<span className="meta-label">ชื่อกลุ่ม</span>
									<span className="meta-value">{task.groupName}</span>
								</div>
							</div>
						</article>
					))
				)}
			</div>
		</>
	);
}

export default Task;
