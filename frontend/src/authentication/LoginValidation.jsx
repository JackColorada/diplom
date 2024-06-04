function Validation(values) {
   let error = {}
   const login_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/ 

    if (values.login === "") {
        error.login = "Имя не может быть пустым"
    }  else {
        error.login = ""
    }

    if (values.password === "") {
        error.password = "Пароль не может быть пустым"
    } else if (!password_pattern.test(values.password)) {
        error.password = "Пароль или логин не подходит"
    } else {
        error.password = ""
    }
    return error
}

export default Validation;