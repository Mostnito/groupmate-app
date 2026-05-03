import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast, Flip } from 'react-toastify';
import './GroupManage.css';

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

function GroupManage() {
	const { groupId } = useParams();
	const navigate = useNavigate();
	const [group, setGroup] = useState(null);
	const [members, setMembers] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [userRole, setUserRole] = useState(null);
	const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
	const [taskForm, setTaskForm] = useState({
		task_name: '',
		task_des: '',
		assigned_to: '',
		start_date: '',
		end_date: ''
	});

	const fetchGroupData = useCallback(async (token, currentUserId) => {
		try {
			// Fetch group info and members
			const groupRes = await axios.get(`${API_URL}/api/group/${groupId}/members`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			setGroup(groupRes.data.group);
			setMembers(groupRes.data.members);
			
			// Set user role
			const currentUserMember = groupRes.data.members.find(m => m.user_id === currentUserId);
			if (currentUserMember) {
				setUserRole(currentUserMember.role);
			}
			
			// Fetch tasks
			const tasksRes = await axios.get(`${API_URL}/api/group/${groupId}/tasks`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setTasks(tasksRes.data.tasks);
			
			setLoading(false);
		} catch (error) {
			console.error('Error fetching group data:', error);
			toast.error('ไม่สามารถดึงข้อมูลกลุ่มได้');
			setLoading(false);
		}
	}, [groupId]);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			toast.error('กรุณาเข้าสู่ระบบ');
			navigate('/');
			return;
		}
		const currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchGroupData(token, currentUserId);
	}, [groupId, navigate, fetchGroupData]);

	const handleLeaveGroup = async () => {
		try {
			const token = localStorage.getItem('token');
			const userId = JSON.parse(atob(token.split('.')[1])).userId;
			await axios.post(
				`${API_URL}/api/group/leave`,
				{ group_id: groupId, user_id: userId },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success('ออกจากกลุ่มสำเร็จ!');
			navigate('/dashboard');
		} catch (error) {
			console.error('Error leaving group:', error);
			toast.error(error.response?.data?.error || 'ไม่สามารถออกจากกลุ่มได้');
		}
	};

	const handleDeleteGroup = async () => {
		if (!window.confirm('คุณแน่ใจหรือว่าต้องการลบกลุ่มนี้? การกระทำนี้ไม่สามารถยกเลิกได้')) {
			return;
		}
		
		try {
			const token = localStorage.getItem('token');
			const userId = JSON.parse(atob(token.split('.')[1])).userId;
			await axios.delete(
				`${API_URL}/api/group/delete`,
				{
					data: { group_id: groupId, user_id: userId },
					headers: { Authorization: `Bearer ${token}` }
				}
			);
			toast.success('ลบกลุ่มสำเร็จ!');
			navigate('/dashboard');
		} catch (error) {
			console.error('Error deleting group:', error);
			toast.error(error.response?.data?.error || 'ไม่สามารถลบกลุ่มได้');
		}
	};

	const handleTaskFormChange = (e) => {
		const { name, value } = e.target;
		setTaskForm(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleCreateTask = async (e) => {
		e.preventDefault();
		
		if (!taskForm.task_name.trim() || !taskForm.task_des.trim() || !taskForm.assigned_to || !taskForm.start_date || !taskForm.end_date) {
			toast.error('กรุณากรอกข้อมูลทั้งหมด');
			return;
		}

		if (new Date(taskForm.end_date) <= new Date(taskForm.start_date)) {
			toast.error('วันจบต้องมากกว่าวันเริ่ม');
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const userId = JSON.parse(atob(token.split('.')[1])).userId;
			
			await axios.post(
				`${API_URL}/api/task/create`,
				{
					group_id: groupId,
					user_id: userId,
					assigned_to: parseInt(taskForm.assigned_to),
					task_name: taskForm.task_name,
					task_des: taskForm.task_des,
					start_date: taskForm.start_date,
					end_date: taskForm.end_date
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			
			toast.success('สร้างงานสำเร็จ!', { theme: "colored", transition: Flip });
			setShowCreateTaskModal(false);
			setTaskForm({
				task_name: '',
				task_des: '',
				assigned_to: '',
				start_date: '',
				end_date: ''
			});
			
			// Refresh tasks list
			const tasksRes = await axios.get(`${API_URL}/api/group/${groupId}/tasks`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setTasks(tasksRes.data.tasks);
		} catch (error) {
			console.error('Error creating task:', error);
			toast.error(error.response?.data?.error || 'ไม่สามารถสร้างงานได้');
		}
	};

	if (loading) {
		return <div className="loading-state"><p>กำลังโหลดข้อมูล...</p></div>;
	}

	if (!group) {
		return <div className="empty-state"><p>ไม่พบข้อมูลกลุ่ม</p></div>;
	}

	const sortedTasks = [...tasks].sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

	return (
		<div className="group-manage-page">
            <ToastContainer />
			<div className="group-header-section">
				<div className="group-header-left">
					<button className="back-btn" onClick={() => navigate('/dashboard')}>
						← ย้อนกลับ
					</button>
					<div className="group-header-content">
						<h1>{group.group_name}</h1>
						<p>{members.length} สมาชิก</p>
					</div>
				</div>
				<div className="group-actions-top">
					{userRole === 'leader' && (
						<button className="action-btn create-task-btn" onClick={() => setShowCreateTaskModal(true)}>
							เพิ่มงานใหม่
						</button>
					)}
					{userRole === 'leader' ? (
						<button className="action-btn delete-btn" onClick={handleDeleteGroup}>
							ลบกลุ่ม
						</button>
					) : (
						<button className="action-btn leave-btn" onClick={handleLeaveGroup}>
							ออกจากกลุ่ม
						</button>
					)}
				</div>
			</div>

			<div className="manage-container">
				{/* Members Section */}
				<section className="members-section">
					<h2>สมาชิก ({members.length})</h2>
					<div className="members-list">
						{members.map((member) => (
							<div className="member-card" key={member.user_id}>
								<div className="member-info">
									<span className="member-name">{member.name} {member.surname}</span>
									<span className={`member-role role-${member.role}`}>
										{member.role === 'leader' ? '👑 ผู้นำ' : '👤 สมาชิก'}
									</span>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Tasks Section */}
				<section className="tasks-section">
					<h2>งาน ({tasks.length})</h2>
					{tasks.length === 0 ? (
						<div className="empty-state">
							<p>ยังไม่มีงานในกลุ่มนี้</p>
						</div>
					) : (
						<div className="tasks-list">
							{sortedTasks.map((task) => (
								<article className="task-card-manage" key={task.task_id}>
									<div className="task-main">
										<div className="task-card-top">
											<span className="task-deadline-badge">{getDaysLeft(task.end_date)}</span>
										</div>
										<h3 className="task-title">{task.task_name}</h3>
										<p className="task-detail">{task.task_des}</p>
										<p className="task-assigned">ได้รับมอบหมายให้: <strong>{task.assigned_name}</strong></p>
									</div>
									<div className="task-meta">
										<div className="meta-item">
											<span className="meta-label">เวลาส่ง</span>
											<span className="meta-value">{formatDateTime(task.end_date)}</span>
										</div>
									</div>
								</article>
							))}
						</div>
					)}
				</section>
			</div>

			{/* Create Task Modal */}
			{showCreateTaskModal && (
				<div className="modal-overlay" onClick={() => setShowCreateTaskModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<h2>สร้างงาน</h2>
						<form onSubmit={handleCreateTask}>
							<div className="form-group">
								<label>ชื่องาน *</label>
								<input
									type="text"
									name="task_name"
									value={taskForm.task_name}
									onChange={handleTaskFormChange}
									placeholder="ระบุชื่องาน"
								/>
							</div>

							<div className="form-group">
								<label>รายละเอียด *</label>
								<textarea
									name="task_des"
									value={taskForm.task_des}
									onChange={handleTaskFormChange}
									placeholder="ระบุรายละเอียดงาน"
									rows="4"
								></textarea>
							</div>

							<div className="form-group">
								<label>มอบหมายให้สมาชิก *</label>
								<select
									name="assigned_to"
									value={taskForm.assigned_to}
									onChange={handleTaskFormChange}
								>
									<option value="">เลือกสมาชิก</option>
									{members.map((member) => (
										<option key={member.user_id} value={member.user_id}>
											{member.name} {member.surname}
										</option>
									))}
								</select>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>วันเริ่ม *</label>
									<input
										type="datetime-local"
										name="start_date"
										value={taskForm.start_date}
										onChange={handleTaskFormChange}
									/>
								</div>

								<div className="form-group">
									<label>วันจบ *</label>
									<input
										type="datetime-local"
										name="end_date"
										value={taskForm.end_date}
										onChange={handleTaskFormChange}
									/>
								</div>
							</div>

							<div className="modal-actions">
								<button
									type="button"
									className="modal-btn cancel-btn"
									onClick={() => setShowCreateTaskModal(false)}
								>
									ยกเลิก
								</button>
								<button type="submit" className="modal-btn create-btn">
									สร้างงาน
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default GroupManage;