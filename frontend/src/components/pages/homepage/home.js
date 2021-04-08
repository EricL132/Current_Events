import React from 'react'
import article from '../articlepages/article';
import './home.css'
const querystring = require('querystring');

class home extends React.Component {
    constructor(props) {
        super(props)

        this.state = { articles: [], articlesFromSearch: [], columnsize: 1500, boxsize: 280 }
        this.handleLoadArticle = this.handleLoadArticle.bind(this)
        this.getSettings = this.getSettings.bind(this)
        this.handleRightScroll = this.handleRightScroll.bind(this)
        this.getArticles()
    }
    componentDidMount() {
        this.getSettings()
        const searchParam = document.getElementById('search-input')
        searchParam.addEventListener('input', async () => {
            const res = this.state.articlesFromSearch.map((article) => {
                return article.filter((item) => {
                    const title = item.title.toLowerCase()
                    const searchvalue = searchParam.value.toLowerCase()
                    if (title.includes(searchvalue)) {
                        return item
                    }

                })
                /* const result = article.filter((item) => {
                    const title = item.title.toLowerCase()
                    const searchvalue = searchParam.value.toLowerCase()
                    return title.includes(searchvalue)
                })

                this.setState({ articles: [result] }) */
                // console.log(article)

            })
            this.setState({ articles: res })

        })
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

    async handleLoadArticle(e) {
        const docu = e.nativeEvent.path.filter((ele) => {
            try { return ele.classList.contains('home-articles-container') } catch (err) { return null }
        })
        const param = await docu[0].getAttribute('title')
        const queryString = querystring.stringify({ title: param })
        this.props.history.push(`/article/?${queryString}`)

    }
    async getArticles() {
        const res = await fetch('/info/articles')
        const articlesInfo = await res.json()
        this.setState({ articles: articlesInfo.articles })
        this.setState({ articlesFromSearch: articlesInfo.articles })
        console.log(articlesInfo.articles)
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
    render() {
        return (
            <div className="page-container">

                {this.state.articles ?
                    <div className="home-all-articles-container" style={{ maxWidth: `${this.state.columnsize}px` }}>
                        {this.state.articles.map((articleType, i) => {
                            return <div key={i} className="topics-container">
                                {articleType[0] ?
                                    <h1 className="topic-title">{articleType[0].topic.substring(0, 1).toUpperCase() + articleType[0].topic.substring(1, articleType[0].topic.length)}</h1>

                                    : null}



                                <div className="topic-articles">
                                    {articleType.map((article, i) => {
                                        return <div key={i} title={article.title} onClick={this.handleLoadArticle} className="home-articles-container" style={{ minWidth: `${this.state.boxsize}px` }}>
                                            <img src={article.urlToImage} alt=""></img>
                                            <span>{article.title}</span>
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

                        })}
                    </div>
                    : null}



            </div>
        )
    }
}

export default home;