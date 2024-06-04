import React from 'react';
import { Carousel } from 'react-bootstrap';
import './Home.css';

function Main() {
  return (
    <div className="body-wrapper">
      <div className="container mt-4 mb-5 p-3 text-white bg-dark rounded" style={{ maxWidth: '1200px' }}>
        <h1 className="text-center mb-4" style={{ fontSize: '2.5rem' }}>Корпоративный таск менеджер: эффективное управление задачами для команды</h1>
        <p style={{ fontSize: '1.2rem' }}>Корпоративный таск менеджер - это инструмент, разработанный для упорядочивания и управления задачами в рамках корпоративной среды. Он предоставляет команде возможность легко создавать, назначать, отслеживать и завершать задачи, улучшая производительность и координацию работы.</p>
        
        <h2 style={{ fontSize: '1.5rem' }}>Функциональные Возможности:</h2>
        <ul>
          <li><strong>Создание и Назначение Задач:</strong> Пользователи могут быстро создавать новые задачи.</li>
          <li><strong>Отслеживание Прогресса:</strong> Таск менеджер позволяет отслеживать статус выполнения каждой задачи - от открытия до завершения. Это обеспечивает прозрачность и понимание текущего состояния проекта.</li>
          <li><strong>Приоритизация и Сортировка:</strong> Задачи могут быть организованы по приоритету и дедлайнам. Это помогает команде сосредоточиться на самых важных задачах и управлять временными ресурсами эффективно.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem' }}>Преимущества:</h2>
        
        <Carousel indicators={false} interval={3000} className="bg-secondary p-3 rounded">
          <Carousel.Item>
            <div className="d-flex flex-column justify-content-center align-items-center">
              <h3>Улучшенная Производительность</h3>
              <p className="text-center">Четкое определение задач и их статусов помогает предотвратить дублирование работы и ускоряет процесс достижения целей проекта.</p>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="d-flex flex-column justify-content-center align-items-center">
              <h3>Более Точное Планирование</h3>
              <p className="text-center">Отслеживание временных рамок и прогресса помогает менеджерам делать более точные прогнозы и планировать ресурсы более эффективно.</p>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>
    </div>
  );
}

export default Main;
