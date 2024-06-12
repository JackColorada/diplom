import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Validation from './SignupValidation'
import axios from 'axios'
import bcrypt from 'bcryptjs';
import MakeItRain from './Rain';
import '../main/Home.css';
import {connect} from '../connect';

function Signup() {
    JSON.stringify(connect);

    const [values, setValues] = useState({
        login: "",
        email: "",
        password: "",
        class: "warrior"
    });
    const [errors, setErrors] = useState({});
    const [existingUserError, setExistingUserError] = useState({
        login: "",
        email: ""
    });
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const validationErrors = Validation(values);
        setErrors(validationErrors);
    
        if (!Object.values(validationErrors).some(error => error)) {
            bcrypt.hash(values.password, 10).then(async (hashedPassword) => {
                try {
                    const response = await axios.post(`${connect}/signup`, { ...values, password: hashedPassword });
                    if (response.data.success) {
                        localStorage.setItem('isLoggedIn', true);
                        navigate('/');
                        
                        axios.post(`${connect}/login`,  values)
                            .then(res => {
                                if (res.data.success) {
                                    const { user } = res.data;
                                    localStorage.setItem('userData', JSON.stringify(user));
                                    
                                    window.location.reload();
                                } else {
                                    console.log("Не удалось получить данные пользователя");
                                }
                            })
                            .catch(err => console.log(err));
                    } else {
                        console.log("Регистрация не удалась");
                    }
                } catch (error) {
                    console.log(error);
                    if (error.response && error.response.data && error.response.data.error) {
                        const errorMessage = error.response.data.error;
                        const fieldErrors = {
                            login: errorMessage === 'Логин уже существует' ? 'Пользователь с таким логином уже существует.' : '',
                            email: errorMessage === 'Почта уже используется' ? 'Пользователь с такой почтой уже существует.' : '',
                        };
                        setExistingUserError(fieldErrors);
                    } else {
                        console.log("Не удалось выполнить запрос на сервер.");
                    }
                }
            });
        }
    };

    const classOptions = [
        { value: "warrior", label: "🗡️ Воин" },
        { value: "archer", label: "🏹 Лучник" },
        { value: "mage", label: "🔮 Маг" }
    ];

    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        const selectedOption = classOptions.find(option => option.value === selectedValue);
        setValues(prev => ({ ...prev, class: selectedOption.value }));
    };
   

    return (
        <div className="position-relative vh-100 overflow-hidden">
            <MakeItRain />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center overflow-hidden">
                <div className="bg-white p-4 rounded" style={{ width: '90%', maxWidth: '400px' }}>
                    <h2 className="mb-4 text-center">Регистрация</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="login"><strong>Логин</strong></label>
                            <input type="text" placeholder="Введите ваш логин" className="form-control rounded-0" name="login" onChange={handleInput} />
                            {errors.login && <span className="text-danger"> {errors.login}</span>}
                            {existingUserError.login && <span className="text-danger"> {existingUserError.login}</span>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email"><strong>Почта</strong></label>
                            <input type="email" placeholder="Введите вашу почту" className="form-control rounded-0" name="email" onChange={handleInput} />
                            {errors.email && <span className="text-danger"> {errors.email}</span>}
                            {existingUserError.email && <span className="text-danger"> {existingUserError.email}</span>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password"><strong>Пароль</strong></label>
                            <input type="password" placeholder="Введите ваш пароль" className="form-control rounded-0" name="password" onChange={handleInput} />
                            {errors.password && <span className="text-danger"> {errors.password}</span>}
                        </div>
                        <p>Пароль должен содержать хотя бы одну цифру, одну строчную букву, одну заглавную букву и иметь длину не менее 8 символов</p>
                        <div className="mb-3">
                            <label htmlFor="class"><strong>Выберите ваш класс</strong></label>
                            <select className="form-select" onChange={handleSelectChange} value={values.class}>
                                {classOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-success w-100 mb-3">Зарегистрироваться</button>
                        <Link to="/login" className="btn btn-light border w-100 mb-2">Войти в аккаунт</Link>
                        <Link to="/" className="btn btn-light border w-100">Вернуться на главную</Link>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
