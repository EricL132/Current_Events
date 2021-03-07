import React from 'react'
import './home.css'


class home extends React.Component {
    constructor(props) {
        super(props)
        this.state = { articles: [] }
        this.getArticles()
    }
    componentDidMount() {

    }

    async getArticles() {
        const res = await fetch('/info/articles')
        const articlesInfo = await res.json()
        this.setState({ articles: articlesInfo.articles })
    }
    render() {
        return (
            <div className="page-container">

                {this.state.articles ?
                    <div className="all-article-container">
                        {this.state.articles.map((article, i) => {
                            return <div key={i} className="article-container">
                                <img src={article.image}></img>
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