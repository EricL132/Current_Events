import React from 'react'
import './nav.css'
import { withRouter } from 'react-router-dom';
let interval
//api keys 88353932d9e19d635c50d258b4818f1c 382bce18da87832e602b2515716a2a0f   

class nav extends React.Component {
    constructor(props) {
        super(props)
        this.getWeather = this.getWeather.bind(this)
        this.handleShowLogin = this.handleShowLogin.bind(this)
        this.handleSignupFormClose = this.handleSignupFormClose.bind(this)
        this.handleSignup = this.handleSignup.bind(this)
        this.handleLogin = this.handleLogin.bind(this)
        this.handleOutsideClick = this.handleOutsideClick.bind(this)
        this.checkAccess = this.checkAccess.bind(this)
        this.checkForLogin = this.checkForLogin.bind(this)
        this.jwtDecode = this.jwtDecode.bind(this)
        this.handleDarkMode = this.handleDarkMode.bind(this)
        this.handleShowMenu = this.handleShowMenu.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
        this.handleShowForgotpass = this.handleShowForgotpass.bind(this)
        this.handleForgotPass = this.handleForgotPass.bind(this)
        this.state = { admin: false, weather: "", showLogin: false, signUp: false, errorMessage: "", loggedIn: false, loggedInName: "", email: "", accessToken: "none", darkmode: true, showmenu: false, forgotpassword: false }
        this.checkForLogin()
    }




    componentDidMount() {
        //this.getWeather()
        interval = setInterval(() => {
            this.checkAccess()
        }, 120000)
    }

    async checkForLogin() {
        const res = await fetch('/user/account/access', { method: "GET", headers: { 'access-token': this.state.accessToken } })
        if (res.status === 200) {
            this.state.accessToken = res.headers.get('access-token')
            const tokenInfo = await this.jwtDecode()
            this.state.email = tokenInfo.email
            this.state.loggedInName = tokenInfo.name
            this.state.admin = tokenInfo.admin
            this.setState({ loggedIn: true })

        } else {
            const loginButton = document.getElementById('open-login-button')
            loginButton.innerHTML = "Login"
        }
    }


    async jwtDecode() {

        return JSON.parse(window.atob(this.state.accessToken.split('.')[1]));
    }
    async checkAccess() {
        if (this.state.loggedIn) {
            const res = await fetch('/user/account/access', { method: "GET", headers: { 'access-token': this.state.accessToken } })
            if (res.status === 200) {
                this.state.accessToken = res.headers.get('access-token')
            } else {
                this.props.history.push('/')
            }
        }
    }

    componentWillUnmount() {
        clearInterval(interval)
    }
    async getWeather() {
        const res = await fetch('http://api.weatherstack.com/current?access_key=382bce18da87832e602b2515716a2a0f&query=New%20York&units=f')
        const weatherInfo = await res.json()
        this.setState({ weather: weatherInfo.current.temperature })
    }
    handleOutsideClick(e) {
        const ele = document.getElementById('lighter-outside')
        if (e.target === ele) {
            this.setState({ showLogin: false })
            this.setState({ signUp: false })
            this.setState({ forgotpassword: false })
            this.setState({ errorMessage: "" })
        }
    }
    handleShowLogin(e) {
        this.setState({ errorMessage: "" })
        if (!this.state.showLogin) {
            this.setState({ showLogin: true })
        } else {
            this.setState({ showLogin: false })
            this.setState({ signUp: false })
            this.setState({ forgotpassword: false })
        }
    }

