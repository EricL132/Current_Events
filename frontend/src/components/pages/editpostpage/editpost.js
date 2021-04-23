import React from 'react'
import './editpost.css'

let continueInterval;
class editpost extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accessToken: "none", loggedIn: true, errorMessage: "", articleCreated: false, myArticles: [], searchArticles: []
        }
        this.checkIfAdmin = this.checkIfAdmin.bind(this)
        this.handleEditPost = this.handleEditPost.bind(this)
        this.handleFileInput = this.handleFileInput.bind(this)
        this.getArticles = this.getArticles.bind(this)
        this.handleSelectItem = this.handleSelectItem.bind(this)

    }

    componentDidMount() {
        this.getArticles()
    }
    async getArticles() {
        await this.checkAccess();
        fetch('/info/myarticles').then((res) => {
            return res.json()
        }).then((data) => {
            console.log(data)
            if (data.articles) {
                this.setState({ myArticles: data.articles })
                this.setState({ searchArticles: data.articles })
                console.log(data.articles)
            }

        })
    }

    async checkIfAdmin() {
        await this.checkAccess();
        const tokenInfo = await this.jwtDecode()
        if (tokenInfo.admin !== true) {
            this.props.history.push('/')
        }
        this.setState({ pageLoaded: true })
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

    async handleEditPost() {
        this.setState({ errorMessage: "" })
        if (!this.state.articleCreated) {
            const exacttitle = document.getElementById('post-exact-title').value
            const title = document.getElementById('post-title').value
            const author = document.getElementById('post-author').value
            const image = document.getElementById('post-image').value
            const video = document.getElementById('post-video').value
            const information = document.getElementById('post-info').value
            if (exacttitle !== "") {
                this.setState({ articleCreated: true })
                const loadingSpan = document.getElementsByClassName("loading-span")[0]
                loadingSpan.innerHTML = ""
                loadingSpan.classList += " loading"
                if (!image.includes("https://drive.google.com/uc?id=") && image !== "") {
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
                    if (video !== "") {
                        if (document.getElementById('post-image').value.includes("https://drive.google.com/uc?id=") || image === "") {
                            clearInterval(continueInterval)


                            const link = video.split('=')[1]
                            const res = await fetch('/info/createbackupvid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link: link }) })
                            const reslink = await res.json()
                            console.log(reslink)
                            const backupvid = 'https://drive.google.com/file/d/' + reslink.link + '/preview'
                            await fetch('/info/editpost', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                    exacttitle: exacttitle,
                                    title: title,
                                    author: author,
                                    urlToImage: image,
                                    vid: video,
                                    backupvid: backupvid,
                                    description: information
                                })
                            }).then(async (res) => {
                                if (res.status !== 200) {
                                    const erro = await res.json()
                                    this.setState({ errorMessage: erro.errormessage })
                                    this.setState({ articleCreated: false })
                                    const loadingSpan = document.getElementsByClassName("loading-span")[0]
                                    loadingSpan.innerHTML = "Edit Article"
                                    loadingSpan.classList += "loading-span"
                                } else {
                                    this.props.history.push('/')
                                }
                            })

                        }
                    } else {
                        clearInterval(continueInterval)
                        await fetch('/info/editpost', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                exacttitle: exacttitle,
                                title: title,
                                author: author,
                                urlToImage: image,
                                vid: "",
                                backupvid: "",
                                description: information
                            })
                        }).then(async (res) => {
                            if (res.status !== 200) {
                                const erro = await res.json()
                                this.setState({ errorMessage: erro.errormessage })
                                this.setState({ articleCreated: false })
                                const loadingSpan = document.getElementsByClassName("loading-span")[0]
                                loadingSpan.innerHTML = "Edit Article"
                                loadingSpan.classList += "loading-span"
                            } else {
                                this.props.history.push('/')
                            }
                        })

                    }


                }, 3000)



            } else {
                this.setState({ errorMessage: "Invalid Title" })
            }
        } else {
            this.setState({ errorMessage: "Performing changes already (If its over 30 seconds refresh page and try again)" })
        }


    }

    handleSelectItem() {
        document.getElementById("edit-search").style.left = "84%"
    }
    handleFileInput() {

        document.getElementById("file-input").click();

    }
    render() {
        return (
            <div className="edit-page-container">
                {/* <div id="selected-edit-container">
                    <div id="selected-item-info-container">

                    </div>
                    <div id="selected-item-change-container">

                    </div>
                </div> */}

                <div id="edit-search">
                    <div id="edit-search-container">
                        <h1 style={{ color: "var(--text-color)" }}>Search For Spcific Article</h1>
                        <div id="search-inputs-container">
                            <input className="edit-input" placeholder="Title"></input>
                            <input className="edit-input" placeholder="Author"></input>
                            <input className="edit-input" placeholder="Topic"></input>
                            <input className="edit-input" placeholder="Content"></input>

                        </div>
                        <button className="default-blue-button">Search</button>
                    </div>
                    {this.state.myArticles.length > 0 ?
                        <div id="edit-articles-container">
                            {this.state.myArticles.map((article,i)=>{
                                    return <div id="article-container" key={i} onClick={this.handleSelectItem}>
                            
                                    <img src={article.urlToImage}></img>
                                    <div id="article-info-container">
                                        <span>Title: {article.title}</span>
                                        <span>Topic: {article.topic}</span>
                                        <span>Author: {article.author}</span>
                                        <span>Published: {article.publishedAt}</span>
                                        <span style={{whiteSpace:"nowrap"}}>Content: {article.content}</span>
                                    </div>
    
                                </div>
                                })

                                }
                        </div>

                        : null}

                </div>

            </div>

        )
    }
}

export default editpost;



/*  <div className="create-page-container">
               <div className="create-middle-container">
                   <div className="inputfield-container">
                       <input autoComplete="off" spellCheck={false} id="post-exact-title" className="post-input" placeholder="Exact title of article to edit"></input>
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
                       <button onClick={this.handleEditPost} className="submitcreate"><span className="loading-span">Edit Article</span></button>
                   </div>
               </div>
           </div> */
