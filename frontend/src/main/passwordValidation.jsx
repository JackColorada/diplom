// passwordValidation.js

const validatePasswords = (currentPassword, newPassword, confirmPassword) => {
    let errors = {};
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

    if (!currentPassword) {
        errors.currentPassword = "Текущий пароль не может быть пустым";
    }

    if (!newPassword) {
        errors.newPassword = "Новый пароль не может быть пустым";
    } else if (!password_pattern.test(newPassword)) {
        errors.newPassword = "Новый пароль должен содержать хотя бы одну цифру, одну строчную букву, одну заглавную букву и иметь длину не менее 8 символов";
    }

    if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Пароли не совпадают";
    }

    return errors;
};

export default validatePasswords;
