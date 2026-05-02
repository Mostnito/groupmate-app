import { useState } from 'react';
import './Chat.css';

const groups = [
	{
		id: 1,
		name: 'Group A',
		lastMessage: 'สรุปงานเสร็จแล้ว',
		unread: 3,
		members: 8
	},
	{
		id: 2,
		name: 'Frontend Team',
		lastMessage: 'พรุ่งนี้ช่วยรีวิว UI หน่อย',
		unread: 1,
		members: 5
	},
	{
		id: 3,
		name: 'Project Squad',
		lastMessage: 'ประชุมเวลา 10:00 น.',
		unread: 0,
		members: 12
	}
];

const messagesByGroup = {
	1: [
		{ id: 1, sender: 'สมชาย', text: 'สรุปงานเสร็จแล้ว', time: '09:20' },
		{ id: 2, sender: 'เรา', text: 'ดีมาก เดี๋ยวเช็คอีกที', time: '09:25' }
	],
	2: [
		{ id: 1, sender: 'พิม', text: 'พรุ่งนี้ช่วยรีวิว UI หน่อย', time: '10:15' },
		{ id: 2, sender: 'เรา', text: 'ได้เลย เดี๋ยวดูให้', time: '10:18' }
	],
	3: [
		{ id: 1, sender: 'แอดมิน', text: 'ประชุมเวลา 10:00 น.', time: '08:00' },
		{ id: 2, sender: 'เรา', text: 'รับทราบครับ', time: '08:02' }
	]
};

function Chat() {
	const [selectedGroupId, setSelectedGroupId] = useState(groups[0].id);
	const [message, setMessage] = useState('');

	const selectedGroup = groups.find((group) => group.id === selectedGroupId);
	const messages = messagesByGroup[selectedGroupId] || [];

	const handleSendMessage = (e) => {
		e.preventDefault();
		if (!message.trim()) return;
		setMessage('');
	};

	return (
		<>

			<div className="chat-layout">
				<aside className="chat-group-list">
					<h2>กลุ่ม</h2>
					<div className="group-items">
						{groups.map((group) => (
							<button
								key={group.id}
								className={`group-item ${selectedGroupId === group.id ? 'active' : ''}`}
								onClick={() => setSelectedGroupId(group.id)}
							>
								<div className="group-item-main">
									<span className="group-name">{group.name}</span>
									<span className="group-meta">สมาชิก {group.members} คน</span>
								</div>
								<div className="group-item-side">
									<span className="group-last-message">{group.lastMessage}</span>
									{group.unread > 0 && <span className="group-unread">{group.unread}</span>}
								</div>
							</button>
						))}
					</div>
				</aside>

				<section className="chat-room">
					<div className="chat-room-header">
						<div>
							<h2>{selectedGroup.name}</h2>
							<p>สมาชิก {selectedGroup.members} คน</p>
						</div>
						<span className="chat-room-badge">พร้อมสนทนา</span>
					</div>

					<div className="chat-messages">
						{messages.map((item) => (
							<div
								key={item.id}
								className={`chat-message ${item.sender === 'เรา' ? 'own' : 'other'}`}
							>
								<div className="message-content">
									<span className="message-sender">{item.sender}</span>
									<p>{item.text}</p>
								</div>
								<span className="message-time">{item.time}</span>
							</div>
						))}
					</div>

					<form className="chat-input-bar" onSubmit={handleSendMessage}>
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder={`พิมพ์ข้อความถึง ${selectedGroup.name}`}
						/>
						<button type="submit">ส่ง</button>
					</form>
				</section>
			</div>
		</>
	);
}

export default Chat;
