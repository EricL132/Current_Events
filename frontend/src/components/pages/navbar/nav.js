//Navbar component
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
        this.handleGoToHome = this.handleGoToHome.bind(this)
        this.handleLoadCreate = this.handleLoadCreate.bind(this)
        this.handleAccount = this.handleAccount.bind(this)
        this.handleDisplayMode = this.handleDisplayMode.bind(this)
        this.handleLoadEdit = this.handleLoadEdit.bind(this)
        this.state = { admin: false, weather: "", showLogin: false, signUp: false, errorMessage: "", loggedIn: false, loggedInName: "", email: "", accessToken: "none", darkmode: true, showmenu: false, forgotpassword: false, modeText: [" Dark Mode"] }
        this.checkForLogin()
    }



    //Checks for login and dark/light mode
    componentDidMount() {
        //this.getWeather()
        const darkmode = localStorage.getItem("darkmode")
        if (darkmode !== null) {
            if (darkmode === "true") {
                this.setState({ darkmode: false }, () => {
                    this.handleDarkMode("firstload")
                })
            } else {
                this.setState({ darkmode: true }, () => {
                    this.handleDarkMode("firstload")
                })
            }

        }
        interval = setInterval(() => {
            this.checkAccess()
        }, 120000)


    }

    //Function to check login
    async checkForLogin() {
        const res = await fetch('/user/account/access', { method: "GET", headers: { 'access-token': this.state.accessToken } })
        if (res.status === 200) {

            this.setState({ accessToken: res.headers.get('access-token') })
            const tokenInfo = await this.jwtDecode()
            this.setState({ email: tokenInfo.email })
            this.setState({ loggedInName: tokenInfo.name })
            this.setState({ admin: tokenInfo.admin })
            this.setState({ loggedIn: true })

        } else {
            const loginButton = document.getElementById('open-login-button')
            loginButton.innerHTML = "Login"
        }
    }

    //Function to decode jwt token
    async jwtDecode() {

        return JSON.parse(window.atob(this.state.accessToken.split('.')[1]));
    }

    //Function to check if access token expired
    async checkAccess() {
        if (this.state.loggedIn) {
            const res = await fetch('/user/account/access', { method: "GET", headers: { 'access-token': this.state.accessToken } })
            if (res.status === 200) {
                this.setState({ accessToken: res.headers.get('access-token') })

            } else {
                this.props.history.push('/')
            }
        }
    }

    //Removes the check access token interval
    componentWillUnmount() {
        clearInterval(interval)
    }

    //Function to get weather in new york
    async getWeather() {
        const res = await fetch('http://api.weatherstack.com/current?access_key=382bce18da87832e602b2515716a2a0f&query=New%20York&units=f')
        const weatherInfo = await res.json()
        this.setState({ weather: weatherInfo.current.temperature })
    }

    //Function used to handle close login popup when clicked outside of it
    handleOutsideClick(e) {
        const ele = document.getElementById('lighter-outside')
        if (e.target === ele) {
            this.setState({ showLogin: false })
            this.setState({ signUp: false })
            this.setState({ forgotpassword: false })
            this.setState({ errorMessage: "" })
        }
    }
    //Function to set display modes
    handleDisplayMode() {
        this.props.handleDisplayMode()
        localStorage.setItem('displayslide', this.props.displaySlide)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    //Function to show login popup
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

    //Function to close signup popup and go to login popup
    handleSignupFormClose() {
        this.setState({ errorMessage: "" })
        if (!this.state.signUp) {
            this.setState({ signUp: true })
        } else {
            this.setState({ signUp: false })
        }
    }

    //Function to navigate to account page (login required)
    handleAccount() {
        this.setState({ showmenu: false })
        this.props.history.push('/account')
    }

    //Handles sign up
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
            this.setState({ loggedInName: first.charAt(0).toUpperCase() + first.slice(1) })
            this.setState({ email: email })
            this.setState({ showLogin: false })
            this.setState({ forgotpassword: false })
            this.setState({ signUp: false })
            this.setState({ showmenu: false })
            this.setState({ loggedIn: true })
        }
    }
    //Handles login
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
                this.state.admin = returnedInfo.admin
                this.state.showmenu = false
                this.setState({ loggedIn: true })
                window.location.reload()
            }
        }, 100)


    }
    //Handles display dark/light mode
    async handleDarkMode(item) {
        if (this.state.darkmode) {
            const navbar = document.getElementById('nav-container')

            const loginB = navbar.children[0].children[0]
            const moonicon = navbar.children[0].children[1]
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
            if (item !== "firstload") {
                localStorage.setItem("darkmode", false)
            }

            this.state.darkmode = false
        } else {
            const navbar = document.getElementById('nav-container')
            const loginB = navbar.children[0].children[0]
            const moonicon = navbar.children[0].children[1]
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
            if (item !== "firstload") {
                localStorage.setItem("darkmode", true)

            }
            this.state.darkmode = true

        }
        this.setState({ showmenu: false })
    }

    //Handles whether menu should be shown
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

    //Shows forget password page or closes forgot password page and shows login popup
    handleShowForgotpass() {
        this.setState({ errorMessage: "" })
        if (!this.state.forgotpassword) {
            this.setState({ forgotpassword: true })
        } else {
            this.setState({ forgotpassword: false })
        }
    }

    //Handles logout
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

    //Handles send resetpassword request
    async handleForgotPass(e) {
        e.preventDefault()
        const email = document.getElementById("email").value
        const res = await fetch('/user/account/resetpass', { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email }) })
        if (res.status !== 200) {
            const rep = await res.json()
            this.setState({ errorMessage: rep.status })
        } else {
            document.getElementsByClassName('login-form')[0].innerHTML = "<span class='email-sent-span'>Email Sent</span>"
        }

    }

    //Handles return to homepage from differnt page on site
    handleGoToHome() {
        if (window.location.pathname === "/") {
            this.setState({ showmenu: false })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            this.setState({ showmenu: false })
            this.props.history.push('/')
        }
    }

    //Goes to create post page
    handleLoadCreate() {
        this.setState({ showmenu: false })
        this.props.history.push('/createpost')
    }

    //Goes to edit post page
    handleLoadEdit() {
        this.setState({ showmenu: false })
        this.props.history.push('/editpost')
    }

    
    render() {
        return (
            <>
                <div id="nav-container">
                    <button onClick={this.handleGoToHome} className="home-button">Home</button>
                    {window.location.pathname === "/" ?
                        <div className="dropdown-search">
                            <input autoComplete="off" placeholder="Search" spellCheck="false" className="search-input" id="search-input"></input>
                            <div id="search-display"><span id="search-display-span">All:</span></div> 
                            <div id="search-menu-type" className="dropdown-search-content">
                                <button className="search-buttons" s="search" >Search All</button>
                                <button className="search-buttons" s="title" >Search By Title</button>
                                <button className="search-buttons" s="author" >Search By Author</button>
                                <button className="search-buttons" s="topic" >Search By Topic</button>
                                <button className="search-buttons" s="content" >Search By Content</button>
                            </div>
                        </div>
                        : null}

                    {this.state.weather ?
                        <div id="weather-container">
                            <span>{this.state.weather}<sup>o</sup><br></br>New York</span>
                        </div>
                        : null}
                    {!this.state.loggedIn ?
                        <div className="nav-dropdown-container">{/* <i class="fas fa-grip-lines"></i> */}
                            <button onClick={this.props.handleDisplayMode} className="grid-icon-login set-buttons" stlye={{ marginRight: "2rem" }}><i class="fas fa-th"></i></button>
                            <button onClick={this.handleDarkMode} className="moon-icon-login set-buttons"><i className="far fa-moon"></i></button>
                            <button onClick={this.handleShowLogin} id="open-login-button"></button>
                        </div>
                        :


                        <div onBlur={this.handleShowMenu} className="nav-dropdown-container">
                            <button onClick={this.handleShowMenu} id="open-login-button" >{this.state.loggedInName}</button>
                            {this.state.showmenu ?
                                <div id="dropdown-menu">
                                    <ul>
                                        <li>
                                            <button onClick={this.handleAccount}>Account</button>
                                        </li>
                                        <li>
                                            <button onClick={this.handleLoadCreate}>Create Post</button>
                                        </li>
                                        <li>
                                            <button onClick={this.handleLoadEdit}>Edit Post</button>
                                        </li>



                                        {this.state.darkmode ?
                                            <li >
                                                <button className="dropdown-button" onClick={this.handleDarkMode}><i className="far fa-moon"></i> Light Mode</button>
                                            </li>
                                            :
                                            <li >
                                                <button className="dropdown-button" onClick={this.handleDarkMode}><i className="far fa-moon"></i> Dark Mode</button>
                                            </li>}
                                        {this.props.displaySlide ?
                                            <li >
                                                <button className="dropdown-button" id="displaymode" onClick={this.handleDisplayMode}> Grid Mode</button>
                                            </li>
                                            :
                                            <li >
                                                <button className="dropdown-button" id="displaymode" onClick={this.handleDisplayMode}> Topic Mode</button>
                                            </li>}







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
                                <input spellCheck="false" id="email" className="default-input" placeholder="Email"></input>
                                <input autoComplete="off" style={{ marginTop: "1rem" }} type="password" spellCheck="false" id="password" className="default-input" placeholder="Password"></input>
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
                                        <input spellCheck="false" style={{ marginTop: "1rem" }} id="signup-email" className="default-input" placeholder="Email"></input>
                                        <input autoComplete="off" style={{ marginTop: "1rem" }} type="password" spellCheck="false" id="signup-password" className="default-input" placeholder="Password"></input>
                                        <input autoComplete="off" style={{ marginTop: "1rem" }} type="password" spellCheck="false" id="signup-confirm-password" className="default-input" placeholder="Confirm Password"></input>

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
                                            <input spellCheck="false" id="email" className="default-input" placeholder="Email" style={{ marginTop: '7.6rem' }}></input>
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