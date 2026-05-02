import './Task.css';

const tasks = [
	{
		id: 1,
		title: 'ออกแบบหน้า Login',
		detail: 'ปรับ UI ให้สอดคล้องกับธีมของระบบและตรวจสอบการทำงานของปุ่มเข้าสู่ระบบ',
		deadline: '2026-05-03T15:00:00',
		groupName: 'Group A'
	},
	{
		id: 2,
		title: 'จัดทำ API รายชื่อสมาชิก',
		detail: 'เชื่อมต่อข้อมูลกลุ่มและสมาชิกให้พร้อมใช้งานในหน้า Dashboard',
		deadline: '2026-05-05T18:30:00',
		groupName: 'Frontend Team'
	},
	{
		id: 3,
		title: 'ตรวจสอบหน้า Settings',
		detail: 'ทดสอบฟิลด์ชื่อ นามสกุล เบอร์โทร และอีเมลให้ครบทุกกรณี',
		deadline: '2026-05-04T10:00:00',
		groupName: 'UI/UX Team'
	},
	{
		id: 4,
		title: 'สรุปรายงานความคืบหน้า',
		detail: 'รวบรวมสถานะงานและส่งสรุปให้ทีมก่อนประชุมประจำสัปดาห์',
		deadline: '2026-05-07T09:00:00',
		groupName: 'Project Squad'
	}
];

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
	const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

	return (
		<>

			<div className="task-list">
				{sortedTasks.map((task) => (
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
				))}
			</div>
		</>
	);
}

export default Task;
