import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import connect from '../connect';

function AddTaskPage() {
  const [inputValue, setInputValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [subtasks, setSubtasks] = useState([]); 
  const [subtaskInputValue, setSubtaskInputValue] = useState(''); 
  const navigate = useNavigate(); 
  
  const addItem = async () => {

    if (inputValue.trim() !== '') {
      if (!endDate) {
        setError('Пожалуйста, выберите дату окончания задачи.');
        return;
      }
      if (endDate < startDate) {
        setError('Дата окончания не может быть раньше даты начала задачи.');
        return;
      }
  
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Создаем основную задачу
        const newTask = {
          text: inputValue,
          completed: false,
          start_date: startDate,
          end_date: endDate,
          user_id: userData.id,
          parent_id: null // parent_id равен null для основной задачи
        };
  
        // Отправляем запрос на сервер для создания основной задачи
        const response = await axios.post(`${connect}/tasks`, newTask);
        const taskId = response.data.id; // Получаем id созданной основной задачи
  
        // Создаем подзадачи с использованием id основной задачи
        const subtasksData = subtasks.map(subtask => ({
          text: subtask.text,
          completed: subtask.completed,
          start_date: subtask.start_date,
          end_date: subtask.end_date,
          user_id: userData.id,
          parent_id: taskId // parent_id равен id основной задачи для подзадачи
        }));
  
        // Отправляем запрос на сервер для создания подзадач
        await axios.post(`${connect}/tasks`, subtasksData);
  
        navigate('/'); // Переходим на главную страницу после успешного добавления задач
      } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
      }
    } else {
      setError('Пожалуйста, введите текст задачи.');
    }
  };
  

  const addSubtaskField = () => {
    setSubtasks([...subtasks, { text: subtaskInputValue, completed: false }]);
    setSubtaskInputValue(''); 
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Add Task</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col">
          <p className="pt-3">Начало задачи</p>
          <input
            type="date"
            className="form-control mt-2"
            value={startDate}
            disabled={true}
          />
        </div>
        <div className="col">
          <p className="pt-3">Конец задачи</p>
          <input
            type="date"
            className="form-control mt-2"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3 pt-4">
        <input
          type="text"
          className="form-control"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Добавить задачу..."
        />
      </div>

      <div style={{ marginLeft: '100px' }}> {/* Добавляем отступ слева */}
        {subtasks.map((subtask, index) => (
          <div key={index} className="row mt-2">
            <div className="col">
              <input
                type="text"
                className="form-control"
                value={subtask.text}
                readOnly
              />
            </div>
          </div>
        ))}

        <div className="row mt-2">
          <div className="col">
            <input
              type="text"
              className="form-control"
              value={subtaskInputValue}
              onChange={e => setSubtaskInputValue(e.target.value)}
              placeholder="Добавить подзадачу..."
            />
          </div>
          
        </div>
        <div className="col-auto">
            <button className="btn btn-primary mt-2" onClick={addSubtaskField}>Добавить подзадачу</button>
          </div>
      </div>
      <button className="btn btn-primary mt-2" onClick={addItem}>Добавить</button>

    </div>
  );
}

export default AddTaskPage;
