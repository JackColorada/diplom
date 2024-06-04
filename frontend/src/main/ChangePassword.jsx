import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {connect} from '../connect';

function ChangePassword() {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    JSON.stringify(connect);

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
        if (newPassword !== confirmPassword) {
            alert("Пароли не совпадают");
            return;
        }

        try {
            const response = await axios.put(`${connect}/change-password`, {
                userId,
                currentPassword,
                newPassword
            });

            alert(response.data.message);
        } catch (error) {
            console.error("Ошибка при изменении пароля:", error);
            alert("Ошибка при изменении пароля");
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
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Новый пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Сохранить</button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;
