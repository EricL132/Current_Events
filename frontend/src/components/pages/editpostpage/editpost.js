import React from 'react'
import './editpost.css'
import Editbox from './editbox'

class editpost extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accessToken: "none", loggedIn: true, errorMessage: "", articleCreated: false, myArticles: [], searchArticles: [], selected: false, selectedItem: "",
            searchFields: {
                searchtitle: "",
                searchauthor: "",
                searchtopic: "",
                searchcontent: ""
            }
        }
        this.getArticles = this.getArticles.bind(this)
        this.handleSelectItem = this.handleSelectItem.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
    }
    //Calls function get articles on load
    componentDidMount() {
        this.getArticles()
    }
    //Function gets all user created articles, gets all articles if admin/sub admin
    async getArticles() {
        await this.checkAccess();
        fetch('/info/myarticles').then((res) => {
            return res.json()
        }).then((data) => {
            if (data.articles) {
                this.setState({ myArticles: data.articles })
                this.setState({ searchArticles: data.articles })
            }
            this.setState({ pageloaded: true })
        })
    }

    //Checks for user login/access
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

    //Function called when article is selected for editing 
    handleSelectItem(e) {
        document.getElementById("edit-search").style.right = "0"
        this.setState({ selected: true })
        this.setState({ selectedItem: e.currentTarget.getAttribute("item") })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    //Function that handles searching of a specific article
    handleSearch(e) {
        const { name, value } = e.target
        this.state.searchFields[name] = value
        let result = this.state.searchArticles
        for (var [key, keyvalue] of Object.entries(this.state.searchFields)) {
            if (keyvalue !== "") {
                keyvalue = keyvalue.toLowerCase()
                switch (key) {
                    case "searchall":
                        key = "all"
                        break;
                    case "searchtitle":
                        key = "title"
                        break;
                    case "searchtopic":
                        key = "topic"
                        break;
                    case "searchauthor":
                        key = "author"
                        break;
                    case "searchcontent":
                        key = "content"
                        break;
                    default:
                        break;
                }
                result = result.filter((article) => {
                    if (key === "all") {
                        try {
                            const title = article["title"].toLowerCase()
                            const author = article["author"].toLowerCase()
                            const topic = article["topic"].toLowerCase()
                            const content = article["content"].toLowerCase()
                            if (title.includes(keyvalue) || author.includes(keyvalue) || topic.includes(keyvalue) || content.includes(keyvalue)) {
                                return article
                            }
                        } catch (err) {

                        }

                    } else {
                        if (article[key]) {
                            const item = article[key].toLowerCase()
                            return item.includes(keyvalue)
                        }
                    }

                })
            }
        }
        this.setState({ myArticles: result })

    }

    render() {
        return (
            <div className="edit-page-container">
                <div id="selected-edit-container">
                    {this.state.selected ?
                            <div id="inside1">

                                <Editbox props={this.props} isDisplay={true} selectedItem={this.state.myArticles[this.state.selectedItem]}></Editbox>


                                <Editbox props={this.props}  selectedItem={this.state.myArticles[this.state.selectedItem]}></Editbox>

                            </div>


                       
                        : null}

                    <div id="edit-search">
                        <div id="edit-search-container">
                            <h1 style={{ color: "var(--text-color)" }}>Search For Spcific Article</h1>
                            <form autoComplete="off" spellCheck={false} id="search-inputs-container" onChange={this.handleSearch}>
                                <input className="edit-input" name="searchall" placeholder="Search All" style={{ minWidth: "60%" }}></input>
                                <input className="edit-input" name="searchtitle" placeholder="Title"></input>
                                <input className="edit-input" name="searchauthor" placeholder="Author"></input>
                                <input className="edit-input" name="searchtopic" placeholder="Topic"></input>
                                <input className="edit-input" name="searchcontent" placeholder="Content"></input>

                            </form>

                        </div>
                        {this.state.myArticles.length > 0 ?
                            <div id="edit-articles-container">
                                {this.state.myArticles.map((article, i) => {
                                    return <div id="article-container" key={i} item={i} onClick={this.handleSelectItem}>

                                        <img src={article.urlToImage}></img>
                                        <div id="article-info-container">
                                            <span>Title: {article.title}</span>
                                            <span>Topic: {article.topic}</span>
                                            <span>Author: {article.author}</span>
                                            <span>Published: {article.publishedAt}</span>
                                            <span style={{ whiteSpace: "nowrap" }}>Content: {article.content}</span>
                                        </div>

                                    </div>
                                })

                                }


                            </div>

                            :
                            <>
                                {this.state.pageloaded ? <div id="no-articles"><span>You dont have any articles</span></div> : null}
                            </>
                        }

                    </div>
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
