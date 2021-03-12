import React from 'react'
import './home.css'
const querystring = require('querystring');

class home extends React.Component {
    constructor(props) {
        super(props)

        this.state = { articles: [], articlesFromSearch:[] }
        this.handleLoadArticle = this.handleLoadArticle.bind(this)
        this.getArticles()
    }
    componentDidMount() {
        const searchParam = document.getElementById('search-input')
        searchParam.addEventListener('input',()=>{
            const result =  this.state.articlesFromSearch.filter((item)=>{
                const title = item.title.toLowerCase()
                const searchvalue = searchParam.value.toLowerCase()
                return title.includes(searchvalue)
            })
            this.setState({articles:result})
        })
    }
    async handleLoadArticle(e) {
        const docu = e.nativeEvent.path.filter((ele) => {
            try{return ele.classList.contains('home-articles-container')}catch(err){return null}

        })
        const param = await docu[0].getAttribute('title')
        const queryString = querystring.stringify({title:param})
        this.props.history.push(`/article/?${queryString}`)
    
    }
    async getArticles() {
        const res = await fetch('/info/articles')
        const articlesInfo = await res.json()
        this.setState({ articles: articlesInfo.articles })
        this.setState({ articlesFromSearch: articlesInfo.articles })

    }
    render() {
        return (
            <div className="page-container">

                {this.state.articles ?
                    <div onClick={this.handleLoadArticle} className="home-all-articles-container">
                        {this.state.articles.map((article, i) => {
                            return <div key={i} title={article.title} className="home-articles-container">
                                <img src={article.urlToImage} alt=""></img>
                                <span>{article.title}</span>
                            </div>

                        })}
                    </div>
                    : null}



            </div>
        )
    }
}

export default home;