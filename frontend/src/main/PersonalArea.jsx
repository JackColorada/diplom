import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from 'react-bootstrap/ProgressBar'; 
import {connect} from '../connect';

function PersonalArea() {

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [taskCounts, setTaskCounts] = useState({ completed_tasks: 0, incomplete_tasks: 0 });
  JSON.stringify(connect);

  useEffect(() => {
    // Получаем данные о пользователе из localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      // Запрос информации об опыте пользователя
      fetchExperience(parsedUserData.id);
      // Запрос количества завершенных и незавершенных задач пользователя
      fetchTaskCounts(parsedUserData.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Определение уровня пользователя на основе его опыта
    if (experience >= 1000) {
      setLevel(5);
    } else if (experience >= 501) {
      setLevel(4);
    } else if (experience >= 301) {
      setLevel(3);
    } else if (experience >= 101) {
      setLevel(2);
    } else {
      setLevel(1);
    }
  }, [experience]);

  const fetchExperience = async (userId) => {
    try {
      const response = await fetch(`${connect}/experience/${userId}`); // Замените на ваш эндпоинт
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.experience !== undefined) {
        setExperience(data.experience);
      } else {
        console.error('Experience data not found in response:', data);
      }
    } catch (error) {
      console.error('Ошибка при получении опыта пользователя:', error);
    }
  };

  const fetchTaskCounts = async (userId) => {
    try {
      const response = await fetch(`${connect}/task-counts/${userId}`); // Замените на ваш эндпоинт
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTaskCounts(data);
    } catch (error) {
      console.error('Ошибка при получении количества задач:', error);
    }
  };

  const handleLogout = () => {
    // Очищаем данные о пользователе из localStorage и перенаправляем на страницу входа
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const classOptions = [
    { value: "warrior", label: "Воин" },
    { value: "archer", label: "Лучник" },
    { value: "mage", label: "Маг" }
  ];
  const getClassLabel = (classValue) => {
    const classOption = classOptions.find(option => option.value === classValue);
    return classOption ? classOption.label : 'Неизвестный класс';
  };

  const handleEditPassword = () => {
    navigate('/change-password'); // Переход на страницу изменения пароля
  };

  return (
    <div className="body-wrapper">
      <div className="container mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="bg-white p-4 rounded w-100" style={{ maxWidth: '900px' }}>
          {userData && (
            <div>
              <div className="d-flex justify-content-between mb-4">
                <h5 className="card-title">Личный кабинет</h5>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 d-flex justify-content-center mb-3 mb-md-0">
                    <img src={`img/pictures/${userData.class}.jpg`} alt="Avatar" className="img-fluid rounded-circle" style={{ width: '100%', maxWidth: '300px' }} />
                  </div>
                  <div className="col-md-8">
                    <h1>{userData.login}</h1>
                    <p>{getClassLabel(userData.class)} уровня: {level}</p>
                    <p>Текущий опыт:</p>
                    <ProgressBar
                      now={(experience % 100) || 1}
                      max={level * 100}
                      label={`${experience % 100 || 1}/${level * 100}`}
                      className="my-2"
                      style={{ height: '30px', border: "solid 2px black", textAlign: "center" }}
                    />
                    <p>Завершенные задачи: {taskCounts.completed_tasks}</p>
                    <p>Незавершенные задачи: {taskCounts.incomplete_tasks}</p>
                  </div>
                </div>
              </div>

              <div className="card-footer mt-3 d-flex justify-content-between">
                <button className="btn btn-primary" onClick={handleEditPassword}>Изменить пароль</button>
                <button onClick={handleLogout} className="btn btn-danger">Выйти</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalArea;
