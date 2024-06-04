const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "checklist"
});
app.post("/signup", (req, res) => {
    const { login, email, password, class: userClass } = req.body;

    // Проверка существования логина
    db.query("SELECT * FROM Users WHERE `login` = ?", [login], (loginError, loginResults) => {
        if (loginError) {
            return res.status(500).json({ error: "Ошибка при проверке логина" });
        }
        if (loginResults.length > 0) {
            return res.status(400).json({ error: "Логин уже существует" });
        }

        // Проверка существования почты
        db.query("SELECT * FROM Users WHERE `email` = ?", [email], (emailError, emailResults) => {
            if (emailError) {
                return res.status(500).json({ error: "Ошибка при проверке почты" });
            }
            if (emailResults.length > 0) {
                return res.status(400).json({ error: "Почта уже используется" });
            }

            // Если логин и почта уникальны, выполняем регистрацию
            const sql = "INSERT INTO Users (`login`, `email`, `password`, `class`) VALUES (?, ?, ?, ?)";
            const values = [login, email, password, userClass];
            db.query(sql, values, (signupError, data) => {
                if (signupError) {
                    return res.status(500).json({ error: "Ошибка при регистрации пользователя" });
                }
                return res.status(200).json({ success: true });
            });
        });
    });
});

// Аутентификация пользователя
app.post("/login", (req, res) => {
    const { login, password } = req.body;

    const sql = "SELECT * FROM Users WHERE `login` = ?";
    db.query(sql, [login], async (err, data) => {
        if (err) {
            console.error("Ошибка при выполнении запроса к базе данных:", err);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (data.length === 0) {
            return res.status(400).json({ error: "Пользователь с таким логином не найден" });
        }

        const user = data[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Отправляем на клиент все данные о пользователе
            return res.json({ success: true, user });
        } else {
            return res.status(400).json({ error: "Неправильный пароль" });
        }
    });
});



app.post("/tasks", (req, res) => {
    const { text, completed, start_date, end_date, userId, parentId, important } = req.body;
    const sql = "INSERT INTO tasks (text, completed, start_date, end_date, user_id, parent_id, important) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [text, completed, start_date, end_date, userId, parentId, important ? 1 : 0];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Ошибка при добавлении задачи:", error);
            return res.status(500).json({ error: "Ошибка сервера", details: error.message });
        }

        // Получаем id только что созданной задачи
        const taskId = result.insertId;

        // Получаем информацию о только что созданной задаче
        const getTaskSql = "SELECT * FROM tasks WHERE id = ?";
        db.query(getTaskSql, [taskId], (getTaskError, taskResult) => {
            if (getTaskError) {
                console.error("Ошибка при получении информации о задаче:", getTaskError);
                return res.status(500).json({ error: "Ошибка сервера", details: getTaskError.message });
            }

            const createdTask = taskResult[0];

            // Возвращаем созданную задачу в ответе
            return res.status(200).json({ message: "Задача успешно добавлена", task: createdTask });
        });
    });
});


