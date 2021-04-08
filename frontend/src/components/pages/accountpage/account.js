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
        this.state = {
            accessToken: "none", loggedIn: true, accountInfo: {}, showuser: true, showadmin: false, boxsize: "", columnsize:""
        }
    }

    async getUserInfo() {
        await this.checkAccess()
        const decoded = jwt_decode(this.state.accessToken);
        this.setState({ accountInfo: decoded })
        this.setState({ userEmail:decoded.email.slice(0,1).toUpperCase()+decoded.email.slice(1,decoded.email.length)})
        const columnSize = localStorage.getItem('columnsize')
        const boxSize = localStorage.getItem('boxsize')
        if (columnSize) {
            this.setState({ columnsize: columnSize })
        } else {
            this.setState({ columnsize: 1500 })
        }
        if(boxSize){
            this.setState({boxsize:boxSize})
            
        }else{
            this.setState({boxsize:300})
        }

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

    async changeColumnSize() {
        document.getElementById('change-column-button').innerText = 'Change'
        const size = document.getElementById('homecolumnsinput').value
        localStorage.setItem('columnsize', size)
        document.getElementById('change-column-button').innerText = 'Changed'
        this.setState({ columnsize: size })
        document.getElementById('homecolumnsinput').value = ""
    }

    async changeBoxSize() {
        document.getElementById('change-box-button').innerText = 'Change'
        const size = document.getElementById('box-size-input').value
        localStorage.setItem('boxsize', size)
        document.getElementById('change-box-button').innerText = 'Changed'
        this.setState({ boxsize: size })
        document.getElementById('box-size-input').value = ""
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
                            <li className="pages-list selected-pages-list">User Settings</li>
                            {this.state.accountInfo.admin ?
                                <li className="pages-list">Admin Settings</li>
                                : null}

                        </ul>
                        <div className="change-container">
                            {this.state.showuser ?
                                <div className="user-config-container">
                                    <div className="user-info-container">
                                        <label>Email</label>
                                        <span style={{backgroundColor:"var(--lighter-background)"}}>{this.state.userEmail}</span>
                                    </div>
                                    <div className="user-info-container">
                                        <label>Change Password</label>
                                        <input className="default-input user-info-input" placeholder="Current Password"></input>
                                        <input className="default-input user-info-input" placeholder="New Password"></input>
                                        <input className="default-input user-info-input" placeholder="Confirm New Password"></input>
                                        <button className="default-blue-button user-info-button">Change Password</button>
                                    </div>
                                   {/*  <div className="homecolumns-container">
                                        <label for="homecolumnsinput">Column Size</label>
                                        <input id="homecolumnsinput" type="number" placeholder={this.state.columnsize}></input>
                                        <button id="change-column-button" onClick={this.changeColumnSize} className="account-admin-button">Change</button>

                                    </div>
                                    <div className="homecolumns-container">

                                        <label for="box-size-input">Box Size</label>
                                        <input id="box-size-input" type="number" placeholder={this.state.boxsize}></input>
                                        <button id="change-box-button" onClick={this.changeBoxSize} className="account-admin-button">Change</button>
                                    </div> */}
                                </div>
                                : <>{
                                    this.state.showadmin ?
                                        <div></div>
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