import React from 'react'
import './createpost.css'

let continueInterval;
class createpost extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accessToken: "none", loggedIn: true, errorMessage: "", articleCreated: false, image: "", driveLink: ""
        }
        this.checkIfAdmin = this.checkIfAdmin.bind(this)
        this.handleCreatePost = this.handleCreatePost.bind(this)
        this.checkForImage = this.checkForImage.bind(this)
        this.setImage = this.setImage.bind(this)
        this.removeImage = this.removeImage.bind(this)
    }

    componentDidMount() {
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
                this.setState({ image: `https://drive.google.com/uc?id=${resInfo.imagelink}` })
            })
        })


    }

    async checkIfAdmin() {
        await this.checkAccess();
        const tokenInfo = await this.jwtDecode()
        this.setState({ tokenInfo: tokenInfo })
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
            const video = document.getElementById('post-video').value
            const topic = document.getElementById('post-topic').value
            const information = document.getElementById('post-info').value
            //fetch(`https://www.youtube.com/oembed?url=${this.state.article.vid}&format=json`)
            if (title && this.state.image && video) {
                if (video.includes("https://www.youtube.com/watch?v=")) {
                    const res = await fetch(`https://www.youtube.com/oembed?url=${video}&format=json`)
                    if (!res.ok) {
                        this.setState({ errorMessage: "Invalid youtube video" })
                        return
                    }
                }
                this.setState({ articleCreated: true })
                const loadingSpan = document.getElementsByClassName("loading-span")[0]
                loadingSpan.innerHTML = ""
                loadingSpan.classList += " loading"
                if (!this.state.image.includes("https://drive.google.com/uc?id=")) {


                    await fetch(`/info/saveimage?image=${this.state.image}`, { method: "POST" }).then(async (res) => {
                        const resInfo = await res.json()
                        this.setState({ driveLink: `https://drive.google.com/uc?id=${resInfo.imagelink}` })
                    })




                }
                continueInterval = setInterval(async () => {
                    if (this.state.driveLink != "") {
                        clearInterval(continueInterval)
                        if (this.state.tokenInfo.admin && video.includes("https://www.youtube.com/watch?v=") || this.state.tokenInfo.subadmin && video.includes("https://www.youtube.com/watch?v=")) {


                            fetch('/info/createbackupvid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link: video }) }).then(async (res) => {
                                if (!res.ok) {

                                    this.setState({ articleCreated: false })
                                    this.setState({ errorMessage: "Failed to create post" })

                                    const loadingSpan = document.getElementsByClassName("loading-span")[0]
                                    loadingSpan.innerHTML = "Edit Article"
                                    loadingSpan.classList += "loading-span"
                                    return
                                }
                                const reslink = await res.json()
                                const backupvid = 'https://drive.google.com/file/d/' + reslink.link + '/preview'
                                await fetch('/info/createarticle', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                        title: title,
                                        urlToImage: this.state.driveLink,
                                        vid: video,
                                        topic: topic,
                                        backupvid: backupvid,
                                        content: information
                                    })
                                }).then((res) => {
                                    if (!res.ok) {
                                        this.setState({ articleCreated: false })
                                        this.setState({ errorMessage: "Failed to create post" })
                                        const loadingSpan = document.getElementsByClassName("loading-span")[0]
                                        loadingSpan.innerHTML = "Edit Article"
                                        loadingSpan.classList += "loading-span"
                                        return
                                    }
                                    this.props.history.push('/')

                                })

                            })
                        } else {
                            await fetch('/info/createarticle', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                    title: title,
                                    urlToImage: this.state.driveLink,
                                    vid: video,
                                    topic: topic,
                                    backupvid: "",
                                    content: information
                                })
                            }).then((res) => {
                                if (!res.ok) {
                                    this.setState({ articleCreated: false })
                                    this.setState({ errorMessage: "Failed to create post" })
                                    const loadingSpan = document.getElementsByClassName("loading-span")[0]
                                    loadingSpan.innerHTML = "Edit Article"
                                    loadingSpan.classList += "loading-span"
                                    return
                                }
                                this.props.history.push('/')

                            })

                        }

                    }

                }, 3000)


            } else {
                this.setState({ errorMessage: "Please fill out all fields" })
            }
        }


    }


    checkForImage() {
        const link = document.getElementById("post-video").value
        if (link) {
            fetch(`/info/siteimage?site=${link}`).then((res) => res.json()).then((data) => {
                if (data) {

                    try {
                        this.setState({ image: data["twitter_card"].images[0].url })
                    } catch (err) {
                        try {
                            this.setState({ image: data["open_graph"].images[0].url })
                        } catch (err) {

                        }
                    }

                    document.getElementById("post-image").value = this.state.image

                }
            })
        }

    }
    setImage(e) {
        this.setState({ image: e.target.value })
    }

    removeImage() {
        this.setState({ image: "" })
        document.getElementById("post-image").value = ""
    }
    render() {
        return (
            <div className="create-page-container">
                <div className="create-middle-container">
                    <h1 className="create-h1">Create Post</h1>
                    <div className="inputfield-container">
                        <input autoComplete="off" spellCheck={false} id="post-title" className="post-input" placeholder="Title"></input>
                        <input autoComplete="off" spellCheck={false} id="post-topic" className="post-input" placeholder="Topic"></input>

                        <div id="image-container">
                            <input autoComplete="off" spellCheck={false} id="post-image" className="post-input" placeholder="Image Link" onChange={this.setImage}></input>
                            <input id="file-input" type="file" accept="image/png, image/jpeg"></input>
                            <div id="addImageByFile-container">
                                <button id="addfileButton" onClick={() => document.getElementById("file-input").click()}><i className="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div id="image-con">

                            {this.state.image ?
                                <>
                                    <button className="delete-image" onClick={this.removeImage}><i class="fas fa-times"></i></button>
                                    <img id="image-box" src={this.state.image}></img>
                                </>
                                : null}

                        </div>

                        <input autoComplete="off" spellCheck={false} id="post-video" className="post-input" placeholder="Youtube Link/Website Link" onChange={this.checkForImage}></input>
                        <textarea autoComplete="off" spellCheck={false} id="post-info" className="post-input post-info" placeholder="Information"></textarea>
                        <span id="error-Message">{this.state.errorMessage}</span>
                        <button onClick={this.handleCreatePost} className="submitcreate"><span className="loading-span">Add Article</span></button>
                    </div>
                </div>
            </div>

        )
    }
}

export default createpost;