// Обработчик для создания задачи
app.get("/tasks", (req, res) => {
    console.log("Получен запрос на /tasks");
    const userId = req.query.userId;
    const selectedDate = req.query.selectedDate;
    console.log(`userId: ${userId}, selectedDate: ${selectedDate}`);

    const sql = "SELECT * FROM tasks WHERE user_id = ? AND ? >= start_date AND ? <= end_date";
    db.query(sql, [userId, selectedDate, selectedDate], (error, results) => {
        if (error) {
            console.error("Ошибка при получении списка задач:", error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        console.log("Результаты запроса:", results);

        const groupedTasks = results.reduce((acc, task) => {
            if (!task.parent_id) {
                acc.push(task);
            } else {
                const parentTask = acc.find(parent => parent.id === task.parent_id);
                if (parentTask) {
                    if (!parentTask.subtasks) {
                        parentTask.subtasks = [];
                    }
                    parentTask.subtasks.push(task);
                }
            }
            return acc;
        }, []);

        return res.status(200).json(groupedTasks);
    });
});
// Обработчик для обновления задачи
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { text, completed, start_date, end_date, important } = req.body;

    // Получаем текущие данные задачи
    const getTaskSql = "SELECT * FROM tasks WHERE id = ?";
    db.query(getTaskSql, [id], (getTaskError, taskResult) => {
        if (getTaskError) {
            console.error("Ошибка при получении задачи:", getTaskError);
            return res.status(500).json({ error: "Ошибка сервера", details: getTaskError.message });
        }

        if (taskResult.length === 0) {
            return res.status(404).json({ error: "Задача не найдена" });
        }

        const currentTask = taskResult[0];

        // Используем текущие значения, если они не были переданы
        const updatedText = text || currentTask.text;
        const updatedCompleted = completed !== undefined ? completed : currentTask.completed;
        const updatedStartDate = start_date || currentTask.start_date;
        const updatedEndDate = end_date || currentTask.end_date;
        const updatedImportant = important !== undefined ? (important ? 1 : 0) : currentTask.important;

        const updateTaskSql = "UPDATE tasks SET text = ?, completed = ?, start_date = ?, end_date = ?, important = ? WHERE id = ?";
        db.query(updateTaskSql, [updatedText, updatedCompleted, updatedStartDate, updatedEndDate, updatedImportant, id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Ошибка при обновлении задачи:", updateError);
                return res.status(500).json({ error: "Ошибка сервера", details: updateError.message });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Задача не найдена" });
            }

            // Определяем, завершена ли задача
            const isCompleted = updatedCompleted && !currentTask.completed;

            // Определяем, является ли задача подзадачей
            const isSubtask = !!currentTask.parent_id;

            // Изменяем опыт в зависимости от статуса задачи и типа задачи
            let experienceChange;
            if (isCompleted) {
                experienceChange = isSubtask ? 10 : 50;
            } else {
                experienceChange = isSubtask ? -10 : -50;
            }

            // Дополнительный SQL-запрос для обновления опыта
            const updateExperienceSql = "UPDATE Users SET experience = experience + ? WHERE id = ?";
            db.query(updateExperienceSql, [experienceChange, currentTask.user_id], (experienceError, experienceResult) => {
                if (experienceError) {
                    console.error("Ошибка при обновлении опыта пользователя:", experienceError);
                    // Не отправляем ошибку клиенту, так как основная операция успешно завершена
                }

                // Обновляем опыт в каждой подзадаче, если основная задача завершена
                if (isCompleted && !isSubtask) {
                    const updateSubtasksSql = "UPDATE tasks SET completed = 1 WHERE parent_id = ?";
                    db.query(updateSubtasksSql, [id], (updateSubtasksError, updateSubtasksResult) => {
                        if (updateSubtasksError) {
                            console.error("Ошибка при обновлении подзадач:", updateSubtasksError);
                            // Не отправляем ошибку клиенту, так как основная операция успешно завершена
                        }
                        // Дополнительный SQL-запрос для обновления опыта в каждой подзадаче
                        const updateSubtasksExperienceSql = "UPDATE Users SET experience = experience + 10 WHERE id IN (SELECT user_id FROM tasks WHERE parent_id = ?)";
                        db.query(updateSubtasksExperienceSql, [id], (subtasksExperienceError, subtasksExperienceResult) => {
                            if (subtasksExperienceError) {
                                console.error("Ошибка при обновлении опыта в подзадачах:", subtasksExperienceError);
                                // Не отправляем ошибку клиенту, так как основная операция успешно завершена
                            }
                            return res.status(200).json({ message: "Задача и подзадачи успешно обновлены" });
                        });
                    });
                } else {
                    return res.status(200).json({ message: "Задача успешно обновлена" });
                }
            });
        });
    });
});




// Обработчик для удаления задачи
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM tasks WHERE id = ?";
    db.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Ошибка при удалении задачи:", error);
            return res.status(500).json({ error: "Ошибка сервера", details: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Задача не найдена" });
        }

        return res.status(204).end();
    });
});

