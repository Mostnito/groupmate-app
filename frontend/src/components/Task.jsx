import { useState, useEffect } from 'react';
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
	const diffMs = target - now;
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays < 0) return 'เลยกำหนด';
	if (diffDays === 0) return 'วันนี้';
	if (diffDays === 1) return 'พรุ่งนี้';
	return `${diffDays} วัน`;
}

function Task() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);

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

	return (
		<>
			<div className="task-list">
				{loading ? (
					<div className="loading-state">
						<p>กำลังโหลดข้อมูล...</p>
					</div>
				) : tasks.length === 0 ? (
					<div className="empty-state">
						<p>ยังไม่มีงานใดเลย</p>
						<p className="sub-text">รอการมอบหมายงานจากเพื่อนร่วมกลุ่ม</p>
					</div>
				) : (
					sortedTasks.map((task) => (
						<article className="task-card task-card-row" key={task.id}>
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
