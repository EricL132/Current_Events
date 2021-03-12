import React from 'react'
import './pagenotfound.css'


class resetpass extends React.Component{
    componentDidMount(){
        console.log('Page not ofund')
    }
    render(){
        return(
            <div className="page-container">
                
               <div className="middle-container">
                    page not found
               </div>
            </div>
        )
    }
}

export default resetpass;