// Добавление подзадачи
app.post("/subtasks", (req, res) => {
    const { text, completed, start_date, end_date, userId, parentId } = req.body; // Включаем parentId в параметры запроса
    const sql = "INSERT INTO Tasks (text, completed, start_date, end_date, user_id, parent_id) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [text, completed, start_date, end_date, userId, parentId], (error, result) => {
        if (error) {
            console.error("Ошибка при добавлении подзадачи:", error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        return res.status(200).json({ message: "Подзадача успешно добавлена", id: result.insertId });
    });
});

app.put("/subtasks/:id", (req, res) => {
    const { id } = req.params;
    const { text, completed, start_date, end_date } = req.body;

    // Получаем текущие данные подзадачи
    const getSubtaskSql = "SELECT * FROM tasks WHERE id = ?";
    db.query(getSubtaskSql, [id], (getSubtaskError, subtaskResult) => {
        if (getSubtaskError) {
            console.error("Ошибка при получении подзадачи:", getSubtaskError);
            return res.status(500).json({ error: "Ошибка сервера", details: getSubtaskError.message });
        }

        if (subtaskResult.length === 0) {
            return res.status(404).json({ error: "Подзадача не найдена" });
        }

        const currentSubtask = subtaskResult[0];

        // Используем текущие значения, если они не были переданы
        const updatedText = text || currentSubtask.text;
        const updatedCompleted = completed !== undefined ? completed : currentSubtask.completed;
        const updatedStartDate = start_date || currentSubtask.start_date;
        const updatedEndDate = end_date || currentSubtask.end_date;

        const updateSubtaskSql = "UPDATE tasks SET text = ?, completed = ?, start_date = ?, end_date = ? WHERE id = ?";
        db.query(updateSubtaskSql, [updatedText, updatedCompleted, updatedStartDate, updatedEndDate, id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Ошибка при обновлении подзадачи:", updateError);
                return res.status(500).json({ error: "Ошибка сервера", details: updateError.message });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Подзадача не найдена" });
            }

            return res.status(200).json({ message: "Подзадача успешно обновлена" });
        });
    });
});

app.get("/experience/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT experience FROM Users WHERE id = ?";

    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("Ошибка при получении опыта пользователя:", error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const experience = results[0].experience;
        return res.status(200).json({ experience });
    });
});

// Новый маршрут для обновления опыта пользователя
app.put("/experience/:userId", (req, res) => {
    const userId = req.params.userId;
    const { experience } = req.body;

    const sql = "UPDATE Users SET experience = ? WHERE id = ?";
    db.query(sql, [experience, userId], (error, result) => {
        if (error) {
            console.error("Ошибка при обновлении опыта пользователя:", error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        return res.status(200).json({ message: "Опыт пользователя успешно обновлен" });
    });
});
app.put('/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    const sql = "SELECT * FROM Users WHERE `id` = ?";
    db.query(sql, [userId], async (err, data) => {
        if (err) {
            console.error("Ошибка при выполнении запроса к базе данных:", err);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (data.length === 0) {
            return res.status(400).json({ error: "Пользователь не найден" });
        }

        const user = data[0];
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: "Неправильный текущий пароль" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = "UPDATE Users SET `password` = ? WHERE `id` = ?";
        db.query(updateSql, [hashedNewPassword, userId], (updateErr, updateData) => {
            if (updateErr) {
                console.error("Ошибка при обновлении пароля:", updateErr);
                return res.status(500).json({ error: "Ошибка сервера" });
            }
            return res.json({ success: true, message: "Пароль успешно обновлен" });
        });
    });
});





app.get("/task-counts/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT 
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed_tasks,
            SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS incomplete_tasks
        FROM tasks
        WHERE user_id = ?`;
    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("Ошибка при получении количества задач:", error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        const taskCounts = results[0];
        return res.status(200).json(taskCounts);
    });
});


const server = app.listen(8888, () => {
    console.log("Сервер запущен на порту 8888");
});

module.exports = server;