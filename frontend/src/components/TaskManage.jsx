import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './TaskManage.css';

const API_URL = 'http://localhost:5000';

function formatDateTime(dateString) {
	return new Intl.DateTimeFormat('th-TH', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(dateString));
}

function TaskManage() {
	const { taskId } = useParams();
	const navigate = useNavigate();
	const [task, setTask] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [submission, setSubmission] = useState(null);
	const [comment, setComment] = useState('');
	const [file, setFile] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [reviewing, setReviewing] = useState(false);
	const [reviewComment, setReviewComment] = useState('');
	const [accessDenied, setAccessDenied] = useState(false);

	useEffect(() => {
		const fetchTask = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					toast.error('กรุณาเข้าสู่ระบบ');
					navigate('/dashboard');
					return;
				}

				const userId = JSON.parse(atob(token.split('.')[1])).userId;

				const response = await axios.get(`${API_URL}/api/task/detail/${taskId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});

				const foundTask = response.data.task;
				setTask(foundTask);
				setLoading(false);
				
				// Fetch group members to check user role
				const membersRes = await axios.get(`${API_URL}/api/group/${foundTask.group_id}/members`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				const currentUserMember = membersRes.data.members.find(m => m.user_id === userId);
				if (currentUserMember) {
					setUserRole(currentUserMember.role);
				}

				if (currentUserMember?.role === 'leader' && foundTask.task_status === 'in_progress') {
					toast.error('หัวหน้ากลุ่มดูงานที่ยังไม่ส่งไม่ได้');
					setAccessDenied(true);
					setLoading(false);
					return;
				}
				
				// If already submitted or reviewed, fetch the submission record
				if (foundTask.task_status === 'submitted' || foundTask.task_status === 'reviewed') {
					try {
						const subRes = await axios.get(`${API_URL}/api/task/${foundTask.task_id}/submission`, {
							headers: { Authorization: `Bearer ${token}` }
						});
						setSubmission(subRes.data.submission);
					} catch (err) {
						console.warn('No submission record found or failed to fetch submission', err);
					}
				}
			} catch (error) {
				if (error.response?.status === 404) {
					toast.error('ไม่พบงาน');
					navigate('/dashboard');
					return;
				}
				console.error('Error fetching task:', error);
				toast.error('ไม่สามารถดึงข้อมูลงานได้');
				navigate('/dashboard');
			}
		};

		fetchTask();
	}, [taskId, navigate]);

	const handleSubmitTask = async (e) => {
		e.preventDefault();

		if (!comment.trim()) {
			toast.error('กรุณาเพิ่มหมายเหตุหรือความเห็น');
			return;
		}

		try {
			setSubmitting(true);
			const token = localStorage.getItem('token');
			const userId = JSON.parse(atob(token.split('.')[1])).userId;

			await axios.post(
				`${API_URL}/api/task/submit`,
				{
					task_id: parseInt(taskId),
					user_id: userId,
					file: file ? file.name : null,
					comment: comment
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			toast.success('ส่งงานสำเร็จ!');
			setComment('');
			setFile(null);
			setSubmitting(false);
			setTimeout(() => navigate('/dashboard'), 1500);
		} catch (error) {
			console.error('Error submitting task:', error);
			toast.error(error.response?.data?.error || 'ไม่สามารถส่งงานได้');
			setSubmitting(false);
		}
	};

	const handleReviewTask = async (e) => {
		e.preventDefault();

		if (!reviewComment.trim()) {
			toast.error('กรุณาระบุความเห็นการตรวจงาน');
			return;
		}

		try {
			setReviewing(true);
			const token = localStorage.getItem('token');
			const userId = JSON.parse(atob(token.split('.')[1])).userId;

			await axios.put(
				`${API_URL}/api/task/check`,
				{
					task_id: parseInt(taskId),
					reviewd_by: userId,
					reviewd_comment: reviewComment
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			toast.success('ตรวจงานสำเร็จ!');
			setReviewComment('');
			setReviewing(false);
			setTimeout(() => navigate('/dashboard'), 1500);
		} catch (error) {
			console.error('Error reviewing task:', error);
			toast.error(error.response?.data?.error || 'ไม่สามารถตรวจงานได้');
			setReviewing(false);
		}
	};

	if (loading) {
		return (
			<div className="task-manage-page">
				<div className="loading-state">
					<p>กำลังโหลดข้อมูล...</p>
				</div>
			</div>
		);
	}

	if (!task) {
		return (
			<div className="task-manage-page">
				<div className="empty-state">
					<p>ไม่พบข้อมูลงาน</p>
				</div>
			</div>
		);
	}

	if (accessDenied) {
		return (
			<div className="task-manage-page">
				<ToastContainer />
				<div className="empty-state">
					<p>หัวหน้ากลุ่มดูงานที่ยังไม่ส่งไม่ได้</p>
					<button className="action-btn cancel-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: 16 }}>
						กลับไปหน้าหลัก
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className="task-manage-page">
			<ToastContainer />
			<div className="task-manage-header">
				<button className="back-btn" onClick={() => navigate('/dashboard')}>
					← ย้อนกลับ
				</button>
				<h1>ส่งงาน</h1>
			</div>

			<div className="task-manage-container">
				<section className="task-detail-section">
					<h2>รายละเอียดงาน</h2>
					<div className="task-detail-content">
						<div className="detail-item">
							<span className="detail-label">ชื่องาน</span>
							<span className="detail-value">{task.task_name}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">รายละเอียด</span>
							<span className="detail-value">{task.task_des}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">กลุ่ม</span>
							<span className="detail-value">{task.group_name}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">เวลาที่กำหนด</span>
							<span className="detail-value">{formatDateTime(task.end_date)}</span>
						</div>
					</div>
				</section>

				{(task.task_status === 'submitted' || task.task_status === 'reviewed') && submission ? (
					<section className="task-submit-section">
						<h2>{task.task_status === 'reviewed' ? 'ข้อมูลการส่งและผลตรวจ' : 'ข้อมูลการส่ง'}</h2>
						<div className="detail-item">
							<span className="detail-label">ไฟล์ที่ส่ง</span>
							<span className="detail-value">{submission.file_path || 'ไม่มีไฟล์แนบ'}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">รายละเอียด</span>
							<span className="detail-value">{submission.comment}</span>
						</div>
						<div className="detail-item">
							<span className="detail-label">เวลาที่ส่ง</span>
							<span className="detail-value">{formatDateTime(submission.submitted_at)}</span>
						</div>
						{task.task_status === 'reviewed' && (
							<div className="detail-item">
								<span className="detail-label">ความคิดเห็นจากการตรวจ</span>
								<span className="detail-value">{submission.reviewed_comment || 'ไม่มีความคิดเห็น'}</span>
							</div>
						)}
						{userRole === 'leader' && (
							<form onSubmit={handleReviewTask} className="review-form" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
								<h3>ตรวจงาน</h3>
								<div className="form-group">
									<label>ความเห็นตรวจ *</label>
									<textarea
										value={reviewComment}
										onChange={(e) => setReviewComment(e.target.value)}
										placeholder="ระบุความเห็นการตรวจงาน..."
										rows="4"
									></textarea>
								</div>

								<div className="form-actions">
									<button
										type="button"
										className="action-btn cancel-btn"
										onClick={() => navigate('/dashboard')}
										disabled={reviewing}
									>
										ย้อนกลับ
									</button>
									<button
										type="submit"
										className="action-btn submit-btn"
										disabled={reviewing}
									>
										{reviewing ? 'กำลังตรวจ...' : 'ยืนยันตรวจ'}
									</button>
								</div>
							</form>
						)}
					</section>
				) : (
					<section className="task-submit-section">
						<h2>ส่งงาน</h2>
						<form onSubmit={handleSubmitTask}>
							<div className="form-group">
								<label>หมายเหตุ *</label>
								<textarea
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									placeholder="ระบุหมายเหตุหรือความเห็น..."
									rows="5"
								></textarea>
							</div>

							<div className="form-group">
								<label>ไฟล์แนบ (ไม่บังคับ)</label>
								<div className="file-input-wrapper">
									<input
										type="file"
										onChange={(e) => setFile(e.target.files[0])}
										id="file-input"
									/>
									<label htmlFor="file-input" className="file-label">
										📎 {file ? file.name : 'เลือกไฟล์'}
									</label>
								</div>
							</div>

							<div className="form-actions">
								<button
									type="button"
									className="action-btn cancel-btn"
									onClick={() => navigate('/dashboard')}
									disabled={submitting}
								>
									ยกเลิก
								</button>
								<button
									type="submit"
									className="action-btn submit-btn"
									disabled={submitting}
								>
									{submitting ? 'กำลังส่ง...' : 'ส่งงาน'}
								</button>
							</div>
						</form>
					</section>
				)}
			</div>
		</div>
	);
}

export default TaskManage;