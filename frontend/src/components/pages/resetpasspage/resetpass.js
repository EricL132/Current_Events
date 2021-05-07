import React from 'react'
import './resetpass.css'



class resetpass extends React.Component {
    constructor(props) {
        super(props)
        this.handleResetpass = this.handleResetpass.bind(this)
        this.checkAccess = this.checkAccess.bind(this)
        this.state = {
            errorMessage: "",
            accessToken: "none",
            pageLoaded: false
        }
    }
    componentWillMount() {
        this.checkAccess()
    }
    componentDidMount() {
    }

    async checkAccess() {
        const res = await fetch('/user/account/access', { method: "GET", headers: { 'access-token': this.state.accessToken } })
        if (res.status === 200) {
            this.props.history.push('/')
        } else {
            this.setState({ pageLoaded: true })
        }
    }
    async handleResetpass() {
        this.setState({ errorMessage: "" })
        const pass = document.getElementById("password").value
        const confirmpass = document.getElementById("confirm-password").value
        if (pass.length < 6) {
            this.setState({ errorMessage: "Password must be at least 6 characters long" })
        } else {
            if (pass !== confirmpass) {
                this.setState({ errorMessage: "Passwords do not match" })
            } else {
                const res = await fetch('/user/account/reset', { method: "POST", headers: { "Content-Type": 'application/json' }, body: JSON.stringify({ token: this.props.location.search, password: pass }) })
                const resMes = await res.json()
                if (res !== 200) {
                    this.setState({ errorMessage: resMes.status })
                } else {
                    window.location.reload()
                }

            }
        }


    }
    render() {
        return (
            <>
                {
                    this.state.pageLoaded ?
                        <div className="page-container">
                            <div className="resetpass-container">
                                <div className="resetpass-mid">
                                    <input autoComplete="off" type="password" spellCheck="false" id="password" className="default-input user-info-input" placeholder="New Password"></input>
                                    <input autoComplete="off" type="password" spellCheck="false" id="confirm-password" className="default-input user-info-input" placeholder="Confirm New Password"></input>
                                    <button className="default-blue-button user-info-button" onClick={this.handleResetpass}>Change Password</button>
                                    <div className="error-container-login" style={{ marginBottom: "-3rem" }}>{this.state.errorMessage}</div>
                                </div>
                            </div>
                        </div>
                        : null
                }
            </>
        )
    }
}

export default resetpass;