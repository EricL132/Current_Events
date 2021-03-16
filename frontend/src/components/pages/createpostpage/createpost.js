import React from 'react'
import './createpost.css'


class resetpass extends React.Component {
    constructor(props){
        super(props)
        this.state = {

        }
        this.checkIfAdmin = this.checkIfAdmin.bind(this)
        this.checkIfAdmin()
    }

    checkIfAdmin(){
        const res = fetch('/checkaccess',)
    }


    componentDidMount() {

    }
    render() {
        return (
            <div className="create-page-container">
                <div className="create-middle-container">
                    <div className="inputfield-container">
                    <input spellCheck={false} id="post-title" className="post-input" placeholder="Title"></input>
                    <input spellCheck={false} id="post-auther" className="post-input" placeholder="Auther"></input>
                    <input spellCheck={false} id="post-iamge" className="post-input" placeholder="Image Link"></input>
                    <input spellCheck={false} id="post-video" className="post-input" placeholder="Video Link"></input>
                    <textarea  spellCheck={false} id="post-info" className="post-input" placeholder="Information"></textarea>
                    <button className="submitcreate">Add Article</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default resetpass;