import React from 'react'
import './account.css'
import jwt_decode from 'jwt-decode';


class account extends React.Component {
    constructor(props) {
        super(props)
        this.getUserInfo = this.getUserInfo.bind(this)
        this.checkAccess = this.checkAccess.bind(this)
        this.changeColumnSize = this.changeColumnSize.bind(this)
        this.changeBoxSize = this.changeBoxSize.bind(this)
        this.handleChangePass = this.handleChangePass.bind(this)
        this.state = {
            accessToken: "none", loggedIn: true, accountInfo: {}, showuser: true, showadmin: false, boxsize: "", columnsize: ""
        }
    }

    //Gets user info from server
    async getUserInfo() {
        await this.checkAccess()
        const decoded = jwt_decode(this.state.accessToken);
        this.setState({ accountInfo: decoded })
        this.setState({ userEmail: decoded.email.slice(0, 1).toUpperCase() + decoded.email.slice(1, decoded.email.length) })
        const columnSize = localStorage.getItem('columnsize')
        const boxSize = localStorage.getItem('boxsize')
        if (columnSize) {
            this.setState({ columnsize: columnSize })
        } else {
            this.setState({ columnsize: 1500 })
        }
        if (boxSize) {
            this.setState({ boxsize: boxSize })

        } else {
            this.setState({ boxsize: 300 })
        }

    }

    //Checks if user still has access
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

    //Function called to change column size of grid mode
    async changeColumnSize() {
        document.getElementById('change-column-button').innerText = 'Change'
        const size = document.getElementById('homecolumnsinput').value
        localStorage.setItem('columnsize', size)
        document.getElementById('change-column-button').innerText = 'Changed'
        this.setState({ columnsize: size })
        document.getElementById('homecolumnsinput').value = ""
    }
    //Function called to change box size of grid mode
    async changeBoxSize() {
        document.getElementById('change-box-button').innerText = 'Change'
        const size = document.getElementById('box-size-input').value
        localStorage.setItem('boxsize', size)
        document.getElementById('change-box-button').innerText = 'Changed'
        this.setState({ boxsize: size })
        document.getElementById('box-size-input').value = ""
    }
    //Gets user info on load
    componentDidMount() {
        this.getUserInfo()
    }
    //Handles changing current password from users account page
    async handleChangePass(e) {
        e.preventDefault()
        const currentPass = document.getElementById("currentpass").value
        const newpass = document.getElementById("newpass").value
        const confirm = document.getElementById("confirmnewpass").value
        if (newpass.length < 6) return this.setState({ errorMessage: "Password must be at least 6 characters" })
        if (newpass !== confirm) return this.setState({ errorMessage: "Passwords do not match" })
        if (currentPass !== "") {
            document.getElementById("change-pass-button").classList.add("disabled")
            const res = await fetch('/user/account/changepass', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: this.state.accountInfo.email, currentpass: currentPass, newpass: newpass }) })
            const error = await res.json()
            document.getElementById("change-pass-button").classList.remove("disabled")
            document.getElementById("currentpass").value = ""
            document.getElementById("newpass").value = ""
            document.getElementById("confirmnewpass").value = ""
            return this.setState({ errorMessage: error.status })

        }
    }
    render() {
        return (
            <div className="account-page-container">
                <div className="middle-container">
                    <h1 className="name-h1">{this.state.accountInfo.name}</h1>
                    <div className="different-pages">
                        <ul>
                            <li className="pages-list selected-pages-list">User Settings</li>


                        </ul>
                        <div className="change-container">
                            {this.state.showuser ?
                                <div className="user-config-container">
                                    <div className="user-info-container">
                                        <label>Email</label>
                                        <span style={{ backgroundColor: "var(--lighter-background)" }}>{this.state.userEmail}</span>
                                    </div>


                                    <form className="user-info-container">
                                        <label>Change Password</label>
                                        <input autoComplete="off" spellCheck={false} id="currentpass" type="password" className="default-input user-info-input" placeholder="Current Password"></input>
                                        <input autoComplete="off" spellCheck={false} id="newpass" type="password" className="default-input user-info-input" placeholder="New Password"></input>
                                        <input autoComplete="off" spellCheck={false} id="confirmnewpass" type="password" className="default-input user-info-input" placeholder="Confirm New Password"></input>
                                        <button id="change-pass-button" className="default-blue-button user-info-button" onClick={this.handleChangePass}>Change Password</button>
                                        <div className="error-container">{this.state.errorMessage}</div>
                                    </form>
                                    <div id="size-buttons-container">
                                        <div className="homecolumns-container">
                                            <label for="homecolumnsinput">Column Size</label>
                                            <input id="homecolumnsinput" type="number" placeholder={this.state.columnsize}></input>
                                            <button id="change-column-button" onClick={this.changeColumnSize} className="account-admin-button">Change</button>

                                        </div>
                                        <div className="homecolumns-container">
                                            <label for="box-size-input">Box Size</label>
                                            <input id="box-size-input" type="number" placeholder={this.state.boxsize}></input>
                                            <button id="change-box-button" onClick={this.changeBoxSize} className="account-admin-button">Change</button>
                                        </div>
                                    </div>
                                    
                                </div>
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default account;

/* <>{
                                    this.state.showadmin ?
                                        <div></div>
                                        : null
                                }</> */