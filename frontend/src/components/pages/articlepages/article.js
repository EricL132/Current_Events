import React from 'react'
import './article.css'

class article extends React.Component {
    constructor(props) {
        super(props)
        this.getArticle = this.getArticle.bind(this)
        this.state = {
            article: ""
        }
        this.getArticle()
    }
    componentDidMount() {
       
    }

    async getArticle() {
        const res = await fetch(`/info/findarticle/${window.location.search}`)

        if (res.status === 200) {
            const resInfo = await res.json()
            this.setState({ article: resInfo.article })
        }
    }

    render() {
        return (
            <div className="article-page-container">
                {this.state.article ?
                    <div className="middle-container">
                        <div className="video-container">
                            <iframe title="video-frame"  id="video-frame" allowFullScreen={true} className="iframe-youtube" width="100%" height="100%"
                                src="https://www.youtube.com/embed/tgbNymZ7vqY">
                                    
                            </iframe>
                        </div>
                        <div className="article-info">
                            <h1 className="article-title">{this.state.article.title}</h1>
                            <h3 className="author-name">{this.state.article.author}, {this.state.article.publishedAt}</h3>
                            <span className="article-description">{this.state.article.description}</span>
                        </div>
                    </div>
                    : null}

            </div>
        )
    }
}
//https://drive.google.com/file/d/1U0N635TIBrfEihgoZMyqWn7tDgrmeQEt/preview
export default article;