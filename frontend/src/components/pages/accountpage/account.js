import React from 'react'
import './account.css'
import jwt_decode from 'jwt-decode';


class account extends React.Component {
    constructor(props) {
        super(props)
        this.getUserInfo = this.getUserInfo.bind(this)
        this.checkAccess = this.checkAccess.bind(this)
        this.changeColumnSize = this.changeColumnSize.bind(this)
        this.state = {
            accessToken: "none", loggedIn: true, accountInfo: {}, showuser: false, showadmin: true
        }
    }

    async getUserInfo() {

        await this.checkAccess()
        const decoded = jwt_decode(this.state.accessToken);
        this.setState({ accountInfo: decoded })
        console.log(decoded)
    }

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

    async changeColumnSize(){
        document.getElementsByClassName('account-admin-button')[0].innerText = 'Change'
        const size = document.getElementById('homecolumnsinput').value
        const res = await fetch('/info/adminchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({column:size})})
        if(res.status!==200) this.props.history.push('/')
        document.getElementsByClassName('account-admin-button')[0].innerText = 'Changed'
    }
    componentDidMount() {
        this.getUserInfo()
    }
    render() {
        return (
            <div className="account-page-container">
                <div className="middle-container">
                    <h1>{this.state.accountInfo.name}</h1>
                    <div className="different-pages">
                        <ul>
                            <li>User Settings</li>
                            {this.state.accountInfo.admin ?
                                <li>Admin Settings</li>
                                : null}

                        </ul>
                        <div className="change-container">
                            {this.state.showuser ?
                                <div></div>
                                : <>{
                                    this.state.showadmin ?
                                        <div className="admin-config-container">
                                            <div className="homecolumns-container">
                                            <label for="homecolumnsinput">Home Page Columns</label>
                                            <input id="homecolumnsinput" type="number"></input>
                                            <button onClick={this.changeColumnSize} className="account-admin-button">Change</button>
                                            </div>
                                        </div>
                                        : null
                                }</>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default account;