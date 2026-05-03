import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Chat.css';
import {io} from 'socket.io-client';
const socket = io('http://localhost:5000');

function Chat() {
	const [groups, setGroups] = useState([]);
	const [selectedGroupId, setSelectedGroupId] = useState(null);
	const [messages, setMessages] = useState([]);
	const [groupsLoading, setGroupsLoading] = useState(true);
	const [messagesLoading, setMessagesLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [message, setMessage] = useState('');
	const token = localStorage.getItem('token');
	const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

	const selectedGroup = groups.find((group) => group.id === selectedGroupId) || null;

	useEffect(() => {
		const fetchGroups = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/group', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const mappedGroups = response.data.groups.map((group) => ({
					id: group.group_id,
					name: group.group_name,
					members: parseInt(group.member_count, 10) || 0,
					role: group.role,
					code: group.group_code
				}));

				setGroups(mappedGroups);
				setSelectedGroupId(mappedGroups[0]?.id ?? null);
			} catch (error) {
				console.error('Error fetching chat groups:', error);
				toast.error('ไม่สามารถดึงข้อมูลกลุ่มได้');
			} finally {
				setGroupsLoading(false);
			}
		};

		if (token) {
			fetchGroups();
		} else {
			Promise.resolve().then(() => setGroupsLoading(false));
		}
	}, [token]);

	useEffect(() => {
		const handleSocketMessage = (payload) => {
			if (String(payload.group_id) !== String(selectedGroupId)) {
				return;
			}

			setMessages((currentMessages) => {
				if (currentMessages.some((item) => item.id === payload.chat_id)) {
					return currentMessages;
				}

				return [
					...currentMessages,
					{
						id: payload.chat_id,
						sender: payload.sender_id === userId ? 'เรา' : payload.name || 'สมาชิก',
						text: payload.message,
						time: new Date(payload.create_at).toLocaleTimeString('th-TH', {
							hour: '2-digit',
							minute: '2-digit'
						})
					}
				];
			});
		};

		const fetchMessages = async () => {
			if (!selectedGroupId) {
				setMessages([]);
				return;
			}

			try {
				setMessagesLoading(true);
				const response = await axios.get('http://localhost:5000/api/chat', {
					params: {
						group_id: selectedGroupId
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const mappedMessages = response.data.messages.map((item) => ({
					id: item.chat_id,
					sender: item.sender_id === userId ? 'เรา' : item.name,
					text: item.message,
					time: new Date(item.create_at).toLocaleTimeString('th-TH', {
						hour: '2-digit',
						minute: '2-digit'
					})
				}));

				setMessages(mappedMessages);
			} catch (error) {
				console.error('Error fetching chat messages:', error);
				toast.error('ไม่สามารถดึงข้อความได้');
				setMessages([]);
			} finally {
				setMessagesLoading(false);
			}
		};

		socket.on('chat-message', handleSocketMessage);
		fetchMessages();

		return () => {
			socket.off('chat-message', handleSocketMessage);
		};
	}, [selectedGroupId, token, userId]);

	useEffect(() => {
		if (!selectedGroupId) {
			return undefined;
		}

		socket.emit('join-group', selectedGroupId);

		return () => {
			socket.emit('leave-group', selectedGroupId);
		};
	}, [selectedGroupId]);

	const handleSendMessage = (e) => {
		e.preventDefault();
		if (!message.trim() || !selectedGroupId) return;

		const sendMessage = async () => {
			try {
				setSending(true);
				await axios.post(
					'http://localhost:5000/api/chat/send',
					{
						group_id: selectedGroupId,
						user_id: userId,
						message
					},
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}
				);
				setMessage('');
				const response = await axios.get('http://localhost:5000/api/chat', {
					params: { group_id: selectedGroupId },
					headers: { Authorization: `Bearer ${token}` }
				});
				const mappedMessages = response.data.messages.map((item) => ({
					id: item.chat_id,
					sender: item.sender_id === userId ? 'เรา' : item.name,
					text: item.message,
					time: new Date(item.create_at).toLocaleTimeString('th-TH', {
						hour: '2-digit',
						minute: '2-digit'
					})
				}));
				setMessages(mappedMessages);
			} catch (error) {
				console.error('Error sending chat message:', error);
				toast.error(error.response?.data?.error || 'ไม่สามารถส่งข้อความได้');
			} finally {
				setSending(false);
			}
		};

		sendMessage();
	};

	return (
		<div className="chat-page">
			<div className="chat-header">
				<h1>แชทกลุ่ม</h1>
				<p>เลือกกลุ่มแล้วเริ่มสนทนากับสมาชิกในทีม</p>
			</div>
			<div className="chat-layout">
				<aside className="chat-group-list">
					<h2>กลุ่มของฉัน</h2>
					<div className="group-items">
						{groupsLoading ? (
							<div className="chat-loading">กำลังโหลดกลุ่ม...</div>
						) : groups.length === 0 ? (
							<div className="chat-empty">ยังไม่มีกลุ่มให้แชท</div>
						) : (
							groups.map((group) => (
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
										<span className="group-last-message">รหัส {group.code}</span>
									</div>
								</button>
							))
						)}
					</div>
				</aside>

				<section className="chat-room">
					<div className="chat-room-header">
						<div>
							<h2>{selectedGroup ? selectedGroup.name : 'เลือกกลุ่ม'}</h2>
							<p>{selectedGroup ? `สมาชิก ${selectedGroup.members} คน` : 'ยังไม่ได้เลือกกลุ่ม'}</p>
						</div>
					</div>

					<div className="chat-messages">
						{messagesLoading ? (
							<div className="chat-loading">กำลังโหลดข้อความ...</div>
						) : messages.length === 0 ? (
							<div className="chat-empty">ยังไม่มีข้อความในกลุ่มนี้</div>
						) : (
							messages.map((item) => (
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
							))
						)}
					</div>

					<form className="chat-input-bar" onSubmit={handleSendMessage}>
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder={selectedGroup ? `พิมพ์ข้อความถึง ${selectedGroup.name}` : 'เลือกกลุ่มก่อน'}
							disabled={!selectedGroupId || sending}
						/>
						<button type="submit" disabled={!selectedGroupId || sending}>
							{sending ? 'กำลังส่ง...' : 'ส่ง'}
						</button>
					</form>
				</section>
			</div>
		</div>
	);
}

export default Chat;
