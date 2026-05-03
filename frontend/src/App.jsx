import { Route,Router,Routes } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import GroupManage from './components/GroupManage';
import Task from './components/Task';
import TaskManage from './components/TaskManage';
import './App.css';

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/group-manage/:groupId" element={<GroupManage />} />
      <Route path="/task" element={<Task />} />
      <Route path="/task-manage/:taskId" element={<TaskManage />} />
    </Routes>
  );
}

export default App;