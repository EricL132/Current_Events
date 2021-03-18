import { timingSafeEqual } from 'crypto'
import React from 'react'
import './article.css'

class article extends React.Component {
    constructor(props) {
        super(props)
        this.getArticle = this.getArticle.bind(this)
        this.handleError = this.handleError.bind(this)
        this.state = {
            article: "",
            showBackUpVid:false,
            pageLoaded:false
        }
        this.getArticle()
    }
    componentDidMount() {
       
    }

    async getArticle() {
        const res = await fetch(`/info/findarticle/${window.location.search}`)

        if (res.status === 200) {
            const resInfo = await res.json()
            this.setState({ article: resInfo.article },()=>{
                this.handleError()
            })
        }
    }
    async handleError(){
        console.log(this.state.article)
        const res = await fetch(`https://www.youtube.com/oembed?url=${this.state.article.vid}&format=json`)
        if(res.status===404){
            this.setState({showBackUpVid:true})
        }
        this.setState({pageLoaded:true})
    }
    render() {
        return (
            <div className="article-page-container">
                {this.state.article ?
                    <div className="middle-container">
                        <div className="video-container">
                        {!this.state.showBackUpVid && this.state.pageLoaded?
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${this.state.article.vid.split('=')[1]}`} frameBorder="0" allowFullScreen/>
                        :                        
                        <iframe width="100%" height="100%" src={this.state.article.backupvid} frameBorder="0" allowFullScreen/>
                         }
                        
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
export default article;