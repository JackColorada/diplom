import React from 'react';
import { Link } from 'react-router-dom';


const { localStorage } = window;

function Header(props) {
  // Получаем значение isLoggedIn из localStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return (
    <div className="container-fluid bg-dark text-light py-3">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <img src='img/pictures/Logo.jpg' alt='Logo' width={60} style={{borderRadius: "50px"}}/>
            <Link to="/" className="btn btn-light me-2" >На главную</Link>
          <div>
            {/* Если пользователь вошел в систему, отображаем соответствующие линки */}
            {isLoggedIn === 'true' && (
              <>
                <Link to="/user" className="btn btn-light me-2">Личный кабинет</Link>
              </>
            )}

            {/* Если пользователь не вошел в систему, отображаем линки для входа и регистрации */}
            {isLoggedIn !== 'true' && (
              <>
                <Link to="/login" className="btn btn-light me-2">Войти</Link>
                <Link to="/signup" className="btn btn-light">Зарегистрироваться</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
