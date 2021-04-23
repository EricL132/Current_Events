import React from 'react'
import './createpost.css'

let continueInterval;
class createpost extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accessToken: "none", loggedIn: true, errorMessage: "", articleCreated: false
        }
        this.checkIfAdmin = this.checkIfAdmin.bind(this)
        this.handleCreatePost = this.handleCreatePost.bind(this)
        this.handleFileInput = this.handleFileInput.bind(this)

    }

    componentDidMount(){
        this.checkIfAdmin()
        document.getElementById("file-input").addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.value = null
        })
        document.getElementById("file-input").addEventListener('change', async (e) => {
            const file = document.getElementById("file-input").files[0]
            const form = new FormData()
            form.append('file', file)
            await fetch('/info/saveimage', { method: "POST", body: form }).then(async (res) => {
                const resInfo = await res.json()
                document.getElementById("post-image").value = `https://drive.google.com/uc?id=${resInfo.imagelink}`
            })
        })
    }

    async checkIfAdmin() {
        await this.checkAccess();
        const tokenInfo = await this.jwtDecode()
        console.log(tokenInfo)
        this.setState({tokenInfo:tokenInfo})
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

    async handleCreatePost() {
        this.setState({ errorMessage: "" })
        if (!this.state.articleCreated) {
            const title = document.getElementById('post-title').value
            const author = document.getElementById('post-author').value
            const image = document.getElementById('post-image').value
            const video = document.getElementById('post-video').value
            const topic = document.getElementById('post-topic').value
            const information = document.getElementById('post-info').value
            if (title && author && image && video && information) {
                this.setState({ articleCreated: true })
                const loadingSpan = document.getElementsByClassName("loading-span")[0]
                loadingSpan.innerHTML = ""
                loadingSpan.classList += " loading"
                if (!image.includes("https://drive.google.com/uc?id=")) {
                    await fetch(image).then(async (res) => {
                        const blob = await res.blob()
                        const file = new File([blob], "image.png", { type: blob.type })
                        let form = new FormData();
                        form.append("file", file)
                        await fetch('/info/saveimage', { method: "POST", body: form }).then(async (res) => {
                            const resInfo = await res.json()
                            document.getElementById("post-image").value = `https://drive.google.com/uc?id=${resInfo.imagelink}`
                        })
                    })
                }
                continueInterval = setInterval(async () => {
                    if (document.getElementById('post-image').value.includes("https://drive.google.com/uc?id=")) {
                        clearInterval(continueInterval)
                        if(this.state.tokenInfo.admin || this.state.tokenInfo.subadmin){
                            const link = video.split('=')[1]
                            fetch('/info/createbackupvid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link: link }) }).then(async (res) => {
                                if (!res.ok) return res.json()
                                const reslink = await res.json()
                                const backupvid = 'https://drive.google.com/file/d/' + reslink.link + '/preview'
                                await fetch('/info/createarticle', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                        title: title,
                                        author: author,
                                        urlToImage: image,
                                        vid: video,
                                        topic: topic,
                                        backupvid: backupvid,
                                        description: information
                                    })
                                }).then((res)=>{
                                    if(!res.ok) return res.json()
                                    this.props.history.push('/')
                                    
                                }).then((data)=>{
                                    if(data){
                                        this.setState({articleCreated:false})
                                        this.setState({errorMessage:data.status})
                                    }
                                })
    
                            }).then((data)=>{
                                if(data){
                                    this.setState({articleCreated:false})
                                    this.setState({errorMessage:data.status})
                                }
                            })
                        }else{
                            await fetch('/info/createarticle', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                    title: title,
                                    author: author,
                                    urlToImage: image,
                                    vid: video,
                                    topic: topic,
                                    backupvid: "",
                                    description: information
                                })
                            }).then((res)=>{
                                if(!res.ok) return res.json()
                                this.props.history.push('/')
                                
                            }).then((data)=>{
                                if(data){
                                    this.setState({articleCreated:false})
                                    this.setState({errorMessage:data.status})
                                }
                            })
                            
                        }
                       
                    }

                }, 3000)


            } else {
                this.setState({ errorMessage: "Please fill out all fields" })
            }
        }


    }

    handleFileInput() {

        document.getElementById("file-input").click();

    }
    render() {
        return (
            <div className="create-page-container">
                <div className="create-middle-container">
                    <div className="inputfield-container">
                        <input autoComplete="off" spellCheck={false} id="post-title" className="post-input" placeholder="Title"></input>
                        <input autoComplete="off" spellCheck={false} id="post-author" className="post-input" placeholder="Author"></input>
                        <input autoComplete="off" spellCheck={false} id="post-topic" className="post-input" placeholder="Topic"></input>

                        <div id="image-container">
                            <input autoComplete="off" spellCheck={false} id="post-image" className="post-input" placeholder="Image Link"></input>
                            <input id="file-input" type="file" accept="image/png, image/jpeg"></input>
                            <div id="addImageByFile-container">
                                <button id="addfileButton" onClick={this.handleFileInput}><i className="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <input autoComplete="off" spellCheck={false} id="post-video" className="post-input" placeholder="Video Link"></input>
                        <textarea autoComplete="off" spellCheck={false} id="post-info" className="post-input" placeholder="Information"></textarea>
                        <span id="error-Message">{this.state.errorMessage}</span>
                        <button onClick={this.handleCreatePost} className="submitcreate"><span className="loading-span">Add Article</span></button>
                    </div>
                </div>
            </div>

        )
    }
}

export default createpost;