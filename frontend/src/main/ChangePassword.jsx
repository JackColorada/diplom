import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from '../connect';
import validatePasswords from './passwordValidation';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.id) {
            setUserId(userData.id);
        } else {
            console.error('UserId не найден в localStorage');
        }
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        const validationErrors = validatePasswords(currentPassword, newPassword, confirmPassword);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            const response = await axios.put(`${connect}/change-password`, {
                userId,
                currentPassword,
                newPassword
            });
            navigate('/user');
        } catch (error) {
            console.error("Ошибка при изменении пароля:", error);
            if (error.response && error.response.status === 400) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    currentPassword: 'Текущий пароль неверен.'
                }));
            } else {
                setServerError('Ошибка при изменении пароля.');
            }
        }
    };

    return (
        <div className="body-wrapper d-flex align-items-center justify-content-center">
            <div className='container bg-white' style={{ borderRadius: "5px", marginBottom: "200px", padding: "20px" }}>
                <h2>Изменить пароль</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Текущий пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setErrors(prevErrors => ({ ...prevErrors, currentPassword: '' }));
                            }}
                        />
                        {errors.currentPassword && <span className="text-danger">{errors.currentPassword}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Новый пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setErrors(prevErrors => ({ ...prevErrors, newPassword: '' }));
                            }}
                        />
                        {errors.newPassword && <span className="text-danger">{errors.newPassword}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors(prevErrors => ({ ...prevErrors, confirmPassword: '' }));
                            }}
                        />
                        {errors.confirmPassword && <span className="text-danger">{errors.confirmPassword}</span>}
                    </div>
                    {serverError && <div className="text-danger mb-3">{serverError}</div>}
                    <button type="submit" className="btn btn-primary">Сохранить</button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;
