import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Home.css';
import {connect} from '../connect';

function Home() {
  JSON.stringify(connect);

  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const formatDateForDisplay = date => {
    const formattedDate = new Date(date);
    const offset = formattedDate.getTimezoneOffset() * 60 * 1000; // смещение в миллисекундах
    const localDate = new Date(formattedDate.getTime() - offset);

    // Форматирование даты в формате день.месяц.год
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return localDate.toLocaleDateString('ru-RU', options).replace(/\//g, '.');
  };

  const formatDate = date => {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0];
  };
  const [items, setItems] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [completedItems, setCompletedItems] = useState({});
  const [subtaskInputValue, setSubtaskInputValue] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingItem, setEditingItem] = useState(null);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingStartDate, setEditingStartDate] = useState(getCurrentDate());
  const [editingEndDate, setEditingEndDate] = useState('');
  const [editingImportant, setEditingImportant] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const formattedDate = formatDate(selectedDate);
      const response = await axios.get(`${connect}/tasks?userId=${userData.id}&selectedDate=${formattedDate}`);
      const sortedData = response.data.sort((a, b) => b.important - a.important); // Сортировка по важности
      setItems(sortedData);
      const completedItemsObj = {};
      response.data.forEach(item => {
        completedItemsObj[item.id] = item.completed;
        if (item.subtasks) {
          item.subtasks.forEach(subtask => {
            completedItemsObj[subtask.id] = subtask.completed;
          });
        }
      });
      setCompletedItems(completedItemsObj);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  const toggleItemCompletion = async id => {
    try {
      const updatedItems = items.map(item => {
        if (item.id === id) {
          item.completed = !item.completed;
        }
        return item;
      });

      const completedItem = updatedItems.find(item => item.id === id);

      if (completedItem) {
        const updateResponse = await axios.put(`${connect}/tasks/${id}`, {
          completed: completedItem.completed
        });

        if (updateResponse.status === 200) {
          setItems(updatedItems);
          setCompletedItems(prev => ({ ...prev, [id]: completedItem.completed }));
        } else {
          console.error('Ошибка при обновлении задачи:', updateResponse.statusText);
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
    }
  };

  const toggleSubtaskCompletion = async (parentId, subtaskId) => {
    try {
      const updatedItems = items.map(item => {
        if (item.id === parentId) {
          item.subtasks = item.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              subtask.completed = !subtask.completed;
            }
            return subtask;
          });
        }
        return item;
      });

      const parentTask = updatedItems.find(item => item.id === parentId);
      const completedSubtask = parentTask.subtasks.find(subtask => subtask.id === subtaskId);

      if (completedSubtask) {
        const updateResponse = await axios.put(`${connect}/tasks/${subtaskId}`, {
          completed: completedSubtask.completed
        });

        if (updateResponse.status === 200) {
          setItems(updatedItems);
          setCompletedItems(prev => ({ ...prev, [subtaskId]: completedSubtask.completed }));
        } else {
          console.error('Ошибка при обновлении подзадачи:', updateResponse.statusText);
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении подзадачи:', error);
    }
  };

  const deleteTask = async id => {
    try {
      const response = await axios.delete(`${connect}/tasks/${id}`);
      if (response.status === 204) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    try {
      const response = await axios.delete(`${connect}/tasks/${subtaskId}`);
      if (response.status === 204) {
        const updatedItems = items.map(item => {
          if (item.id === taskId) {
            const updatedSubtasks = item.subtasks.filter(subtask => subtask.id !== subtaskId);
            return { ...item, subtasks: updatedSubtasks };
          }
          return item;
        });
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Ошибка при удалении подзадачи:', error);
    }
  };

  const addItem = async () => {
    if (inputValue.trim() !== '') {
      if (!endDate) {
        setError('Выберите дату конца задачи');
        return;
      }
      if (endDate < startDate) {
        setError('Задача не может заканчиваться раньше начала');
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem('userData'));

        const response = await axios.post(`${connect}/tasks`, {
          text: inputValue,
          completed: false,
          start_date: startDate,
          end_date: endDate,
          userId: userData.id,
          parentId: null,
          important: isImportant
        });

        const newTask = response.data.task;

        const subtaskPromises = subtaskInputValue
        .filter(subtask => subtask.trim() !== '') // Фильтруем пустые подзадачи
        .map(subtask => {
            return axios.post(`${connect}/subtasks`, {
            text: subtask,
            completed: false,
            start_date: startDate,
            end_date: endDate,
            userId: userData.id,
            parentId: newTask.id,
            important: isImportant
          });
        });

        await Promise.all(subtaskPromises);

        setInputValue('');
        setStartDate(getCurrentDate());
        setEndDate('');
        setError('');
        setShowCreateForm(false);
        setSubtaskInputValue([]);
        fetchData();
      } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
      }
    }
  };

  const editTask = async id => {
    try {
      const response = await axios.put(`${connect}/tasks/${id}`, {
        text: editingValue,
        completed: false,
        start_date: editingStartDate,
        end_date: editingEndDate,
        important: editingImportant
      });

      if (response.status === 200) {
        setItems(
          items.map(item =>
            item.id === id
              ? { ...item, text: editingValue, start_date: editingStartDate, end_date: editingEndDate, important: editingImportant }
              : item
          )
        );
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
    }
  };

  const editSubtask = async (taskId, subtaskId) => {
    try {
      const response = await axios.put(`${connect}/subtasks/${subtaskId}`, {
        text: editingValue,
        completed: false,
        start_date: editingStartDate,
        end_date: editingEndDate,
        important: editingImportant
      });

      if (response.status === 200) {
        const updatedItems = items.map(item => {
          if (item.id === taskId) {
            const updatedSubtasks = item.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, text: editingValue, start_date: editingStartDate, end_date: editingEndDate, important: editingImportant }
                : subtask
            );
            return { ...item, subtasks: updatedSubtasks };
          }
          return item;
        });
        setItems(updatedItems);
        setEditingSubtask(null);
      }
    } catch (error) {
      console.error('Ошибка при обновлении подзадачи:', error);
    }
  };

  const addSubtaskInput = () => {
    setSubtaskInputValue([...subtaskInputValue, '']);
  };
  const removeSubtaskField = index => {
    const updatedSubtasks = [...subtaskInputValue];
    updatedSubtasks.splice(index, 1);
    setSubtaskInputValue(updatedSubtasks);
  };

  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...subtaskInputValue];
    updatedSubtasks[index] = value;
    setSubtaskInputValue(updatedSubtasks);
  };

  return (
    <div className="body-wrapper">
      <div className="container mt-4" style={{ backgroundColor: '#303C6C', borderRadius: '10px', padding: '20px', marginBottom: '110px' }}>
        <h1 className="mb-4 text-white">Задачи</h1>
        <div className="d-flex flex-column flex-md-row">
          <p className="text-white m-2">Выберите дату</p>
          <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} className="m-2" />
        </div>
        <button className="btn btn-primary mb-4" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Отменить' : 'Добавить задачу'}
        </button>

        {showCreateForm && (
          <div className="mb-4 p-2" style={{ backgroundColor: '#1A1A2E', borderRadius: '10px' }}>
            <div className="row">
              <div className="col-md-6">
                <p className="pt-3 text-white">Начало задачи</p>
                <input
                  type="date"
                  className="form-control mt-2"
                  value={startDate}
                  min={getCurrentDate()}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <p className="pt-3 text-white">Конец задачи</p>
                <input
                  type="date"
                  className="form-control mt-2"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Название задачи"
              className="form-control mb-2 mt-3"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <div className="mt-3">
              {subtaskInputValue.map((subtaskValue, index) => (
                <div key={index} className="d-flex align-items-center mt-2">
                  <input
                    type="text"
                    className="form-control mt-2"
                    value={subtaskValue}
                    onChange={e => handleSubtaskChange(index, e.target.value)}
                    placeholder="Добавить подзадачу"
                  />
                  <button onClick={() => removeSubtaskField(index)} className="btn btn-danger ms-2">Удалить</button>
                </div>
              ))}
              <button className="btn btn-success mt-2" onClick={addSubtaskInput}>
                Добавить подзадачу
              </button>
            </div>
            <div className="form-check mt-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="importantCheckbox"
                checked={isImportant}
                onChange={() => setIsImportant(!isImportant)}
              />
              <label className="form-check-label text-white" htmlFor="importantCheckbox">
                Важная задача
              </label>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}

            <button className="btn btn-primary mt-2" onClick={addItem}>
              Создать
            </button>
            <button className="btn btn-danger mt-2 ms-2" onClick={() => setShowCreateForm(false)}>
              Отменить
            </button>
          </div>
        )}

        <ul className="list-group">
          {items.map(item => (
            <li
              key={item.id}
              className="list-group-item"
              style={{ marginBottom: '10px', backgroundColor: item.important ? '#C96567' : '#C4DBF6', color: item.important ? 'white' : '' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    checked={completedItems[item.id]}
                    onChange={() => toggleItemCompletion(item.id)}
                    className="form-check-input"
                  />
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      className="form-control ms-2"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                    />
                  ) : (
                    <span className="ms-2" style={{ textDecoration: completedItems[item.id] ? 'line-through' : 'none' }}>
                      {item.text}
                    </span>
                  )}
                </div>
                <div className="d-flex flex-column flex-md-row align-items-md-center">
                  <span className="me-md-2">{formatDateForDisplay(item.start_date)} - {formatDateForDisplay(item.end_date)}</span>
                  {editingItem === item.id ? (
                    <div className="d-flex">
                      <button className="btn btn-primary m-1" onClick={() => editTask(item.id)}>
                        Сохранить
                      </button>
                      <button className="btn btn-secondary m-1" onClick={() => setEditingItem(null)}>
                        Отменить
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex">
                      <button
                        className="btn btn-warning m-1"
                        onClick={() => {
                          setEditingItem(item.id);
                          setEditingValue(item.text);
                          setEditingStartDate(formatDate(item.start_date));
                          setEditingEndDate(formatDate(item.end_date));
                          setEditingImportant(item.important);
                        }}
                      >
                        Редактировать
                      </button>
                      <button className="btn btn-danger m-1" onClick={() => deleteTask(item.id)}>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {item.subtasks && item.subtasks.length > 0 && (
                <ul className="list-group mt-2">
                  {item.subtasks.map(subtask => (
                    <li key={subtask.id} className="list-group-item" style={{ marginBottom: '5px' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <input
                            type="checkbox"
                            checked={completedItems[subtask.id]}
                            onChange={() => toggleSubtaskCompletion(item.id, subtask.id)}
                            className="form-check-input"
                          />
                          {editingSubtask === subtask.id ? (
                            <input
                              type="text"
                              className="form-control ms-2"
                              value={editingValue}
                              onChange={e => setEditingValue(e.target.value)}
                            />
                          ) : (
                            <span className="ms-2" style={{ textDecoration: completedItems[subtask.id] ? 'line-through' : 'none' }}>
                              {subtask.text}
                            </span>
                          )}
                        </div>
                        <div className="d-flex flex-column flex-md-row align-items-md-center">
                          {editingSubtask === subtask.id ? (
                            <div className="d-flex">
                              <button className="btn btn-primary m-1" onClick={() => editSubtask(item.id, subtask.id)}>
                                Сохранить
                              </button>
                              <button className="btn btn-secondary m-1" onClick={() => setEditingSubtask(null)}>
                                Отменить
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex">
                              <button
                                className="btn btn-warning m-1"
                                onClick={() => {
                                  setEditingSubtask(subtask.id);
                                  setEditingValue(subtask.text);
                                  setEditingStartDate(formatDate(subtask.start_date));
                                  setEditingEndDate(formatDate(subtask.end_date));
                                  setEditingImportant(subtask.important);
                                }}
                              >
                                Редактировать
                              </button>
                              <button className="btn btn-danger m-1" onClick={() => deleteSubtask(item.id, subtask.id)}>
                                Удалить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;