    handleSignupFormClose() {
        this.setState({ errorMessage: "" })
        if (!this.state.signUp) {
            this.setState({ signUp: true })
        } else {
            this.setState({ signUp: false })
        }
    }
    async handleSignup() {
        const loadingContainer = document.getElementsByClassName('loading-span')[0]
        loadingContainer.innerHTML = ""
        const iele = document.createElement('i')
        iele.classList.add('loading')
        loadingContainer.appendChild(iele)
        this.setState({ errorMessage: "" })
        const formEle = document.getElementById('signup-form')
        const first = formEle.children[0].children[0].value
        const last = formEle.children[0].children[1].value
        const email = formEle.children[1].value
        const password = formEle.children[2].value
        const secondPassword = formEle.children[3].value
        if (password !== secondPassword) {
            this.setState({ errorMessage: "Passwords do not match" })
            return
        }
        const res = await fetch('/user/account/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ first: first, last: last, email: email, password: password }) })
        if (res.status !== 200) {
            const statusMessage = await res.json()
            this.setState({ errorMessage: statusMessage.status })
            loadingContainer.innerHTML = "Sign Up"
        } else {
            this.state.loggedInName = first.charAt(0).toUpperCase() + first.slice(1)
            this.state.email = email
            this.state.showLogin = false
            this.state.forgotpassword = false
            this.state.signUp = false
            this.state.showmenu = false
            this.setState({ loggedIn: true })
        }
    }

    async handleLogin() {
        const loadingContainer = document.getElementsByClassName('loading-span')[0]
        loadingContainer.innerHTML = ""
        const iele = document.createElement('i')
        iele.classList.add('loading')
        loadingContainer.appendChild(iele)
        const formEle = document.getElementsByClassName('login-form')[0]
        const email = formEle.children[0].value
        const password = formEle.children[1].value
        const res = await fetch('/user/account/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: password }) })
        const returnedInfo = await res.json();
        setTimeout(() => {
            if (res.status !== 200) {
                this.setState({ errorMessage: returnedInfo.status })
                loadingContainer.innerHTML = "Login"
            } else {
                this.state.accessToken = returnedInfo.accessToken
                this.state.loggedInName = returnedInfo.name
                this.state.showLogin = false
                this.setState({ loggedIn: true })

            }
        }, 100)


    }

    async handleDarkMode() {
        if (this.state.darkmode) {
            const navbar = document.getElementById('nav-container')

            const loginB = navbar.children[0].children[0]
            const moonicon = navbar.children[0].children[1]
            navbar.style.border = '1px solid black'
            navbar.style.color = 'var(--text-color-black)'
            document.documentElement.style.setProperty('--background-color', '#f7f7f8');
            document.documentElement.style.setProperty('--lighter-background', '#fff');
            document.documentElement.style.setProperty('--text-color-white', 'black');
            document.documentElement.style.setProperty('--text-color', 'black');
            document.documentElement.style.setProperty('--input-color', '#fff');
            if (loginB) {
                loginB.style.border = '1px solid black'
            }
            if (moonicon) {
                moonicon.style.border = '1px solid black'
            }
            this.state.darkmode = false
        } else {
            const navbar = document.getElementById('nav-container')
            const loginB = navbar.children[0].children[0]
            const moonicon = navbar.children[0].children[1]
            navbar.style.border = ''
            navbar.style.color = 'var(--text-color-white)'
            document.documentElement.style.setProperty('--background-color', '#0E0E0E');
            document.documentElement.style.setProperty('--lighter-background', '#18181b');
            document.documentElement.style.setProperty('--text-color-white', '#fff');
            document.documentElement.style.setProperty('--text-color', '#9BAEC8');
            document.documentElement.style.setProperty('--input-color', '#131419');
            if (loginB) {
                loginB.style.border = ''
            }
            if (moonicon) {
                moonicon.style.border = ''
            }
            this.state.darkmode = true

        }
        this.setState({ showmenu: false })
    }

    handleShowMenu(e) {
        if (e.type === 'blur') {
            if (!e.relatedTarget) {
                if (!this.state.showmenu) {
                    this.setState({ showmenu: true })
                } else {

                    this.setState({ showmenu: false })
                }
            }
        } else {
            if (!this.state.showmenu) {
                this.setState({ showmenu: true })
            } else {

                this.setState({ showmenu: false })

            }
        }



    }

    handleShowForgotpass() {
        this.state.errorMessage = ""
        if (!this.state.forgotpassword) {
            this.setState({ forgotpassword: true })
        } else {
            this.setState({ forgotpassword: false })
        }
    }

    async handleLogout() {
        const res = await fetch('/user/account/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
        if (res.status === 200) {
            this.setState({ loggedIn: false })
            const loginButton = document.getElementById('open-login-button')

            loginButton.innerHTML = "Login"
            this.state.accessToken = "none"
            this.state.email = ""
            this.state.loggedInName = ""


        }
    }

    async handleForgotPass(e) {
        e.preventDefault()

        const email = e.target.children[0].value
        const res = await fetch('/user/account/resetpass', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) })
    }

    render() {
        return (
            <>

                <div id="nav-container">
                    <input placeholder="Search" spellCheck="false" className="search-input"></input>
                    {this.state.weather ?
                        <div id="weather-container">
                            <span>{this.state.weather}<sup>o</sup><br></br>New York</span>
                        </div>
                        : null}
                    {!this.state.loggedIn ?
                        <div className="nav-dropdown-container">

                            <button onClick={this.handleShowLogin} id="open-login-button"></button>
                            <button onClick={this.handleDarkMode} className="moon-icon-login"><i className="far fa-moon"></i></button>
                        </div>
                        :


                        <div onBlur={this.handleShowMenu} className="nav-dropdown-container">
                            <button onClick={this.handleShowMenu} id="open-login-button" >{this.state.loggedInName}</button>
                            {this.state.showmenu ?
                                <div id="dropdown-menu">
                                    <ul>
                                        <li >
                                            <button className="dropdown-button" onClick={this.handleDarkMode}><i className="far fa-moon"> Dark Mode</i></button>
                                        </li>
                                        {this.state.admin ?
                                            <li>
                                                <button>Create Post </button>
                                            </li>
                                            : null}

                                        <li>
                                            <button>Account</button>
                                        </li>
                                        <li>
                                            <button className="dropdown-button" onClick={this.handleLogout} >Logout</button>
                                        </li>
                                    </ul>
                                </div>
                                : null}
                        </div>}




                </div>

                {this.state.showLogin && !this.state.signUp && !this.state.loggedIn && !this.state.forgotpassword ?
                    <div onClick={this.handleOutsideClick} id="lighter-outside">
                        <div className="login-container">
                            <button onClick={this.handleShowLogin} id="close-login-button"><i className="fas fa-times"></i></button>
                            <form className="login-form" autoComplete="off" onSubmit={this.handleLogin}>
                                <input spellCheck="false" id="email" className="login-input" placeholder="Email"></input>
                                <input autoComplete="off" style={{ marginTop: "1rem" }} type="password" spellCheck="false" id="password" className="login-input" placeholder="Password"></input>
                                <div id='rem-container'>
                                    <span id="forgot-pass" onClick={this.handleShowForgotpass}>Forgot password</span>
                                </div>
                            </form>
                            <div className="error-container-login">{this.state.errorMessage}</div>
                            <div id='login-button-container' >

                                <button onClick={this.handleLogin} className="login-button" ><span className="loading-span">Login</span></button>
                                <span className="bottom-text" onClick={this.handleSignupFormClose}>Sign Up</span>
                            </div>
                        </div>
                    </div>
                    :
                    <>
                        {!this.state.forgotpassword && this.state.signUp ?
                            <div onClick={this.handleOutsideClick} id="lighter-outside">
                                <div id="signup-container">
                                    <button onClick={this.handleShowLogin} id="close-login-button"><i className="fas fa-times"></i></button>
                                    <form id="signup-form" autoComplete="off" onSubmit={this.handleSignup}>
                                        <div id="name-container">
                                            <input spellCheck="false" id="first-name" className="name-input" placeholder="First Name"></input>
                                            <input spellCheck="false" id="last-name" className="name-input" placeholder="Last Name"></input>

                                        </div>
                                        <input spellCheck="false" style={{ marginTop: "1rem" }} id="signup-email" className="login-input" placeholder="Email"></input>
                                        <input autoComplete="off" style={{ marginTop: "1rem" }} type="password" spellCheck="false" id="signup-password" className="login-input" placeholder="Password"></input>
                                        <input autoComplete="off" style={{ marginTop: "1rem" }} type="password" spellCheck="false" id="signup-confirm-password" className="login-input" placeholder="Confirm Password"></input>

                                    </form>
                                    <div className="error-container">{this.state.errorMessage}</div>
                                    <div id='signup-button-container'>
                                        <button onClick={this.handleSignup} className="login-button"><span className="loading-span">Sign Up</span></button>
                                        <span className="bottom-text" onClick={this.handleSignupFormClose}>Login</span>
                                    </div>
                                </div>
                            </div>

                            : <>
                                {this.state.forgotpassword ? <div onClick={this.handleOutsideClick} id="lighter-outside">
                                    <div className="login-container">
                                        <button onClick={this.handleShowLogin} id="close-login-button"><i className="fas fa-times"></i></button>
                                        <form className="login-form" autoComplete="off" spellCheck="false" onSubmit={this.handleForgotPass}>
                                            <input spellCheck="false" id="email" className="login-input" placeholder="Email" style={{ marginTop: '7.6rem' }}></input>
                                            <div className="error-container-login" style={{ marginTop: '4rem' }}>{this.state.errorMessage}</div>
                                            <button className="login-button" style={{ marginTop: '3.7rem' }}><span className="loading-span" >Send email</span></button>
                                            <span className="bottom-text" onClick={this.handleShowForgotpass}>Login</span>
                                        </form>

                                    </div>
                                </div>
                                    : null}
                            </>

                        }
                    </>
                }

            </>
        )
    }
}

export default withRouter(nav);