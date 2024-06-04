import React, { useState } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom'
import styles from './rain.css'
import axios from 'axios'
import MakeItRain from "./Rain";
import '../main/Home.css';
import Validation from './LoginValidation';
import {connect} from '../connect';
function Login() {
    JSON.stringify(connect);
    console.log(connect);
    const [values, setValues] = useState({
        login: "",
        password: ""
    })
    const navigate = useNavigate();
    const [errors, setErrors] = useState({})

    const handleInput = (event) => {
        setValues(prev => ({...prev, [event.target.name]: event.target.value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({}); 
        event.preventDefault();

        // Вызываем функцию валидации и сохраняем результаты в состоянии ошибок
        const validationErrors = Validation(values);
        setErrors(validationErrors);
        axios.post(`${connect}/login`, values)
            .then(res => {
                if (res.data.success) {
                    const { user } = res.data;
                    localStorage.setItem('isLoggedIn', true);
                    localStorage.setItem('userData', JSON.stringify(user)); 

                    navigate('/');
                    window.location.reload();

                } else {
                    console.log("No record existed")
                }

            })
            .catch(err => console.log(err))
    }

    return (
        <div className="position-relative vh-100">
            <MakeItRain />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
                <div className="bg-white p-4 rounded" style={{ width: '300px' }}>
                    <h2 className="mb-4">Вход</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="login"><strong>Логин</strong></label>
                            <input type="text" placeholder="Введите ваш логин" name="login" className="form-control rounded-0" onChange={handleInput} />
                            {errors.login && <span className="text-danger"> {errors.login}</span>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password"><strong>Пароль</strong></label>
                            <input type="password" placeholder="Введите ваш пароль" name="password" className="form-control rounded-0" onChange={handleInput} />
                            {errors.password && <span className="text-danger"> {errors.password}</span>}
                        </div>
                        <button type="submit" className="btn btn-success w-100 mb-3">Войти</button>
                        <Link to="/signup" className="btn btn-light border w-100 mb-2">Создать аккаунт</Link>
                        <Link to="/" className="btn btn-light border w-100">Вернуться на главную</Link>
                    </form>
                </div>
            </div>
        </div>
    );
    
}

export default Login
