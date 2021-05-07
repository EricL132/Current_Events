import React from 'react'
import article from '../articlepages/article';
import './home.css'
const querystring = require('querystring');

class home extends React.Component {
    constructor(props) {
        super(props)

        this.state = { articles: [], articlesFromSearch: [], columnsize: 1500, boxsize: 280 }
        this.getSettings = this.getSettings.bind(this)
        this.handleRightScroll = this.handleRightScroll.bind(this)
        this.performSearch = this.performSearch.bind(this)
        this.handleSearchReturn = this.handleSearchReturn.bind(this)
        this.handleTextClick = this.handleTextClick.bind(this)
    }

    componentWillMount() {
        this.getArticles()
    }

    componentDidMount() {
        this.getSettings()
        const searchParam = document.getElementById('search-input')
        searchParam.addEventListener('input', async () => {
            this.performSearch(searchParam)
        })
        document.getElementById("search-menu-type").addEventListener("click", (e) => {
            this.handleSearchReturn(e)
        })

    }
    handleSearchReturn(e) {
        let stype = e.target.getAttribute("s")
        this.props.handleChangeSearchType(stype)
        stype= stype.slice(0, 1).toUpperCase() + stype.slice(1, stype.length)
        document.getElementById("search-input").placeholder = stype
        const searchParam = document.getElementById('search-input')
        if(stype==="Search"){
            stype="All"
        }
        document.getElementById("search-display-span").textContent = stype+":"
        this.performSearch(searchParam)
    }
    performSearch(searchParam) {
        const typeOf = this.props.typeOfSearch
        const res = this.state.articlesFromSearch.map((article) => {
            return article.filter((item) => {
                if (typeOf === "search") {
                    try {
                        const title = item["title"].toLowerCase()
                        const author = item["author"].toLowerCase()
                        const topic = item["topic"].toLowerCase()
                        const content = item["content"].toLowerCase()
                        const searchvalue = searchParam.value.toLowerCase()
                        if (title.includes(searchvalue) || author.includes(searchvalue) || topic.includes(searchvalue) || content.includes(searchvalue)) {
                            return item
                        }
                    } catch (err) {

                    }

                } else {
                    if (item[typeOf]) {
                        const title = item[typeOf].toLowerCase()
                        const searchvalue = searchParam.value.toLowerCase()
                        if (title.includes(searchvalue)) {
                            return item
                        }
                    }
                }

            })
        })
        this.setState({ articles: res })
    }
    async getSettings() {
        const columnsize = localStorage.getItem('columnsize')
        const boxsize = localStorage.getItem('boxsize')
        if (columnsize) {
            this.setState({ columnsize: columnsize })
        }
        if (boxsize) {
            this.setState({ boxsize: boxsize })
        }
    }


    async getArticles() {
        const res = await fetch('/info/articles')
        const articlesInfo = await res.json()
        this.setState({ articles: articlesInfo.articles })
        this.setState({ articlesFromSearch: articlesInfo.articles })
    }
    handleRightScroll(e) {
        let pa;
        if (e.target.classList.contains("fas")) {
            pa = e.target.parentNode.parentNode.parentNode
        } else {
            pa = e.target.parentNode.parentNode
        }
        pa.scrollLeft += document.getElementsByClassName("topic-articles")[0].offsetWidth - 100



        if (pa.scrollLeft === (pa.scrollWidth - pa.clientWidth)) {
            pa.scrollLeft = 0;
        }

    }
    handleLeftScroll(e) {
        let pa;
        if (e.target.classList.contains("fas")) {
            pa = e.target.parentNode.parentNode.parentNode
        } else {
            pa = e.target.parentNode.parentNode
        }
        if (pa.scrollLeft - document.getElementsByClassName("topic-articles")[0].offsetWidth < 0) {
            pa.scrollLeft = (pa.scrollWidth - pa.clientWidth)
        } else {
            pa.scrollLeft -= document.getElementsByClassName("topic-articles")[0].offsetWidth + 100
        }


    }

    handleTextClick(e) {
        if (e.target.nodeName !== "IMG") {
            if (e.target.classList.contains("home-articles-container")) {
                window.location.href = e.target.firstChild
            } else {
                window.location.href = e.target.previousElementSibling
            }
        }

    }
    render() {
        return (
            <div className="page-container">

                {this.state.articles ?
                    <>

                        {this.props.displaySlide ?
                            <div className="home-all-articles-container" style={{ width: `1451px` }}>
                                {this.state.articles.slice(0).reverse().map((articleType, i) => {
                                    return <div key={i} className="topics-container">
                                        {articleType[0] ?
                                            <h1 className="topic-title">{articleType[0].topic.substring(0, 1).toUpperCase() + articleType[0].topic.substring(1, articleType[0].topic.length)}</h1>

                                            : null}
                                        <div className="topic-articles">
                                            {articleType.slice(0).reverse().map((article, i) => {
                                                const queryString = querystring.stringify({ id: article._id })
                                                return <div key={i} className="home-articles-container" style={{ maxWidth: "280px" }} onClick={this.handleTextClick}>
                                                    {article.vid ?
                                                        <>
                                                            {article.vid.includes("https://www.youtube.com/watch?v=") ?
                                                                <a href={`/article/?${queryString}`}><img src={article.urlToImage} className="topic-image" alt=""></img></a>
                                                                : <a href={article.vid}><img src={article.urlToImage} className="topic-image" alt=""></img></a>

                                                            }

                                                        </>
                                                        : <a href={`/article/?${queryString}`}><img src={article.urlToImage} className="topic-image" alt=""></img></a>
                                                    }
                                                    <span >{article.title}</span>
                                                </div>
                                            })
                                            }




                                            <div className="slide-button-container-left">
                                                <button className="slide-article-button" onClick={this.handleLeftScroll}><i className="fas fa-arrow-left"></i></button>
                                            </div>
                                            <div className="slide-button-container-right">
                                                <button className="slide-article-button" onClick={this.handleRightScroll}><i className="fas fa-arrow-right"></i></button>
                                            </div>


                                        </div>

                                    </div>

                                })
                                }
                            </div>
                            : <div className="home-all-articles-container" style={{ maxWidth: `${this.state.columnsize}px` }}>
                                {this.state.articles.slice(0).reverse().map((item) => {
                                    return item.slice(0).reverse().map((article, i) => {
                                        const queryString = querystring.stringify({ id: article._id })
                                        return <div key={i} className="home-articles-container" style={{ width: `${this.state.boxsize}px`, height: `${this.state.boxsize}px` }} onClick={this.handleTextClick}>
                                            {article.vid ?
                                                <>
                                                    {article.vid.includes("https://www.youtube.com/watch?v=") ?
                                                        <a href={`/article/?${queryString}`}><img src={article.urlToImage} className="boxes-image" alt=""></img></a>
                                                        : <a href={article.vid}><img className="boxes-image" src={article.urlToImage} alt=""></img></a>

                                                    }

                                                </>
                                                : <a href={`/article/?${queryString}`}><img className="boxes-image" src={article.urlToImage} alt=""></img></a>
                                            }
                                            <span >{article.title}</span>
                                        </div>
                                    })
                                })

                                }
                            </div>}

                    </>
                    : null}



            </div>
        )
    }
}

export default home;