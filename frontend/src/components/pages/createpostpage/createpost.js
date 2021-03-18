import React from 'react'
import './createpost.css'


class resetpass extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            accessToken:"none",loggedIn:true,pageLoaded:false
        }
        this.checkIfAdmin = this.checkIfAdmin.bind(this)
        this.handleCreatePost = this.handleCreatePost.bind(this)
        this.checkIfAdmin()
        
    }

    async checkIfAdmin(){
        await this.checkAccess();
        const tokenInfo = await this.jwtDecode()
        if(tokenInfo.admin!==true){
            this.props.history.push('/')
        }
        this.setState({pageLoaded:true})
        
    }

    async jwtDecode() {

        return JSON.parse(window.atob(this.state.accessToken.split('.')[1]));
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

    async handleCreatePost(){
        const title = document.getElementById('post-title').value
        const author = document.getElementById('post-author').value
        const image = document.getElementById('post-image').value
        const video = document.getElementById('post-video').value
        const backupvid = document.getElementById('post-backupvideo').value
        const information = document.getElementById('post-info').value
        await fetch('/info/createarticle',{method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            title:title,      
            author:author,        
            urlToImage:image,  
            vid:video,  
            backupvid:backupvid,  
            description:information
        })})
        this.props.history.push('/')
    }
    componentDidMount() {

    }
    render() {
        return (
            <>
            {this.state.pageLoaded? 
                <div className="create-page-container">
                <div className="create-middle-container">
                    <div className="inputfield-container">
                    <input spellCheck={false} id="post-title" className="post-input" placeholder="Title"></input>
                    <input spellCheck={false} id="post-author" className="post-input" placeholder="Author"></input>
                    <input spellCheck={false} id="post-image" className="post-input" placeholder="Image Link"></input>
                    <input spellCheck={false} id="post-video" className="post-input" placeholder="Video Link"></input>
                    <input spellCheck={false} id="post-backupvideo" className="post-input" placeholder="Back Up Video Link"></input>
                    <textarea  spellCheck={false} id="post-info" className="post-input" placeholder="Information"></textarea>
                    <button onClick={this.handleCreatePost} className="submitcreate">Add Article</button>
                    </div>
                </div>
            </div>
            :null}
           </>
        )
    }
}

export default resetpass;